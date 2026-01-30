"use client"

import { Clock, Target, TrendingUp, Zap } from "lucide-react"
import { motion } from "framer-motion"

import { Cartao, CartaoConteudo } from "@/componentes/ui/cartao"
import { variantesEntrada } from "@/lib/animacoes"
import type { FocusStatsDisplay } from "@/app/(protegido)/foco/types"

interface EstatisticasFocoProps {
  estatisticas: FocusStatsDisplay
}

const stats = [
  {
    key: "sessions",
    icon: Target,
    label: "Sessoes totais",
    iconClass: "bg-primary/10 text-primary",
    getValue: (e: FocusStatsDisplay) => `${e.totalSessions}`,
  },
  {
    key: "time",
    icon: Clock,
    label: "Tempo total",
    iconClass: "bg-info/10 text-info",
    getValue: (e: FocusStatsDisplay) => `${e.totalHours}h ${e.totalMinutes}m`,
  },
  {
    key: "xp",
    icon: Zap,
    label: "XP ganho",
    iconClass: "bg-success/10 text-success",
    getValue: (e: FocusStatsDisplay) => `${e.totalXp}`,
  },
  {
    key: "avg",
    icon: TrendingUp,
    label: "Media por sessao",
    iconClass: "bg-warning/10 text-warning",
    getValue: (e: FocusStatsDisplay) => `${e.averageMinutes}min`,
  },
] as const

export function EstatisticasFoco({ estatisticas }: EstatisticasFocoProps) {
  return (
    <motion.section
      variants={variantesEntrada}
      initial="oculto"
      animate="visivel"
      className="grid gap-4 grid-cols-2 md:grid-cols-4"
    >
      {stats.map((stat) => {
        const Icone = stat.icon
        return (
          <Cartao key={stat.key}>
            <CartaoConteudo className="flex items-center gap-4 p-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.iconClass}`}>
                <Icone className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold">
                  {stat.getValue(estatisticas)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            </CartaoConteudo>
          </Cartao>
        )
      })}
    </motion.section>
  )
}
