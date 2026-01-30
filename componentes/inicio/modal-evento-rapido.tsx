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
import {
  CHAVE_EVENTOS_AGENDA,
  lerLocalStorage,
  salvarLocalStorage,
} from "@/lib/armazenamento"

import type {
  EventoAgenda,
  IntegracaoCalendario,
  StatusEvento,
} from "@/app/(protegido)/agenda/dados-agenda"
import {
  categoriasAgenda,
  eventosAgenda,
} from "@/app/(protegido)/agenda/dados-agenda"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type FormularioEvento = {
  titulo: string
  descricao: string
  data: string
  horarioInicio: string
  horarioFim: string
  categoria: string
  local: string
  status: StatusEvento
  calendario: IntegracaoCalendario
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface ModalEventoRapidoProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ModalEventoRapido({ open, onOpenChange }: ModalEventoRapidoProps) {
  const dataHoje = React.useMemo(() => new Date().toISOString().slice(0, 10), [])

  const formularioPadrao = React.useMemo<FormularioEvento>(
    () => ({
      titulo: "",
      descricao: "",
      data: dataHoje,
      horarioInicio: "09:00",
      horarioFim: "09:30",
      categoria: "Reunião",
      local: "",
      status: "confirmado",
      calendario: "Manual",
    }),
    [dataHoje]
  )

  const [formEvento, setFormEvento] = React.useState<FormularioEvento>(formularioPadrao)

  React.useEffect(() => {
    if (!open) return
    setFormEvento({ ...formularioPadrao, data: dataHoje })
  }, [open, formularioPadrao, dataHoje])

  const atualizarForm = (parcial: Partial<FormularioEvento>) =>
    setFormEvento((prev) => ({ ...prev, ...parcial }))

  const criarEvento = () => {
    if (!formEvento.titulo.trim()) return
    const listaAtual =
      lerLocalStorage<EventoAgenda[]>(CHAVE_EVENTOS_AGENDA) ?? eventosAgenda
    const novoEvento: EventoAgenda = {
      id: Math.random().toString(36).slice(2, 9),
      ...formEvento,
    }
    salvarLocalStorage(CHAVE_EVENTOS_AGENDA, [novoEvento, ...listaAtual])
    onOpenChange(false)
  }

  return (
    <Dialogo open={open} onOpenChange={onOpenChange}>
      <DialogoConteudo className="rounded-2xl border-border p-6">
        <DialogoCabecalho>
          <DialogoTitulo>Novo agendamento</DialogoTitulo>
          <DialogoDescricao>
            Crie um evento rápido e envie direto para a agenda.
          </DialogoDescricao>
        </DialogoCabecalho>
        <div className="mt-5 grid gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="acao-evento-titulo">
              Título
            </label>
            <Entrada
              id="acao-evento-titulo"
              value={formEvento.titulo}
              onChange={(e) => atualizarForm({ titulo: e.target.value })}
              placeholder="Ex: Call com cliente"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="acao-evento-data">
                Data
              </label>
              <Entrada
                id="acao-evento-data"
                type="date"
                value={formEvento.data}
                onChange={(e) => atualizarForm({ data: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="acao-evento-categoria">
                Categoria
              </label>
              <Seletor
                value={formEvento.categoria}
                onValueChange={(valor) => atualizarForm({ categoria: valor })}
              >
                <SeletorGatilho id="acao-evento-categoria">
                  <SeletorValor placeholder="Selecione" />
                </SeletorGatilho>
                <SeletorConteudo>
                  {categoriasAgenda.map((categoria) => (
                    <SeletorItem key={categoria.id} value={categoria.titulo}>
                      {categoria.titulo}
                    </SeletorItem>
                  ))}
                </SeletorConteudo>
              </Seletor>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="acao-evento-inicio">
                Início
              </label>
              <Entrada
                id="acao-evento-inicio"
                type="time"
                value={formEvento.horarioInicio}
                onChange={(e) => atualizarForm({ horarioInicio: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="acao-evento-fim">
                Fim
              </label>
              <Entrada
                id="acao-evento-fim"
                type="time"
                value={formEvento.horarioFim}
                onChange={(e) => atualizarForm({ horarioFim: e.target.value })}
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="acao-evento-status">
                Status
              </label>
              <Seletor
                value={formEvento.status}
                onValueChange={(valor) => atualizarForm({ status: valor as StatusEvento })}
              >
                <SeletorGatilho id="acao-evento-status">
                  <SeletorValor placeholder="Selecione" />
                </SeletorGatilho>
                <SeletorConteudo>
                  <SeletorItem value="confirmado">Confirmado</SeletorItem>
                  <SeletorItem value="pendente">Pendente</SeletorItem>
                  <SeletorItem value="foco">Foco</SeletorItem>
                </SeletorConteudo>
              </Seletor>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="acao-evento-calendario">
                Calendário
              </label>
              <Seletor
                value={formEvento.calendario}
                onValueChange={(valor) =>
                  atualizarForm({ calendario: valor as IntegracaoCalendario })
                }
              >
                <SeletorGatilho id="acao-evento-calendario">
                  <SeletorValor placeholder="Selecione" />
                </SeletorGatilho>
                <SeletorConteudo>
                  <SeletorItem value="Manual">Manual</SeletorItem>
                  <SeletorItem value="Google">Google</SeletorItem>
                  <SeletorItem value="Outlook">Outlook</SeletorItem>
                </SeletorConteudo>
              </Seletor>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="acao-evento-local">
              Local
            </label>
            <Entrada
              id="acao-evento-local"
              value={formEvento.local}
              onChange={(e) => atualizarForm({ local: e.target.value })}
              placeholder="Ex: Google Meet"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="acao-evento-descricao">
              Descrição
            </label>
            <AreaTexto
              id="acao-evento-descricao"
              value={formEvento.descricao}
              onChange={(e) => atualizarForm({ descricao: e.target.value })}
              placeholder="Contexto do evento."
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
              <Link href="/agenda">Abrir agenda</Link>
            </Botao>
            <Botao onClick={criarEvento}>Criar evento</Botao>
          </div>
        </DialogoRodape>
      </DialogoConteudo>
    </Dialogo>
  )
}
