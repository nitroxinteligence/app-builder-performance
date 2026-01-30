"use client"

import * as React from "react"
import { Bell, CheckCheck, Inbox } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

import { Botao } from "@/componentes/ui/botao"
import { Emblema } from "@/componentes/ui/emblema"
import {
  Flutuante,
  FlutuanteGatilho,
  FlutuanteConteudo,
} from "@/componentes/ui/flutuante"
import { cn } from "@/lib/utilidades"
import {
  useNotificacoes,
  useContagemNaoLidas,
  useMarcarComoLida,
  useMarcarTodasComoLidas,
} from "@/hooks/useNotificacoes"
import type { TipoNotificacao } from "@/lib/supabase/types"

const iconesPorTipo: Record<TipoNotificacao, string> = {
  sistema: "bg-blue-100 dark:bg-blue-900/30",
  conquista: "bg-amber-100 dark:bg-amber-900/30",
  lembrete: "bg-purple-100 dark:bg-purple-900/30",
  tarefa: "bg-emerald-100 dark:bg-emerald-900/30",
  habito: "bg-green-100 dark:bg-green-900/30",
  foco: "bg-orange-100 dark:bg-orange-900/30",
  curso: "bg-indigo-100 dark:bg-indigo-900/30",
}

export function DropdownNotificacoes() {
  const { data: notificacoes } = useNotificacoes()
  const { data: contagem } = useContagemNaoLidas()
  const marcarLida = useMarcarComoLida()
  const marcarTodas = useMarcarTodasComoLidas()

  const contagemExibida = contagem ?? 0

  return (
    <Flutuante>
      <FlutuanteGatilho asChild>
        <Botao
          variant="ghost"
          size="icon"
          className="relative h-9 w-9"
          aria-label="Notificações"
        >
          <Bell className="h-4 w-4" aria-hidden="true" />
          {contagemExibida > 0 ? (
            <Emblema
              className={cn(
                "absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold",
                "bg-primary text-primary-foreground"
              )}
            >
              {contagemExibida > 99 ? "99+" : contagemExibida}
            </Emblema>
          ) : null}
        </Botao>
      </FlutuanteGatilho>
      <FlutuanteConteudo
        align="end"
        sideOffset={8}
        className="w-80 p-0"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="text-sm font-semibold">Notificações</h3>
          {contagemExibida > 0 ? (
            <Botao
              variant="ghost"
              size="sm"
              className="h-auto gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => marcarTodas.mutate()}
              disabled={marcarTodas.isPending}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Marcar todas como lidas
            </Botao>
          ) : null}
        </div>

        <div className="max-h-80 overflow-y-auto">
          {!notificacoes || notificacoes.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
              <Inbox className="h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                Nenhuma notificação
              </p>
            </div>
          ) : (
            notificacoes.map((notificacao) => (
              <button
                key={notificacao.id}
                type="button"
                className={cn(
                  "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/50",
                  !notificacao.lida && "bg-primary/5"
                )}
                onClick={() => {
                  if (!notificacao.lida) {
                    marcarLida.mutate(notificacao.id)
                  }
                }}
              >
                <div
                  className={cn(
                    "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                    iconesPorTipo[notificacao.tipo]
                  )}
                >
                  <Bell className="h-3.5 w-3.5 text-foreground/70" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={cn(
                        "text-sm",
                        notificacao.lida
                          ? "text-muted-foreground"
                          : "font-medium text-foreground"
                      )}
                    >
                      {notificacao.titulo}
                    </p>
                    {!notificacao.lida ? (
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    ) : null}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                    {notificacao.mensagem}
                  </p>
                  <p className="mt-1 text-[10px] text-muted-foreground/70">
                    {formatDistanceToNow(new Date(notificacao.created_at), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </FlutuanteConteudo>
    </Flutuante>
  )
}
