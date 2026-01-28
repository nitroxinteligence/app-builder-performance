import { z } from 'zod'

// ==========================================
// ENUMS
// ==========================================

export const dificuldadeHabitoSchema = z.enum(['facil', 'medio', 'dificil'])
export const frequenciaHabitoSchema = z.enum(['diario', 'semanal'])
export const statusObjetivoSchema = z.enum(['backlog', 'a_fazer', 'em_andamento', 'em_revisao', 'concluido'])
export const statusMetaSchema = z.enum(['nao_iniciada', 'em_andamento', 'pausada', 'atrasada', 'concluida'])
export const nivelUsuarioSchema = z.enum(['iniciante', 'bronze', 'prata', 'ouro', 'diamante'])
export const prioridadeSchema = z.enum(['baixa', 'media', 'alta'])
export const visibilidadeSchema = z.enum(['publica', 'privada'])

// ==========================================
// CATEGORIA DE HÁBITOS
// ==========================================

export const categoriaHabitoCreateSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(50, 'Nome muito longo'),
  descricao: z.string().max(200, 'Descrição muito longa').nullable().optional(),
  icone: z.string().max(50, 'Ícone muito longo').default('activity'),
  cor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida').default('#6366f1'),
  ordem: z.string().max(50).default('0|100000:'),
  user_id: z.string().uuid('ID de usuário inválido'),
})

export const categoriaHabitoUpdateSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(50, 'Nome muito longo').optional(),
  descricao: z.string().max(200, 'Descrição muito longa').nullable().optional(),
  icone: z.string().max(50, 'Ícone muito longo').optional(),
  cor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida').optional(),
  ordem: z.string().max(50).optional(),
})

// ==========================================
// HÁBITO
// ==========================================

export const habitoCreateSchema = z.object({
  titulo: z.string().min(1, 'Título é obrigatório').max(100, 'Título muito longo'),
  descricao: z.string().max(500, 'Descrição muito longa').nullable().optional(),
  icone: z.string().max(50, 'Ícone muito longo').default('check'),
  cor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida').nullable().optional(),

  dificuldade: dificuldadeHabitoSchema.default('medio'),
  frequencia: frequenciaHabitoSchema.default('diario'),
  dias_semana: z.array(z.number().int().min(0).max(6)).default([0, 1, 2, 3, 4, 5, 6]),

  categoria_id: z.string().uuid('ID de categoria inválido').nullable().optional(),
  objetivo_id: z.string().uuid('ID de objetivo inválido').nullable().optional(),

  ordem: z.string().max(50).default('0|100000:'),
  ativo: z.boolean().default(true),

  user_id: z.string().uuid('ID de usuário inválido'),
})

export const habitoUpdateSchema = z.object({
  titulo: z.string().min(1, 'Título é obrigatório').max(100, 'Título muito longo').optional(),
  descricao: z.string().max(500, 'Descrição muito longa').nullable().optional(),
  icone: z.string().max(50, 'Ícone muito longo').optional(),
  cor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida').nullable().optional(),

  dificuldade: dificuldadeHabitoSchema.optional(),
  frequencia: frequenciaHabitoSchema.optional(),
  dias_semana: z.array(z.number().int().min(0).max(6)).optional(),

  categoria_id: z.string().uuid('ID de categoria inválido').nullable().optional(),
  objetivo_id: z.string().uuid('ID de objetivo inválido').nullable().optional(),

  ordem: z.string().max(50).optional(),
  ativo: z.boolean().optional(),
})

// ==========================================
// HISTÓRICO DE HÁBITOS
// ==========================================

export const historicoHabitoCreateSchema = z.object({
  habito_id: z.string().uuid('ID de hábito inválido'),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (YYYY-MM-DD)'),
  concluido: z.boolean().default(true),
  horario: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Horário inválido (HH:MM ou HH:MM:SS)').nullable().optional(),
  user_id: z.string().uuid('ID de usuário inválido'),
})

// ==========================================
// COLUNA DE OBJETIVOS
// ==========================================

export const colunaObjetivoCreateSchema = z.object({
  titulo: z.string().min(1, 'Título é obrigatório').max(50, 'Título muito longo'),
  descricao: z.string().max(200, 'Descrição muito longa').nullable().optional(),
  icone: z.string().max(50, 'Ícone muito longo').default('folder'),
  cor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida').default('#6366f1'),
  ordem: z.string().max(50).default('0|100000:'),
  user_id: z.string().uuid('ID de usuário inválido'),
})

export const colunaObjetivoUpdateSchema = z.object({
  titulo: z.string().min(1, 'Título é obrigatório').max(50, 'Título muito longo').optional(),
  descricao: z.string().max(200, 'Descrição muito longa').nullable().optional(),
  icone: z.string().max(50, 'Ícone muito longo').optional(),
  cor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida').optional(),
  ordem: z.string().max(50).optional(),
})

// ==========================================
// OBJETIVO
// ==========================================

export const objetivoCreateSchema = z.object({
  titulo: z.string().min(1, 'Título é obrigatório').max(100, 'Título muito longo'),
  descricao: z.string().max(500, 'Descrição muito longa').nullable().optional(),

  progresso_atual: z.number().int().min(0).max(100).default(0),
  progresso_total: z.number().int().min(1).max(1000).default(100),

  status: statusObjetivoSchema.default('backlog'),

  cor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida').nullable().optional(),
  tags: z.array(z.string().max(30)).default([]),

  data_inicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida').nullable().optional(),
  data_fim: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida').nullable().optional(),

  prioridade: prioridadeSchema.default('media'),
  arquivado: z.boolean().default(false),

  coluna_id: z.string().uuid('ID de coluna inválido').nullable().optional(),
  meta_id: z.string().uuid('ID de meta inválido').nullable().optional(),

  ordem: z.string().max(50).default('0|100000:'),

  user_id: z.string().uuid('ID de usuário inválido'),
})

export const objetivoUpdateSchema = z.object({
  titulo: z.string().min(1, 'Título é obrigatório').max(100, 'Título muito longo').optional(),
  descricao: z.string().max(500, 'Descrição muito longa').nullable().optional(),

  progresso_atual: z.number().int().min(0).max(100).optional(),
  progresso_total: z.number().int().min(1).max(1000).optional(),

  status: statusObjetivoSchema.optional(),

  cor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida').nullable().optional(),
  tags: z.array(z.string().max(30)).optional(),

  data_inicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida').nullable().optional(),
  data_fim: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida').nullable().optional(),

  prioridade: prioridadeSchema.optional(),
  arquivado: z.boolean().optional(),

  coluna_id: z.string().uuid('ID de coluna inválido').nullable().optional(),
  meta_id: z.string().uuid('ID de meta inválido').nullable().optional(),

  ordem: z.string().max(50).optional(),
})

export const objetivoMoverSchema = z.object({
  id: z.string().uuid('ID inválido'),
  coluna_id: z.string().uuid('ID de coluna inválido').nullable().optional(),
  status: statusObjetivoSchema.optional(),
  ordem: z.string().max(50),
})

// ==========================================
// META
// ==========================================

export const metaCreateSchema = z.object({
  titulo: z.string().min(1, 'Título é obrigatório').max(100, 'Título muito longo'),
  descricao: z.string().max(500, 'Descrição muito longa').nullable().optional(),

  progresso_atual: z.number().int().min(0).default(0),
  progresso_total: z.number().int().min(1).max(10000).default(100),

  status: statusMetaSchema.default('nao_iniciada'),

  categoria: z.string().max(50, 'Categoria muito longa').nullable().optional(),
  cor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida').default('#6366f1'),
  icone: z.string().max(50, 'Ícone muito longo').default('target'),
  tags: z.array(z.string().max(30)).default([]),

  ano: z.number().int().min(2020).max(2100).default(new Date().getFullYear()),
  trimestre: z.number().int().min(1).max(4).nullable().optional(),
  data_inicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida').nullable().optional(),
  data_fim: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida').nullable().optional(),

  prioridade: prioridadeSchema.default('media'),
  visibilidade: visibilidadeSchema.default('privada'),
  notas_progresso: z.string().max(1000, 'Notas muito longas').nullable().optional(),

  ordem: z.string().max(50).default('0|100000:'),

  user_id: z.string().uuid('ID de usuário inválido'),
})

export const metaUpdateSchema = z.object({
  titulo: z.string().min(1, 'Título é obrigatório').max(100, 'Título muito longo').optional(),
  descricao: z.string().max(500, 'Descrição muito longa').nullable().optional(),

  progresso_atual: z.number().int().min(0).optional(),
  progresso_total: z.number().int().min(1).max(10000).optional(),

  status: statusMetaSchema.optional(),

  categoria: z.string().max(50, 'Categoria muito longa').nullable().optional(),
  cor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida').optional(),
  icone: z.string().max(50, 'Ícone muito longo').optional(),
  tags: z.array(z.string().max(30)).optional(),

  ano: z.number().int().min(2020).max(2100).optional(),
  trimestre: z.number().int().min(1).max(4).nullable().optional(),
  data_inicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida').nullable().optional(),
  data_fim: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida').nullable().optional(),

  prioridade: prioridadeSchema.optional(),
  visibilidade: visibilidadeSchema.optional(),
  notas_progresso: z.string().max(1000, 'Notas muito longas').nullable().optional(),

  ordem: z.string().max(50).optional(),
})

export const metaMoverSchema = z.object({
  id: z.string().uuid('ID inválido'),
  status: statusMetaSchema,
  ordem: z.string().max(50),
})

// ==========================================
// MARCO DE META
// ==========================================

export const marcoMetaCreateSchema = z.object({
  meta_id: z.string().uuid('ID de meta inválido'),
  titulo: z.string().min(1, 'Título é obrigatório').max(100, 'Título muito longo'),
  descricao: z.string().max(300, 'Descrição muito longa').nullable().optional(),
  concluido: z.boolean().default(false),
  ordem: z.number().int().min(0).default(0),
})

export const marcoMetaUpdateSchema = z.object({
  titulo: z.string().min(1, 'Título é obrigatório').max(100, 'Título muito longo').optional(),
  descricao: z.string().max(300, 'Descrição muito longa').nullable().optional(),
  concluido: z.boolean().optional(),
  data_conclusao: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida').nullable().optional(),
  ordem: z.number().int().min(0).optional(),
})

// ==========================================
// TYPES INFERIDOS
// ==========================================

export type DificuldadeHabito = z.infer<typeof dificuldadeHabitoSchema>
export type FrequenciaHabito = z.infer<typeof frequenciaHabitoSchema>
export type StatusObjetivo = z.infer<typeof statusObjetivoSchema>
export type StatusMeta = z.infer<typeof statusMetaSchema>
export type NivelUsuario = z.infer<typeof nivelUsuarioSchema>
export type Prioridade = z.infer<typeof prioridadeSchema>
export type Visibilidade = z.infer<typeof visibilidadeSchema>

export type CategoriaHabitoCreateInput = z.infer<typeof categoriaHabitoCreateSchema>
export type CategoriaHabitoUpdateInput = z.infer<typeof categoriaHabitoUpdateSchema>

export type HabitoCreateInput = z.infer<typeof habitoCreateSchema>
export type HabitoUpdateInput = z.infer<typeof habitoUpdateSchema>

export type HistoricoHabitoCreateInput = z.infer<typeof historicoHabitoCreateSchema>

export type ColunaObjetivoCreateInput = z.infer<typeof colunaObjetivoCreateSchema>
export type ColunaObjetivoUpdateInput = z.infer<typeof colunaObjetivoUpdateSchema>

export type ObjetivoCreateInput = z.infer<typeof objetivoCreateSchema>
export type ObjetivoUpdateInput = z.infer<typeof objetivoUpdateSchema>
export type ObjetivoMoverInput = z.infer<typeof objetivoMoverSchema>

export type MetaCreateInput = z.infer<typeof metaCreateSchema>
export type MetaUpdateInput = z.infer<typeof metaUpdateSchema>
export type MetaMoverInput = z.infer<typeof metaMoverSchema>

export type MarcoMetaCreateInput = z.infer<typeof marcoMetaCreateSchema>
export type MarcoMetaUpdateInput = z.infer<typeof marcoMetaUpdateSchema>
