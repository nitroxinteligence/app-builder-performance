'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/providers/auth-provider'
import type { Notificacao } from '@/lib/supabase/types'

const NOTIFICACOES_KEY = ['notificacoes']

async function fetchNotificacoes(userId: string): Promise<Notificacao[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    throw new Error(`Erro ao buscar notificações: ${error.message}`)
  }

  return (data || []) as Notificacao[]
}

async function fetchContagemNaoLidas(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('lida', false)

  if (error) {
    throw new Error(`Erro ao contar notificações: ${error.message}`)
  }

  return count ?? 0
}

async function marcarComoLida(id: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ lida: true })
    .eq('id', id)

  if (error) {
    throw new Error(`Erro ao marcar notificação: ${error.message}`)
  }
}

async function marcarTodasComoLidas(userId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ lida: true })
    .eq('user_id', userId)
    .eq('lida', false)

  if (error) {
    throw new Error(`Erro ao marcar notificações: ${error.message}`)
  }
}

export function useNotificacoes() {
  const { user } = useAuth()

  return useQuery({
    queryKey: [...NOTIFICACOES_KEY, user?.id],
    queryFn: () => fetchNotificacoes(user!.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 2,
    refetchInterval: 1000 * 60 * 2,
  })
}

export function useContagemNaoLidas() {
  const { user } = useAuth()

  return useQuery({
    queryKey: [...NOTIFICACOES_KEY, 'contagem', user?.id],
    queryFn: () => fetchContagemNaoLidas(user!.id),
    enabled: !!user,
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
  })
}

export function useMarcarComoLida() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: marcarComoLida,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: NOTIFICACOES_KEY })

      const previousNotificacoes = queryClient.getQueriesData<Notificacao[]>({
        queryKey: NOTIFICACOES_KEY,
      })

      queryClient.setQueriesData<Notificacao[]>(
        { queryKey: NOTIFICACOES_KEY },
        (old) => {
          if (!old) return old
          if (!Array.isArray(old)) return old
          return old.map((n) => (n.id === id ? { ...n, lida: true } : n))
        }
      )

      return { previousNotificacoes }
    },
    onError: (_error, _id, context) => {
      if (context?.previousNotificacoes) {
        for (const [key, data] of context.previousNotificacoes) {
          queryClient.setQueryData(key, data)
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICACOES_KEY })
    },
  })
}

export function useMarcarTodasComoLidas() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: () => {
      if (!user?.id) {
        throw new Error('Usuário não autenticado')
      }
      return marcarTodasComoLidas(user.id)
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: NOTIFICACOES_KEY })

      const previousNotificacoes = queryClient.getQueriesData<Notificacao[]>({
        queryKey: NOTIFICACOES_KEY,
      })

      queryClient.setQueriesData<Notificacao[]>(
        { queryKey: NOTIFICACOES_KEY },
        (old) => {
          if (!old) return old
          if (!Array.isArray(old)) return old
          return old.map((n) => ({ ...n, lida: true }))
        }
      )

      return { previousNotificacoes }
    },
    onError: (_error, _vars, context) => {
      if (context?.previousNotificacoes) {
        for (const [key, data] of context.previousNotificacoes) {
          queryClient.setQueryData(key, data)
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICACOES_KEY })
    },
  })
}
