'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/providers/auth-provider'
import type {
  AgendaEvent,
  CreateEventDto,
  UpdateEventDto,
  UseAgendaReturn,
} from '@/types/agenda'

// ==========================================
// CONSTANTS
// ==========================================

const EVENTS_KEY = (userId: string | undefined) =>
  ['agenda', 'events', userId].filter(Boolean)

// ==========================================
// FETCH FUNCTIONS
// ==========================================

async function fetchEvents(userId: string): Promise<AgendaEvent[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('user_id', userId)
    .order('data', { ascending: true })
    .order('horario_inicio', { ascending: true })

  if (error) {
    throw new Error(`Erro ao buscar eventos: ${error.message}`)
  }

  return data ?? []
}

async function createEventApi(
  userId: string,
  eventData: CreateEventDto
): Promise<AgendaEvent> {
  const { data, error } = await supabase
    .from('events')
    .insert({
      user_id: userId,
      titulo: eventData.titulo,
      descricao: eventData.descricao ?? null,
      data: eventData.data,
      horario_inicio: eventData.horario_inicio,
      horario_fim: eventData.horario_fim,
      categoria: eventData.categoria,
      local: eventData.local ?? null,
      status: eventData.status,
      calendario: eventData.calendario,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Erro ao criar evento: ${error.message}`)
  }

  return data
}

async function updateEventApi(
  eventId: string,
  eventData: UpdateEventDto
): Promise<AgendaEvent> {
  const { data, error } = await supabase
    .from('events')
    .update({
      ...(eventData.titulo !== undefined && { titulo: eventData.titulo }),
      ...(eventData.descricao !== undefined && { descricao: eventData.descricao }),
      ...(eventData.data !== undefined && { data: eventData.data }),
      ...(eventData.horario_inicio !== undefined && {
        horario_inicio: eventData.horario_inicio,
      }),
      ...(eventData.horario_fim !== undefined && {
        horario_fim: eventData.horario_fim,
      }),
      ...(eventData.categoria !== undefined && { categoria: eventData.categoria }),
      ...(eventData.local !== undefined && { local: eventData.local }),
      ...(eventData.status !== undefined && { status: eventData.status }),
      ...(eventData.calendario !== undefined && {
        calendario: eventData.calendario,
      }),
    })
    .eq('id', eventId)
    .select()
    .single()

  if (error) {
    throw new Error(`Erro ao atualizar evento: ${error.message}`)
  }

  return data
}

async function deleteEventApi(eventId: string): Promise<void> {
  const { error } = await supabase.from('events').delete().eq('id', eventId)

  if (error) {
    throw new Error(`Erro ao excluir evento: ${error.message}`)
  }
}

// ==========================================
// MAIN HOOK
// ==========================================

export function useAgenda(): UseAgendaReturn {
  const { user } = useAuth()
  const userId = user?.id
  const queryClient = useQueryClient()

  const eventsQuery = useQuery({
    queryKey: EVENTS_KEY(userId),
    queryFn: () => {
      if (!userId) throw new Error('Usuário não autenticado')
      return fetchEvents(userId)
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateEventDto) => {
      if (!userId) throw new Error('Usuário não autenticado')
      return createEventApi(userId, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENTS_KEY(userId) })
      toast.success('Evento criado com sucesso!')
    },
    onError: (error) => {
      toast.error('Erro ao criar evento', {
        description: error instanceof Error ? error.message : 'Tente novamente',
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEventDto }) =>
      updateEventApi(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENTS_KEY(userId) })
      toast.success('Evento atualizado!')
    },
    onError: (error) => {
      toast.error('Erro ao atualizar evento', {
        description: error instanceof Error ? error.message : 'Tente novamente',
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteEventApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENTS_KEY(userId) })
      toast.success('Evento excluído')
    },
    onError: (error) => {
      toast.error('Erro ao excluir evento', {
        description: error instanceof Error ? error.message : 'Tente novamente',
      })
    },
  })

  const createEvent = async (data: CreateEventDto): Promise<AgendaEvent> => {
    return createMutation.mutateAsync(data)
  }

  const updateEvent = async (
    id: string,
    data: UpdateEventDto
  ): Promise<AgendaEvent> => {
    return updateMutation.mutateAsync({ id, data })
  }

  const deleteEvent = async (id: string): Promise<void> => {
    return deleteMutation.mutateAsync(id)
  }

  return {
    events: eventsQuery.data ?? [],
    isLoading: eventsQuery.isLoading,
    error: eventsQuery.error instanceof Error ? eventsQuery.error : null,
    createEvent,
    updateEvent,
    deleteEvent,
  }
}

// ==========================================
// HELPER HOOKS
// ==========================================

export function useEventsByDate(date: string) {
  const { events, isLoading, error } = useAgenda()

  const filteredEvents = events.filter((event) => event.data === date)

  return {
    events: filteredEvents,
    isLoading,
    error,
  }
}

export function useUpcomingEvents(fromDate: string, limit = 5) {
  const { events, isLoading, error } = useAgenda()

  const upcomingEvents = events
    .filter((event) => event.data >= fromDate)
    .slice(0, limit)

  return {
    events: upcomingEvents,
    isLoading,
    error,
  }
}
