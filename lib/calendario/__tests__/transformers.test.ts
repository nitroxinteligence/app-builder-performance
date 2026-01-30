import { describe, it, expect, vi, beforeEach } from 'vitest'

import {
  transformGoogleEvent,
  transformOutlookEvent,
  validateGoogleEvent,
  validateOutlookEvent,
} from '../transformers'
import type { GoogleCalendarEvent, OutlookCalendarEvent } from '@/types/calendario'

// ==========================================
// FIXTURES
// ==========================================

function makeGoogleEvent(overrides: Partial<GoogleCalendarEvent> = {}): GoogleCalendarEvent {
  return {
    kind: 'calendar#event',
    etag: '"abc123"',
    id: 'google-event-1',
    status: 'confirmed',
    htmlLink: 'https://calendar.google.com/event?id=1',
    created: '2026-01-01T00:00:00Z',
    updated: '2026-01-01T00:00:00Z',
    summary: 'Team Standup',
    description: 'Daily sync meeting',
    location: 'Room 301',
    iCalUID: 'uid@google.com',
    start: { dateTime: '2026-01-30T09:00:00-03:00' },
    end: { dateTime: '2026-01-30T09:30:00-03:00' },
    ...overrides,
  }
}

function makeOutlookEvent(overrides: Partial<OutlookCalendarEvent> = {}): OutlookCalendarEvent {
  return {
    id: 'outlook-event-1',
    createdDateTime: '2026-01-01T00:00:00Z',
    lastModifiedDateTime: '2026-01-01T00:00:00Z',
    subject: 'Sprint Planning',
    bodyPreview: 'Discuss next sprint goals',
    isAllDay: false,
    isCancelled: false,
    start: { dateTime: '2026-01-30T14:00:00.0000000', timeZone: 'UTC' },
    end: { dateTime: '2026-01-30T15:00:00.0000000', timeZone: 'UTC' },
    location: { displayName: 'Conference Room A' },
    ...overrides,
  }
}

// ==========================================
// validateGoogleEvent
// ==========================================

describe('validateGoogleEvent', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('returns validated event for valid Google event', () => {
    const raw = makeGoogleEvent()
    const result = validateGoogleEvent(raw, 'user-1')
    expect(result).not.toBeNull()
    expect(result?.id).toBe('google-event-1')
  })

  it('returns null for event missing id', () => {
    const raw = { start: { dateTime: '2026-01-30T09:00:00Z' }, end: { dateTime: '2026-01-30T10:00:00Z' } }
    const result = validateGoogleEvent(raw, 'user-1')
    expect(result).toBeNull()
  })

  it('returns null for event missing start/end', () => {
    const raw = { id: 'evt-1' }
    const result = validateGoogleEvent(raw, 'user-1')
    expect(result).toBeNull()
  })

  it('returns null for completely invalid input', () => {
    expect(validateGoogleEvent(null, 'user-1')).toBeNull()
    expect(validateGoogleEvent(undefined, 'user-1')).toBeNull()
    expect(validateGoogleEvent('string', 'user-1')).toBeNull()
    expect(validateGoogleEvent(42, 'user-1')).toBeNull()
  })

  it('accepts event with extra passthrough fields', () => {
    const raw = {
      ...makeGoogleEvent(),
      customField: 'should-pass-through',
    }
    const result = validateGoogleEvent(raw, 'user-1')
    expect(result).not.toBeNull()
  })

  it('accepts event with minimal required fields', () => {
    const raw = {
      id: 'min-event',
      start: { dateTime: '2026-01-30T10:00:00Z' },
      end: { dateTime: '2026-01-30T11:00:00Z' },
    }
    const result = validateGoogleEvent(raw, 'user-1')
    expect(result).not.toBeNull()
  })
})

// ==========================================
// validateOutlookEvent
// ==========================================

describe('validateOutlookEvent', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('returns validated event for valid Outlook event', () => {
    const raw = makeOutlookEvent()
    const result = validateOutlookEvent(raw, 'user-1')
    expect(result).not.toBeNull()
    expect(result?.id).toBe('outlook-event-1')
  })

  it('returns null for event missing id', () => {
    const raw = {
      start: { dateTime: '2026-01-30T10:00:00', timeZone: 'UTC' },
      end: { dateTime: '2026-01-30T11:00:00', timeZone: 'UTC' },
    }
    const result = validateOutlookEvent(raw, 'user-1')
    expect(result).toBeNull()
  })

  it('returns null for event missing start.timeZone', () => {
    const raw = {
      id: 'evt-1',
      start: { dateTime: '2026-01-30T10:00:00' },
      end: { dateTime: '2026-01-30T11:00:00', timeZone: 'UTC' },
    }
    const result = validateOutlookEvent(raw, 'user-1')
    expect(result).toBeNull()
  })

  it('returns null for completely invalid input', () => {
    expect(validateOutlookEvent(null, 'user-1')).toBeNull()
    expect(validateOutlookEvent(undefined, 'user-1')).toBeNull()
    expect(validateOutlookEvent('string', 'user-1')).toBeNull()
  })

  it('accepts event with extra passthrough fields', () => {
    const raw = {
      ...makeOutlookEvent(),
      unknownProp: true,
    }
    const result = validateOutlookEvent(raw, 'user-1')
    expect(result).not.toBeNull()
  })
})

// ==========================================
// transformGoogleEvent
// ==========================================

describe('transformGoogleEvent', () => {
  it('transforms a standard timed event', () => {
    const event = makeGoogleEvent()
    const result = transformGoogleEvent(event)

    expect(result.titulo).toBe('Team Standup')
    expect(result.descricao).toBe('Daily sync meeting')
    expect(result.data).toBe('2026-01-30')
    expect(result.horario_inicio).toBe('09:00')
    expect(result.horario_fim).toBe('09:30')
    expect(result.categoria).toBe('Reuniao')
    expect(result.local).toBe('Room 301')
    expect(result.status).toBe('confirmado')
    expect(result.calendario).toBe('Google')
    expect(result.external_event_id).toBe('google-event-1')
  })

  it('transforms an all-day event with start.date', () => {
    const event = makeGoogleEvent({
      start: { date: '2026-02-14' },
      end: { date: '2026-02-15' },
    })

    const result = transformGoogleEvent(event)

    expect(result.data).toBe('2026-02-14')
    expect(result.horario_inicio).toBe('00:00')
    expect(result.horario_fim).toBe('23:59')
  })

  it('uses "(Sem título)" when summary is missing', () => {
    const event = makeGoogleEvent({ summary: undefined })
    const result = transformGoogleEvent(event)
    expect(result.titulo).toBe('(Sem título)')
  })

  it('handles missing description and location', () => {
    const event = makeGoogleEvent({
      description: undefined,
      location: undefined,
    })
    const result = transformGoogleEvent(event)
    expect(result.descricao).toBeUndefined()
    expect(result.local).toBeUndefined()
  })

  it('extracts date from dateTime correctly', () => {
    const event = makeGoogleEvent({
      start: { dateTime: '2026-06-15T14:30:00+05:30' },
      end: { dateTime: '2026-06-15T15:00:00+05:30' },
    })
    const result = transformGoogleEvent(event)
    expect(result.data).toBe('2026-06-15')
    expect(result.horario_inicio).toBe('14:30')
    expect(result.horario_fim).toBe('15:00')
  })

  it('falls back to current date when neither date nor dateTime exist', () => {
    const event = makeGoogleEvent({
      start: {} as GoogleCalendarEvent['start'],
      end: {} as GoogleCalendarEvent['end'],
    })
    const result = transformGoogleEvent(event)
    expect(result.data).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(result.horario_inicio).toBe('00:00')
    expect(result.horario_fim).toBe('23:59')
  })
})

// ==========================================
// transformOutlookEvent
// ==========================================

describe('transformOutlookEvent', () => {
  it('transforms a standard timed event', () => {
    const event = makeOutlookEvent()
    const result = transformOutlookEvent(event)

    expect(result.titulo).toBe('Sprint Planning')
    expect(result.descricao).toBe('Discuss next sprint goals')
    expect(result.data).toBe('2026-01-30')
    expect(result.horario_inicio).toBe('14:00')
    expect(result.horario_fim).toBe('15:00')
    expect(result.categoria).toBe('Reuniao')
    expect(result.local).toBe('Conference Room A')
    expect(result.status).toBe('confirmado')
    expect(result.calendario).toBe('Outlook')
    expect(result.external_event_id).toBe('outlook-event-1')
  })

  it('transforms an all-day event', () => {
    const event = makeOutlookEvent({
      isAllDay: true,
      start: { dateTime: '2026-03-01T00:00:00.0000000', timeZone: 'UTC' },
      end: { dateTime: '2026-03-02T00:00:00.0000000', timeZone: 'UTC' },
    })
    const result = transformOutlookEvent(event)

    expect(result.data).toBe('2026-03-01')
    expect(result.horario_inicio).toBe('00:00')
    expect(result.horario_fim).toBe('23:59')
  })

  it('uses "(Sem título)" when subject is missing', () => {
    const event = makeOutlookEvent({ subject: undefined })
    const result = transformOutlookEvent(event)
    expect(result.titulo).toBe('(Sem título)')
  })

  it('handles missing bodyPreview and location', () => {
    const event = makeOutlookEvent({
      bodyPreview: undefined,
      location: undefined,
    })
    const result = transformOutlookEvent(event)
    expect(result.descricao).toBeUndefined()
    expect(result.local).toBeUndefined()
  })

  it('handles location with empty displayName', () => {
    const event = makeOutlookEvent({
      location: { displayName: '' },
    })
    const result = transformOutlookEvent(event)
    expect(result.local).toBe('')
  })
})
