export type StatusEvento = 'confirmado' | 'pendente' | 'cancelado'

export type IntegracaoCalendario = 'google' | 'outlook' | 'apple' | 'nenhum' | 'Manual'

export type EventoAgenda = {
  id: string
  titulo: string
  descricao: string
  data: string
  horarioInicio: string
  horarioFim: string
  categoria: string
  local: string
  status: StatusEvento
  calendario: IntegracaoCalendario
}

export const categoriasAgenda = [
  { id: 'reuniao', titulo: 'Reunião' },
  { id: 'evento', titulo: 'Evento' },
  { id: 'lembrete', titulo: 'Lembrete' },
  { id: 'pessoal', titulo: 'Pessoal' },
  { id: 'trabalho', titulo: 'Trabalho' },
]

export const eventosAgenda: EventoAgenda[] = []
