'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/providers/auth-provider'
import {
  metaCreateSchema,
  metaUpdateSchema,
  objetivoCreateSchema,
  objetivoUpdateSchema,
  objetivoMoverSchema,
  colunaObjetivoCreateSchema,
  colunaObjetivoUpdateSchema,
  marcoMetaCreateSchema,
  marcoMetaUpdateSchema,
} from '@/lib/schemas/habito'
import type {
  Meta,
  Objetivo,
  ColunaObjetivo,
  MarcoMeta,
} from '@/types/database'
import type {
  MetaCreateInput,
  MetaUpdateInput,
  ObjetivoCreateInput,
  ObjetivoUpdateInput,
  ObjetivoMoverInput,
  ColunaObjetivoCreateInput,
  ColunaObjetivoUpdateInput,
  MarcoMetaCreateInput,
  MarcoMetaUpdateInput,
} from '@/lib/schemas/habito'

// ==========================================
// QUERY KEYS
// ==========================================

const METAS_KEY = ['metas']
const OBJETIVOS_KEY = ['objetivos']
const COLUNAS_OBJETIVO_KEY = ['colunas_objetivo']
const MARCOS_META_KEY = ['marcos_meta']

// ==========================================
// META - FETCH FUNCTIONS
// ==========================================

async function fetchMetas(userId: string): Promise<Meta[]> {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .order('ordem', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Erro ao buscar metas: ${error.message}`)
  }

  return (data || []) as Meta[]
}

async function fetchMeta(id: string): Promise<Meta | null> {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Erro ao buscar meta: ${error.message}`)
  }

  return data as Meta
}

// ==========================================
// META - MUTATION FUNCTIONS
// ==========================================

async function createMeta(input: MetaCreateInput): Promise<Meta> {
  const validated = metaCreateSchema.parse(input)

  const { data, error } = await supabase
    .from('goals')
    .insert(validated)
    .select()
    .single()

  if (error) {
    throw new Error(`Erro ao criar meta: ${error.message}`)
  }

  return data as Meta
}

async function createMetaWithUserId(
  input: Omit<MetaCreateInput, 'user_id'>,
  userId: string
): Promise<Meta> {
  return createMeta({ ...input, user_id: userId })
}

async function updateMeta({
  id,
  data: updateData,
}: {
  id: string
  data: MetaUpdateInput
}): Promise<Meta> {
  const validated = metaUpdateSchema.parse(updateData)

  const { data, error } = await supabase
    .from('goals')
    .update(validated)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Erro ao atualizar meta: ${error.message}`)
  }

  return data as Meta
}

async function deleteMeta(id: string): Promise<void> {
  const { error } = await supabase.from('goals').delete().eq('id', id)

  if (error) {
    throw new Error(`Erro ao deletar meta: ${error.message}`)
  }
}

// ==========================================
// OBJETIVO - FETCH FUNCTIONS
// ==========================================

async function fetchObjetivos(userId: string): Promise<Objetivo[]> {
  const { data, error } = await supabase
    .from('objectives')
    .select('*')
    .eq('user_id', userId)
    .order('ordem', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Erro ao buscar objetivos: ${error.message}`)
  }

  return (data || []) as Objetivo[]
}

async function fetchObjetivo(id: string): Promise<Objetivo | null> {
  const { data, error } = await supabase
    .from('objectives')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Erro ao buscar objetivo: ${error.message}`)
  }

  return data as Objetivo
}

// ==========================================
// OBJETIVO - MUTATION FUNCTIONS
// ==========================================

async function createObjetivo(input: ObjetivoCreateInput): Promise<Objetivo> {
  const validated = objetivoCreateSchema.parse(input)

  const { data, error } = await supabase
    .from('objectives')
    .insert(validated)
    .select()
    .single()

  if (error) {
    throw new Error(`Erro ao criar objetivo: ${error.message}`)
  }

  return data as Objetivo
}

async function createObjetivoWithUserId(
  input: Omit<ObjetivoCreateInput, 'user_id'>,
  userId: string
): Promise<Objetivo> {
  return createObjetivo({ ...input, user_id: userId })
}

async function updateObjetivo({
  id,
  data: updateData,
}: {
  id: string
  data: ObjetivoUpdateInput
}): Promise<Objetivo> {
  const validated = objetivoUpdateSchema.parse(updateData)

  const { data, error } = await supabase
    .from('objectives')
    .update(validated)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Erro ao atualizar objetivo: ${error.message}`)
  }

  return data as Objetivo
}

async function deleteObjetivo(id: string): Promise<void> {
  const { error } = await supabase.from('objectives').delete().eq('id', id)

  if (error) {
    throw new Error(`Erro ao deletar objetivo: ${error.message}`)
  }
}

async function moverObjetivo({
  id,
  coluna_id,
  status,
  ordem,
}: ObjetivoMoverInput): Promise<Objetivo> {
  const validated = objetivoMoverSchema.parse({ id, coluna_id, status, ordem })

  const updateData: Partial<Objetivo> = {
    ordem: validated.ordem,
  }

  if (validated.coluna_id !== undefined) {
    updateData.coluna_id = validated.coluna_id
  }

  if (validated.status !== undefined) {
    updateData.status = validated.status
  }

  const { data, error } = await supabase
    .from('objectives')
    .update(updateData)
    .eq('id', validated.id)
    .select()
    .single()

  if (error) {
    throw new Error(`Erro ao mover objetivo: ${error.message}`)
  }

  return data as Objetivo
}

// ==========================================
// COLUNA OBJETIVO - FETCH FUNCTIONS
// ==========================================

async function fetchColunasObjetivo(userId: string): Promise<ColunaObjetivo[]> {
  const { data, error } = await supabase
    .from('objective_columns')
    .select('*')
    .eq('user_id', userId)
    .order('ordem', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Erro ao buscar colunas de objetivo: ${error.message}`)
  }

  return (data || []) as ColunaObjetivo[]
}

// ==========================================
// COLUNA OBJETIVO - MUTATION FUNCTIONS
// ==========================================

async function createColunaObjetivo(
  input: ColunaObjetivoCreateInput
): Promise<ColunaObjetivo> {
  const validated = colunaObjetivoCreateSchema.parse(input)

  const { data, error } = await supabase
    .from('objective_columns')
    .insert(validated)
    .select()
    .single()

  if (error) {
    throw new Error(`Erro ao criar coluna de objetivo: ${error.message}`)
  }

  return data as ColunaObjetivo
}

async function createColunaObjetivoWithUserId(
  input: Omit<ColunaObjetivoCreateInput, 'user_id'>,
  userId: string
): Promise<ColunaObjetivo> {
  return createColunaObjetivo({ ...input, user_id: userId })
}

async function updateColunaObjetivo({
  id,
  data: updateData,
}: {
  id: string
  data: ColunaObjetivoUpdateInput
}): Promise<ColunaObjetivo> {
  const validated = colunaObjetivoUpdateSchema.parse(updateData)

  const { data, error } = await supabase
    .from('objective_columns')
    .update(validated)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Erro ao atualizar coluna de objetivo: ${error.message}`)
  }

  return data as ColunaObjetivo
}

async function deleteColunaObjetivo(id: string): Promise<void> {
  const { error } = await supabase
    .from('objective_columns')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Erro ao deletar coluna de objetivo: ${error.message}`)
  }
}

// ==========================================
// MARCO META - FETCH FUNCTIONS
// ==========================================

async function fetchMarcosMeta(metaId: string): Promise<MarcoMeta[]> {
  const { data, error } = await supabase
    .from('goal_milestones')
    .select('*')
    .eq('meta_id', metaId)
    .order('ordem', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Erro ao buscar marcos da meta: ${error.message}`)
  }

  return (data || []) as MarcoMeta[]
}

// ==========================================
// MARCO META - MUTATION FUNCTIONS
// ==========================================

async function createMarcoMeta(input: MarcoMetaCreateInput): Promise<MarcoMeta> {
  const validated = marcoMetaCreateSchema.parse(input)

  const { data, error } = await supabase
    .from('goal_milestones')
    .insert(validated)
    .select()
    .single()

  if (error) {
    throw new Error(`Erro ao criar marco da meta: ${error.message}`)
  }

  return data as MarcoMeta
}

async function updateMarcoMeta({
  id,
  data: updateData,
}: {
  id: string
  data: MarcoMetaUpdateInput
}): Promise<MarcoMeta> {
  const validated = marcoMetaUpdateSchema.parse(updateData)

  const { data, error } = await supabase
    .from('goal_milestones')
    .update(validated)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Erro ao atualizar marco da meta: ${error.message}`)
  }

  return data as MarcoMeta
}

async function deleteMarcoMeta(id: string): Promise<void> {
  const { error } = await supabase.from('goal_milestones').delete().eq('id', id)

  if (error) {
    throw new Error(`Erro ao deletar marco da meta: ${error.message}`)
  }
}

// ==========================================
// META - HOOKS
// ==========================================

export function useMetas() {
  const { user } = useAuth()

  return useQuery({
    queryKey: METAS_KEY,
    queryFn: () => fetchMetas(user!.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  })
}

export function useMeta(id: string | undefined) {
  return useQuery({
    queryKey: [...METAS_KEY, id],
    queryFn: () => (id ? fetchMeta(id) : null),
    enabled: !!id,
  })
}

export function useCreateMeta() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (input: Omit<MetaCreateInput, 'user_id'>) => {
      if (!user?.id) {
        throw new Error('Usuário não autenticado')
      }
      return createMetaWithUserId(input, user.id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: METAS_KEY })
    },
  })
}

export function useUpdateMeta() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateMeta,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: METAS_KEY })
    },
  })
}

export function useDeleteMeta() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteMeta,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: METAS_KEY })
      queryClient.invalidateQueries({ queryKey: MARCOS_META_KEY })
    },
  })
}

// ==========================================
// OBJETIVO - HOOKS
// ==========================================

export function useObjetivos() {
  const { user } = useAuth()

  return useQuery({
    queryKey: OBJETIVOS_KEY,
    queryFn: () => fetchObjetivos(user!.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  })
}

export function useObjetivo(id: string | undefined) {
  return useQuery({
    queryKey: [...OBJETIVOS_KEY, id],
    queryFn: () => (id ? fetchObjetivo(id) : null),
    enabled: !!id,
  })
}

export function useCreateObjetivo() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (input: Omit<ObjetivoCreateInput, 'user_id'>) => {
      if (!user?.id) {
        throw new Error('Usuário não autenticado')
      }
      return createObjetivoWithUserId(input, user.id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OBJETIVOS_KEY })
    },
  })
}

export function useUpdateObjetivo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateObjetivo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OBJETIVOS_KEY })
    },
  })
}

export function useDeleteObjetivo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteObjetivo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OBJETIVOS_KEY })
    },
  })
}

export function useMoverObjetivo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: moverObjetivo,
    onMutate: async ({ id, coluna_id, status, ordem }) => {
      await queryClient.cancelQueries({ queryKey: OBJETIVOS_KEY })

      const previousObjetivos =
        queryClient.getQueryData<Objetivo[]>(OBJETIVOS_KEY)

      queryClient.setQueryData<Objetivo[]>(OBJETIVOS_KEY, (old) => {
        if (!old) return old

        return old.map((objetivo) =>
          objetivo.id === id
            ? {
                ...objetivo,
                coluna_id: coluna_id !== undefined ? coluna_id : objetivo.coluna_id,
                status: status !== undefined ? status : objetivo.status,
                ordem,
              }
            : objetivo
        )
      })

      return { previousObjetivos }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousObjetivos) {
        queryClient.setQueryData(OBJETIVOS_KEY, context.previousObjetivos)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: OBJETIVOS_KEY })
    },
  })
}

// ==========================================
// COLUNA OBJETIVO - HOOKS
// ==========================================

export function useColunasObjetivo() {
  const { user } = useAuth()

  return useQuery({
    queryKey: COLUNAS_OBJETIVO_KEY,
    queryFn: () => fetchColunasObjetivo(user!.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  })
}

export function useCreateColunaObjetivo() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (input: Omit<ColunaObjetivoCreateInput, 'user_id'>) => {
      if (!user?.id) {
        throw new Error('Usuário não autenticado')
      }
      return createColunaObjetivoWithUserId(input, user.id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COLUNAS_OBJETIVO_KEY })
    },
  })
}

export function useUpdateColunaObjetivo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateColunaObjetivo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COLUNAS_OBJETIVO_KEY })
    },
  })
}

export function useDeleteColunaObjetivo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteColunaObjetivo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COLUNAS_OBJETIVO_KEY })
      queryClient.invalidateQueries({ queryKey: OBJETIVOS_KEY })
    },
  })
}

// ==========================================
// MARCO META - HOOKS
// ==========================================

export function useMarcosMeta(metaId: string | undefined) {
  return useQuery({
    queryKey: [...MARCOS_META_KEY, metaId],
    queryFn: () => (metaId ? fetchMarcosMeta(metaId) : []),
    enabled: !!metaId,
    staleTime: 1000 * 60 * 5,
  })
}

export function useCreateMarcoMeta() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createMarcoMeta,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [...MARCOS_META_KEY, data.meta_id],
      })
      queryClient.invalidateQueries({ queryKey: METAS_KEY })
    },
  })
}

export function useUpdateMarcoMeta() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateMarcoMeta,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MARCOS_META_KEY })
      queryClient.invalidateQueries({ queryKey: METAS_KEY })
    },
  })
}

export function useDeleteMarcoMeta() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteMarcoMeta,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MARCOS_META_KEY })
      queryClient.invalidateQueries({ queryKey: METAS_KEY })
    },
  })
}

// ==========================================
// EXPORTS - QUERY KEYS
// ==========================================

export { METAS_KEY, OBJETIVOS_KEY, COLUNAS_OBJETIVO_KEY, MARCOS_META_KEY }
