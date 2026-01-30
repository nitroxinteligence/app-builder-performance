import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import {
  fetchWithRetry,
  mapHttpErrorToSyncError,
  getErrorMessage,
  shouldSkipAutoSync,
  isTokenExpiringSoon,
} from '../resilience'

// ==========================================
// mapHttpErrorToSyncError
// ==========================================

describe('mapHttpErrorToSyncError', () => {
  it('maps 401 to TOKEN_EXPIRED', () => {
    expect(mapHttpErrorToSyncError(401)).toBe('TOKEN_EXPIRED')
  })

  it('maps 403 to PERMISSION_DENIED', () => {
    expect(mapHttpErrorToSyncError(403)).toBe('PERMISSION_DENIED')
  })

  it('maps 429 to RATE_LIMITED', () => {
    expect(mapHttpErrorToSyncError(429)).toBe('RATE_LIMITED')
  })

  it.each([500, 502, 503, 504])('maps %d to PROVIDER_UNAVAILABLE', (status) => {
    expect(mapHttpErrorToSyncError(status)).toBe('PROVIDER_UNAVAILABLE')
  })

  it('maps unknown status to UNKNOWN_ERROR', () => {
    expect(mapHttpErrorToSyncError(418)).toBe('UNKNOWN_ERROR')
    expect(mapHttpErrorToSyncError(0)).toBe('UNKNOWN_ERROR')
  })
})

// ==========================================
// getErrorMessage
// ==========================================

describe('getErrorMessage', () => {
  it('returns provider-specific message for TOKEN_EXPIRED', () => {
    expect(getErrorMessage('TOKEN_EXPIRED', 'Google')).toContain('Google')
  })

  it('returns provider-specific message for TOKEN_REVOKED', () => {
    expect(getErrorMessage('TOKEN_REVOKED', 'Outlook')).toContain('Outlook')
  })

  it('returns generic message for RATE_LIMITED', () => {
    const msg = getErrorMessage('RATE_LIMITED', 'Google')
    expect(msg).toBeTruthy()
    expect(typeof msg).toBe('string')
  })

  it('returns generic message for NETWORK_ERROR', () => {
    expect(getErrorMessage('NETWORK_ERROR', 'Google')).toContain('conexao')
  })

  it('returns fallback for UNKNOWN_ERROR', () => {
    expect(getErrorMessage('UNKNOWN_ERROR', 'Google')).toBeTruthy()
  })

  it('returns message for every error type', () => {
    const types = [
      'TOKEN_EXPIRED',
      'TOKEN_REVOKED',
      'RATE_LIMITED',
      'NETWORK_ERROR',
      'PERMISSION_DENIED',
      'PROVIDER_UNAVAILABLE',
      'INVALID_RESPONSE',
      'UNKNOWN_ERROR',
    ] as const

    for (const t of types) {
      const msg = getErrorMessage(t, 'Google')
      expect(msg).toBeTruthy()
      expect(msg.length).toBeGreaterThan(5)
    }
  })
})

// ==========================================
// shouldSkipAutoSync
// ==========================================

describe('shouldSkipAutoSync', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns false when lastSyncAt is null', () => {
    expect(shouldSkipAutoSync(null)).toBe(false)
  })

  it('returns true when last sync was less than 5 minutes ago', () => {
    const now = new Date('2026-01-30T12:00:00Z')
    vi.setSystemTime(now)

    const twoMinutesAgo = new Date('2026-01-30T11:58:00Z').toISOString()
    expect(shouldSkipAutoSync(twoMinutesAgo)).toBe(true)
  })

  it('returns false when last sync was more than 5 minutes ago', () => {
    const now = new Date('2026-01-30T12:00:00Z')
    vi.setSystemTime(now)

    const tenMinutesAgo = new Date('2026-01-30T11:50:00Z').toISOString()
    expect(shouldSkipAutoSync(tenMinutesAgo)).toBe(false)
  })

  it('returns false when last sync was exactly 5 minutes ago', () => {
    const now = new Date('2026-01-30T12:05:00Z')
    vi.setSystemTime(now)

    const fiveMinutesAgo = new Date('2026-01-30T12:00:00Z').toISOString()
    expect(shouldSkipAutoSync(fiveMinutesAgo)).toBe(false)
  })

  it('returns true when last sync was 4m59s ago', () => {
    const now = new Date('2026-01-30T12:04:59Z')
    vi.setSystemTime(now)

    const almostFiveMin = new Date('2026-01-30T12:00:00Z').toISOString()
    expect(shouldSkipAutoSync(almostFiveMin)).toBe(true)
  })
})

// ==========================================
// isTokenExpiringSoon
// ==========================================

describe('isTokenExpiringSoon', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns true when token expires within 5 minutes', () => {
    const now = new Date('2026-01-30T12:00:00Z')
    vi.setSystemTime(now)

    const expiresInThreeMin = new Date('2026-01-30T12:03:00Z').toISOString()
    expect(isTokenExpiringSoon(expiresInThreeMin)).toBe(true)
  })

  it('returns true when token is already expired', () => {
    const now = new Date('2026-01-30T12:00:00Z')
    vi.setSystemTime(now)

    const alreadyExpired = new Date('2026-01-30T11:50:00Z').toISOString()
    expect(isTokenExpiringSoon(alreadyExpired)).toBe(true)
  })

  it('returns false when token expires in more than 5 minutes', () => {
    const now = new Date('2026-01-30T12:00:00Z')
    vi.setSystemTime(now)

    const expiresInTenMin = new Date('2026-01-30T12:10:00Z').toISOString()
    expect(isTokenExpiringSoon(expiresInTenMin)).toBe(false)
  })

  it('returns true at exactly 5 minute boundary', () => {
    const now = new Date('2026-01-30T12:00:00Z')
    vi.setSystemTime(now)

    const expiresExactly = new Date('2026-01-30T12:05:00Z').toISOString()
    expect(isTokenExpiringSoon(expiresExactly)).toBe(true)
  })

  it('returns false when token expires in 5min + 1ms', () => {
    const now = new Date('2026-01-30T12:00:00.000Z')
    vi.setSystemTime(now)

    const expiresJustAfter = new Date('2026-01-30T12:05:00.001Z').toISOString()
    expect(isTokenExpiringSoon(expiresJustAfter)).toBe(false)
  })
})

// ==========================================
// fetchWithRetry
// ==========================================

describe('fetchWithRetry', () => {
  const context = { provider: 'Google', userId: 'test-user' }

  beforeEach(() => {
    vi.useFakeTimers()
    vi.spyOn(globalThis, 'fetch')
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('returns response on first success', async () => {
    const mockResponse = new Response('ok', { status: 200 })
    vi.mocked(fetch).mockResolvedValueOnce(mockResponse)

    const result = await fetchWithRetry('https://example.com', {}, context, 3, 10)

    expect(result.status).toBe(200)
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('returns non-retryable error immediately (e.g. 401)', async () => {
    const mockResponse = new Response('unauthorized', { status: 401 })
    vi.mocked(fetch).mockResolvedValueOnce(mockResponse)

    const result = await fetchWithRetry('https://example.com', {}, context, 3, 10)

    expect(result.status).toBe(401)
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('retries on 429 and succeeds on second attempt', async () => {
    const failResponse = new Response('rate limited', { status: 429 })
    const successResponse = new Response('ok', { status: 200 })

    vi.mocked(fetch)
      .mockResolvedValueOnce(failResponse)
      .mockResolvedValueOnce(successResponse)

    const promise = fetchWithRetry('https://example.com', {}, context, 3, 10)

    // Advance past the retry delay
    await vi.advanceTimersByTimeAsync(2000)

    const result = await promise
    expect(result.status).toBe(200)
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('throws after exhausting all retries on 500', async () => {
    vi.useRealTimers()
    vi.mocked(fetch)
      .mockImplementation(() =>
        Promise.resolve(new Response('server error', { status: 500 }))
      )

    await expect(
      fetchWithRetry('https://example.com', {}, context, 1, 0)
    ).rejects.toThrow('HTTP 500')
  })

  it('retries on network errors', async () => {
    vi.mocked(fetch)
      .mockRejectedValueOnce(new Error('Network failure'))
      .mockResolvedValueOnce(new Response('ok', { status: 200 }))

    const promise = fetchWithRetry('https://example.com', {}, context, 3, 10)

    await vi.advanceTimersByTimeAsync(2000)

    const result = await promise
    expect(result.status).toBe(200)
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('throws network error after all retries exhausted', async () => {
    vi.useRealTimers()
    vi.mocked(fetch)
      .mockImplementation(() => Promise.reject(new Error('Network failure')))

    await expect(
      fetchWithRetry('https://example.com', {}, context, 1, 0)
    ).rejects.toThrow('Network failure')
  })

  it('passes correct options to fetch', async () => {
    const mockResponse = new Response('ok', { status: 200 })
    vi.mocked(fetch).mockResolvedValueOnce(mockResponse)

    const options = { headers: { Authorization: 'Bearer token123' } }
    await fetchWithRetry('https://api.example.com', options, context, 0, 10)

    expect(fetch).toHaveBeenCalledWith('https://api.example.com', options)
  })
})
