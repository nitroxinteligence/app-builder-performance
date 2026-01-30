import { createHmac, randomUUID, timingSafeEqual } from 'crypto'

import type { CalendarProvider } from '@/types/calendario'

// ==========================================
// STATE TOKEN TYPES
// ==========================================

interface StatePayload {
  userId: string
  provider: CalendarProvider
  nonce: string
  exp: number
}

interface ValidatedState {
  userId: string
  provider: CalendarProvider
}

// ==========================================
// HELPERS
// ==========================================

function getSecret(): string {
  const secret = process.env.CALENDAR_STATE_SECRET
  if (!secret) {
    throw new Error('CALENDAR_STATE_SECRET environment variable is not configured')
  }
  return secret
}

function toBase64Url(data: string): string {
  return Buffer.from(data, 'utf-8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function fromBase64Url(data: string): string {
  const padded = data.replace(/-/g, '+').replace(/_/g, '/')
  return Buffer.from(padded, 'base64').toString('utf-8')
}

function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret)
    .update(payload)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

// ==========================================
// PUBLIC API
// ==========================================

const STATE_TOKEN_EXPIRY_MS = 5 * 60 * 1000 // 5 minutes

export function generateStateToken(
  userId: string,
  provider: CalendarProvider
): string {
  const secret = getSecret()

  const payload: StatePayload = {
    userId,
    provider,
    nonce: randomUUID(),
    exp: Date.now() + STATE_TOKEN_EXPIRY_MS,
  }

  const payloadString = JSON.stringify(payload)
  const encodedPayload = toBase64Url(payloadString)
  const signature = sign(encodedPayload, secret)

  return `${encodedPayload}.${signature}`
}

export function validateStateToken(token: string): ValidatedState {
  const secret = getSecret()

  const parts = token.split('.')
  if (parts.length !== 2) {
    throw new Error('Invalid state token format')
  }

  const [encodedPayload, providedSignature] = parts

  const expectedSignature = sign(encodedPayload, secret)
  const sigA = Buffer.from(providedSignature, 'utf-8')
  const sigB = Buffer.from(expectedSignature, 'utf-8')
  if (sigA.length !== sigB.length || !timingSafeEqual(sigA, sigB)) {
    throw new Error('Invalid state token signature')
  }

  let payload: StatePayload
  try {
    const decoded = fromBase64Url(encodedPayload)
    payload = JSON.parse(decoded) as StatePayload
  } catch {
    throw new Error('Invalid state token payload')
  }

  if (!payload.userId || !payload.provider || !payload.nonce || !payload.exp) {
    throw new Error('Incomplete state token payload')
  }

  if (payload.provider !== 'Google' && payload.provider !== 'Outlook') {
    throw new Error('Invalid provider in state token')
  }

  if (Date.now() > payload.exp) {
    throw new Error('State token has expired')
  }

  return {
    userId: payload.userId,
    provider: payload.provider,
  }
}
