"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Check, Circle, Target } from "lucide-react"

import { cn } from "@/lib/utilidades"
import { Progresso } from "@/componentes/ui/progresso"
import type { DailyMission } from "@/types/dashboard"

interface PropsSecaoMissoesDiarias {
  missoes: DailyMission[]
}

export function SecaoMissoesDiarias({ missoes }: PropsSecaoMissoesDiarias) {
  const concluidas = missoes.filter((m) => m.concluida).length
  const percentual = missoes.length > 0 ? Math.round((concluidas / missoes.length) * 100) : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.35 }}
      className="rounded-2xl border border-[color:var(--borda-cartao)] bg-card p-6 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          <h3 className="font-titulo text-base font-semibold text-foreground">
            Missoes diarias
          </h3>
        </div>
        <span className="text-xs font-medium text-muted-foreground">
          {concluidas}/{missoes.length} concluidas
        </span>
      </div>

      <div className="mt-3 space-y-1.5">
        <Progresso value={percentual} />
        <p className="text-[11px] text-muted-foreground">{percentual}% completo</p>
      </div>

      <div className="mt-4 space-y-2">
        {missoes.map((missao, i) => (
          <motion.div
            key={missao.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.4 + i * 0.05 }}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors",
              missao.concluida
                ? "bg-[var(--success-soft)]"
                : "bg-muted/50"
            )}
          >
            <div className="flex h-5 w-5 shrink-0 items-center justify-center">
              {missao.concluida ? (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--success)]">
                  <Check className="h-3 w-3 text-white" />
                </div>
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground/40" />
              )}
            </div>
            <span
              className={cn(
                "flex-1 text-sm",
                missao.concluida
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {missao.texto}
            </span>
            <span
              className={cn(
                "text-xs font-medium",
                missao.concluida ? "text-[var(--success)]" : "text-muted-foreground"
              )}
            >
              {missao.xp}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
