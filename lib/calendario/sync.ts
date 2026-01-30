import type { SupabaseClient } from '@supabase/supabase-js'

import type { AgendaEvent } from '@/types/agenda'
import type {
  CalendarConnection,
  CalendarProvider,
  SyncResult,
  SyncError,
} from '@/types/calendario'

import { fetchGoogleCalendarEvents } from './google'
import { fetchOutlookCalendarEvents } from './outlook'
import { transformGoogleEvent, transformOutlookEvent } from './transformers'
import type { SyncEventDto } from './transformers'

// ==========================================
// CONSTANTS
// ==========================================

const SYNC_RANGE_PAST_DAYS = 30
const SYNC_RANGE_FUTURE_DAYS = 90

// ==========================================
// TOKEN CHECK
// ==========================================

function isTokenExpired(connection: CalendarConnection): boolean {
  const expiresAt = new Date(connection.token_expires_at).getTime()
  return Date.now() >= expiresAt
}

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
// FETCH EXTERNAL EVENTS
// ==========================================

async function fetchExternalEvents(
  connection: CalendarConnection,
): Promise<{ events: SyncEventDto[]; syncToken: string | null }> {
  const { timeMin, timeMax } = getSyncDateRange()

  if (connection.provider === 'Google') {
    const result = await fetchGoogleCalendarEvents(connection.access_token, timeMin, timeMax)
    const transformed = result.events
      .filter((e) => e.status !== 'cancelled')
      .map(transformGoogleEvent)
    return { events: transformed, syncToken: result.syncToken }
  }

  const result = await fetchOutlookCalendarEvents(connection.access_token, timeMin, timeMax)
  const transformed = result.events
    .filter((e) => e.isCancelled !== true)
    .map(transformOutlookEvent)
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

export async function syncCalendarEvents(
  supabaseAdmin: SupabaseClient,
  connection: CalendarConnection,
  userId: string,
): Promise<SyncResult> {
  const provider: CalendarProvider = connection.provider

  // Task 10: Basic token check (full refresh in CI-1.6)
  if (isTokenExpired(connection)) {
    throw new Error('TOKEN_EXPIRED')
  }

  // Fetch external events
  const { events: externalEvents, syncToken } = await fetchExternalEvents(connection)

  // Fetch existing synced events for this provider
  const { data: existingEvents, error: fetchError } = await supabaseAdmin
    .from('events')
    .select('*')
    .eq('user_id', userId)
    .eq('calendario', provider)
    .not('external_event_id', 'is', null)

  if (fetchError) {
    throw new Error(`Failed to fetch existing events: ${fetchError.message}`)
  }

  // Compute diff
  const diff = computeSyncDiff(externalEvents, (existingEvents ?? []) as AgendaEvent[])

  // Execute operations
  const result = await executeSyncOperations(supabaseAdmin, userId, diff)

  // Update last_sync_at and sync_token
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- calendar_connections table type will be auto-generated via supabase gen types
  await (supabaseAdmin as any)
    .from('calendar_connections')
    .update({
      last_sync_at: new Date().toISOString(),
      sync_token: syncToken,
    })
    .eq('id', connection.id)

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
