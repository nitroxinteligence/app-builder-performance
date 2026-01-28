import { z } from 'zod'

// Enums que correspondem ao schema do banco de dados
export const prioridadeSchema = z.enum(['baixa', 'media', 'alta', 'urgente'])
export const colunaKanbanSchema = z.enum(['backlog', 'a_fazer', 'em_andamento', 'concluido'])
export const statusTarefaSchema = z.enum(['pendente', 'em_progresso', 'em_revisao', 'concluido'])

// Alias para compatibilidade (deprecated - usar colunaKanbanSchema)
export const estagioSchema = colunaKanbanSchema

export const tarefaCreateSchema = z.object({
  titulo: z.string().min(1, 'Título é obrigatório').max(200, 'Título muito longo'),
  descricao: z.string().max(1000, 'Descrição muito longa').nullable().optional(),
  prioridade: prioridadeSchema.default('media'),
  status: statusTarefaSchema.default('pendente'),
  coluna: colunaKanbanSchema.default('backlog'),
  data_limite: z.string().nullable().optional(),
  xp_recompensa: z.number().int().min(0).max(1000).default(10),
  projeto_id: z.string().uuid().nullable().optional(),
  tags: z.array(z.string()).default([]),
  estimativa_tempo: z.number().int().min(0).nullable().optional(),
  ordem: z.number().int().min(0).default(0),
  user_id: z.string().uuid('ID de usuário inválido'),
})

export const tarefaUpdateSchema = z.object({
  titulo: z.string().min(1, 'Título é obrigatório').max(200, 'Título muito longo').optional(),
  descricao: z.string().max(1000, 'Descrição muito longa').nullable().optional(),
  prioridade: prioridadeSchema.optional(),
  status: statusTarefaSchema.optional(),
  coluna: colunaKanbanSchema.optional(),
  data_limite: z.string().nullable().optional(),
  xp_recompensa: z.number().int().min(0).max(1000).optional(),
  projeto_id: z.string().uuid().nullable().optional(),
  tags: z.array(z.string()).optional(),
  estimativa_tempo: z.number().int().min(0).nullable().optional(),
  tempo_gasto: z.number().int().min(0).optional(),
  ordem: z.number().int().min(0).optional(),
  concluida_em: z.string().nullable().optional(),
})

export const pendenciaCreateSchema = z.object({
  titulo: z.string().min(1, 'Título é obrigatório').max(200, 'Título muito longo'),
  descricao: z.string().max(1000, 'Descrição muito longa').nullable().optional(),
  prioridade: prioridadeSchema.default('media'),
  categoria: z.string().max(50, 'Categoria muito longa').nullable().optional(),
  prazo: z.string().max(50, 'Prazo muito longo').nullable().optional(),
  data_vencimento: z.string().nullable().optional(),
  user_id: z.string().uuid('ID de usuário inválido'),
})

export const pendenciaUpdateSchema = z.object({
  titulo: z.string().min(1, 'Título é obrigatório').max(200, 'Título muito longo').optional(),
  descricao: z.string().max(1000, 'Descrição muito longa').nullable().optional(),
  prioridade: prioridadeSchema.optional(),
  categoria: z.string().max(50, 'Categoria muito longa').nullable().optional(),
  prazo: z.string().max(50, 'Prazo muito longo').nullable().optional(),
  data_vencimento: z.string().nullable().optional(),
})

export type TarefaCreateInput = z.infer<typeof tarefaCreateSchema>
export type TarefaUpdateInput = z.infer<typeof tarefaUpdateSchema>
export type PendenciaCreateInput = z.infer<typeof pendenciaCreateSchema>
export type PendenciaUpdateInput = z.infer<typeof pendenciaUpdateSchema>
