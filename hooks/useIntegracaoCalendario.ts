'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/providers/auth-provider'
import type { CalendarConnection, CalendarProvider, SyncResult } from '@/types/calendario'

// ==========================================
// CONSTANTS
// ==========================================

const CONNECTIONS_KEY = (userId: string | undefined) =>
  ['calendario', 'connections', userId].filter(Boolean)

const EVENTS_KEY = (userId: string | undefined) =>
  ['agenda', 'events', userId].filter(Boolean)

// ==========================================
// FETCH FUNCTIONS
// ==========================================

async function fetchConnections(userId: string): Promise<CalendarConnection[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- calendar_connections table type will be auto-generated via supabase gen types
  const { data, error } = await (supabase as any)
    .from('calendar_connections')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)

  if (error) {
    throw new Error(`Erro ao buscar conexoes: ${error.message}`)
  }

  return (data ?? []) as CalendarConnection[]
}

// ==========================================
// API CALLS
// ==========================================

async function disconnectProvider(provider: CalendarProvider): Promise<{ eventsDeleted: number }> {
  const response = await fetch('/api/calendario/disconnect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider }),
  })

  const data = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(data.error ?? 'Falha ao desconectar')
  }

  return data.data
}

async function syncCalendars(options?: { force?: boolean }): Promise<{
  results: SyncResult[]
  totalCreated: number
  totalUpdated: number
  totalDeleted: number
}> {
  const response = await fetch('/api/calendario/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ force: options?.force ?? false }),
  })
  const data = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(data.error ?? 'Falha ao sincronizar')
  }

  return data.data
}

// ==========================================
// MAIN HOOK
// ==========================================

export interface UseIntegracaoCalendarioReturn {
  connections: CalendarConnection[]
  isLoading: boolean
  isSyncing: boolean
  isDisconnecting: boolean
  isConnected: (provider: CalendarProvider) => boolean
  lastSyncAt: (provider: CalendarProvider) => Date | null
  getConnection: (provider: CalendarProvider) => CalendarConnection | undefined
  disconnect: (provider: CalendarProvider) => Promise<void>
  sync: (options?: { force?: boolean }) => Promise<void>
}

export function useIntegracaoCalendario(): UseIntegracaoCalendarioReturn {
  const { user } = useAuth()
  const userId = user?.id
  const queryClient = useQueryClient()

  const connectionsQuery = useQuery({
    queryKey: CONNECTIONS_KEY(userId),
    queryFn: () => {
      if (!userId) throw new Error('Usuario nao autenticado')
      return fetchConnections(userId)
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  })

  const disconnectMutation = useMutation({
    mutationFn: disconnectProvider,
    onSuccess: (_data, provider) => {
      queryClient.invalidateQueries({ queryKey: CONNECTIONS_KEY(userId) })
      queryClient.invalidateQueries({ queryKey: EVENTS_KEY(userId) })
      toast.success(`${provider} Calendar desconectado.`)
    },
    onError: (error) => {
      toast.error('Erro ao desconectar', {
        description: error instanceof Error ? error.message : 'Tente novamente',
      })
    },
  })

  const syncMutation = useMutation({
    mutationFn: (options?: { force?: boolean }) => syncCalendars(options),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: CONNECTIONS_KEY(userId) })
      queryClient.invalidateQueries({ queryKey: EVENTS_KEY(userId) })
      const { totalCreated, totalUpdated, totalDeleted } = data
      if (totalCreated + totalUpdated + totalDeleted > 0) {
        toast.success(`Sincronizado: ${totalCreated} novos, ${totalUpdated} atualizados, ${totalDeleted} removidos`)
      } else {
        toast.success('Calendarios sincronizados — nenhuma alteracao.')
      }
    },
    onError: (error) => {
      toast.error('Erro ao sincronizar', {
        description: error instanceof Error ? error.message : 'Tente novamente',
      })
    },
  })

  const connections = connectionsQuery.data ?? []

  const isConnected = (provider: CalendarProvider): boolean =>
    connections.some((c) => c.provider === provider)

  const lastSyncAt = (provider: CalendarProvider): Date | null => {
    const conn = connections.find((c) => c.provider === provider)
    return conn?.last_sync_at ? new Date(conn.last_sync_at) : null
  }

  const getConnection = (provider: CalendarProvider): CalendarConnection | undefined =>
    connections.find((c) => c.provider === provider)

  const disconnect = async (provider: CalendarProvider): Promise<void> => {
    await disconnectMutation.mutateAsync(provider)
  }

  const sync = async (options?: { force?: boolean }): Promise<void> => {
    await syncMutation.mutateAsync(options)
  }

  return {
    connections,
    isLoading: connectionsQuery.isLoading,
    isSyncing: syncMutation.isPending,
    isDisconnecting: disconnectMutation.isPending,
    isConnected,
    lastSyncAt,
    getConnection,
    disconnect,
    sync,
  }
}
