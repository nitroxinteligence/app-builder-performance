import { z } from 'zod'

export const tipoNotificacaoEnum = z.enum([
  'sistema',
  'conquista',
  'lembrete',
  'tarefa',
  'habito',
  'foco',
  'curso',
])

export const notificacaoCreateSchema = z.object({
  user_id: z.string().uuid(),
  titulo: z.string().min(1).max(200),
  mensagem: z.string().min(1).max(1000),
  tipo: tipoNotificacaoEnum,
  lida: z.boolean().default(false),
})

export type NotificacaoCreateInput = z.infer<typeof notificacaoCreateSchema>
