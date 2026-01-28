export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type TaskPriority = "baixa" | "media" | "alta" | "urgente"
export type TaskStatus = "pendente" | "em_progresso" | "em_revisao" | "concluido"
export type KanbanColumn = "backlog" | "a_fazer" | "em_andamento" | "concluido"
export type FocusMode = "pomodoro" | "deep_work" | "flowtime" | "custom"
export type SessionStatus = "active" | "paused" | "completed" | "cancelled"

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          avatar_url: string | null
          total_xp: number
          level: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          avatar_url?: string | null
          total_xp?: number
          level?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          avatar_url?: string | null
          total_xp?: number
          level?: number
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          titulo: string
          descricao: string | null
          prioridade: TaskPriority
          status: TaskStatus
          coluna: KanbanColumn
          data_limite: string | null
          xp_recompensa: number
          projeto_id: string | null
          tags: string[]
          estimativa_tempo: number | null
          tempo_gasto: number
          ordem: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          titulo: string
          descricao?: string | null
          prioridade?: TaskPriority
          status?: TaskStatus
          coluna?: KanbanColumn
          data_limite?: string | null
          xp_recompensa?: number
          projeto_id?: string | null
          tags?: string[]
          estimativa_tempo?: number | null
          tempo_gasto?: number
          ordem?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          titulo?: string
          descricao?: string | null
          prioridade?: TaskPriority
          status?: TaskStatus
          coluna?: KanbanColumn
          data_limite?: string | null
          xp_recompensa?: number
          projeto_id?: string | null
          tags?: string[]
          estimativa_tempo?: number | null
          tempo_gasto?: number
          ordem?: number
          created_at?: string
          updated_at?: string
        }
      }
      focus_sessions: {
        Row: {
          id: string
          user_id: string
          task_id: string | null
          modo: FocusMode
          duracao_planejada: number
          duracao_real: number
          xp_ganho: number
          started_at: string
          ended_at: string | null
          pausas: FocusPause[]
          status: SessionStatus
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          task_id?: string | null
          modo: FocusMode
          duracao_planejada: number
          duracao_real?: number
          xp_ganho?: number
          started_at?: string
          ended_at?: string | null
          pausas?: FocusPause[]
          status?: SessionStatus
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          task_id?: string | null
          modo?: FocusMode
          duracao_planejada?: number
          duracao_real?: number
          xp_ganho?: number
          started_at?: string
          ended_at?: string | null
          pausas?: FocusPause[]
          status?: SessionStatus
          created_at?: string
        }
      }
    }
    Views: {
      focus_sessions_with_task: {
        Row: {
          id: string
          user_id: string
          task_id: string | null
          modo: FocusMode
          duracao_planejada: number
          duracao_real: number
          xp_ganho: number
          started_at: string
          ended_at: string | null
          pausas: FocusPause[]
          status: SessionStatus
          created_at: string
          task_titulo: string | null
          task_prioridade: TaskPriority | null
          task_coluna: KanbanColumn | null
        }
      }
    }
    Functions: {
      add_user_xp: {
        Args: {
          p_user_id: string
          p_xp_amount: number
        }
        Returns: {
          new_total_xp: number
          new_level: number
          level_up: boolean
        }[]
      }
      calculate_focus_xp: {
        Args: {
          duration_seconds: number
        }
        Returns: number
      }
      calculate_level: {
        Args: {
          xp: number
        }
        Returns: number
      }
      complete_focus_session: {
        Args: {
          p_session_id: string
          p_duration_real: number
          p_ended_at?: string
        }
        Returns: {
          session_id: string
          xp_earned: number
          new_total_xp: number
          new_level: number
          level_up: boolean
        }[]
      }
      get_focus_stats: {
        Args: {
          p_user_id: string
        }
        Returns: {
          total_sessions: number
          total_seconds: number
          total_xp: number
          average_session_seconds: number
          sessions_today: number
          seconds_today: number
          sessions_this_week: number
          seconds_this_week: number
        }[]
      }
      cancel_active_sessions: {
        Args: {
          p_user_id: string
        }
        Returns: number
      }
      add_task_time: {
        Args: {
          p_task_id: string
          p_minutes: number
        }
        Returns: number
      }
    }
    Enums: {
      task_priority: TaskPriority
      task_status: TaskStatus
      kanban_column: KanbanColumn
      focus_mode: FocusMode
      session_status: SessionStatus
    }
  }
}

// Derived types for easier use
export type User = Database["public"]["Tables"]["users"]["Row"]
export type UserInsert = Database["public"]["Tables"]["users"]["Insert"]
export type UserUpdate = Database["public"]["Tables"]["users"]["Update"]

export type Task = Database["public"]["Tables"]["tasks"]["Row"]
export type TaskInsert = Database["public"]["Tables"]["tasks"]["Insert"]
export type TaskUpdate = Database["public"]["Tables"]["tasks"]["Update"]

export type FocusSession = Database["public"]["Tables"]["focus_sessions"]["Row"]
export type FocusSessionInsert = Database["public"]["Tables"]["focus_sessions"]["Insert"]
export type FocusSessionUpdate = Database["public"]["Tables"]["focus_sessions"]["Update"]

export type FocusSessionWithTask = Database["public"]["Views"]["focus_sessions_with_task"]["Row"]

// Custom types
export interface FocusPause {
  started_at: string
  ended_at: string | null
  duration: number // in seconds
}

export interface FocusStats {
  totalSessions: number
  totalSeconds: number
  totalXp: number
  averageSessionSeconds: number
  sessionsToday: number
  secondsToday: number
  sessionsThisWeek: number
  secondsThisWeek: number
}

export interface CompleteFocusSessionResult {
  sessionId: string
  xpEarned: number
  newTotalXp: number
  newLevel: number
  levelUp: boolean
}

// Map focus mode ID to database enum
export const focusModeMap: Record<string, FocusMode> = {
  pomodoro: "pomodoro",
  "deep-work": "deep_work",
  flowtime: "flowtime",
  custom: "custom",
}

// Map database enum to focus mode ID
export const focusModeReverseMap: Record<FocusMode, string> = {
  pomodoro: "pomodoro",
  deep_work: "deep-work",
  flowtime: "flowtime",
  custom: "custom",
}

// Map kanban column to display name
export const kanbanColumnNames: Record<KanbanColumn, string> = {
  backlog: "Backlog",
  a_fazer: "A fazer",
  em_andamento: "Em andamento",
  concluido: "Concluído",
}

// Map priority to display name
export const priorityNames: Record<TaskPriority, string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
  urgente: "Urgente",
}
