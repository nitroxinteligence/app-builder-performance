"use client"

import { CheckCircle2 } from "lucide-react"

import { Botao } from "@/componentes/ui/botao"
import {
  Dialogo,
  DialogoCabecalho,
  DialogoConteudo,
  DialogoDescricao,
  DialogoRodape,
  DialogoTitulo,
} from "@/componentes/ui/dialogo"
import type { FocusTask } from "@/app/(protegido)/foco/types"

interface ModalTarefaProps {
  aberto: boolean
  onOpenChange: (aberto: boolean) => void
  tarefaAtual: FocusTask | undefined
  onMarcarConcluida: () => void
}

export function ModalTarefa({
  aberto,
  onOpenChange,
  tarefaAtual,
  onMarcarConcluida,
}: ModalTarefaProps) {
  return (
    <Dialogo open={aberto} onOpenChange={onOpenChange}>
      <DialogoConteudo className="max-w-lg rounded-2xl border-border p-6">
        <DialogoCabecalho>
          <DialogoTitulo>Marcar tarefa como concluída?</DialogoTitulo>
          <DialogoDescricao>
            Você completou uma sessão de foco na tarefa abaixo. Deseja
            marcá-la como concluída no Kanban?
          </DialogoDescricao>
        </DialogoCabecalho>
        <div className="rounded-xl border border-border bg-card p-4 text-sm">
          <p className="font-medium text-foreground">
            {tarefaAtual?.titulo ?? "Tarefa"}
          </p>
          <p className="text-muted-foreground">{tarefaAtual?.coluna}</p>
        </div>
        <DialogoRodape className="mt-6 sm:justify-between">
          <Botao
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Não, continuar depois
          </Botao>
          <Botao onClick={onMarcarConcluida}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Sim, concluir tarefa
          </Botao>
        </DialogoRodape>
      </DialogoConteudo>
    </Dialogo>
  )
}
