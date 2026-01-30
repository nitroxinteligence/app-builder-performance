import { z } from 'zod'

// ==========================================
// PERFIL - UPDATE
// ==========================================

export const perfilUpdateSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo').optional(),
  avatar_url: z.string().url('URL inválida').nullable().optional(),
})

// ==========================================
// PERFIL - ALTERAR SENHA
// ==========================================

export const alterarSenhaSchema = z.object({
  novaSenha: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  confirmacao: z.string().min(1, 'Confirmação é obrigatória'),
}).refine((data) => data.novaSenha === data.confirmacao, {
  message: 'As senhas não conferem',
  path: ['confirmacao'],
})

// ==========================================
// TYPES INFERIDOS
// ==========================================

export type PerfilUpdateInput = z.infer<typeof perfilUpdateSchema>
export type AlterarSenhaInput = z.infer<typeof alterarSenhaSchema>
