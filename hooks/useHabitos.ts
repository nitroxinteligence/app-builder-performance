'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/providers/auth-provider'
import {
  habitoCreateSchema,
  habitoUpdateSchema,
  categoriaHabitoCreateSchema,
  categoriaHabitoUpdateSchema,
  historicoHabitoCreateSchema,
} from '@/lib/schemas/habito'
import type { Habito, CategoriaHabito, HistoricoHabito } from '@/types/database'
import type {
  HabitoCreateInput,
  HabitoUpdateInput,
  CategoriaHabitoCreateInput,
  CategoriaHabitoUpdateInput,
  HistoricoHabitoCreateInput,
} from '@/lib/schemas/habito'

const HABITOS_KEY = ['habitos']
const CATEGORIAS_HABITOS_KEY = ['categorias_habitos']
const HISTORICO_HABITOS_KEY = ['historico_habitos']

// ==========================================
// FETCH FUNCTIONS - HÁBITOS
// ==========================================

async function fetchHabitos(userId: string): Promise<Habito[]> {
  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', userId)
    .order('ordem', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Erro ao buscar hábitos: ${error.message}`)
  }

  return (data || []) as Habito[]
}

async function fetchHabito(id: string): Promise<Habito | null> {
  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Erro ao buscar hábito: ${error.message}`)
  }

  return data as Habito
}

// ==========================================
// FETCH FUNCTIONS - CATEGORIAS
// ==========================================

async function fetchCategoriasHabitos(userId: string): Promise<CategoriaHabito[]> {
  const { data, error } = await supabase
    .from('habit_categories')
    .select('*')
    .eq('user_id', userId)
    .order('ordem', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Erro ao buscar categorias de hábitos: ${error.message}`)
  }

  return (data || []) as CategoriaHabito[]
}

// ==========================================
// FETCH FUNCTIONS - HISTÓRICO
// ==========================================

async function fetchHistoricoHabitos(userId: string, habitoId?: string): Promise<HistoricoHabito[]> {
  let query = supabase
    .from('habit_history')
    .select('*')
    .eq('user_id', userId)
    .order('data', { ascending: false })

  if (habitoId) {
    query = query.eq('habito_id', habitoId)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Erro ao buscar histórico de hábitos: ${error.message}`)
  }

  return (data || []) as HistoricoHabito[]
}

// ==========================================
// MUTATION FUNCTIONS - HÁBITOS
// ==========================================

async function createHabito(input: HabitoCreateInput): Promise<Habito> {
  const validated = habitoCreateSchema.parse(input)

  const { data, error } = await supabase
    .from('habits')
    .insert(validated)
    .select()
    .single()

  if (error) {
    throw new Error(`Erro ao criar hábito: ${error.message}`)
  }

  return data as Habito
}

async function createHabitoWithUserId(
  input: Omit<HabitoCreateInput, 'user_id'>,
  userId: string
): Promise<Habito> {
  return createHabito({ ...input, user_id: userId })
}

async function updateHabito({
  id,
  data: updateData,
}: {
  id: string
  data: HabitoUpdateInput
}): Promise<Habito> {
  const validated = habitoUpdateSchema.parse(updateData)

  const { data, error } = await supabase
    .from('habits')
    .update(validated)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Erro ao atualizar hábito: ${error.message}`)
  }

  return data as Habito
}

async function deleteHabito(id: string): Promise<void> {
  const { error } = await supabase.from('habits').delete().eq('id', id)

  if (error) {
    throw new Error(`Erro ao deletar hábito: ${error.message}`)
  }
}

// ==========================================
// MUTATION FUNCTIONS - CATEGORIAS
// ==========================================

async function createCategoriaHabito(input: CategoriaHabitoCreateInput): Promise<CategoriaHabito> {
  const validated = categoriaHabitoCreateSchema.parse(input)

  const { data, error } = await supabase
    .from('habit_categories')
    .insert(validated)
    .select()
    .single()

  if (error) {
    throw new Error(`Erro ao criar categoria de hábito: ${error.message}`)
  }

  return data as CategoriaHabito
}

async function createCategoriaHabitoWithUserId(
  input: Omit<CategoriaHabitoCreateInput, 'user_id'>,
  userId: string
): Promise<CategoriaHabito> {
  return createCategoriaHabito({ ...input, user_id: userId })
}

async function updateCategoriaHabito({
  id,
  data: updateData,
}: {
  id: string
  data: CategoriaHabitoUpdateInput
}): Promise<CategoriaHabito> {
  const validated = categoriaHabitoUpdateSchema.parse(updateData)

  const { data, error } = await supabase
    .from('habit_categories')
    .update(validated)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Erro ao atualizar categoria de hábito: ${error.message}`)
  }

  return data as CategoriaHabito
}

async function deleteCategoriaHabito(id: string): Promise<void> {
  const { error } = await supabase.from('habit_categories').delete().eq('id', id)

  if (error) {
    throw new Error(`Erro ao deletar categoria de hábito: ${error.message}`)
  }
}

// ==========================================
// MUTATION FUNCTIONS - HISTÓRICO
// ==========================================

async function registrarHabito(input: HistoricoHabitoCreateInput): Promise<HistoricoHabito> {
  const validated = historicoHabitoCreateSchema.parse(input)

  const { data, error } = await supabase
    .from('habit_history')
    .upsert(validated, {
      onConflict: 'habito_id,data',
      ignoreDuplicates: false,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Erro ao registrar hábito: ${error.message}`)
  }

  return data as HistoricoHabito
}

async function registrarHabitoWithUserId(
  input: Omit<HistoricoHabitoCreateInput, 'user_id'>,
  userId: string
): Promise<HistoricoHabito> {
  return registrarHabito({ ...input, user_id: userId })
}

// ==========================================
// HOOKS - HÁBITOS
// ==========================================

export function useHabitos() {
  const { user } = useAuth()

  return useQuery({
    queryKey: [...HABITOS_KEY, user?.id],
    queryFn: () => fetchHabitos(user!.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  })
}

export function useHabito(id: string | undefined) {
  const { user } = useAuth()

  return useQuery({
    queryKey: [...HABITOS_KEY, user?.id, id],
    queryFn: () => (id ? fetchHabito(id) : null),
    enabled: !!id,
  })
}

export function useCreateHabito() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (input: Omit<HabitoCreateInput, 'user_id'>) => {
      if (!user?.id) {
        throw new Error('Usuário não autenticado')
      }
      return createHabitoWithUserId(input, user.id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HABITOS_KEY })
      toast.success('Hábito criado com sucesso!')
    },
    onError: (error) => {
      toast.error('Erro ao criar hábito', {
        description: error instanceof Error ? error.message : 'Tente novamente',
      })
    },
  })
}

export function useUpdateHabito() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateHabito,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HABITOS_KEY })
      toast.success('Hábito atualizado!')
    },
    onError: (error) => {
      toast.error('Erro ao atualizar hábito', {
        description: error instanceof Error ? error.message : 'Tente novamente',
      })
    },
  })
}

export function useDeleteHabito() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteHabito,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HABITOS_KEY })
      queryClient.invalidateQueries({ queryKey: HISTORICO_HABITOS_KEY })
      toast.success('Hábito excluído')
    },
    onError: (error) => {
      toast.error('Erro ao excluir hábito', {
        description: error instanceof Error ? error.message : 'Tente novamente',
      })
    },
  })
}

// ==========================================
// HOOKS - CATEGORIAS
// ==========================================

export function useCategoriasHabitos() {
  const { user } = useAuth()

  return useQuery({
    queryKey: [...CATEGORIAS_HABITOS_KEY, user?.id],
    queryFn: () => fetchCategoriasHabitos(user!.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  })
}

export function useCreateCategoriaHabito() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (input: Omit<CategoriaHabitoCreateInput, 'user_id'>) => {
      if (!user?.id) {
        throw new Error('Usuário não autenticado')
      }
      return createCategoriaHabitoWithUserId(input, user.id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIAS_HABITOS_KEY })
      toast.success('Categoria criada com sucesso!')
    },
    onError: (error) => {
      toast.error('Erro ao criar categoria', {
        description: error instanceof Error ? error.message : 'Tente novamente',
      })
    },
  })
}

export function useUpdateCategoriaHabito() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateCategoriaHabito,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIAS_HABITOS_KEY })
      toast.success('Categoria atualizada!')
    },
    onError: (error) => {
      toast.error('Erro ao atualizar categoria', {
        description: error instanceof Error ? error.message : 'Tente novamente',
      })
    },
  })
}

export function useDeleteCategoriaHabito() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteCategoriaHabito,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIAS_HABITOS_KEY })
      queryClient.invalidateQueries({ queryKey: HABITOS_KEY })
      toast.success('Categoria excluída')
    },
    onError: (error) => {
      toast.error('Erro ao excluir categoria', {
        description: error instanceof Error ? error.message : 'Tente novamente',
      })
    },
  })
}

// ==========================================
// HOOKS - HISTÓRICO
// ==========================================

export function useHistoricoHabitos(habitoId?: string) {
  const { user } = useAuth()

  return useQuery({
    queryKey: habitoId ? [...HISTORICO_HABITOS_KEY, user?.id, habitoId] : [...HISTORICO_HABITOS_KEY, user?.id],
    queryFn: () => fetchHistoricoHabitos(user!.id, habitoId),
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  })
}

export function useRegistrarHabito() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (input: Omit<HistoricoHabitoCreateInput, 'user_id'>) => {
      if (!user?.id) {
        throw new Error('Usuário não autenticado')
      }
      return registrarHabitoWithUserId(input, user.id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HISTORICO_HABITOS_KEY })
      queryClient.invalidateQueries({ queryKey: HABITOS_KEY })
      toast.success('Hábito registrado!')
    },
    onError: (error) => {
      toast.error('Erro ao registrar hábito', {
        description: error instanceof Error ? error.message : 'Tente novamente',
      })
    },
  })
}
