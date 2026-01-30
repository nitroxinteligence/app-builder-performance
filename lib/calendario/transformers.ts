import type { CreateEventDto, CalendarIntegration } from '@/types/agenda'
import type { GoogleCalendarEvent, OutlookCalendarEvent } from '@/types/calendario'

// ==========================================
// INTERNAL TYPES
// ==========================================

export interface SyncEventDto extends CreateEventDto {
  external_event_id: string
}

// ==========================================
// GOOGLE → AgendaEvent
// ==========================================

function extractDateFromGoogleDateTime(dt: { date?: string; dateTime?: string }): string {
  if (dt.date) {
    return dt.date
  }
  if (dt.dateTime) {
    return dt.dateTime.slice(0, 10)
  }
  return new Date().toISOString().slice(0, 10)
}

function extractTimeFromGoogleDateTime(
  dt: { date?: string; dateTime?: string },
  fallback: string,
): string {
  if (dt.dateTime) {
    const match = dt.dateTime.match(/T(\d{2}:\d{2})/)
    return match ? match[1] : fallback
  }
  return fallback
}

export function transformGoogleEvent(event: GoogleCalendarEvent): SyncEventDto {
  const isAllDay = Boolean(event.start.date && !event.start.dateTime)

  return {
    titulo: event.summary ?? '(Sem título)',
    descricao: event.description,
    data: extractDateFromGoogleDateTime(event.start),
    horario_inicio: isAllDay ? '00:00' : extractTimeFromGoogleDateTime(event.start, '00:00'),
    horario_fim: isAllDay ? '23:59' : extractTimeFromGoogleDateTime(event.end, '23:59'),
    categoria: 'Reuniao',
    local: event.location,
    status: 'confirmado',
    calendario: 'Google' as CalendarIntegration,
    external_event_id: event.id,
  }
}

// ==========================================
// OUTLOOK → AgendaEvent
// ==========================================

function extractDateFromOutlookDateTime(dt: { dateTime: string }): string {
  return dt.dateTime.slice(0, 10)
}

function extractTimeFromOutlookDateTime(dt: { dateTime: string }, fallback: string): string {
  const match = dt.dateTime.match(/T(\d{2}:\d{2})/)
  return match ? match[1] : fallback
}

export function transformOutlookEvent(event: OutlookCalendarEvent): SyncEventDto {
  const isAllDay = event.isAllDay === true

  return {
    titulo: event.subject ?? '(Sem título)',
    descricao: event.bodyPreview ?? undefined,
    data: extractDateFromOutlookDateTime(event.start),
    horario_inicio: isAllDay ? '00:00' : extractTimeFromOutlookDateTime(event.start, '00:00'),
    horario_fim: isAllDay ? '23:59' : extractTimeFromOutlookDateTime(event.end, '23:59'),
    categoria: 'Reuniao',
    local: event.location?.displayName ?? undefined,
    status: 'confirmado',
    calendario: 'Outlook' as CalendarIntegration,
    external_event_id: event.id,
  }
}
