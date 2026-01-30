"use client"

import { Clock, Target, TrendingUp, Zap } from "lucide-react"

import { Cartao, CartaoConteudo } from "@/componentes/ui/cartao"
import type { FocusStatsDisplay } from "@/app/(protegido)/foco/types"

interface EstatisticasFocoProps {
  estatisticas: FocusStatsDisplay
}

export function EstatisticasFoco({ estatisticas }: EstatisticasFocoProps) {
  return (
    <section className="grid gap-4 grid-cols-2 md:grid-cols-4">
      <Cartao>
        <CartaoConteudo className="flex items-center gap-4 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-semibold">
              {estatisticas.totalSessions}
            </p>
            <p className="text-xs text-muted-foreground">
              Sessões totais
            </p>
          </div>
        </CartaoConteudo>
      </Cartao>
      <Cartao>
        <CartaoConteudo className="flex items-center gap-4 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-semibold">
              {estatisticas.totalHours}h {estatisticas.totalMinutes}m
            </p>
            <p className="text-xs text-muted-foreground">
              Tempo total
            </p>
          </div>
        </CartaoConteudo>
      </Cartao>
      <Cartao>
        <CartaoConteudo className="flex items-center gap-4 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 text-green-500">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-semibold">
              {estatisticas.totalXp}
            </p>
            <p className="text-xs text-muted-foreground">XP ganho</p>
          </div>
        </CartaoConteudo>
      </Cartao>
      <Cartao>
        <CartaoConteudo className="flex items-center gap-4 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-semibold">
              {estatisticas.averageMinutes}min
            </p>
            <p className="text-xs text-muted-foreground">
              Média por sessão
            </p>
          </div>
        </CartaoConteudo>
      </Cartao>
    </section>
  )
}
