"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { ArrowUp, ArrowDown } from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utilidades"
import { Progresso } from "@/componentes/ui/progresso"

export interface PropsCartaoKpi {
  titulo: string
  valor: string
  valorNumerico?: number
  label: string
  icone: LucideIcon
  corIcone?: string
  tendencia?: {
    valor: string
    positiva: boolean
  }
  progresso?: {
    valor: number
    label: string
  }
  indice?: number
}

export function CartaoKpi({
  titulo,
  valor,
  label,
  icone: Icone,
  corIcone = "bg-secondary text-secondary-foreground",
  tendencia,
  progresso,
  indice = 0,
}: PropsCartaoKpi) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: indice * 0.08, ease: [0.4, 0, 0.2, 1] }}
      className="rounded-2xl border border-[color:var(--borda-cartao)] bg-card p-5 shadow-sm"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
            {titulo}
          </p>
          <p className="font-titulo text-[28px] font-bold leading-none text-foreground">
            {valor}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{label}</span>
            {tendencia ? (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 text-xs font-medium",
                  tendencia.positiva ? "text-[var(--success)]" : "text-[var(--destructive)]"
                )}
              >
                {tendencia.positiva ? (
                  <ArrowUp className="h-3 w-3" />
                ) : (
                  <ArrowDown className="h-3 w-3" />
                )}
                {tendencia.valor}
              </span>
            ) : null}
          </div>
        </div>
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl",
            corIcone
          )}
        >
          <Icone className="h-5 w-5" />
        </div>
      </div>
      {progresso ? (
        <div className="mt-3 space-y-1.5">
          <Progresso value={progresso.valor} />
          <p className="text-[11px] text-muted-foreground">{progresso.label}</p>
        </div>
      ) : null}
    </motion.div>
  )
}
