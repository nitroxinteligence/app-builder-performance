import type { LucideIcon } from 'lucide-react'

// ==========================================
// NÍVEL DO USUÁRIO
// ==========================================

export interface UserLevel {
  nivel: number
  titulo: string
  xpAtual: number
  xpTotal: number
  percentual: number
  streakAtual: number
}

// ==========================================
// ESTATÍSTICAS DIÁRIAS
// ==========================================

export interface DailyStats {
  tarefasHoje: number
  tarefasUrgentes: number
  focoHoje: number
  habitosCompletos: number
  habitosAtivos: number
  streakAtual: number
}

// ==========================================
// ESTATÍSTICAS SEMANAIS
// ==========================================

export interface WeeklyStats {
  tarefasCompletas: number
  tarefasTotal: number
  tarefasPercentual: number
  focoSegundos: number
  focoMeta: number
  focoPercentual: number
  habitosChecksDias: number
  habitosConsistencia: number
}

// ==========================================
// MISSÕES
// ==========================================

export interface DailyMission {
  id: string
  texto: string
  xp: string
  concluida: boolean
}

export interface WeeklyMission {
  id: string
  texto: string
  recompensa: string
}

// ==========================================
// CARDS E PROGRESSO (UI)
// ==========================================

export interface CardResumo {
  id: string
  titulo: string
  valor: string
  detalhe: string
  icone: LucideIcon
}

export interface ProgressoItem {
  id: string
  titulo: string
  detalhe: string
  percentual: number
}

// ==========================================
// DADOS COMPOSTOS DO DASHBOARD
// ==========================================

export interface DashboardData {
  userLevel: UserLevel
  dailyStats: DailyStats
  weeklyStats: WeeklyStats
  cardsResumo: CardResumo[]
  progressoSemanal: ProgressoItem[]
  missoesDiarias: DailyMission[]
  missoesSemanais: WeeklyMission[]
  isLoading: boolean
  error: Error | null
}
