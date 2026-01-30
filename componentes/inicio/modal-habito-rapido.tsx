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
import { useCategoriasHabitos, useCreateHabito } from "@/hooks/useHabitos"
import { useAuth } from "@/lib/providers/auth-provider"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type FormularioHabito = {
  titulo: string
  categoriaId: string
  frequencia: string
  duracao: string
  observacao: string
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface ModalHabitoRapidoProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ModalHabitoRapido({ open, onOpenChange }: ModalHabitoRapidoProps) {
  const { user } = useAuth()
  const { data: categoriasHabitosDB = [] } = useCategoriasHabitos()
  const createHabitoMutation = useCreateHabito()

  const categoriasHabitos = React.useMemo(
    () =>
      categoriasHabitosDB.map((cat) => ({
        id: cat.id,
        titulo: cat.nome,
      })),
    [categoriasHabitosDB]
  )

  const [formHabito, setFormHabito] = React.useState<FormularioHabito>({
    titulo: "",
    categoriaId: "",
    frequencia: "diario",
    duracao: "21",
    observacao: "",
  })

  React.useEffect(() => {
    if (!open) return
    setFormHabito({
      titulo: "",
      categoriaId: categoriasHabitos[0]?.id ?? "",
      frequencia: "diario",
      duracao: "21",
      observacao: "",
    })
  }, [open, categoriasHabitos])

  const atualizarForm = (parcial: Partial<FormularioHabito>) =>
    setFormHabito((prev) => ({ ...prev, ...parcial }))

  const criarHabito = () => {
    if (!formHabito.titulo.trim() || !user) return
    createHabitoMutation.mutate(
      {
        titulo: formHabito.titulo,
        descricao: formHabito.observacao || null,
        icone: "sparkles",
        cor: null,
        dificuldade: "medio",
        frequencia: formHabito.frequencia === "diario" ? "diario" : "semanal",
        dias_semana:
          formHabito.frequencia === "diario"
            ? [0, 1, 2, 3, 4, 5, 6]
            : [1, 3, 5],
        categoria_id: formHabito.categoriaId || null,
        objetivo_id: null,
        ordem: "0",
        ativo: true,
      },
      { onSuccess: () => onOpenChange(false) }
    )
  }

  return (
    <Dialogo open={open} onOpenChange={onOpenChange}>
      <DialogoConteudo className="rounded-2xl border-border p-6">
        <DialogoCabecalho>
          <DialogoTitulo>Novo hábito de hoje</DialogoTitulo>
          <DialogoDescricao>
            Registre um hábito diário para acompanhar agora.
          </DialogoDescricao>
        </DialogoCabecalho>
        <div className="mt-5 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="acao-habito-titulo">
              Título
            </label>
            <Entrada
              id="acao-habito-titulo"
              value={formHabito.titulo}
              onChange={(e) => atualizarForm({ titulo: e.target.value })}
              placeholder="Ex: Meditar 10 min"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="acao-habito-categoria">
                Categoria
              </label>
              <Seletor
                value={formHabito.categoriaId}
                onValueChange={(valor) => atualizarForm({ categoriaId: valor })}
              >
                <SeletorGatilho id="acao-habito-categoria">
                  <SeletorValor placeholder="Selecione" />
                </SeletorGatilho>
                <SeletorConteudo>
                  {categoriasHabitos.map((categoria) => (
                    <SeletorItem key={categoria.id} value={categoria.id}>
                      {categoria.titulo}
                    </SeletorItem>
                  ))}
                </SeletorConteudo>
              </Seletor>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="acao-habito-frequencia">
                Frequência
              </label>
              <Seletor
                value={formHabito.frequencia}
                onValueChange={(valor) => atualizarForm({ frequencia: valor })}
              >
                <SeletorGatilho id="acao-habito-frequencia">
                  <SeletorValor placeholder="Selecione" />
                </SeletorGatilho>
                <SeletorConteudo>
                  <SeletorItem value="diario">Diário</SeletorItem>
                  <SeletorItem value="semanal">Semanal</SeletorItem>
                  <SeletorItem value="alternado">Dias alternados</SeletorItem>
                </SeletorConteudo>
              </Seletor>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="acao-habito-duracao">
              Duração (dias)
            </label>
            <Seletor
              value={formHabito.duracao}
              onValueChange={(valor) => atualizarForm({ duracao: valor })}
            >
              <SeletorGatilho id="acao-habito-duracao">
                <SeletorValor placeholder="Selecione" />
              </SeletorGatilho>
              <SeletorConteudo>
                <SeletorItem value="7">7 dias</SeletorItem>
                <SeletorItem value="14">14 dias</SeletorItem>
                <SeletorItem value="21">21 dias</SeletorItem>
                <SeletorItem value="30">30 dias</SeletorItem>
                <SeletorItem value="60">60 dias</SeletorItem>
                <SeletorItem value="90">90 dias</SeletorItem>
              </SeletorConteudo>
            </Seletor>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="acao-habito-observacao">
              Observações
            </label>
            <AreaTexto
              id="acao-habito-observacao"
              value={formHabito.observacao}
              onChange={(e) => atualizarForm({ observacao: e.target.value })}
              placeholder="Detalhes que ajudam a manter a rotina."
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
              <Link href="/habitos">Abrir hábitos</Link>
            </Botao>
            <Botao onClick={criarHabito}>Adicionar hábito</Botao>
          </div>
        </DialogoRodape>
      </DialogoConteudo>
    </Dialogo>
  )
}
