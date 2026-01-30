"use client"

import { DragDropContext, type DropResult } from "@hello-pangea/dnd"

import type { Tarefa } from "@/lib/supabase/types"
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
      <section className="-mx-6 overflow-x-auto px-6 pb-2 md:overflow-visible">
        <div className="flex flex-col gap-4 md:flex-row md:min-w-[980px] lg:min-w-0 lg:grid lg:grid-cols-3">
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
      </section>
    </DragDropContext>
  )
}
