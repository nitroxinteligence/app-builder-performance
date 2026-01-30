"use client"

import { Check, Circle, Flame } from "lucide-react"
import { motion } from "framer-motion"

import { Emblema } from "@/componentes/ui/emblema"
import { cn } from "@/lib/utilidades"
import { variantesHover, variantesClique, transicaoRapida } from "@/lib/animacoes"
import type { HabitoDiarioUI } from "./tipos-habitos"

export type HabitoCardProps = {
  habito: HabitoDiarioUI
  categoriaId: string
  onAlternar: (categoriaId: string, habitoId: string) => void
  disabled?: boolean
}

export function HabitoCard({
  habito,
  categoriaId,
  onAlternar,
  disabled = false,
}: HabitoCardProps) {
  return (
    <motion.button
      type="button"
      onClick={() => onAlternar(categoriaId, habito.id)}
      aria-pressed={habito.feitoHoje}
      disabled={disabled}
      whileHover={variantesHover.escala}
      whileTap={variantesClique.escala}
      transition={transicaoRapida}
      className="flex w-full items-center gap-3 rounded-[var(--radius)] border border-[color:var(--borda-cartao)] bg-card px-3 py-2.5 text-left transition-colors hover:bg-secondary/50 disabled:opacity-50"
    >
      <span
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs transition-colors",
          habito.feitoHoje
            ? "border-success/40 bg-success/10 text-success"
            : "border-border text-muted-foreground"
        )}
      >
        {habito.feitoHoje ? (
          <Check className="h-3.5 w-3.5" />
        ) : (
          <Circle className="h-3.5 w-3.5" />
        )}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{habito.titulo}</p>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {habito.streak > 0 && (
            <span className="flex items-center gap-0.5 text-warning">
              <Flame className="h-3 w-3" />
              {habito.streak}
            </span>
          )}
          <span>{habito.streak} dias</span>
        </div>
      </div>
      {habito.feitoHoje ? (
        <Emblema variant="sucesso">Feito</Emblema>
      ) : (
        <Emblema variant="aviso">Fazer</Emblema>
      )}
    </motion.button>
  )
}
