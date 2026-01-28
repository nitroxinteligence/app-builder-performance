// ==========================================
// TIPOS DE EVENTO
// ==========================================

export type EventStatus = 'confirmado' | 'pendente' | 'foco'

export type CalendarIntegration = 'Manual' | 'Google' | 'Outlook'

// ==========================================
// CATEGORIAS DE EVENTO
// ==========================================

export interface EventCategory {
  id: string
  titulo: string
}

export const EVENT_CATEGORIES: readonly EventCategory[] = [
  { id: 'reuniao', titulo: 'Reunião' },
  { id: 'foco', titulo: 'Bloco de foco' },
  { id: 'aula', titulo: 'Aula / Mentoria' },
  { id: 'pessoal', titulo: 'Pessoal' },
] as const

// ==========================================
// EVENTO DA AGENDA
// ==========================================

export interface AgendaEvent {
  id: string
  user_id: string
  titulo: string
  descricao: string | null
  data: string
  horario_inicio: string
  horario_fim: string
  categoria: string
  local: string | null
  status: EventStatus
  calendario: CalendarIntegration
  created_at: string
  updated_at: string
}

// ==========================================
// DTOs PARA CRIAÇÃO E ATUALIZAÇÃO
// ==========================================

export interface CreateEventDto {
  titulo: string
  descricao?: string
  data: string
  horario_inicio: string
  horario_fim: string
  categoria: string
  local?: string
  status: EventStatus
  calendario: CalendarIntegration
}

export interface UpdateEventDto {
  titulo?: string
  descricao?: string
  data?: string
  horario_inicio?: string
  horario_fim?: string
  categoria?: string
  local?: string
  status?: EventStatus
  calendario?: CalendarIntegration
}

// ==========================================
// DADOS DO HOOK
// ==========================================

export interface AgendaData {
  events: AgendaEvent[]
  isLoading: boolean
  error: Error | null
}

export interface AgendaActions {
  createEvent: (data: CreateEventDto) => Promise<AgendaEvent>
  updateEvent: (id: string, data: UpdateEventDto) => Promise<AgendaEvent>
  deleteEvent: (id: string) => Promise<void>
}

export interface UseAgendaReturn extends AgendaData, AgendaActions {}
