"use client"

import * as React from "react"
import { motion } from "framer-motion"

import { cn } from "@/lib/utilidades"
import { transicaoRapida } from "@/lib/animacoes"

interface PropsAlternador extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  ativado: boolean
  aoAlternar: (ativado: boolean) => void
  tamanho?: "sm" | "md" | "lg"
}

const tamanhosTrack: Record<string, string> = {
  sm: "h-5 w-9",
  md: "h-6 w-11",
  lg: "h-7 w-[52px]",
}

const tamanhosThumb: Record<string, { inativo: number; ativo: number; size: string }> = {
  sm: { inativo: 2, ativo: 18, size: "h-3.5 w-3.5" },
  md: { inativo: 2, ativo: 22, size: "h-4.5 w-4.5" },
  lg: { inativo: 3, ativo: 27, size: "h-5 w-5" },
}

const Alternador = React.forwardRef<HTMLButtonElement, PropsAlternador>(
  ({ className, ativado, aoAlternar, tamanho = "md", disabled, ...props }, ref) => {
    const thumbConfig = tamanhosThumb[tamanho]

    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={ativado}
        disabled={disabled}
        onClick={() => aoAlternar(!ativado)}
        className={cn(
          "relative inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
          ativado ? "bg-primary" : "bg-input",
          tamanhosTrack[tamanho],
          className
        )}
        {...props}
      >
        <motion.span
          className={cn(
            "pointer-events-none block rounded-full bg-background shadow-lg",
            thumbConfig.size
          )}
          animate={{
            x: ativado ? thumbConfig.ativo : thumbConfig.inativo,
          }}
          transition={transicaoRapida}
        />
      </button>
    )
  }
)

Alternador.displayName = "Alternador"

export { Alternador }
export type { PropsAlternador }
