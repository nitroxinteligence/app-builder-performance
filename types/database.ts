// Enums que correspondem ao schema do banco de dados
export type Prioridade = 'baixa' | 'media' | 'alta' | 'urgente'
export type PrioridadeSimples = 'baixa' | 'media' | 'alta'
export type StatusTarefa = 'pendente' | 'em_progresso' | 'em_revisao' | 'concluido'
export type ColunaKanban = 'backlog' | 'a_fazer' | 'em_andamento' | 'concluido'
export type DificuldadeHabito = 'facil' | 'medio' | 'dificil'
export type FrequenciaHabito = 'diario' | 'semanal'
export type StatusObjetivo = 'backlog' | 'a_fazer' | 'em_andamento' | 'em_revisao' | 'concluido'
export type StatusMeta = 'nao_iniciada' | 'em_andamento' | 'pausada' | 'atrasada' | 'concluida'
export type Visibilidade = 'publica' | 'privada'

// Alias para compatibilidade (deprecated - usar ColunaKanban)
export type Estagio = ColunaKanban

export interface Usuario {
  id: string
  email: string
  name: string
  avatar_url: string | null
  total_xp: number
  level: number
  streak_shields: number
  current_streak: number
  longest_streak: number
  created_at: string
  updated_at: string
}

export interface Tarefa {
  id: string
  user_id: string
  titulo: string
  descricao: string | null
  prioridade: Prioridade
  status: StatusTarefa
  coluna: ColunaKanban
  data_limite: string | null
  xp_recompensa: number
  projeto_id: string | null
  tags: string[]
  estimativa_tempo: number | null
  tempo_gasto: number
  ordem: number
  concluida_em: string | null
  created_at: string
  updated_at: string
}

export interface Pendencia {
  id: string
  user_id: string
  titulo: string
  descricao: string | null
  prioridade: Prioridade
  categoria: string | null
  prazo: string | null
  data_vencimento: string | null
  created_at: string
  updated_at: string
}

export type TarefaCreate = Omit<Tarefa, 'id' | 'created_at' | 'updated_at' | 'concluida_em' | 'tempo_gasto'> & {
  tempo_gasto?: number
}
export type TarefaUpdate = Partial<Omit<Tarefa, 'id' | 'created_at' | 'updated_at' | 'user_id'>>

export type PendenciaCreate = Omit<Pendencia, 'id' | 'created_at' | 'updated_at'>
export type PendenciaUpdate = Partial<Omit<Pendencia, 'id' | 'created_at' | 'updated_at' | 'user_id'>>

// ==========================================
// HÁBITOS
// ==========================================

export interface CategoriaHabito {
  id: string
  user_id: string
  nome: string
  descricao: string | null
  icone: string
  cor: string
  ordem: string
  created_at: string
  updated_at: string
}

export interface Habito {
  id: string
  user_id: string
  titulo: string
  descricao: string | null
  icone: string
  cor: string | null
  dificuldade: DificuldadeHabito
  frequencia: FrequenciaHabito
  dias_semana: number[]
  categoria_id: string | null
  objetivo_id: string | null
  ordem: string
  ativo: boolean
  streak_atual: number
  maior_streak: number
  total_conclusoes: number
  created_at: string
  updated_at: string
}

export interface HistoricoHabito {
  id: string
  user_id: string
  habito_id: string
  data: string
  concluido: boolean
  horario: string | null
  created_at: string
}

export type CategoriaHabitoCreate = Omit<CategoriaHabito, 'id' | 'created_at' | 'updated_at'>
export type CategoriaHabitoUpdate = Partial<Omit<CategoriaHabito, 'id' | 'created_at' | 'updated_at' | 'user_id'>>

export type HabitoCreate = Omit<Habito, 'id' | 'created_at' | 'updated_at' | 'streak_atual' | 'maior_streak' | 'total_conclusoes'>
export type HabitoUpdate = Partial<Omit<Habito, 'id' | 'created_at' | 'updated_at' | 'user_id'>>

export type HistoricoHabitoCreate = Omit<HistoricoHabito, 'id' | 'created_at'>

// ==========================================
// OBJETIVOS
// ==========================================

export interface ColunaObjetivo {
  id: string
  user_id: string
  titulo: string
  descricao: string | null
  icone: string
  cor: string
  ordem: string
  created_at: string
  updated_at: string
}

export interface Objetivo {
  id: string
  user_id: string
  titulo: string
  descricao: string | null
  progresso_atual: number
  progresso_total: number
  status: StatusObjetivo
  cor: string | null
  tags: string[]
  data_inicio: string | null
  data_fim: string | null
  prioridade: PrioridadeSimples
  arquivado: boolean
  coluna_id: string | null
  meta_id: string | null
  ordem: string
  created_at: string
  updated_at: string
}

export type ColunaObjetivoCreate = Omit<ColunaObjetivo, 'id' | 'created_at' | 'updated_at'>
export type ColunaObjetivoUpdate = Partial<Omit<ColunaObjetivo, 'id' | 'created_at' | 'updated_at' | 'user_id'>>

export type ObjetivoCreate = Omit<Objetivo, 'id' | 'created_at' | 'updated_at'>
export type ObjetivoUpdate = Partial<Omit<Objetivo, 'id' | 'created_at' | 'updated_at' | 'user_id'>>

// ==========================================
// METAS
// ==========================================

export interface Meta {
  id: string
  user_id: string
  titulo: string
  descricao: string | null
  progresso_atual: number
  progresso_total: number
  status: StatusMeta
  categoria: string | null
  cor: string
  icone: string
  tags: string[]
  ano: number
  trimestre: number | null
  data_inicio: string | null
  data_fim: string | null
  prioridade: PrioridadeSimples
  visibilidade: Visibilidade
  notas_progresso: string | null
  ordem: string
  created_at: string
  updated_at: string
}

export interface MarcoMeta {
  id: string
  meta_id: string
  titulo: string
  descricao: string | null
  concluido: boolean
  data_conclusao: string | null
  ordem: number
  created_at: string
  updated_at: string
}

export type MetaCreate = Omit<Meta, 'id' | 'created_at' | 'updated_at'>
export type MetaUpdate = Partial<Omit<Meta, 'id' | 'created_at' | 'updated_at' | 'user_id'>>

export type MarcoMetaCreate = Omit<MarcoMeta, 'id' | 'created_at' | 'updated_at'>
export type MarcoMetaUpdate = Partial<Omit<MarcoMeta, 'id' | 'created_at' | 'updated_at' | 'meta_id'>>

export type Database = {
  public: {
    Tables: {
      users: {
        Row: Usuario
        Insert: Omit<Usuario, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<Usuario, 'id' | 'created_at' | 'updated_at'>>
        Relationships: []
      }
      tasks: {
        Row: Tarefa
        Insert: Omit<Tarefa, 'id' | 'created_at' | 'updated_at' | 'concluida_em' | 'tempo_gasto'> & {
          id?: string
          created_at?: string
          updated_at?: string
          concluida_em?: string | null
          tempo_gasto?: number
        }
        Update: Partial<Omit<Tarefa, 'id' | 'created_at' | 'updated_at' | 'user_id'>>
        Relationships: [
          {
            foreignKeyName: 'tasks_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      pending_items: {
        Row: Pendencia
        Insert: Omit<Pendencia, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<Pendencia, 'id' | 'created_at' | 'updated_at' | 'user_id'>>
        Relationships: [
          {
            foreignKeyName: 'pending_items_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      task_priority: Prioridade
      task_status: StatusTarefa
      kanban_column: ColunaKanban
    }
    CompositeTypes: Record<string, never>
  }
}
