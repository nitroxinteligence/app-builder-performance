'use client'

import { ptBR } from 'date-fns/locale'

import {
  Cartao,
  CartaoCabecalho,
  CartaoConteudo,
  CartaoDescricao,
  CartaoTitulo,
} from '@/componentes/ui/cartao'
import { Calendario } from '@/componentes/ui/calendario'
import { StatusIntegracao } from '@/componentes/agenda/status-integracao'
import type { CalendarProvider } from '@/types/calendario'
import type { UseIntegracaoCalendarioReturn } from '@/hooks/useIntegracaoCalendario'

interface CalendarioViewProps {
  dataSelecionada: Date
  onSelecionarData: (data: Date) => void
  onConnectGoogle: () => void
  onConnectOutlook: () => void
  conectandoProvider: string | null
  integracao: UseIntegracaoCalendarioReturn
  onRequestDisconnect: (provider: CalendarProvider) => void
}

export function CalendarioView({
  dataSelecionada,
  onSelecionarData,
  onConnectGoogle,
  onConnectOutlook,
  conectandoProvider,
  integracao,
  onRequestDisconnect,
}: CalendarioViewProps) {
  return (
    <div className="space-y-6">
      <Cartao>
        <CartaoCabecalho>
          <CartaoTitulo className="text-base">Calendario</CartaoTitulo>
          <CartaoDescricao>
            Selecione um dia para visualizar a agenda.
          </CartaoDescricao>
        </CartaoCabecalho>
        <CartaoConteudo>
          <Calendario
            mode="single"
            selected={dataSelecionada}
            onSelect={(date) => onSelecionarData(date ?? dataSelecionada)}
            locale={ptBR}
            className="w-full"
          />
        </CartaoConteudo>
      </Cartao>

      <StatusIntegracao
        integracao={integracao}
        onConnectGoogle={onConnectGoogle}
        onConnectOutlook={onConnectOutlook}
        conectandoProvider={conectandoProvider}
        onRequestDisconnect={onRequestDisconnect}
      />
    </div>
  )
}
