'use client'

import { useQuery } from '@tanstack/react-query'
import { Aperture, Focus, Repeat2, Sparkles } from 'lucide-react'

import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/providers/auth-provider'
import {
  getLevelTitle,
  calculateXpProgress,
  formatFocusTime,
  formatDate,
  getStartOfWeek,
} from '@/lib/utils/dashboard'
import type {
  UserLevel,
  DailyStats,
  WeeklyStats,
  DailyMission,
  WeeklyMission,
  CardResumo,
  ProgressoItem,
  DashboardData,
} from '@/types/dashboard'

// ==========================================
// CONSTANTS
// ==========================================

/** Default weekly task goal for users */
const DEFAULT_WEEKLY_TASK_GOAL = 25

/** Default weekly focus time goal in seconds (12 hours) */
const DEFAULT_WEEKLY_FOCUS_GOAL_SECONDS = 12 * 3600

// Query keys factory
const createQueryKey = (userId: string | undefined, segment: string) =>
  ['dashboard', segment, userId].filter(Boolean)

const USER_LEVEL_KEY = (userId: string | undefined) => createQueryKey(userId, 'userLevel')
const DAILY_STATS_KEY = (userId: string | undefined) => createQueryKey(userId, 'dailyStats')
const WEEKLY_STATS_KEY = (userId: string | undefined) => createQueryKey(userId, 'weeklyStats')
const FOCUS_STATS_KEY = (userId: string | undefined) => createQueryKey(userId, 'focusStats')

// ==========================================
// FETCH FUNCTIONS
// ==========================================

async function fetchUserLevel(userId: string): Promise<UserLevel> {
  const { data, error } = await supabase
    .from('users')
    .select('total_xp, level, current_streak, longest_streak')
    .eq('id', userId)
    .single()

  if (error) {
    throw new Error(`Erro ao buscar nível do usuário: ${error.message}`)
  }

  const { xpAtual, xpTotal, percentual } = calculateXpProgress(
    data.total_xp ?? 0,
    data.level ?? 1
  )

  return {
    nivel: data.level ?? 1,
    titulo: getLevelTitle(data.level ?? 1),
    xpAtual,
    xpTotal,
    percentual,
    streakAtual: data.current_streak ?? 0,
  }
}

async function fetchDailyStats(userId: string): Promise<DailyStats> {
  const hoje = formatDate()

  const [tarefasResult, focusResult, habitosResult, habitosChecksResult, userResult] =
    await Promise.all([
      supabase
        .from('tasks')
        .select('id, prioridade, concluida_em, data_limite')
        .eq('user_id', userId)
        .or(`data_limite.eq.${hoje},concluida_em.gte.${hoje}T00:00:00`),

      supabase.rpc('get_focus_stats', { p_user_id: userId }),

      supabase
        .from('habits')
        .select('id')
        .eq('user_id', userId)
        .eq('ativo', true),

      supabase
        .from('habit_checks')
        .select('id')
        .eq('user_id', userId)
        .eq('check_date', hoje),

      supabase
        .from('users')
        .select('current_streak')
        .eq('id', userId)
        .single(),
    ])

  const errors = [
    tarefasResult.error,
    focusResult.error,
    habitosResult.error,
    habitosChecksResult.error,
    userResult.error,
  ].filter(Boolean)

  if (errors.length > 0) {
    throw new Error(`Erro ao buscar estatísticas diárias: ${errors.map((e) => e?.message).join(', ')}`)
  }

  const tarefas = tarefasResult.data ?? []
  const tarefasHoje = tarefas.filter(
    (t) => t.data_limite === hoje || (t.concluida_em && t.concluida_em.startsWith(hoje))
  ).length
  const tarefasUrgentes = tarefas.filter(
    (t) => t.prioridade === 'urgente' || t.prioridade === 'alta'
  ).length

  const focusStats = focusResult.data?.[0] as {
    seconds_today?: number
    sessions_today?: number
  } | undefined
  const focoHoje = focusStats?.seconds_today ?? 0

  const habitosAtivos = habitosResult.data?.length ?? 0
  const habitosCompletos = habitosChecksResult.data?.length ?? 0
  const streakAtual = userResult.data?.current_streak ?? 0

  return {
    tarefasHoje,
    tarefasUrgentes,
    focoHoje,
    habitosCompletos,
    habitosAtivos,
    streakAtual,
  }
}

async function fetchWeeklyStats(userId: string): Promise<WeeklyStats> {
  const inicioSemana = getStartOfWeek()
  const hoje = formatDate()

  const [tarefasResult, focusResult, habitosChecksResult] = await Promise.all([
    supabase
      .from('tasks')
      .select('id, concluida_em')
      .eq('user_id', userId)
      .gte('concluida_em', inicioSemana),

    supabase.rpc('get_focus_stats', { p_user_id: userId }),

    supabase
      .from('habit_checks')
      .select('check_date')
      .eq('user_id', userId)
      .gte('check_date', inicioSemana.split('T')[0])
      .lte('check_date', hoje),
  ])

  const errors = [
    tarefasResult.error,
    focusResult.error,
    habitosChecksResult.error,
  ].filter(Boolean)

  if (errors.length > 0) {
    throw new Error(`Erro ao buscar estatísticas semanais: ${errors.map((e) => e?.message).join(', ')}`)
  }

  const tarefasCompletas = tarefasResult.data?.length ?? 0
  const tarefasTotal = DEFAULT_WEEKLY_TASK_GOAL
  const tarefasPercentual = Math.round((tarefasCompletas / tarefasTotal) * 100)

  const focusStats = focusResult.data?.[0] as {
    seconds_this_week?: number
  } | undefined
  const focoSegundos = focusStats?.seconds_this_week ?? 0
  const focoMeta = DEFAULT_WEEKLY_FOCUS_GOAL_SECONDS
  const focoPercentual = Math.min(100, Math.round((focoSegundos / focoMeta) * 100))

  const diasUnicos = new Set(
    (habitosChecksResult.data ?? []).map((h) => h.check_date)
  )
  const habitosChecksDias = diasUnicos.size
  const diasSemana = 7
  const habitosConsistencia = Math.round((habitosChecksDias / diasSemana) * 100)

  return {
    tarefasCompletas,
    tarefasTotal,
    tarefasPercentual,
    focoSegundos,
    focoMeta,
    focoPercentual,
    habitosChecksDias,
    habitosConsistencia,
  }
}

// ==========================================
// HOOKS INDIVIDUAIS
// ==========================================

export function useUserLevel() {
  const { user } = useAuth()
  const userId = user?.id

  return useQuery({
    queryKey: USER_LEVEL_KEY(userId),
    queryFn: () => {
      if (!userId) throw new Error('Usuário não autenticado')
      return fetchUserLevel(userId)
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  })
}

export function useDailyStats() {
  const { user } = useAuth()
  const userId = user?.id

  return useQuery({
    queryKey: DAILY_STATS_KEY(userId),
    queryFn: () => {
      if (!userId) throw new Error('Usuário não autenticado')
      return fetchDailyStats(userId)
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  })
}

export function useWeeklyStats() {
  const { user } = useAuth()
  const userId = user?.id

  return useQuery({
    queryKey: WEEKLY_STATS_KEY(userId),
    queryFn: () => {
      if (!userId) throw new Error('Usuário não autenticado')
      return fetchWeeklyStats(userId)
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  })
}

// ==========================================
// GERAÇÃO DE MISSÕES
// ==========================================

function generateDailyMissions(
  dailyStats: DailyStats | undefined,
  focusSessionsToday: number
): DailyMission[] {
  const missions: DailyMission[] = [
    {
      id: 'login',
      texto: 'Login diário',
      xp: '+10 XP',
      concluida: true,
    },
  ]

  if (dailyStats) {
    if (dailyStats.habitosAtivos > 0) {
      missions.push({
        id: 'habitos',
        texto: 'Check hábitos matinais',
        xp: '+15 XP',
        concluida: dailyStats.habitosCompletos > 0,
      })
    }

    if (dailyStats.tarefasUrgentes > 0) {
      missions.push({
        id: 'prioridade',
        texto: '1 tarefa de alta prioridade',
        xp: '+50 XP',
        concluida: false,
      })
    }

    missions.push({
      id: 'foco',
      texto: '2 sessões de foco',
      xp: '+40 XP',
      concluida: focusSessionsToday >= 2,
    })

    if (dailyStats.streakAtual >= 7) {
      missions.push({
        id: 'streak-bonus',
        texto: 'Bônus de streak (7+ dias)',
        xp: '+25 XP',
        concluida: true,
      })
    }
  }

  return missions
}

function generateWeeklyMissions(weeklyStats: WeeklyStats | undefined): WeeklyMission[] {
  return [
    {
      id: 'foco-semanal',
      texto: 'Acumule 5 horas de foco',
      recompensa: 'Tema exclusivo',
    },
    {
      id: 'streak-habitos',
      texto: 'Mantenha streak de hábitos por 7 dias',
      recompensa: 'Badge semanal',
    },
    {
      id: 'daily-quests',
      texto: 'Complete todas as daily quests por 5 dias',
      recompensa: '500 XP',
    },
    {
      id: 'tarefas-em-dia',
      texto: 'Zero tarefas atrasadas por 7 dias',
      recompensa: 'Título especial',
    },
  ]
}

// ==========================================
// HOOK COMPOSTO
// ==========================================

export function useDashboardData(): DashboardData {
  const { user } = useAuth()
  const userId = user?.id

  const userLevelQuery = useQuery({
    queryKey: USER_LEVEL_KEY(userId),
    queryFn: () => {
      if (!userId) throw new Error('Usuário não autenticado')
      return fetchUserLevel(userId)
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  })

  const dailyStatsQuery = useQuery({
    queryKey: DAILY_STATS_KEY(userId),
    queryFn: () => {
      if (!userId) throw new Error('Usuário não autenticado')
      return fetchDailyStats(userId)
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  })

  const weeklyStatsQuery = useQuery({
    queryKey: WEEKLY_STATS_KEY(userId),
    queryFn: () => {
      if (!userId) throw new Error('Usuário não autenticado')
      return fetchWeeklyStats(userId)
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  })

  const focusStatsQuery = useQuery({
    queryKey: FOCUS_STATS_KEY(userId),
    queryFn: async () => {
      if (!userId) throw new Error('Usuário não autenticado')
      const { data, error } = await supabase.rpc('get_focus_stats', {
        p_user_id: userId,
      })
      if (error) throw error
      return data?.[0] as { sessions_today?: number } | undefined
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  })

  const isLoading =
    userLevelQuery.isLoading ||
    dailyStatsQuery.isLoading ||
    weeklyStatsQuery.isLoading ||
    focusStatsQuery.isLoading

  const error =
    userLevelQuery.error ||
    dailyStatsQuery.error ||
    weeklyStatsQuery.error ||
    focusStatsQuery.error

  const userLevel = userLevelQuery.data ?? {
    nivel: 1,
    titulo: 'Iniciante',
    xpAtual: 0,
    xpTotal: 500,
    percentual: 0,
    streakAtual: 0,
  }

  const dailyStats = dailyStatsQuery.data ?? {
    tarefasHoje: 0,
    tarefasUrgentes: 0,
    focoHoje: 0,
    habitosCompletos: 0,
    habitosAtivos: 0,
    streakAtual: 0,
  }

  const weeklyStats = weeklyStatsQuery.data ?? {
    tarefasCompletas: 0,
    tarefasTotal: DEFAULT_WEEKLY_TASK_GOAL,
    tarefasPercentual: 0,
    focoSegundos: 0,
    focoMeta: DEFAULT_WEEKLY_FOCUS_GOAL_SECONDS,
    focoPercentual: 0,
    habitosChecksDias: 0,
    habitosConsistencia: 0,
  }

  const cardsResumo: CardResumo[] = [
    {
      id: 'hoje',
      titulo: 'Hoje',
      valor: `${dailyStats.tarefasHoje} tarefas`,
      detalhe: dailyStats.tarefasUrgentes > 0 ? `${dailyStats.tarefasUrgentes} urgentes` : 'Nenhuma urgente',
      icone: Sparkles,
    },
    {
      id: 'foco',
      titulo: 'Foco',
      valor: formatFocusTime(dailyStats.focoHoje),
      detalhe: dailyStats.focoHoje > 0 ? 'hoje' : 'Nenhuma sessão',
      icone: Focus,
    },
    {
      id: 'habitos',
      titulo: 'Hábitos',
      valor:
        dailyStats.habitosAtivos > 0
          ? `${dailyStats.habitosCompletos}/${dailyStats.habitosAtivos}`
          : '0',
      detalhe: dailyStats.habitosAtivos > 0 ? 'hoje' : 'Nenhum ativo',
      icone: Repeat2,
    },
    {
      id: 'streak',
      titulo: 'Streak',
      valor: `${dailyStats.streakAtual} dias`,
      detalhe: 'em sequência',
      icone: Aperture,
    },
  ]

  const progressoSemanal: ProgressoItem[] = [
    {
      id: 'tarefas',
      titulo: 'Tarefas',
      detalhe: `${weeklyStats.tarefasCompletas}/${weeklyStats.tarefasTotal} (${weeklyStats.tarefasPercentual}%)`,
      percentual: weeklyStats.tarefasPercentual,
    },
    {
      id: 'foco',
      titulo: 'Foco',
      detalhe: `${Math.floor(weeklyStats.focoSegundos / 3600)}h/${Math.floor(weeklyStats.focoMeta / 3600)}h (${weeklyStats.focoPercentual}%)`,
      percentual: weeklyStats.focoPercentual,
    },
    {
      id: 'habitos',
      titulo: 'Hábitos',
      detalhe: `${weeklyStats.habitosConsistencia}% consistência`,
      percentual: weeklyStats.habitosConsistencia,
    },
  ]

  const focusSessionsToday = focusStatsQuery.data?.sessions_today ?? 0
  const missoesDiarias = generateDailyMissions(dailyStatsQuery.data, focusSessionsToday)
  const missoesSemanais = generateWeeklyMissions(weeklyStatsQuery.data)

  return {
    userLevel,
    dailyStats,
    weeklyStats,
    cardsResumo,
    progressoSemanal,
    missoesDiarias,
    missoesSemanais,
    isLoading,
    error: error instanceof Error ? error : null,
  }
}
