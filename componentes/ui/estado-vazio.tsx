"use client"

import * as React from "react"
import {
  Inbox,
  ClipboardList,
  Target,
  type LucideIcon,
} from "lucide-react"
import { motion } from "framer-motion"

import { cn } from "@/lib/utilidades"
import { variantesEntrada, transicaoSuave } from "@/lib/animacoes"

interface PropsEstadoVazio {
  icone?: React.ReactNode
  titulo: string
  descricao?: string
  acao?: React.ReactNode
  className?: string
}

function EstadoVazio({
  icone,
  titulo,
  descricao,
  acao,
  className,
}: PropsEstadoVazio) {
  return (
    <motion.div
      variants={variantesEntrada}
      initial="oculto"
      animate="visivel"
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className
      )}
    >
      {icone && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...transicaoSuave, delay: 0.1 }}
          className="mb-4 text-muted-foreground/50"
        >
          {icone}
        </motion.div>
      )}
      <h3 className="font-titulo text-lg font-semibold text-foreground mb-1">
        {titulo}
      </h3>
      {descricao && (
        <p className="text-sm text-muted-foreground max-w-sm mb-6">
          {descricao}
        </p>
      )}
      {acao && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transicaoSuave, delay: 0.15 }}
        >
          {acao}
        </motion.div>
      )}
    </motion.div>
  )
}

EstadoVazio.displayName = "EstadoVazio"

interface PropsEstadoVazioVariante {
  acao?: React.ReactNode
  className?: string
}

function EstadoVazioTarefas({ acao, className }: PropsEstadoVazioVariante) {
  return (
    <EstadoVazio
      icone={
        <div className="relative">
          <ClipboardList className="h-16 w-16 stroke-[1.25]" />
          <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xs text-primary font-semibold">0</span>
          </div>
        </div>
      }
      titulo="Nenhuma tarefa encontrada"
      descricao="Comece criando sua primeira tarefa para organizar suas atividades e aumentar sua produtividade."
      acao={acao}
      className={className}
    />
  )
}

EstadoVazioTarefas.displayName = "EstadoVazioTarefas"

function EstadoVazioHabitos({ acao, className }: PropsEstadoVazioVariante) {
  return (
    <EstadoVazio
      icone={
        <div className="relative">
          <Target className="h-16 w-16 stroke-[1.25]" />
          <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary animate-pulse" />
        </div>
      }
      titulo="Nenhum habito cadastrado"
      descricao="Crie habitos para construir uma rotina mais saudavel e alcancar seus objetivos."
      acao={acao}
      className={className}
    />
  )
}

EstadoVazioHabitos.displayName = "EstadoVazioHabitos"

interface PropsEstadoVazioGenerico extends PropsEstadoVazioVariante {
  icone?: LucideIcon
  titulo?: string
  descricao?: string
}

function EstadoVazioGenerico({
  icone: Icone = Inbox,
  titulo = "Nada por aqui",
  descricao = "Nao ha itens para exibir no momento.",
  acao,
  className,
}: PropsEstadoVazioGenerico) {
  return (
    <EstadoVazio
      icone={<Icone className="h-12 w-12 stroke-[1.5]" />}
      titulo={titulo}
      descricao={descricao}
      acao={acao}
      className={className}
    />
  )
}

EstadoVazioGenerico.displayName = "EstadoVazioGenerico"

export {
  EstadoVazio,
  EstadoVazioTarefas,
  EstadoVazioHabitos,
  EstadoVazioGenerico,
}

export type { PropsEstadoVazio, PropsEstadoVazioVariante, PropsEstadoVazioGenerico }
