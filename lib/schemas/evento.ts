import { z } from 'zod'

// ==========================================
// ENUMS
// ==========================================

export const statusEventoSchema = z.enum(['confirmado', 'pendente', 'foco'])
export const integracaoCalendarioSchema = z.enum(['Manual', 'Google', 'Outlook'])

// ==========================================
// EVENTO - CREATE
// ==========================================

export const eventoCreateSchema = z.object({
  titulo: z.string().min(1, 'Título é obrigatório').max(200, 'Título muito longo'),
  descricao: z.string().max(1000, 'Descrição muito longa').nullable().optional(),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (YYYY-MM-DD)'),
  horario_inicio: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Horário inválido (HH:MM)'),
  horario_fim: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Horário inválido (HH:MM)'),
  categoria: z.string().min(1, 'Categoria é obrigatória').max(50, 'Categoria muito longa').default('Reunião'),
  local: z.string().max(200, 'Local muito longo').nullable().optional(),
  status: statusEventoSchema.default('confirmado'),
  calendario: integracaoCalendarioSchema.default('Manual'),
  user_id: z.string().uuid('ID de usuário inválido'),
}).refine(
  (data) => data.horario_fim > data.horario_inicio,
  { message: 'Horário de fim deve ser posterior ao horário de início', path: ['horario_fim'] }
)

// ==========================================
// EVENTO - UPDATE
// ==========================================

export const eventoUpdateSchema = z.object({
  titulo: z.string().min(1, 'Título é obrigatório').max(200, 'Título muito longo').optional(),
  descricao: z.string().max(1000, 'Descrição muito longa').nullable().optional(),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (YYYY-MM-DD)').optional(),
  horario_inicio: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Horário inválido (HH:MM)').optional(),
  horario_fim: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Horário inválido (HH:MM)').optional(),
  categoria: z.string().max(50, 'Categoria muito longa').optional(),
  local: z.string().max(200, 'Local muito longo').nullable().optional(),
  status: statusEventoSchema.optional(),
  calendario: integracaoCalendarioSchema.optional(),
})

// ==========================================
// TYPES INFERIDOS
// ==========================================

export type StatusEvento = z.infer<typeof statusEventoSchema>
export type IntegracaoCalendario = z.infer<typeof integracaoCalendarioSchema>
export type EventoCreateInput = z.infer<typeof eventoCreateSchema>
export type EventoUpdateInput = z.infer<typeof eventoUpdateSchema>
