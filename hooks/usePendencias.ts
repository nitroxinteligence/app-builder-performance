'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/providers/auth-provider'
import { pendenciaCreateSchema, pendenciaUpdateSchema } from '@/lib/schemas/tarefa'
import type { Pendencia } from '@/types/database'
import type { PendenciaCreateInput, PendenciaUpdateInput } from '@/lib/schemas/tarefa'

const PENDENCIAS_KEY = ['pendencias']

async function fetchPendencias(userId: string): Promise<Pendencia[]> {
  const { data, error } = await supabase
    .from('pending_items')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Erro ao buscar pendências: ${error.message}`)
  }

  return (data || []) as Pendencia[]
}

async function fetchPendencia(id: string): Promise<Pendencia | null> {
  const { data, error } = await supabase
    .from('pending_items')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Erro ao buscar pendência: ${error.message}`)
  }

  return data as Pendencia
}

async function createPendencia(input: PendenciaCreateInput): Promise<Pendencia> {
  const validated = pendenciaCreateSchema.parse(input)

  const { data, error } = await supabase
    .from('pending_items')
    .insert(validated)
    .select()
    .single()

  if (error) {
    throw new Error(`Erro ao criar pendência: ${error.message}`)
  }

  return data as Pendencia
}

async function createPendenciaWithUserId(
  input: Omit<PendenciaCreateInput, 'user_id'>,
  userId: string
): Promise<Pendencia> {
  return createPendencia({ ...input, user_id: userId })
}

async function updatePendencia({
  id,
  data: updateData,
}: {
  id: string
  data: PendenciaUpdateInput
}): Promise<Pendencia> {
  const validated = pendenciaUpdateSchema.parse(updateData)

  const { data, error } = await supabase
    .from('pending_items')
    .update(validated)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Erro ao atualizar pendência: ${error.message}`)
  }

  return data as Pendencia
}

async function deletePendencia(id: string): Promise<void> {
  const { error } = await supabase.from('pending_items').delete().eq('id', id)

  if (error) {
    throw new Error(`Erro ao deletar pendência: ${error.message}`)
  }
}

export function usePendencias() {
  const { user } = useAuth()

  return useQuery({
    queryKey: PENDENCIAS_KEY,
    queryFn: () => fetchPendencias(user!.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  })
}

export function usePendencia(id: string | undefined) {
  return useQuery({
    queryKey: [...PENDENCIAS_KEY, id],
    queryFn: () => (id ? fetchPendencia(id) : null),
    enabled: !!id,
  })
}

export function useCreatePendencia() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (input: Omit<PendenciaCreateInput, 'user_id'>) => {
      if (!user?.id) {
        throw new Error('Usuário não autenticado')
      }
      return createPendenciaWithUserId(input, user.id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PENDENCIAS_KEY })
      toast.success('Pendência criada!')
    },
    onError: (error) => {
      toast.error('Erro ao criar pendência', {
        description: error instanceof Error ? error.message : 'Tente novamente',
      })
    },
  })
}

export function useUpdatePendencia() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updatePendencia,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PENDENCIAS_KEY })
      toast.success('Pendência atualizada!')
    },
    onError: (error) => {
      toast.error('Erro ao atualizar pendência', {
        description: error instanceof Error ? error.message : 'Tente novamente',
      })
    },
  })
}

export function useDeletePendencia() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deletePendencia,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PENDENCIAS_KEY })
      toast.success('Pendência removida')
    },
    onError: (error) => {
      toast.error('Erro ao remover pendência', {
        description: error instanceof Error ? error.message : 'Tente novamente',
      })
    },
  })
}
