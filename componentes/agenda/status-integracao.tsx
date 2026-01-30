'use client'

import * as React from 'react'
import { CalendarDays, CheckCircle2, Loader2, RefreshCw, X } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { Botao } from '@/componentes/ui/botao'
import {
  Cartao,
  CartaoCabecalho,
  CartaoConteudo,
  CartaoDescricao,
  CartaoTitulo,
} from '@/componentes/ui/cartao'
import { Dica, DicaGatilho, DicaConteudo } from '@/componentes/ui/dica'
import type { CalendarProvider } from '@/types/calendario'
import type { UseIntegracaoCalendarioReturn } from '@/hooks/useIntegracaoCalendario'

interface StatusIntegracaoProps {
  integracao: UseIntegracaoCalendarioReturn
  onConnectGoogle: () => void
  onConnectOutlook: () => void
  conectandoProvider: string | null
  onRequestDisconnect: (provider: CalendarProvider) => void
}

interface ProviderRowProps {
  provider: CalendarProvider
  label: string
  isConnected: boolean
  externalEmail: string | null | undefined
  lastSyncAt: Date | null
  onConnect: () => void
  onDisconnect: () => void
  connectingThis: boolean
  connectingAny: boolean
  isDisconnecting: boolean
}

function ProviderRow({
  provider,
  label,
  isConnected,
  externalEmail,
  lastSyncAt,
  onConnect,
  onDisconnect,
  connectingThis,
  connectingAny,
  isDisconnecting,
}: ProviderRowProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-background/60 px-3 py-2">
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2 text-sm font-medium">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          {label}
          {isConnected && (
            <span className="rounded-full bg-green-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-green-600 dark:text-green-400">
              Conectado
            </span>
          )}
        </div>
        {isConnected && externalEmail && (
          <span className="ml-6 text-[11px] text-muted-foreground">{externalEmail}</span>
        )}
        {isConnected && lastSyncAt && (
          <span className="ml-6 text-[11px] text-muted-foreground">
            Ultima sync: {formatDistanceToNow(lastSyncAt, { locale: ptBR, addSuffix: true })}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1">
        {isConnected ? (
          <Dica>
            <DicaGatilho asChild>
              <Botao
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                onClick={onDisconnect}
                disabled={isDisconnecting}
              >
                {isDisconnecting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <X className="h-3.5 w-3.5" />
                )}
              </Botao>
            </DicaGatilho>
            <DicaConteudo>Desconectar {provider}</DicaConteudo>
          </Dica>
        ) : (
          <Botao
            size="sm"
            variant="secondary"
            className="gap-1"
            onClick={onConnect}
            disabled={connectingAny}
          >
            {connectingThis ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5" />
            )}
            Conectar
          </Botao>
        )}
      </div>
    </div>
  )
}

export function StatusIntegracao({
  integracao,
  onConnectGoogle,
  onConnectOutlook,
  conectandoProvider,
  onRequestDisconnect,
}: StatusIntegracaoProps) {
  const googleConn = integracao.getConnection('Google')
  const outlookConn = integracao.getConnection('Outlook')
  const hasAnyConnection = integracao.connections.length > 0

  return (
    <Cartao>
      <CartaoCabecalho>
        <CartaoTitulo className="text-base">Integracoes</CartaoTitulo>
        <CartaoDescricao>
          Conecte seus calendarios externos.
        </CartaoDescricao>
      </CartaoCabecalho>
      <CartaoConteudo className="space-y-3">
        <ProviderRow
          provider="Google"
          label="Google Calendar"
          isConnected={integracao.isConnected('Google')}
          externalEmail={googleConn?.external_email}
          lastSyncAt={integracao.lastSyncAt('Google')}
          onConnect={onConnectGoogle}
          onDisconnect={() => onRequestDisconnect('Google')}
          connectingThis={conectandoProvider === 'Google'}
          connectingAny={conectandoProvider !== null}
          isDisconnecting={integracao.isDisconnecting}
        />
        <ProviderRow
          provider="Outlook"
          label="Outlook Calendar"
          isConnected={integracao.isConnected('Outlook')}
          externalEmail={outlookConn?.external_email}
          lastSyncAt={integracao.lastSyncAt('Outlook')}
          onConnect={onConnectOutlook}
          onDisconnect={() => onRequestDisconnect('Outlook')}
          connectingThis={conectandoProvider === 'Outlook'}
          connectingAny={conectandoProvider !== null}
          isDisconnecting={integracao.isDisconnecting}
        />
        {hasAnyConnection && (
          <Botao
            size="sm"
            variant="outline"
            className="w-full gap-2"
            onClick={() => integracao.sync()}
            disabled={integracao.isSyncing}
          >
            {integracao.isSyncing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            Sincronizar agora
          </Botao>
        )}
      </CartaoConteudo>
    </Cartao>
  )
}
