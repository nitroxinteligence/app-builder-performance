import type {
  FocusMode,
  FocusPause,
  FocusSession,
  FocusSessionWithTask,
  FocusStats,
  Task,
  SessionStatus,
} from "@/lib/supabase/types"

// Focus mode options for the UI
export interface FocusModeOption {
  id: string
  titulo: string
  descricao: string
  duracao: number // in minutes
}

export const FOCUS_MODES: FocusModeOption[] = [
  {
    id: "pomodoro",
    titulo: "Pomodoro",
    descricao: "Sessão clássica de 25 minutos",
    duracao: 25,
  },
  {
    id: "deep-work",
    titulo: "Deep Work",
    descricao: "Foco profundo de 45 minutos",
    duracao: 45,
  },
  {
    id: "flowtime",
    titulo: "Flowtime",
    descricao: "Sessão longa de 60 minutos",
    duracao: 60,
  },
  {
    id: "custom",
    titulo: "Personalizado",
    descricao: "Defina o tempo ideal para você",
    duracao: 30,
  },
]

// Task for display in focus page
export interface FocusTask {
  id: string
  titulo: string
  coluna: string
  prioridade: string
}

// Input for creating a new focus session
export interface CreateFocusSessionInput {
  taskId: string | null
  modo: string // UI mode ID (e.g., "deep-work")
  duracaoPlanejada: number // in seconds
}

// Input for updating a focus session
export interface UpdateFocusSessionInput {
  sessionId: string
  status?: SessionStatus
  duracaoReal?: number // in seconds
  pausas?: FocusPause[]
}

// Input for completing a focus session
export interface CompleteFocusSessionInput {
  sessionId: string
  duracaoReal: number // in seconds
}

// Input for saving partial session (on page close)
export interface SavePartialSessionInput {
  sessionId: string
  duracaoReal: number // in seconds
  pausas: FocusPause[]
}

// Filters for session history
export interface FocusHistoryFilters {
  modo?: FocusMode
  dataInicio?: string // ISO date
  dataFim?: string // ISO date
  status?: SessionStatus
}

// Pagination options
export interface PaginationOptions {
  page: number
  limit: number
}

// Paginated response
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Server action response wrapper
export interface ActionResponse<T = void> {
  success: boolean
  data?: T
  error?: string
}

// Focus stats for display
export interface FocusStatsDisplay {
  totalSessions: number
  totalHours: number
  totalMinutes: number
  totalXp: number
  averageMinutes: number
  sessionsToday: number
  hoursToday: number
  minutesToday: number
  sessionsThisWeek: number
  hoursThisWeek: number
  minutesThisWeek: number
}

// Session with task info for history display
export interface FocusHistoryItem {
  id: string
  modo: string
  modoDisplay: string
  duracaoPlanejada: number
  duracaoReal: number
  xpGanho: number
  startedAt: string
  endedAt: string | null
  status: SessionStatus
  taskTitulo: string | null
  taskPrioridade: string | null
}

// Active session state (stored in localStorage + synced with DB)
export interface ActiveSessionState {
  sessionId: string
  taskId: string | null
  modo: string
  duracaoPlanejada: number // in seconds
  segundosRestantes: number
  rodando: boolean
  pausas: FocusPause[]
  startedAt: string
  currentPauseStart: string | null // if currently paused
}

// Re-export types from supabase for convenience
export type {
  FocusMode,
  FocusPause,
  FocusSession,
  FocusSessionWithTask,
  FocusStats,
  Task,
  SessionStatus,
}

// Helper to convert stats from DB to display format
export function formatFocusStats(stats: FocusStats): FocusStatsDisplay {
  const totalMinutes = Math.floor(stats.totalSeconds / 60)
  const totalHours = Math.floor(totalMinutes / 60)
  const remainingMinutes = totalMinutes % 60

  const todayMinutes = Math.floor(stats.secondsToday / 60)
  const todayHours = Math.floor(todayMinutes / 60)
  const todayRemainingMinutes = todayMinutes % 60

  const weekMinutes = Math.floor(stats.secondsThisWeek / 60)
  const weekHours = Math.floor(weekMinutes / 60)
  const weekRemainingMinutes = weekMinutes % 60

  return {
    totalSessions: stats.totalSessions,
    totalHours,
    totalMinutes: remainingMinutes,
    totalXp: stats.totalXp,
    averageMinutes: Math.round(stats.averageSessionSeconds / 60),
    sessionsToday: stats.sessionsToday,
    hoursToday: todayHours,
    minutesToday: todayRemainingMinutes,
    sessionsThisWeek: stats.sessionsThisWeek,
    hoursThisWeek: weekHours,
    minutesThisWeek: weekRemainingMinutes,
  }
}

// Helper to format duration for display
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`
}

// Helper to format duration in hours and minutes
export function formatDurationLong(seconds: number): string {
  const totalMinutes = Math.floor(seconds / 60)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours > 0) {
    return `${hours}h ${minutes}min`
  }
  return `${minutes}min`
}

// Mode display names
export const modeDisplayNames: Record<string, string> = {
  pomodoro: "Pomodoro",
  deep_work: "Deep Work",
  flowtime: "Flowtime",
  custom: "Personalizado",
}
