import type { CalendarProvider, OutlookCalendarEvent, OutlookCalendarListResponse } from '@/types/calendario'
import { fetchWithRetry } from './resilience'

// ==========================================
// MICROSOFT OAUTH CONSTANTS
// ==========================================

const MS_AUTH_ENDPOINT = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize'
const MS_TOKEN_ENDPOINT = 'https://login.microsoftonline.com/common/oauth2/v2.0/token'
const MS_GRAPH_ME = 'https://graph.microsoft.com/v1.0/me'
const MS_GRAPH_CALENDAR_VIEW = 'https://graph.microsoft.com/v1.0/me/calendarView'
const MS_SCOPES = 'offline_access Calendars.Read User.Read'

// ==========================================
// TYPES
// ==========================================

export interface OutlookTokenResponse {
  access_token: string
  refresh_token?: string
  expires_in: number
  scope: string
  token_type: string
}

interface MicrosoftUserProfile {
  id: string
  displayName: string
  mail: string | null
  userPrincipalName: string
}

// ==========================================
// HELPERS
// ==========================================

function getMicrosoftClientId(): string {
  const clientId = process.env.MICROSOFT_CLIENT_ID
  if (!clientId) {
    throw new Error('MICROSOFT_CLIENT_ID environment variable is not configured')
  }
  return clientId
}

function getMicrosoftClientSecret(): string {
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET
  if (!clientSecret) {
    throw new Error('MICROSOFT_CLIENT_SECRET environment variable is not configured')
  }
  return clientSecret
}

function getMicrosoftRedirectUri(): string {
  const redirectUri = process.env.MICROSOFT_REDIRECT_URI
  if (!redirectUri) {
    throw new Error('MICROSOFT_REDIRECT_URI environment variable is not configured')
  }
  return redirectUri
}

// ==========================================
// PUBLIC API
// ==========================================

export const OUTLOOK_PROVIDER: CalendarProvider = 'Outlook'

export function buildOutlookAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: getMicrosoftClientId(),
    redirect_uri: getMicrosoftRedirectUri(),
    scope: MS_SCOPES,
    response_type: 'code',
    state,
    response_mode: 'query',
  })

  return `${MS_AUTH_ENDPOINT}?${params.toString()}`
}

export async function exchangeOutlookCode(code: string): Promise<OutlookTokenResponse> {
  const response = await fetch(MS_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: getMicrosoftClientId(),
      client_secret: getMicrosoftClientSecret(),
      redirect_uri: getMicrosoftRedirectUri(),
      grant_type: 'authorization_code',
      scope: MS_SCOPES,
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Microsoft token exchange failed: ${response.status} ${errorBody}`)
  }

  return response.json() as Promise<OutlookTokenResponse>
}

export async function refreshOutlookToken(
  refreshToken: string,
): Promise<OutlookTokenResponse> {
  const response = await fetch(MS_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: getMicrosoftClientId(),
      client_secret: getMicrosoftClientSecret(),
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
      scope: MS_SCOPES,
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    if (errorBody.includes('invalid_grant') || errorBody.includes('interaction_required')) {
      throw new Error('TOKEN_REVOKED')
    }
    throw new Error(`Microsoft token refresh failed: ${response.status}`)
  }

  return response.json() as Promise<OutlookTokenResponse>
}

export async function fetchOutlookCalendarEvents(
  accessToken: string,
  startDateTime: string,
  endDateTime: string,
  userId: string = 'unknown',
): Promise<{ events: OutlookCalendarEvent[]; deltaLink: string | null }> {
  const allEvents: OutlookCalendarEvent[] = []
  let deltaLink: string | null = null
  const context = { provider: 'Outlook', userId }

  const params = new URLSearchParams({
    startDateTime,
    endDateTime,
    $top: '1000',
    $select: 'id,subject,bodyPreview,start,end,location,isAllDay,isCancelled',
  })

  let url: string | null = `${MS_GRAPH_CALENDAR_VIEW}?${params.toString()}`

  while (url) {
    const response = await fetchWithRetry(
      url,
      { headers: { Authorization: `Bearer ${accessToken}` } },
      context,
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch Outlook Calendar events: ${response.status}`)
    }

    const data = (await response.json()) as OutlookCalendarListResponse
    allEvents.push(...data.value)
    url = data['@odata.nextLink'] ?? null
    deltaLink = data['@odata.deltaLink'] ?? null
  }

  return { events: allEvents, deltaLink }
}

export async function getOutlookUserEmail(accessToken: string): Promise<string> {
  const response = await fetch(MS_GRAPH_ME, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch Microsoft user profile: ${response.status}`)
  }

  const data = (await response.json()) as MicrosoftUserProfile
  return data.mail ?? data.userPrincipalName
}
