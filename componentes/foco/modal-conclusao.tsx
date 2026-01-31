"use client"

import Link from "next/link"
import { Clock, Zap, Star } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { Botao } from "@/componentes/ui/botao"
import {
  Dialogo,
  DialogoCabecalho,
  DialogoConteudo,
  DialogoDescricao,
  DialogoFechar,
  DialogoRodape,
  DialogoTitulo,
} from "@/componentes/ui/dialogo"
import { formatDurationLong } from "@/app/(protegido)/foco/types"
import {
  variantesLevelUp,
  variantesEscala,
  transicaoMedia,
} from "@/lib/animacoes"

interface ModalConclusaoProps {
  aberto: boolean
  onOpenChange: (aberto: boolean) => void
  levelUp: boolean
  nivelUsuario: number
  tituloTarefa: string | null
  tempoFocadoAtual: number
  xpGanho: number
}

export function ModalConclusao({
  aberto,
  onOpenChange,
  levelUp,
  nivelUsuario,
  tituloTarefa,
  tempoFocadoAtual,
  xpGanho,
}: ModalConclusaoProps) {
  return (
    <Dialogo open={aberto} onOpenChange={onOpenChange}>
      <DialogoConteudo className="max-w-lg rounded-2xl border-border p-6">
        <DialogoCabecalho>
          <AnimatePresence mode="wait">
            {levelUp ? (
              <motion.div
                key="levelup"
                variants={variantesLevelUp}
                initial="oculto"
                animate="visivel"
                className="mb-4 flex flex-col items-center gap-3"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: 0.8,
                    ease: "easeInOut",
                    repeat: 1,
                  }}
                  className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[var(--warning)] text-white"
                >
                  <Star className="h-8 w-8" />
                </motion.div>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "60%" }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                  className="h-0.5 rounded-full bg-gradient-to-r from-transparent via-primary to-transparent"
                />
              </motion.div>
            ) : null}
          </AnimatePresence>
          <DialogoTitulo>
            {levelUp ? "Level Up!" : "Sessao finalizada"}
          </DialogoTitulo>
          <DialogoDescricao>
            {levelUp
              ? `Parabens! Voce alcancou o nivel ${nivelUsuario}!`
              : "Excelente foco! Sua sessao foi registrada com sucesso."}
          </DialogoDescricao>
        </DialogoCabecalho>
        <motion.div
          variants={variantesEscala}
          initial="oculto"
          animate="visivel"
          className="rounded-xl border border-border bg-[#F5F5F5] dark:bg-[#1E1E1E] p-4 text-sm text-muted-foreground"
        >
          <p className="font-medium text-foreground">
            {tituloTarefa ?? "Sessao livre"}
          </p>
          <div className="mt-2 flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {formatDurationLong(tempoFocadoAtual)}
            </span>
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...transicaoMedia, delay: 0.3 }}
              className="flex items-center gap-1 font-semibold text-primary"
            >
              <Zap className="h-4 w-4" />
              +{xpGanho} XP
            </motion.span>
          </div>
        </motion.div>
        <DialogoRodape className="mt-6 sm:justify-between">
          <DialogoFechar asChild>
            <Botao variant="outline">Continuar no foco</Botao>
          </DialogoFechar>
          <Botao asChild>
            <Link href="/tarefas">Ir para tarefas</Link>
          </Botao>
        </DialogoRodape>
      </DialogoConteudo>
    </Dialogo>
  )
}
