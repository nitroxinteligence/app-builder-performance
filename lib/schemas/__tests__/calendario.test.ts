import { describe, it, expect } from 'vitest'

import {
  connectRequestSchema,
  disconnectRequestSchema,
  syncRequestSchema,
  googleEventSchema,
  outlookEventSchema,
  tokenResponseSchema,
  calendarProviderSchema,
} from '../calendario'

// ==========================================
// calendarProviderSchema
// ==========================================

describe('calendarProviderSchema', () => {
  it('accepts Google', () => {
    expect(calendarProviderSchema.parse('Google')).toBe('Google')
  })

  it('accepts Outlook', () => {
    expect(calendarProviderSchema.parse('Outlook')).toBe('Outlook')
  })

  it('rejects invalid providers', () => {
    expect(() => calendarProviderSchema.parse('iCloud')).toThrow()
    expect(() => calendarProviderSchema.parse('')).toThrow()
    expect(() => calendarProviderSchema.parse(null)).toThrow()
  })
})

// ==========================================
// connectRequestSchema
// ==========================================

describe('connectRequestSchema', () => {
  it('accepts valid Google connect request', () => {
    const result = connectRequestSchema.safeParse({ provider: 'Google' })
    expect(result.success).toBe(true)
  })

  it('accepts valid Outlook connect request', () => {
    const result = connectRequestSchema.safeParse({ provider: 'Outlook' })
    expect(result.success).toBe(true)
  })

  it('rejects missing provider', () => {
    const result = connectRequestSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('rejects invalid provider value', () => {
    const result = connectRequestSchema.safeParse({ provider: 'Yahoo' })
    expect(result.success).toBe(false)
  })
})

// ==========================================
// disconnectRequestSchema
// ==========================================

describe('disconnectRequestSchema', () => {
  it('accepts valid disconnect request', () => {
    const result = disconnectRequestSchema.safeParse({ provider: 'Google' })
    expect(result.success).toBe(true)
  })

  it('rejects empty body', () => {
    const result = disconnectRequestSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})

// ==========================================
// syncRequestSchema
// ==========================================

describe('syncRequestSchema', () => {
  it('accepts empty body with defaults', () => {
    const result = syncRequestSchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.force).toBe(false)
      expect(result.data.provider).toBeUndefined()
    }
  })

  it('accepts force=true', () => {
    const result = syncRequestSchema.safeParse({ force: true })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.force).toBe(true)
    }
  })

  it('accepts provider filter', () => {
    const result = syncRequestSchema.safeParse({ provider: 'Google' })
    expect(result.success).toBe(true)
  })
})

// ==========================================
// googleEventSchema
// ==========================================

describe('googleEventSchema', () => {
  const validEvent = {
    id: 'google-evt-1',
    start: { dateTime: '2026-01-30T09:00:00Z' },
    end: { dateTime: '2026-01-30T10:00:00Z' },
  }

  it('accepts minimal valid event', () => {
    const result = googleEventSchema.safeParse(validEvent)
    expect(result.success).toBe(true)
  })

  it('accepts event with all optional fields', () => {
    const result = googleEventSchema.safeParse({
      ...validEvent,
      status: 'confirmed',
      summary: 'Team Meeting',
      description: 'Weekly sync',
      location: 'Room 101',
    })
    expect(result.success).toBe(true)
  })

  it('accepts event with passthrough fields', () => {
    const result = googleEventSchema.safeParse({
      ...validEvent,
      kind: 'calendar#event',
      etag: '"abc"',
      unknownField: 'should pass through',
    })
    expect(result.success).toBe(true)
  })

  it('rejects event without id', () => {
    const result = googleEventSchema.safeParse({
      start: { dateTime: '2026-01-30T09:00:00Z' },
      end: { dateTime: '2026-01-30T10:00:00Z' },
    })
    expect(result.success).toBe(false)
  })

  it('rejects event without start', () => {
    const result = googleEventSchema.safeParse({
      id: 'evt-1',
      end: { dateTime: '2026-01-30T10:00:00Z' },
    })
    expect(result.success).toBe(false)
  })

  it('rejects event without end', () => {
    const result = googleEventSchema.safeParse({
      id: 'evt-1',
      start: { dateTime: '2026-01-30T09:00:00Z' },
    })
    expect(result.success).toBe(false)
  })

  it('accepts all-day event with date field', () => {
    const result = googleEventSchema.safeParse({
      id: 'evt-1',
      start: { date: '2026-01-30' },
      end: { date: '2026-01-31' },
    })
    expect(result.success).toBe(true)
  })
})

// ==========================================
// outlookEventSchema
// ==========================================

describe('outlookEventSchema', () => {
  const validEvent = {
    id: 'outlook-evt-1',
    start: { dateTime: '2026-01-30T14:00:00.0000000', timeZone: 'UTC' },
    end: { dateTime: '2026-01-30T15:00:00.0000000', timeZone: 'UTC' },
  }

  it('accepts minimal valid event', () => {
    const result = outlookEventSchema.safeParse(validEvent)
    expect(result.success).toBe(true)
  })

  it('accepts event with all optional fields', () => {
    const result = outlookEventSchema.safeParse({
      ...validEvent,
      subject: 'Sprint Planning',
      bodyPreview: 'Discuss priorities',
      isAllDay: false,
      isCancelled: false,
      location: { displayName: 'Room A' },
    })
    expect(result.success).toBe(true)
  })

  it('rejects event without id', () => {
    const result = outlookEventSchema.safeParse({
      start: validEvent.start,
      end: validEvent.end,
    })
    expect(result.success).toBe(false)
  })

  it('rejects event without start.timeZone', () => {
    const result = outlookEventSchema.safeParse({
      id: 'evt-1',
      start: { dateTime: '2026-01-30T14:00:00' },
      end: validEvent.end,
    })
    expect(result.success).toBe(false)
  })

  it('accepts event with passthrough fields', () => {
    const result = outlookEventSchema.safeParse({
      ...validEvent,
      '@odata.etag': '"W/abc"',
      createdDateTime: '2026-01-01T00:00:00Z',
    })
    expect(result.success).toBe(true)
  })
})

// ==========================================
// tokenResponseSchema
// ==========================================

describe('tokenResponseSchema', () => {
  it('accepts valid token response with required fields', () => {
    const result = tokenResponseSchema.safeParse({
      access_token: 'ya29.xxxxx',
      expires_in: 3600,
      token_type: 'Bearer',
    })
    expect(result.success).toBe(true)
  })

  it('accepts token response with optional fields', () => {
    const result = tokenResponseSchema.safeParse({
      access_token: 'ya29.xxxxx',
      expires_in: 3600,
      token_type: 'Bearer',
      scope: 'calendar.readonly',
      refresh_token: '1//xxxxx',
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty access_token', () => {
    const result = tokenResponseSchema.safeParse({
      access_token: '',
      expires_in: 3600,
      token_type: 'Bearer',
    })
    expect(result.success).toBe(false)
  })

  it('rejects negative expires_in', () => {
    const result = tokenResponseSchema.safeParse({
      access_token: 'ya29.xxxxx',
      expires_in: -1,
      token_type: 'Bearer',
    })
    expect(result.success).toBe(false)
  })

  it('rejects missing required fields', () => {
    expect(tokenResponseSchema.safeParse({}).success).toBe(false)
    expect(tokenResponseSchema.safeParse({ access_token: 'abc' }).success).toBe(false)
  })
})
