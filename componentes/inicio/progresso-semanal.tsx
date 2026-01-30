"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { TrendingUp } from "lucide-react"

import { Progresso } from "@/componentes/ui/progresso"
import type { ProgressoItem } from "@/types/dashboard"

interface PropsProgressoSemanal {
  itens: ProgressoItem[]
}

export function ProgressoSemanal({ itens }: PropsProgressoSemanal) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25 }}
      className="rounded-2xl border border-[color:var(--borda-cartao)] bg-card p-6"
    >
      <div className="flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-primary" />
        <h3 className="font-titulo text-base font-semibold text-foreground">
          Progresso semanal
        </h3>
      </div>

      <div className="mt-4 space-y-4">
        {itens.map((item) => (
          <div key={item.id} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">{item.titulo}</span>
              <span className="text-xs text-muted-foreground">{item.detalhe}</span>
            </div>
            <Progresso value={item.percentual} />
          </div>
        ))}
      </div>
    </motion.div>
  )
}
