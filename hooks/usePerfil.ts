'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/providers/auth-provider'
import { perfilUpdateSchema, alterarSenhaSchema } from '@/lib/schemas/perfil'
import type { PerfilUpdateInput, AlterarSenhaInput } from '@/lib/schemas/perfil'

const USERS_KEY = ['users']

async function updatePerfil(
  userId: string,
  input: PerfilUpdateInput
): Promise<void> {
  const validated = perfilUpdateSchema.parse(input)

  const { error: dbError } = await supabase
    .from('users')
    .update(validated)
    .eq('id', userId)

  if (dbError) {
    throw new Error(`Erro ao atualizar perfil: ${dbError.message}`)
  }

  if (validated.name) {
    const { error: authError } = await supabase.auth.updateUser({
      data: { full_name: validated.name },
    })

    if (authError) {
      throw new Error(`Erro ao atualizar metadados: ${authError.message}`)
    }
  }
}

async function alterarSenha(input: AlterarSenhaInput): Promise<void> {
  const validated = alterarSenhaSchema.parse(input)

  const { error } = await supabase.auth.updateUser({
    password: validated.novaSenha,
  })

  if (error) {
    throw new Error(`Erro ao alterar senha: ${error.message}`)
  }
}

async function uploadAvatar(
  userId: string,
  file: File
): Promise<string> {
  const extensao = file.name.split('.').pop()
  const caminho = `${userId}/avatar.${extensao}`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(caminho, file, { upsert: true })

  if (uploadError) {
    throw new Error(`Erro no upload: ${uploadError.message}`)
  }

  const { data } = supabase.storage
    .from('avatars')
    .getPublicUrl(caminho)

  const avatarUrl = `${data.publicUrl}?t=${Date.now()}`

  const { error: dbError } = await supabase
    .from('users')
    .update({ avatar_url: avatarUrl })
    .eq('id', userId)

  if (dbError) {
    throw new Error(`Erro ao salvar URL do avatar: ${dbError.message}`)
  }

  const { error: authError } = await supabase.auth.updateUser({
    data: { avatar_url: avatarUrl },
  })

  if (authError) {
    throw new Error(`Erro ao atualizar metadados: ${authError.message}`)
  }

  return avatarUrl
}

async function removerAvatar(userId: string): Promise<void> {
  const { data: arquivos } = await supabase.storage
    .from('avatars')
    .list(userId)

  if (arquivos && arquivos.length > 0) {
    const caminhos = arquivos.map((f) => `${userId}/${f.name}`)
    await supabase.storage.from('avatars').remove(caminhos)
  }

  const { error: dbError } = await supabase
    .from('users')
    .update({ avatar_url: null })
    .eq('id', userId)

  if (dbError) {
    throw new Error(`Erro ao remover avatar: ${dbError.message}`)
  }

  const { error: authError } = await supabase.auth.updateUser({
    data: { avatar_url: null },
  })

  if (authError) {
    throw new Error(`Erro ao atualizar metadados: ${authError.message}`)
  }
}

export function useUpdatePerfil() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (input: PerfilUpdateInput) => {
      if (!user?.id) {
        throw new Error('Usuário não autenticado')
      }
      return updatePerfil(user.id, input)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY })
      toast.success('Perfil atualizado com sucesso!')
    },
    onError: (error) => {
      toast.error('Erro ao atualizar perfil', {
        description: error instanceof Error ? error.message : 'Tente novamente',
      })
    },
  })
}

export function useAlterarSenha() {
  return useMutation({
    mutationFn: alterarSenha,
    onSuccess: () => {
      toast.success('Senha alterada com sucesso!')
    },
    onError: (error) => {
      toast.error('Erro ao alterar senha', {
        description: error instanceof Error ? error.message : 'Tente novamente',
      })
    },
  })
}

export function useUploadAvatar() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (file: File) => {
      if (!user?.id) {
        throw new Error('Usuário não autenticado')
      }
      return uploadAvatar(user.id, file)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY })
      toast.success('Foto atualizada!')
    },
    onError: (error) => {
      toast.error('Erro ao enviar foto', {
        description: error instanceof Error ? error.message : 'Tente novamente',
      })
    },
  })
}

export function useRemoverAvatar() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: () => {
      if (!user?.id) {
        throw new Error('Usuário não autenticado')
      }
      return removerAvatar(user.id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY })
      toast.success('Foto removida!')
    },
    onError: (error) => {
      toast.error('Erro ao remover foto', {
        description: error instanceof Error ? error.message : 'Tente novamente',
      })
    },
  })
}
