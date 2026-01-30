import { z } from 'zod'

// ==========================================
// ENUMS
// ==========================================

export const calendarProviderSchema = z.enum(['Google', 'Outlook'])

export const calendarConnectionStatusSchema = z.enum([
  'connected',
  'disconnected',
  'syncing',
  'error',
])

// ==========================================
// CALENDAR CONNECTION (tabela completa)
// ==========================================

export const calendarConnectionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  provider: calendarProviderSchema,
  access_token: z.string().min(1),
  refresh_token: z.string().min(1),
  token_expires_at: z.string().datetime(),
  scopes: z.array(z.string()).default([]),
  external_email: z.string().email().nullable().optional(),
  is_active: z.boolean().default(true),
  last_sync_at: z.string().datetime().nullable().optional(),
  sync_token: z.string().nullable().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

// ==========================================
// REQUEST SCHEMAS
// ==========================================

export const connectRequestSchema = z.object({
  provider: calendarProviderSchema,
})

export const disconnectRequestSchema = z.object({
  provider: calendarProviderSchema,
})

export const syncRequestSchema = z.object({
  provider: calendarProviderSchema.optional(),
  force: z.boolean().default(false),
})

// ==========================================
// EXTERNAL EVENT VALIDATION
// ==========================================

export const externalEventSchema = z.object({
  id: z.string().min(1, 'ID do evento externo e obrigatorio'),
  title: z.string().min(1, 'Titulo e obrigatorio').max(500, 'Titulo muito longo'),
  description: z.string().max(5000, 'Descricao muito longa').nullable(),
  location: z.string().max(500, 'Local muito longo').nullable(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data invalida (YYYY-MM-DD)'),
  start_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Horario invalido (HH:MM)'),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data invalida (YYYY-MM-DD)'),
  end_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Horario invalido (HH:MM)'),
  is_all_day: z.boolean(),
  status: z.string(),
  provider: calendarProviderSchema,
})

// ==========================================
// TYPES INFERIDOS
// ==========================================

export type CalendarProviderInput = z.infer<typeof calendarProviderSchema>
export type CalendarConnectionInput = z.infer<typeof calendarConnectionSchema>
export type ConnectRequestInput = z.infer<typeof connectRequestSchema>
export type DisconnectRequestInput = z.infer<typeof disconnectRequestSchema>
export type SyncRequestInput = z.infer<typeof syncRequestSchema>
export type ExternalEventInput = z.infer<typeof externalEventSchema>
