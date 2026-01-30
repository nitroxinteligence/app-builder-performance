import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { generateStateToken, validateStateToken } from '../auth-state'

// ==========================================
// SETUP
// ==========================================

const TEST_SECRET = 'test-secret-key-for-calendar-state-tokens-32'

beforeEach(() => {
  vi.stubEnv('CALENDAR_STATE_SECRET', TEST_SECRET)
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.useRealTimers()
})

// ==========================================
// generateStateToken
// ==========================================

describe('generateStateToken', () => {
  it('generates a string with two parts separated by dot', () => {
    const token = generateStateToken('user-1', 'Google')
    const parts = token.split('.')
    expect(parts).toHaveLength(2)
    expect(parts[0].length).toBeGreaterThan(0)
    expect(parts[1].length).toBeGreaterThan(0)
  })

  it('generates different tokens for different users', () => {
    const token1 = generateStateToken('user-1', 'Google')
    const token2 = generateStateToken('user-2', 'Google')
    expect(token1).not.toBe(token2)
  })

  it('generates different tokens for different providers', () => {
    const token1 = generateStateToken('user-1', 'Google')
    const token2 = generateStateToken('user-1', 'Outlook')
    expect(token1).not.toBe(token2)
  })

  it('generates different tokens on successive calls (nonce)', () => {
    const token1 = generateStateToken('user-1', 'Google')
    const token2 = generateStateToken('user-1', 'Google')
    expect(token1).not.toBe(token2)
  })

  it('throws when CALENDAR_STATE_SECRET is not set', () => {
    vi.stubEnv('CALENDAR_STATE_SECRET', '')
    expect(() => generateStateToken('user-1', 'Google')).toThrow(
      'CALENDAR_STATE_SECRET'
    )
  })
})

// ==========================================
// validateStateToken
// ==========================================

describe('validateStateToken', () => {
  it('validates a freshly generated token', () => {
    const token = generateStateToken('user-1', 'Google')
    const result = validateStateToken(token)

    expect(result.userId).toBe('user-1')
    expect(result.provider).toBe('Google')
  })

  it('validates Outlook provider token', () => {
    const token = generateStateToken('user-2', 'Outlook')
    const result = validateStateToken(token)

    expect(result.userId).toBe('user-2')
    expect(result.provider).toBe('Outlook')
  })

  it('throws on invalid token format (no dot)', () => {
    expect(() => validateStateToken('no-dot-here')).toThrow('Invalid state token format')
  })

  it('throws on invalid token format (too many dots)', () => {
    expect(() => validateStateToken('a.b.c')).toThrow('Invalid state token format')
  })

  it('throws on tampered payload', () => {
    const token = generateStateToken('user-1', 'Google')
    const parts = token.split('.')
    const tampered = `${parts[0]}x.${parts[1]}`
    expect(() => validateStateToken(tampered)).toThrow()
  })

  it('throws on tampered signature', () => {
    const token = generateStateToken('user-1', 'Google')
    const parts = token.split('.')
    const tampered = `${parts[0]}.${parts[1]}x`
    expect(() => validateStateToken(tampered)).toThrow('Invalid state token signature')
  })

  it('throws on expired token', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-30T12:00:00Z'))

    const token = generateStateToken('user-1', 'Google')

    // Advance time past the 5-minute expiry
    vi.setSystemTime(new Date('2026-01-30T12:06:00Z'))

    expect(() => validateStateToken(token)).toThrow('State token has expired')
  })

  it('accepts token just before expiry', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-30T12:00:00Z'))

    const token = generateStateToken('user-1', 'Google')

    // Advance to 4m59s later
    vi.setSystemTime(new Date('2026-01-30T12:04:59Z'))

    const result = validateStateToken(token)
    expect(result.userId).toBe('user-1')
  })

  it('throws when secret changes between generate and validate', () => {
    const token = generateStateToken('user-1', 'Google')

    vi.stubEnv('CALENDAR_STATE_SECRET', 'different-secret-key-entirely-new')

    expect(() => validateStateToken(token)).toThrow('Invalid state token signature')
  })

  it('throws when CALENDAR_STATE_SECRET is not set during validation', () => {
    const token = generateStateToken('user-1', 'Google')
    vi.stubEnv('CALENDAR_STATE_SECRET', '')

    expect(() => validateStateToken(token)).toThrow('CALENDAR_STATE_SECRET')
  })
})
