"use client"

import { CheckCircle2 } from "lucide-react"
import { Droppable } from "@hello-pangea/dnd"

import { Emblema } from "@/componentes/ui/emblema"
import type { Tarefa } from "@/lib/supabase/types"
import { TarefaCard } from "./tarefa-card"
import type { ColunaComTarefas } from "./tipos"

export type KanbanColunaProps = {
  coluna: ColunaComTarefas
  onEditar: (tarefa: Tarefa) => void
  onExcluir: (tarefa: Tarefa) => void
  onConcluir: (tarefa: Tarefa) => void
}

export function KanbanColuna({
  coluna,
  onEditar,
  onExcluir,
  onConcluir,
}: KanbanColunaProps) {
  return (
    <div className="flex w-full flex-col gap-4 rounded-2xl border border-[color:var(--borda-cartao)] bg-card p-4 md:w-[280px] lg:w-auto">
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <span>{coluna.titulo}</span>
            <Emblema variant="secondary">
              {coluna.tarefas.length}
            </Emblema>
          </div>
          {coluna.id === "concluido" ? (
            <CheckCircle2 className="h-4 w-4 text-success" />
          ) : null}
        </div>
        {coluna.dica ? (
          <p className="text-xs text-muted-foreground">{coluna.dica}</p>
        ) : null}
      </div>
      <Droppable droppableId={coluna.id}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="kanban-scroll flex h-[calc(100vh-320px)] min-h-[300px] max-h-[600px] flex-col gap-3 pr-2"
          >
            {coluna.tarefas.map((tarefa, index) => (
              <TarefaCard
                key={tarefa.id}
                tarefa={tarefa}
                index={index}
                onEditar={onEditar}
                onExcluir={onExcluir}
                onConcluir={onConcluir}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  )
}
