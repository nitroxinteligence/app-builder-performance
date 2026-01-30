"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Bot, ChevronRight } from "lucide-react"

import { Botao } from "@/componentes/ui/botao"

interface PropsCartaoBriefing {
  nomeUsuario: string
  mensagem: string
}

export function CartaoBriefing({ nomeUsuario, mensagem }: PropsCartaoBriefing) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
      className="rounded-2xl border border-[color:var(--borda-cartao)] bg-card p-6 shadow-sm"
    >
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Bot className="h-4 w-4" />
        </div>
        <div>
          <h3 className="font-titulo text-sm font-semibold text-foreground">
            Builder Assistant
          </h3>
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Briefing de {nomeUsuario}
          </span>
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        &ldquo;{mensagem}&rdquo;
      </p>

      <div className="mt-4">
        <Botao asChild variant="secondary" size="sm" className="gap-1.5">
          <Link href="/assistente">
            Falar com Assistant
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </Botao>
      </div>
    </motion.div>
  )
}
