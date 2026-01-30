import { z } from 'zod'

// ==========================================
// PERFIL - UPDATE
// ==========================================

export const perfilUpdateSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo').optional(),
  avatar_url: z.string().url('URL inválida').nullable().optional(),
})

// ==========================================
// TYPES INFERIDOS
// ==========================================

export type PerfilUpdateInput = z.infer<typeof perfilUpdateSchema>
