import type { CalendarProvider, CalendarSyncError } from '@/types/calendario'

// ==========================================
// LOGGING
// ==========================================

function logSync(provider: string, userId: string, message: string): void {
  console.log(`[CalendarSync] [${provider}] [${userId}] ${message}`)
}

function logSyncError(provider: string, userId: string, message: string): void {
  console.error(`[CalendarSync] [${provider}] [${userId}] ${message}`)
}

export { logSync, logSyncError }

// ==========================================
// RETRY WITH BACKOFF
// ==========================================

const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504])
const MAX_RETRIES = 3
const BASE_DELAY = 1000

export async function fetchWithRetry(
  url: string,
  options: RequestInit,
  context: { provider: string; userId: string },
  maxRetries: number = MAX_RETRIES,
  baseDelay: number = BASE_DELAY,
): Promise<Response> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options)

      if (response.ok) {
        return response
      }

      // Non-retryable errors: throw immediately
      if (!RETRYABLE_STATUS_CODES.has(response.status)) {
        return response // Let caller handle specific error codes
      }

      // Retryable error
      lastError = new Error(`HTTP ${response.status}`)

      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 500
        logSync(
          context.provider,
          context.userId,
          `Retry ${attempt + 1}/${maxRetries} after ${Math.round(delay)}ms (HTTP ${response.status})`,
        )
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    } catch (error) {
      // Network error
      lastError = error instanceof Error ? error : new Error('Network error')

      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 500
        logSync(
          context.provider,
          context.userId,
          `Retry ${attempt + 1}/${maxRetries} after ${Math.round(delay)}ms (network error)`,
        )
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError ?? new Error('All retry attempts failed')
}

// ==========================================
// ERROR MAPPING
// ==========================================

export function mapHttpErrorToSyncError(status: number): CalendarSyncError {
  switch (status) {
    case 401:
      return 'TOKEN_EXPIRED'
    case 403:
      return 'PERMISSION_DENIED'
    case 429:
      return 'RATE_LIMITED'
    case 500:
    case 502:
    case 503:
    case 504:
      return 'PROVIDER_UNAVAILABLE'
    default:
      return 'UNKNOWN_ERROR'
  }
}

export function getErrorMessage(errorType: CalendarSyncError, provider: CalendarProvider): string {
  switch (errorType) {
    case 'TOKEN_EXPIRED':
      return `Reconectando com ${provider}...`
    case 'TOKEN_REVOKED':
      return `Sua conexao com ${provider} expirou. Por favor, reconecte.`
    case 'RATE_LIMITED':
      return 'Muitas sincronizacoes. Tente novamente em alguns minutos.'
    case 'NETWORK_ERROR':
      return 'Erro de conexao. Verifique sua internet.'
    case 'PERMISSION_DENIED':
      return `Permissao negada. Reconecte sua conta ${provider}.`
    case 'PROVIDER_UNAVAILABLE':
      return `${provider} temporariamente indisponivel. Tente novamente mais tarde.`
    case 'INVALID_RESPONSE':
      return `Resposta inesperada do ${provider}. Tente novamente.`
    case 'UNKNOWN_ERROR':
    default:
      return 'Erro ao sincronizar. Tente novamente.'
  }
}

// ==========================================
// RATE LIMITING
// ==========================================

const SYNC_COOLDOWN_MS = 5 * 60 * 1000 // 5 minutes

export function shouldSkipAutoSync(lastSyncAt: string | null): boolean {
  if (!lastSyncAt) return false
  const lastSync = new Date(lastSyncAt).getTime()
  return Date.now() - lastSync < SYNC_COOLDOWN_MS
}

// ==========================================
// TOKEN EXPIRY CHECK
// ==========================================

const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000 // 5 minutes

export function isTokenExpiringSoon(expiresAt: string): boolean {
  const expiry = new Date(expiresAt).getTime()
  return Date.now() + TOKEN_REFRESH_BUFFER_MS >= expiry
}
