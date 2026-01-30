"use client"

import Link from "next/link"
import { Clock, Zap } from "lucide-react"

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
          <DialogoTitulo>
            {levelUp ? "🎉 Você subiu de nível!" : "Sessão finalizada"}
          </DialogoTitulo>
          <DialogoDescricao>
            {levelUp
              ? `Parabéns! Você alcançou o nível ${nivelUsuario}!`
              : "Excelente foco! Sua sessão foi registrada com sucesso."}
          </DialogoDescricao>
        </DialogoCabecalho>
        <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">
            {tituloTarefa ?? "Sessão livre"}
          </p>
          <div className="mt-2 flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {formatDurationLong(tempoFocadoAtual)}
            </span>
            <span className="flex items-center gap-1 text-primary">
              <Zap className="h-4 w-4" />
              +{xpGanho} XP
            </span>
          </div>
        </div>
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
