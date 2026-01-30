'use client'

import { Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import {
  Cartao,
  CartaoCabecalho,
  CartaoConteudo,
  CartaoDescricao,
  CartaoTitulo,
} from '@/componentes/ui/cartao'
import { cn } from '@/lib/utilidades'
import type { AgendaEvent } from '@/types/agenda'
import { EventoCard, estilosStatus, labelStatus } from './evento-card'

interface ListaEventosDiaProps {
  dataSelecionada: Date
  eventosDoDia: AgendaEvent[]
  proximosEventos: AgendaEvent[]
  isLoading: boolean
  onEditar: (evento: AgendaEvent) => void
  onExcluir: (evento: AgendaEvent) => void
}

export function ListaEventosDia({
  dataSelecionada,
  eventosDoDia,
  proximosEventos,
  isLoading,
  onEditar,
  onExcluir,
}: ListaEventosDiaProps) {
  return (
    <div className="space-y-6">
      <Cartao>
        <CartaoCabecalho>
          <CartaoTitulo className="text-base">Agenda do dia</CartaoTitulo>
          <CartaoDescricao>
            {format(dataSelecionada, "EEEE, dd 'de' MMMM", {
              locale: ptBR,
            })}
          </CartaoDescricao>
        </CartaoCabecalho>
        <CartaoConteudo className="space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : eventosDoDia.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
              Nenhum evento marcado para este dia.
            </div>
          ) : null}
          {eventosDoDia.map((evento) => (
            <EventoCard
              key={evento.id}
              evento={evento}
              onEditar={onEditar}
              onExcluir={onExcluir}
            />
          ))}
        </CartaoConteudo>
      </Cartao>

      <Cartao>
        <CartaoCabecalho>
          <CartaoTitulo className="text-base">
            Próximos compromissos
          </CartaoTitulo>
          <CartaoDescricao>
            Visão rápida dos próximos eventos agendados.
          </CartaoDescricao>
        </CartaoCabecalho>
        <CartaoConteudo className="space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : proximosEventos.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              Nenhum evento próximo.
            </div>
          ) : (
            proximosEventos.map((evento) => (
              <div
                key={evento.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background/60 px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium">{evento.titulo}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(`${evento.data}T00:00:00`), 'dd/MM')} •{' '}
                    {evento.horario_inicio}
                  </p>
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
            ))
          )}
        </CartaoConteudo>
      </Cartao>
    </div>
  )
}
