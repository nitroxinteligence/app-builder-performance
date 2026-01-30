"use client"

import * as React from "react"
import Link from "next/link"

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
import {
  Seletor,
  SeletorConteudo,
  SeletorGatilho,
  SeletorItem,
  SeletorValor,
} from "@/componentes/ui/seletor"
import { Entrada, AreaTexto } from "@/componentes/ui/entrada"
import { useCreatePendencia } from "@/hooks/usePendencias"
import { useAuth } from "@/lib/providers/auth-provider"
import type { Prioridade } from "@/lib/supabase/types"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type FormularioPendencia = {
  titulo: string
  prazo: string
  prioridade: Prioridade
  categoria: string
  descricao: string
}

const formularioPadrao: FormularioPendencia = {
  titulo: "",
  prazo: "Hoje",
  prioridade: "media",
  categoria: "",
  descricao: "",
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface ModalTarefaRapidaProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ModalTarefaRapida({ open, onOpenChange }: ModalTarefaRapidaProps) {
  const { user } = useAuth()
  const createPendenciaMutation = useCreatePendencia()

  const [formPendencia, setFormPendencia] =
    React.useState<FormularioPendencia>(formularioPadrao)

  React.useEffect(() => {
    if (!open) return
    setFormPendencia(formularioPadrao)
  }, [open])

  const atualizarForm = (parcial: Partial<FormularioPendencia>) =>
    setFormPendencia((prev) => ({ ...prev, ...parcial }))

  const criarPendencia = () => {
    if (!formPendencia.titulo.trim() || !user) return
    createPendenciaMutation.mutate(
      {
        titulo: formPendencia.titulo,
        prazo: formPendencia.prazo,
        prioridade: formPendencia.prioridade,
        categoria: formPendencia.categoria || null,
        descricao: formPendencia.descricao || null,
        data_vencimento: null,
      },
      { onSuccess: () => onOpenChange(false) }
    )
  }

  return (
    <Dialogo open={open} onOpenChange={onOpenChange}>
      <DialogoConteudo className="max-w-xl rounded-2xl border-border p-6">
        <DialogoCabecalho>
          <DialogoTitulo>Nova tarefa pendente</DialogoTitulo>
          <DialogoDescricao>
            Registre uma tarefa rápida para organizar depois.
          </DialogoDescricao>
        </DialogoCabecalho>
        <div className="mt-5 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="acao-tarefa-titulo">
              Título
            </label>
            <Entrada
              id="acao-tarefa-titulo"
              value={formPendencia.titulo}
              onChange={(e) => atualizarForm({ titulo: e.target.value })}
              placeholder="Ex: Revisar relatório"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="acao-tarefa-prioridade">
                Prioridade
              </label>
              <Seletor
                value={formPendencia.prioridade}
                onValueChange={(valor) => atualizarForm({ prioridade: valor as Prioridade })}
              >
                <SeletorGatilho id="acao-tarefa-prioridade">
                  <SeletorValor placeholder="Selecione" />
                </SeletorGatilho>
                <SeletorConteudo>
                  <SeletorItem value="alta">Alta</SeletorItem>
                  <SeletorItem value="media">Média</SeletorItem>
                  <SeletorItem value="baixa">Baixa</SeletorItem>
                </SeletorConteudo>
              </Seletor>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="acao-tarefa-prazo">
                Prazo
              </label>
              <Seletor
                value={formPendencia.prazo}
                onValueChange={(valor) => atualizarForm({ prazo: valor })}
              >
                <SeletorGatilho id="acao-tarefa-prazo">
                  <SeletorValor placeholder="Selecione" />
                </SeletorGatilho>
                <SeletorConteudo>
                  <SeletorItem value="Hoje">Hoje</SeletorItem>
                  <SeletorItem value="Amanhã">Amanhã</SeletorItem>
                  <SeletorItem value="Esta semana">Esta semana</SeletorItem>
                  <SeletorItem value="Próxima semana">Próxima semana</SeletorItem>
                </SeletorConteudo>
              </Seletor>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="acao-tarefa-categoria">
              Categoria
            </label>
            <Entrada
              id="acao-tarefa-categoria"
              value={formPendencia.categoria}
              onChange={(e) => atualizarForm({ categoria: e.target.value })}
              placeholder="Ex: Planejamento"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="acao-tarefa-descricao">
              Observações
            </label>
            <AreaTexto
              id="acao-tarefa-descricao"
              value={formPendencia.descricao}
              onChange={(e) => atualizarForm({ descricao: e.target.value })}
              placeholder="Detalhes importantes para lembrar depois."
              className="min-h-[90px] resize-none"
            />
          </div>
        </div>
        <DialogoRodape className="mt-6 sm:justify-between">
          <DialogoFechar asChild>
            <Botao variant="secondary">Cancelar</Botao>
          </DialogoFechar>
          <div className="flex items-center gap-2">
            <Botao asChild variant="outline">
              <Link href="/tarefas">Abrir tarefas</Link>
            </Botao>
            <Botao onClick={criarPendencia}>Adicionar pendência</Botao>
          </div>
        </DialogoRodape>
      </DialogoConteudo>
    </Dialogo>
  )
}
