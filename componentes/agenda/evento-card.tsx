'use client'

import {
  CalendarDays,
  Clock,
  Link2,
  MapPin,
  Pencil,
  Trash2,
} from 'lucide-react'

import { Botao } from '@/componentes/ui/botao'
import { cn } from '@/lib/utilidades'
import type { AgendaEvent, EventStatus } from '@/types/agenda'

const estilosStatus: Record<EventStatus, string> = {
  confirmado:
    'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
  pendente:
    'border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
  foco: 'border-primary/40 bg-primary/10 text-primary',
}

const labelStatus: Record<EventStatus, string> = {
  confirmado: 'Confirmado',
  pendente: 'Pendente',
  foco: 'Foco',
}

interface EventoCardProps {
  evento: AgendaEvent
  onEditar: (evento: AgendaEvent) => void
  onExcluir: (evento: AgendaEvent) => void
}

export function EventoCard({ evento, onEditar, onExcluir }: EventoCardProps) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-border bg-background/60 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold">{evento.titulo}</p>
          {evento.descricao && (
            <p className="text-xs text-muted-foreground">
              {evento.descricao}
            </p>
          )}
        </div>
        <span
          className={cn(
            'rounded-full border px-2 py-0.5 text-[10px] font-semibold',
            estilosStatus[evento.status]
          )}
        >
          {labelStatus[evento.status]}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {evento.horario_inicio} - {evento.horario_fim}
        </span>
        {evento.local && (
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {evento.local}
          </span>
        )}
        <span className="flex items-center gap-1">
          <CalendarDays className="h-3.5 w-3.5" />
          {evento.categoria}
        </span>
        <span className="flex items-center gap-1">
          <Link2 className="h-3.5 w-3.5" />
          {evento.calendario}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Botao
          variant="secondary"
          size="sm"
          className="gap-1"
          onClick={() => onEditar(evento)}
        >
          <Pencil className="h-3.5 w-3.5" />
          Editar
        </Botao>
        <Botao
          variant="outline"
          size="sm"
          className="gap-1 text-destructive hover:text-destructive"
          onClick={() => onExcluir(evento)}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Excluir
        </Botao>
      </div>
    </div>
  )
}

export { estilosStatus, labelStatus }
