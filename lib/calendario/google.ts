import type { CalendarProvider, GoogleCalendarEvent, GoogleCalendarListResponse } from '@/types/calendario'

// ==========================================
// GOOGLE OAUTH CONSTANTS
// ==========================================

const GOOGLE_AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token'
const GOOGLE_CALENDAR_PRIMARY = 'https://www.googleapis.com/calendar/v3/calendars/primary'
const GOOGLE_CALENDAR_EVENTS = 'https://www.googleapis.com/calendar/v3/calendars/primary/events'
const GOOGLE_SCOPE = 'https://www.googleapis.com/auth/calendar.readonly'

// ==========================================
// TYPES
// ==========================================

export interface GoogleTokenResponse {
  access_token: string
  refresh_token?: string
  expires_in: number
  scope: string
  token_type: string
}

interface GoogleCalendarPrimaryResponse {
  kind: string
  etag: string
  id: string
  summary: string
  timeZone: string
}

// ==========================================
// HELPERS
// ==========================================

function getGoogleClientId(): string {
  const clientId = process.env.GOOGLE_CLIENT_ID
  if (!clientId) {
    throw new Error('GOOGLE_CLIENT_ID environment variable is not configured')
  }
  return clientId
}

function getGoogleClientSecret(): string {
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  if (!clientSecret) {
    throw new Error('GOOGLE_CLIENT_SECRET environment variable is not configured')
  }
  return clientSecret
}

function getGoogleRedirectUri(): string {
  const redirectUri = process.env.GOOGLE_REDIRECT_URI
  if (!redirectUri) {
    throw new Error('GOOGLE_REDIRECT_URI environment variable is not configured')
  }
  return redirectUri
}

// ==========================================
// PUBLIC API
// ==========================================

export const GOOGLE_PROVIDER: CalendarProvider = 'Google'

export function buildGoogleAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: getGoogleClientId(),
    redirect_uri: getGoogleRedirectUri(),
    scope: GOOGLE_SCOPE,
    access_type: 'offline',
    prompt: 'consent',
    state,
    response_type: 'code',
  })

  return `${GOOGLE_AUTH_ENDPOINT}?${params.toString()}`
}

export async function exchangeGoogleCode(code: string): Promise<GoogleTokenResponse> {
  const response = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: getGoogleClientId(),
      client_secret: getGoogleClientSecret(),
      redirect_uri: getGoogleRedirectUri(),
      grant_type: 'authorization_code',
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Google token exchange failed: ${response.status} ${errorBody}`)
  }

  return response.json() as Promise<GoogleTokenResponse>
}

export async function fetchGoogleCalendarEvents(
  accessToken: string,
  timeMin: string,
  timeMax: string,
): Promise<{ events: GoogleCalendarEvent[]; syncToken: string | null }> {
  const allEvents: GoogleCalendarEvent[] = []
  let pageToken: string | undefined
  let syncToken: string | null = null

  do {
    const params = new URLSearchParams({
      timeMin,
      timeMax,
      singleEvents: 'true',
      orderBy: 'startTime',
      maxResults: '2500',
    })

    if (pageToken) {
      params.set('pageToken', pageToken)
    }

    const response = await fetch(`${GOOGLE_CALENDAR_EVENTS}?${params.toString()}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch Google Calendar events: ${response.status}`)
    }

    const data = (await response.json()) as GoogleCalendarListResponse
    allEvents.push(...data.items)
    pageToken = data.nextPageToken
    syncToken = data.nextSyncToken ?? null
  } while (pageToken)

  return { events: allEvents, syncToken }
}

export async function getGoogleUserEmail(accessToken: string): Promise<string> {
  const response = await fetch(GOOGLE_CALENDAR_PRIMARY, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch Google calendar info: ${response.status}`)
  }

  const data = (await response.json()) as GoogleCalendarPrimaryResponse
  return data.id
}
