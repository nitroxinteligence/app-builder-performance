"use client"

import { DragDropContext, type DropResult } from "@hello-pangea/dnd"
import { motion } from "framer-motion"

import type { Tarefa } from "@/lib/supabase/types"
import { variantesEntrada } from "@/lib/animacoes"
import { KanbanColuna } from "./kanban-coluna"
import type { ColunaComTarefas } from "./tipos"

export type KanbanBoardProps = {
  colunas: ColunaComTarefas[]
  aoFinalizarArraste: (resultado: DropResult) => void
  onEditar: (tarefa: Tarefa) => void
  onExcluir: (tarefa: Tarefa) => void
  onConcluir: (tarefa: Tarefa) => void
}

export function KanbanBoard({
  colunas,
  aoFinalizarArraste,
  onEditar,
  onExcluir,
  onConcluir,
}: KanbanBoardProps) {
  return (
    <DragDropContext onDragEnd={aoFinalizarArraste}>
      <motion.section
        variants={variantesEntrada}
        initial="oculto"
        animate="visivel"
        className="-mx-6 overflow-x-auto px-6 pb-2 md:overflow-visible"
      >
        <div className="flex flex-col gap-4 md:flex-row md:min-w-[980px] lg:min-w-0 lg:grid lg:grid-cols-4">
          {colunas.map((coluna) => (
            <KanbanColuna
              key={coluna.id}
              coluna={coluna}
              onEditar={onEditar}
              onExcluir={onExcluir}
              onConcluir={onConcluir}
            />
          ))}
        </div>
      </motion.section>
    </DragDropContext>
  )
}
