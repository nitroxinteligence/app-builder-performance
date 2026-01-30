// ==========================================
// TIPOS DE INTEGRACAO DE CALENDARIO
// ==========================================

export type { CalendarIntegration } from './agenda'

// ==========================================
// PROVIDER E STATUS
// ==========================================

export type CalendarProvider = 'Google' | 'Outlook'

export type CalendarConnectionStatus = 'connected' | 'disconnected' | 'syncing' | 'error'

export type CalendarSyncError =
  | 'TOKEN_EXPIRED'
  | 'TOKEN_REVOKED'
  | 'RATE_LIMITED'
  | 'NETWORK_ERROR'
  | 'PERMISSION_DENIED'
  | 'PROVIDER_UNAVAILABLE'
  | 'INVALID_RESPONSE'
  | 'UNKNOWN_ERROR'

// ==========================================
// CALENDAR CONNECTION (tabela calendar_connections)
// ==========================================

export interface CalendarConnection {
  id: string
  user_id: string
  provider: CalendarProvider
  access_token: string
  refresh_token: string
  token_expires_at: string
  scopes: string[]
  external_email: string | null
  is_active: boolean
  last_sync_at: string | null
  sync_token: string | null
  created_at: string
  updated_at: string
}

// ==========================================
// RESULTADO DE SINCRONIZACAO
// ==========================================

export interface SyncResult {
  provider: CalendarProvider
  created: number
  updated: number
  deleted: number
  errors: SyncError[]
  sync_token: string | null
}

export interface SyncError {
  external_event_id: string
  message: string
}

// ==========================================
// EVENTO EXTERNO GENERICO
// ==========================================

export interface ExternalEvent {
  id: string
  title: string
  description: string | null
  location: string | null
  start_date: string
  start_time: string
  end_date: string
  end_time: string
  is_all_day: boolean
  status: string
  provider: CalendarProvider
}

// ==========================================
// GOOGLE CALENDAR EVENT (API v3)
// ==========================================

export interface GoogleCalendarDateTime {
  date?: string
  dateTime?: string
  timeZone?: string
}

export interface GoogleCalendarPerson {
  id?: string
  email?: string
  displayName?: string
  self?: boolean
}

export interface GoogleCalendarEvent {
  kind: string
  etag: string
  id: string
  status: string
  htmlLink: string
  created: string
  updated: string
  summary?: string
  description?: string
  location?: string
  colorId?: string
  creator?: GoogleCalendarPerson
  organizer?: GoogleCalendarPerson
  start: GoogleCalendarDateTime
  end: GoogleCalendarDateTime
  endTimeUnspecified?: boolean
  recurrence?: string[]
  recurringEventId?: string
  originalStartTime?: GoogleCalendarDateTime
  transparency?: string
  visibility?: string
  iCalUID: string
  sequence?: number
  attendees?: GoogleCalendarAttendee[]
  attendeesOmitted?: boolean
  hangoutLink?: string
  eventType?: string
}

export interface GoogleCalendarAttendee {
  id?: string
  email?: string
  displayName?: string
  organizer?: boolean
  self?: boolean
  resource?: boolean
  optional?: boolean
  responseStatus?: string
  comment?: string
  additionalGuests?: number
}

export interface GoogleCalendarListResponse {
  kind: string
  etag: string
  summary: string
  updated: string
  timeZone: string
  accessRole: string
  nextPageToken?: string
  nextSyncToken?: string
  items: GoogleCalendarEvent[]
}

// ==========================================
// OUTLOOK CALENDAR EVENT (Microsoft Graph API)
// ==========================================

export interface OutlookDateTime {
  dateTime: string
  timeZone: string
}

export interface OutlookEmailAddress {
  name: string
  address: string
}

export interface OutlookLocation {
  displayName: string
  locationType?: string
  uniqueId?: string
  uniqueIdType?: string
}

export interface OutlookAttendee {
  type: string
  status: {
    response: string
    time: string
  }
  emailAddress: OutlookEmailAddress
}

export interface OutlookResponseStatus {
  response: string
  time: string
}

export interface OutlookBody {
  contentType: string
  content: string
}

export interface OutlookCalendarEvent {
  '@odata.etag'?: string
  id: string
  createdDateTime: string
  lastModifiedDateTime: string
  changeKey?: string
  categories?: string[]
  originalStartTimeZone?: string
  originalEndTimeZone?: string
  iCalUId?: string
  reminderMinutesBeforeStart?: number
  isReminderOn?: boolean
  hasAttachments?: boolean
  subject?: string
  bodyPreview?: string
  importance?: string
  sensitivity?: string
  isAllDay?: boolean
  isCancelled?: boolean
  isOrganizer?: boolean
  responseRequested?: boolean
  seriesMasterId?: string | null
  showAs?: string
  type?: string
  webLink?: string
  onlineMeetingUrl?: string | null
  recurrence?: unknown
  responseStatus?: OutlookResponseStatus
  body?: OutlookBody
  start: OutlookDateTime
  end: OutlookDateTime
  location?: OutlookLocation
  locations?: OutlookLocation[]
  attendees?: OutlookAttendee[]
  organizer?: {
    emailAddress: OutlookEmailAddress
  }
}

export interface OutlookCalendarListResponse {
  '@odata.context'?: string
  '@odata.nextLink'?: string
  '@odata.deltaLink'?: string
  value: OutlookCalendarEvent[]
}
