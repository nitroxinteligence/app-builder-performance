import type { SupabaseClient } from '@supabase/supabase-js'

import type { AgendaEvent } from '@/types/agenda'
import type {
  CalendarConnection,
  CalendarProvider,
  SyncResult,
  SyncError,
} from '@/types/calendario'

import { refreshGoogleToken } from './google'
import { fetchGoogleCalendarEvents } from './google'
import { refreshOutlookToken } from './outlook'
import { fetchOutlookCalendarEvents } from './outlook'
import {
  transformGoogleEvent,
  transformOutlookEvent,
  validateGoogleEvent,
  validateOutlookEvent,
} from './transformers'
import type { SyncEventDto } from './transformers'
import {
  logSync,
  logSyncError,
  isTokenExpiringSoon,
  shouldSkipAutoSync,
  mapHttpErrorToSyncError,
} from './resilience'

// ==========================================
// CONSTANTS
// ==========================================

const SYNC_RANGE_PAST_DAYS = 30
const SYNC_RANGE_FUTURE_DAYS = 90

// ==========================================
// DATE RANGE
// ==========================================

function getSyncDateRange(): { timeMin: string; timeMax: string } {
  const now = new Date()

  const past = new Date(now)
  past.setDate(past.getDate() - SYNC_RANGE_PAST_DAYS)

  const future = new Date(now)
  future.setDate(future.getDate() + SYNC_RANGE_FUTURE_DAYS)

  return {
    timeMin: past.toISOString(),
    timeMax: future.toISOString(),
  }
}

// ==========================================
// TOKEN REFRESH
// ==========================================

async function ensureValidToken(
  supabaseAdmin: SupabaseClient,
  connection: CalendarConnection,
  userId: string,
): Promise<string> {
  if (!isTokenExpiringSoon(connection.token_expires_at)) {
    return connection.access_token
  }

  logSync(connection.provider, userId, 'Token expiring soon, refreshing...')

  try {
    const tokenResponse =
      connection.provider === 'Google'
        ? await refreshGoogleToken(connection.refresh_token)
        : await refreshOutlookToken(connection.refresh_token)

    const newExpiresAt = new Date(
      Date.now() + tokenResponse.expires_in * 1000,
    ).toISOString()

    const updateData: Record<string, unknown> = {
      access_token: tokenResponse.access_token,
      token_expires_at: newExpiresAt,
      updated_at: new Date().toISOString(),
    }

    // Microsoft may return a new refresh_token
    if (tokenResponse.refresh_token) {
      updateData.refresh_token = tokenResponse.refresh_token
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- calendar_connections table type will be auto-generated via supabase gen types
    await (supabaseAdmin as any)
      .from('calendar_connections')
      .update(updateData)
      .eq('id', connection.id)

    logSync(connection.provider, userId, 'Token refreshed successfully')
    return tokenResponse.access_token
  } catch (error) {
    if (error instanceof Error && error.message === 'TOKEN_REVOKED') {
      logSyncError(connection.provider, userId, 'Refresh token revoked, deactivating connection')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- calendar_connections table type will be auto-generated via supabase gen types
      await (supabaseAdmin as any)
        .from('calendar_connections')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', connection.id)

      throw new Error('TOKEN_REVOKED')
    }
    throw error
  }
}

// ==========================================
// FETCH EXTERNAL EVENTS (with Zod validation)
// ==========================================

async function fetchExternalEvents(
  connection: CalendarConnection,
  accessToken: string,
  userId: string,
): Promise<{ events: SyncEventDto[]; syncToken: string | null }> {
  const { timeMin, timeMax } = getSyncDateRange()

  if (connection.provider === 'Google') {
    const result = await fetchGoogleCalendarEvents(accessToken, timeMin, timeMax, userId)
    const transformed = result.events
      .filter((e) => e.status !== 'cancelled')
      .map((raw) => {
        const validated = validateGoogleEvent(raw, userId)
        return validated ? transformGoogleEvent(validated) : null
      })
      .filter((e): e is SyncEventDto => e !== null)
    return { events: transformed, syncToken: result.syncToken }
  }

  const result = await fetchOutlookCalendarEvents(accessToken, timeMin, timeMax, userId)
  const transformed = result.events
    .filter((e) => e.isCancelled !== true)
    .map((raw) => {
      const validated = validateOutlookEvent(raw, userId)
      return validated ? transformOutlookEvent(validated) : null
    })
    .filter((e): e is SyncEventDto => e !== null)
  return { events: transformed, syncToken: result.deltaLink }
}

// ==========================================
// DIFF LOGIC
// ==========================================

interface SyncDiff {
  toInsert: SyncEventDto[]
  toUpdate: Array<{ id: string; dto: SyncEventDto }>
  toDelete: string[]
}

function computeSyncDiff(
  externalEvents: SyncEventDto[],
  existingEvents: AgendaEvent[],
): SyncDiff {
  const existingByExternalId = new Map<string, AgendaEvent>()
  for (const event of existingEvents) {
    if (event.external_event_id) {
      existingByExternalId.set(event.external_event_id, event)
    }
  }

  const externalIds = new Set(externalEvents.map((e) => e.external_event_id))

  const toInsert: SyncEventDto[] = []
  const toUpdate: Array<{ id: string; dto: SyncEventDto }> = []

  for (const ext of externalEvents) {
    const existing = existingByExternalId.get(ext.external_event_id)
    if (!existing) {
      toInsert.push(ext)
    } else {
      const hasChanges =
        existing.titulo !== ext.titulo ||
        existing.descricao !== (ext.descricao ?? null) ||
        existing.data !== ext.data ||
        existing.horario_inicio !== ext.horario_inicio ||
        existing.horario_fim !== ext.horario_fim ||
        existing.local !== (ext.local ?? null)

      if (hasChanges) {
        toUpdate.push({ id: existing.id, dto: ext })
      }
    }
  }

  const toDelete: string[] = []
  for (const [externalId, existing] of existingByExternalId) {
    if (!externalIds.has(externalId)) {
      toDelete.push(existing.id)
    }
  }

  return { toInsert, toUpdate, toDelete }
}

// ==========================================
// EXECUTE SYNC OPERATIONS
// ==========================================

async function executeSyncOperations(
  supabaseAdmin: SupabaseClient,
  userId: string,
  diff: SyncDiff,
  provider: CalendarProvider,
): Promise<{ created: number; updated: number; deleted: number; errors: SyncError[] }> {
  const errors: SyncError[] = []
  let created = 0
  let updated = 0
  let deleted = 0

  // Insert new events
  if (diff.toInsert.length > 0) {
    const insertRows = diff.toInsert.map((dto) => ({
      user_id: userId,
      titulo: dto.titulo,
      descricao: dto.descricao ?? null,
      data: dto.data,
      horario_inicio: dto.horario_inicio,
      horario_fim: dto.horario_fim,
      categoria: dto.categoria,
      local: dto.local ?? null,
      status: dto.status,
      calendario: dto.calendario,
      external_event_id: dto.external_event_id,
    }))

    const { error } = await supabaseAdmin
      .from('events')
      .insert(insertRows)

    if (error) {
      logSyncError(provider, userId, `Batch insert failed: ${error.message}`)
      errors.push({ external_event_id: 'batch_insert', message: error.message })
    } else {
      created = diff.toInsert.length
    }
  }

  // Update existing events
  for (const { id, dto } of diff.toUpdate) {
    const { error } = await supabaseAdmin
      .from('events')
      .update({
        titulo: dto.titulo,
        descricao: dto.descricao ?? null,
        data: dto.data,
        horario_inicio: dto.horario_inicio,
        horario_fim: dto.horario_fim,
        local: dto.local ?? null,
      })
      .eq('id', id)

    if (error) {
      logSyncError(provider, userId, `Update failed for event ${dto.external_event_id}: ${error.message}`)
      errors.push({ external_event_id: dto.external_event_id, message: error.message })
    } else {
      updated++
    }
  }

  // Delete removed events
  if (diff.toDelete.length > 0) {
    const { error } = await supabaseAdmin
      .from('events')
      .delete()
      .in('id', diff.toDelete)

    if (error) {
      logSyncError(provider, userId, `Batch delete failed: ${error.message}`)
      errors.push({ external_event_id: 'batch_delete', message: error.message })
    } else {
      deleted = diff.toDelete.length
    }
  }

  return { created, updated, deleted, errors }
}

// ==========================================
// PUBLIC API
// ==========================================

export interface SyncOptions {
  force?: boolean
}

export async function syncCalendarEvents(
  supabaseAdmin: SupabaseClient,
  connection: CalendarConnection,
  userId: string,
  options: SyncOptions = {},
): Promise<SyncResult> {
  const provider: CalendarProvider = connection.provider

  // Rate limiting: skip auto-sync if last sync was < 5 min ago (manual sync always runs)
  if (!options.force && shouldSkipAutoSync(connection.last_sync_at)) {
    logSync(provider, userId, 'Sync skipped: last sync was too recent')
    return {
      provider,
      created: 0,
      updated: 0,
      deleted: 0,
      errors: [],
      sync_token: connection.sync_token,
    }
  }

  logSync(provider, userId, 'Starting sync...')

  // Token refresh if expiring soon
  let accessToken: string
  try {
    accessToken = await ensureValidToken(supabaseAdmin, connection, userId)
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown token error'
    logSyncError(provider, userId, `Token refresh failed: ${errorMsg}`)
    throw error
  }

  // Fetch external events
  let externalEvents: SyncEventDto[]
  let syncToken: string | null
  try {
    const result = await fetchExternalEvents(connection, accessToken, userId)
    externalEvents = result.events
    syncToken = result.syncToken
  } catch (error) {
    const status = error instanceof Error && error.message.match(/:\s*(\d{3})$/)
      ? parseInt(error.message.match(/:\s*(\d{3})$/)?.[1] ?? '0', 10)
      : 0
    const syncError = status > 0 ? mapHttpErrorToSyncError(status) : 'NETWORK_ERROR'
    logSyncError(provider, userId, `Fetch external events failed (${syncError}): ${error instanceof Error ? error.message : 'Unknown'}`)
    throw error
  }

  logSync(provider, userId, `Fetched ${externalEvents.length} external events`)

  // Fetch existing synced events for this provider
  const { data: existingEvents, error: fetchError } = await supabaseAdmin
    .from('events')
    .select('*')
    .eq('user_id', userId)
    .eq('calendario', provider)
    .not('external_event_id', 'is', null)

  if (fetchError) {
    logSyncError(provider, userId, `Failed to fetch existing events: ${fetchError.message}`)
    throw new Error(`Failed to fetch existing events: ${fetchError.message}`)
  }

  // Compute diff
  const diff = computeSyncDiff(externalEvents, (existingEvents ?? []) as AgendaEvent[])

  logSync(
    provider,
    userId,
    `Diff: +${diff.toInsert.length} insert, ~${diff.toUpdate.length} update, -${diff.toDelete.length} delete`,
  )

  // Execute operations
  const result = await executeSyncOperations(supabaseAdmin, userId, diff, provider)

  // Update last_sync_at and sync_token
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- calendar_connections table type will be auto-generated via supabase gen types
  await (supabaseAdmin as any)
    .from('calendar_connections')
    .update({
      last_sync_at: new Date().toISOString(),
      sync_token: syncToken,
    })
    .eq('id', connection.id)

  logSync(
    provider,
    userId,
    `Sync complete: +${result.created} created, ~${result.updated} updated, -${result.deleted} deleted, ${result.errors.length} errors`,
  )

  return {
    provider,
    created: result.created,
    updated: result.updated,
    deleted: result.deleted,
    errors: result.errors,
    sync_token: syncToken,
  }
}

export async function getActiveConnections(
  supabaseAdmin: SupabaseClient,
  userId: string,
): Promise<CalendarConnection[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- calendar_connections table type will be auto-generated via supabase gen types
  const { data, error } = await (supabaseAdmin as any)
    .from('calendar_connections')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)

  if (error) {
    throw new Error(`Failed to fetch connections: ${error.message}`)
  }

  return (data ?? []) as CalendarConnection[]
}
