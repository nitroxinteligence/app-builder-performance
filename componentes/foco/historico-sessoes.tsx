"use client"

import {
  ChevronLeft,
  ChevronRight,
  Clock,
  History,
  Timer,
  Zap,
} from "lucide-react"

import { Botao } from "@/componentes/ui/botao"
import { formatDurationLong, type FocusHistoryItem } from "@/app/(protegido)/foco/types"

interface HistoricoSessoesProps {
  historico: FocusHistoryItem[]
  historicoTotal: number
  historicoPagina: number
  carregandoHistorico: boolean
  onCarregarHistorico: (pagina: number) => void
}

export function HistoricoSessoes({
  historico,
  historicoTotal,
  historicoPagina,
  carregandoHistorico,
  onCarregarHistorico,
}: HistoricoSessoesProps) {
  const totalPaginas = Math.ceil(historicoTotal / 5)

  if (historico.length === 0) {
    return null
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-muted-foreground" />
          <h2 className="font-titulo text-lg font-semibold">
            Histórico de Sessões
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">
          {historicoTotal} sessões completadas
        </p>
      </div>

      <div className="space-y-2">
        {historico.map((sessao) => (
          <div
            key={sessao.id}
            className="flex items-center justify-between rounded-xl border border-border bg-card p-4"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Timer className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">
                  {sessao.taskTitulo ?? "Sessão livre"}
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{sessao.modoDisplay}</span>
                  <span>•</span>
                  <span>
                    {new Date(sessao.startedAt).toLocaleDateString(
                      "pt-BR",
                      {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-4 w-4" />
                {formatDurationLong(sessao.duracaoReal)}
              </div>
              <div className="flex items-center gap-1 text-primary">
                <Zap className="h-4 w-4" />
                +{sessao.xpGanho} XP
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Botao
            variant="outline"
            size="sm"
            onClick={() => onCarregarHistorico(historicoPagina - 1)}
            disabled={historicoPagina === 1 || carregandoHistorico}
          >
            <ChevronLeft className="h-4 w-4" />
          </Botao>
          <span className="text-sm text-muted-foreground">
            Página {historicoPagina} de {totalPaginas}
          </span>
          <Botao
            variant="outline"
            size="sm"
            onClick={() => onCarregarHistorico(historicoPagina + 1)}
            disabled={historicoPagina === totalPaginas || carregandoHistorico}
          >
            <ChevronRight className="h-4 w-4" />
          </Botao>
        </div>
      )}
    </section>
  )
}
