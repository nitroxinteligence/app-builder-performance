"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Trophy } from "lucide-react"
import type { LucideIcon } from "lucide-react"

export interface Conquista {
  id: string
  titulo: string
  descricao: string
  icone: LucideIcon
  data: string
}

interface PropsSecaoConquistas {
  conquistas: Conquista[]
}

export function SecaoConquistas({ conquistas }: PropsSecaoConquistas) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.45 }}
      className="rounded-2xl border border-[color:var(--borda-cartao)] bg-card p-6"
    >
      <div className="flex items-center gap-2">
        <Trophy className="h-4 w-4 text-primary" />
        <h3 className="font-titulo text-base font-semibold text-foreground">
          Conquistas recentes
        </h3>
      </div>

      {conquistas.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Nenhuma conquista recente.
        </p>
      ) : (
        <div className="mt-4 flex flex-wrap gap-3">
          {conquistas.map((conquista, i) => (
            <motion.div
              key={conquista.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.5 + i * 0.08 }}
              className="flex items-center gap-3 rounded-xl border border-[color:var(--borda-cartao)] bg-muted/30 px-4 py-3"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                <conquista.icone className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {conquista.titulo}
                </p>
                <p className="text-xs text-muted-foreground">
                  {conquista.descricao}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
