'use client'

import { CalendarDays, CheckCircle2, Loader2 } from 'lucide-react'

import { Botao } from '@/componentes/ui/botao'
import {
  Cartao,
  CartaoCabecalho,
  CartaoConteudo,
  CartaoDescricao,
  CartaoTitulo,
} from '@/componentes/ui/cartao'
import { Calendario } from '@/componentes/ui/calendario'

interface CalendarioViewProps {
  dataSelecionada: Date
  onSelecionarData: (data: Date) => void
  onConnectGoogle?: () => void
  onConnectOutlook?: () => void
  conectandoProvider?: string | null
}

export function CalendarioView({
  dataSelecionada,
  onSelecionarData,
  onConnectGoogle,
  onConnectOutlook,
  conectandoProvider,
}: CalendarioViewProps) {
  return (
    <div className="space-y-6">
      <Cartao>
        <CartaoCabecalho>
          <CartaoTitulo className="text-base">Calendário</CartaoTitulo>
          <CartaoDescricao>
            Selecione um dia para visualizar a agenda.
          </CartaoDescricao>
        </CartaoCabecalho>
        <CartaoConteudo>
          <Calendario
            mode="single"
            selected={dataSelecionada}
            onSelect={(date) => onSelecionarData(date ?? dataSelecionada)}
            className="w-full"
          />
        </CartaoConteudo>
      </Cartao>

      <Cartao>
        <CartaoCabecalho>
          <CartaoTitulo className="text-base">Integrações</CartaoTitulo>
          <CartaoDescricao>
            Conecte seus calendários externos.
          </CartaoDescricao>
        </CartaoCabecalho>
        <CartaoConteudo className="space-y-3">
          <div className="flex items-center justify-between rounded-xl border border-border bg-background/60 px-3 py-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              Google Calendar
            </div>
            <Botao
              size="sm"
              variant="secondary"
              className="gap-1"
              onClick={onConnectGoogle}
              disabled={conectandoProvider !== null && conectandoProvider !== undefined}
            >
              {conectandoProvider === 'Google' ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5" />
              )}
              Conectar
            </Botao>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border bg-background/60 px-3 py-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              Outlook Calendar
            </div>
            <Botao
              size="sm"
              variant="secondary"
              className="gap-1"
              onClick={onConnectOutlook}
              disabled={conectandoProvider !== null && conectandoProvider !== undefined}
            >
              {conectandoProvider === 'Outlook' ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5" />
              )}
              Conectar
            </Botao>
          </div>
        </CartaoConteudo>
      </Cartao>
    </div>
  )
}
