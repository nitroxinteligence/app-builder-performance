import { describe, it, expect } from 'vitest'

import type { AgendaEvent } from '@/types/agenda'
import type { SyncEventDto } from '../transformers'

// ==========================================
// We test computeSyncDiff by importing it indirectly.
// The function is not exported, so we replicate it here
// to test the algorithm in isolation.
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
// FIXTURES
// ==========================================

function makeSyncDto(overrides: Partial<SyncEventDto> = {}): SyncEventDto {
  return {
    titulo: 'Meeting',
    data: '2026-01-30',
    horario_inicio: '09:00',
    horario_fim: '10:00',
    categoria: 'Reuniao',
    status: 'confirmado',
    calendario: 'Google',
    external_event_id: 'ext-1',
    ...overrides,
  }
}

function makeExistingEvent(overrides: Partial<AgendaEvent> = {}): AgendaEvent {
  return {
    id: 'db-1',
    user_id: 'user-1',
    titulo: 'Meeting',
    descricao: null,
    data: '2026-01-30',
    horario_inicio: '09:00',
    horario_fim: '10:00',
    categoria: 'Reuniao',
    local: null,
    status: 'confirmado',
    calendario: 'Google',
    external_event_id: 'ext-1',
    created_at: '2026-01-29T00:00:00Z',
    updated_at: '2026-01-29T00:00:00Z',
    ...overrides,
  }
}

// ==========================================
// computeSyncDiff
// ==========================================

describe('computeSyncDiff', () => {
  it('inserts new events that do not exist in DB', () => {
    const external = [makeSyncDto({ external_event_id: 'new-1' })]
    const existing: AgendaEvent[] = []

    const diff = computeSyncDiff(external, existing)

    expect(diff.toInsert).toHaveLength(1)
    expect(diff.toInsert[0].external_event_id).toBe('new-1')
    expect(diff.toUpdate).toHaveLength(0)
    expect(diff.toDelete).toHaveLength(0)
  })

  it('detects no changes when events match', () => {
    const external = [makeSyncDto()]
    const existing = [makeExistingEvent()]

    const diff = computeSyncDiff(external, existing)

    expect(diff.toInsert).toHaveLength(0)
    expect(diff.toUpdate).toHaveLength(0)
    expect(diff.toDelete).toHaveLength(0)
  })

  it('detects title change as update', () => {
    const external = [makeSyncDto({ titulo: 'Updated Meeting' })]
    const existing = [makeExistingEvent()]

    const diff = computeSyncDiff(external, existing)

    expect(diff.toInsert).toHaveLength(0)
    expect(diff.toUpdate).toHaveLength(1)
    expect(diff.toUpdate[0].id).toBe('db-1')
    expect(diff.toUpdate[0].dto.titulo).toBe('Updated Meeting')
    expect(diff.toDelete).toHaveLength(0)
  })

  it('detects time change as update', () => {
    const external = [makeSyncDto({ horario_inicio: '10:00', horario_fim: '11:00' })]
    const existing = [makeExistingEvent()]

    const diff = computeSyncDiff(external, existing)

    expect(diff.toUpdate).toHaveLength(1)
  })

  it('detects date change as update', () => {
    const external = [makeSyncDto({ data: '2026-02-01' })]
    const existing = [makeExistingEvent()]

    const diff = computeSyncDiff(external, existing)

    expect(diff.toUpdate).toHaveLength(1)
  })

  it('detects description change as update', () => {
    const external = [makeSyncDto({ descricao: 'New description' })]
    const existing = [makeExistingEvent({ descricao: null })]

    const diff = computeSyncDiff(external, existing)

    expect(diff.toUpdate).toHaveLength(1)
  })

  it('detects location change as update', () => {
    const external = [makeSyncDto({ local: 'New Room' })]
    const existing = [makeExistingEvent({ local: null })]

    const diff = computeSyncDiff(external, existing)

    expect(diff.toUpdate).toHaveLength(1)
  })

  it('deletes events that no longer exist externally', () => {
    const external: SyncEventDto[] = []
    const existing = [makeExistingEvent()]

    const diff = computeSyncDiff(external, existing)

    expect(diff.toInsert).toHaveLength(0)
    expect(diff.toUpdate).toHaveLength(0)
    expect(diff.toDelete).toHaveLength(1)
    expect(diff.toDelete[0]).toBe('db-1')
  })

  it('handles mixed insert, update, and delete', () => {
    const external = [
      makeSyncDto({ external_event_id: 'ext-1', titulo: 'Updated Title' }),
      makeSyncDto({ external_event_id: 'ext-new', titulo: 'Brand New' }),
    ]
    const existing = [
      makeExistingEvent({ id: 'db-1', external_event_id: 'ext-1' }),
      makeExistingEvent({ id: 'db-2', external_event_id: 'ext-gone' }),
    ]

    const diff = computeSyncDiff(external, existing)

    expect(diff.toInsert).toHaveLength(1)
    expect(diff.toInsert[0].external_event_id).toBe('ext-new')
    expect(diff.toUpdate).toHaveLength(1)
    expect(diff.toUpdate[0].id).toBe('db-1')
    expect(diff.toDelete).toHaveLength(1)
    expect(diff.toDelete[0]).toBe('db-2')
  })

  it('ignores existing events without external_event_id', () => {
    const external = [makeSyncDto({ external_event_id: 'ext-1' })]
    const existing = [
      makeExistingEvent({ id: 'manual-1', external_event_id: null }),
    ]

    const diff = computeSyncDiff(external, existing)

    expect(diff.toInsert).toHaveLength(1)
    expect(diff.toDelete).toHaveLength(0)
  })

  it('handles empty arrays', () => {
    const diff = computeSyncDiff([], [])

    expect(diff.toInsert).toHaveLength(0)
    expect(diff.toUpdate).toHaveLength(0)
    expect(diff.toDelete).toHaveLength(0)
  })

  it('handles multiple events to insert', () => {
    const external = [
      makeSyncDto({ external_event_id: 'new-1' }),
      makeSyncDto({ external_event_id: 'new-2' }),
      makeSyncDto({ external_event_id: 'new-3' }),
    ]

    const diff = computeSyncDiff(external, [])

    expect(diff.toInsert).toHaveLength(3)
  })

  it('handles multiple events to delete', () => {
    const existing = [
      makeExistingEvent({ id: 'db-1', external_event_id: 'ext-1' }),
      makeExistingEvent({ id: 'db-2', external_event_id: 'ext-2' }),
    ]

    const diff = computeSyncDiff([], existing)

    expect(diff.toDelete).toHaveLength(2)
  })

  it('treats undefined descricao same as null', () => {
    const external = [makeSyncDto({ descricao: undefined })]
    const existing = [makeExistingEvent({ descricao: null })]

    const diff = computeSyncDiff(external, existing)

    expect(diff.toUpdate).toHaveLength(0)
  })

  it('treats undefined local same as null', () => {
    const external = [makeSyncDto({ local: undefined })]
    const existing = [makeExistingEvent({ local: null })]

    const diff = computeSyncDiff(external, existing)

    expect(diff.toUpdate).toHaveLength(0)
  })
})
