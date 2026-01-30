import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import type { Prioridade, Estagio } from "@/lib/supabase/types"

export const estilosPrioridade: Record<Prioridade, string> = {
  urgente:
    "border-purple-200 bg-purple-50 text-purple-600 dark:border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-300",
  alta: "border-red-200 bg-red-50 text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300",
  media:
    "border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
  baixa:
    "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300",
}

export const estagiosKanban: { id: Estagio; titulo: string; dica?: string }[] = [
  { id: "backlog", titulo: "Backlog", dica: "Arraste para mover cards" },
  { id: "a_fazer", titulo: "A fazer" },
  { id: "em_andamento", titulo: "Em andamento" },
  { id: "concluido", titulo: "Concluído" },
]

export type FormularioTarefa = {
  titulo: string
  prioridade: Prioridade
  prazo: string
  dataVencimento?: Date
  categoria: string
  coluna: Estagio
  descricao: string
}

export const formularioVazio: FormularioTarefa = {
  titulo: "",
  prioridade: "media",
  prazo: "",
  categoria: "",
  coluna: "backlog",
  descricao: "",
}

export const formatarData = (data?: Date) =>
  data ? format(data, "dd/MM/yyyy", { locale: ptBR }) : ""

export type ColunaComTarefas = {
  id: Estagio
  titulo: string
  dica?: string
  tarefas: import("@/lib/supabase/types").Tarefa[]
}
