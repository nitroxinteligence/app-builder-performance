'use client'

import * as React from 'react'
import {
  CalendarDays,
  CalendarPlus,
  Clock,
  Mail,
  MapPin,
  Pencil,
  Trash2,
} from 'lucide-react'
import { motion } from 'framer-motion'

import { Botao } from '@/componentes/ui/botao'
import { Emblema } from '@/componentes/ui/emblema'
import { Dica, DicaGatilho, DicaConteudo } from '@/componentes/ui/dica'
import { cn } from '@/lib/utilidades'
import { variantesHover, transicaoRapida } from '@/lib/animacoes'
import type { AgendaEvent, CalendarIntegration, EventStatus } from '@/types/agenda'

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

const estilosCategoria: Record<string, string> = {
  Trabalho: 'border-l-info',
  Pessoal: 'border-l-success',
  Estudo: 'border-l-warning',
  Reuniao: 'border-l-primary',
  Outro: 'border-l-muted-foreground',
}

const badgeCalendario: Record<CalendarIntegration, { icon: typeof CalendarDays; label: string; className: string }> = {
  Google: {
    icon: CalendarDays,
    label: 'Google Calendar',
    className: 'text-red-500 dark:text-red-400',
  },
  Outlook: {
    icon: Mail,
    label: 'Outlook Calendar',
    className: 'text-blue-500 dark:text-blue-400',
  },
  Manual: {
    icon: CalendarPlus,
    label: 'Manual',
    className: 'text-muted-foreground',
  },
}

interface EventoCardProps {
  evento: AgendaEvent
  onEditar: (evento: AgendaEvent) => void
  onExcluir: (evento: AgendaEvent) => void
}

export function EventoCard({ evento, onEditar, onExcluir }: EventoCardProps) {
  const categoriaKey = evento.categoria in estilosCategoria ? evento.categoria : 'Outro'

  return (
    <motion.div
      whileHover={variantesHover.escala}
      transition={transicaoRapida}
      className={cn(
        "flex flex-col gap-2 rounded-2xl border border-[color:var(--borda-cartao)] border-l-4 bg-card p-4 shadow-[var(--shadow-sm)]",
        estilosCategoria[categoriaKey]
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold">{evento.titulo}</p>
          {evento.descricao && (
            <p className="text-xs text-muted-foreground">
              {evento.descricao}
            </p>
          )}
        </div>
        <Emblema
          className={cn(
            estilosStatus[evento.status]
          )}
        >
          {labelStatus[evento.status]}
        </Emblema>
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
        <Emblema variant="outline" className="gap-1">
          <CalendarDays className="h-3 w-3" />
          {evento.categoria}
        </Emblema>
        <Dica>
          <DicaGatilho asChild>
            <span className="flex items-center gap-1 cursor-help">
              {React.createElement(badgeCalendario[evento.calendario].icon, {
                className: cn('h-3.5 w-3.5', badgeCalendario[evento.calendario].className),
              })}
              {evento.calendario}
            </span>
          </DicaGatilho>
          <DicaConteudo>{badgeCalendario[evento.calendario].label}</DicaConteudo>
        </Dica>
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
    </motion.div>
  )
}

export { estilosStatus, labelStatus }
