import { z } from 'zod'

// ==========================================
// ENUMS
// ==========================================

export const nivelCursoSchema = z.enum(['iniciante', 'intermediario', 'avancado'])
export const statusCursoSchema = z.enum(['rascunho', 'publicado', 'arquivado'])

// ==========================================
// COMPLETE LESSON
// ==========================================

export const completarAulaSchema = z.object({
  user_id: z.string().uuid('ID de usuário inválido'),
  lesson_id: z.string().uuid('ID de aula inválido'),
})

// ==========================================
// PROGRESSO AULA - UPDATE
// ==========================================

export const progressoAulaUpdateSchema = z.object({
  concluida: z.boolean().optional(),
  xp_ganho: z.number().int().min(0).optional(),
  concluida_em: z.string().nullable().optional(),
})

// ==========================================
// TYPES INFERIDOS
// ==========================================

export type NivelCurso = z.infer<typeof nivelCursoSchema>
export type StatusCurso = z.infer<typeof statusCursoSchema>
export type CompletarAulaInput = z.infer<typeof completarAulaSchema>
export type ProgressoAulaUpdateInput = z.infer<typeof progressoAulaUpdateSchema>
