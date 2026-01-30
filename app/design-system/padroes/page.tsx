"use client"

import { Check, Clock, Plus, Search, Target } from "lucide-react"

import { ComponentPreview } from "@/componentes/design-system/component-preview"
import { ShowcaseSection } from "@/componentes/design-system/showcase-section"
import { Botao } from "@/componentes/ui/botao"
import {
  Cartao,
  CartaoCabecalho,
  CartaoTitulo,
  CartaoDescricao,
  CartaoConteudo,
} from "@/componentes/ui/cartao"
import { Progresso } from "@/componentes/ui/progresso"
import { Separador } from "@/componentes/ui/separador"
import { Esqueleto, EsqueletoCartao, EsqueletoKanban } from "@/componentes/ui/esqueleto"
import { EstadoVazio } from "@/componentes/ui/estado-vazio"

export default function PadroesPage() {
  return (
    <div className="space-y-12">
      <div className="space-y-2">
        <h1 className="font-titulo text-3xl font-bold tracking-tight">
          Padroes de Composicao
        </h1>
        <p className="text-muted-foreground">
          Patterns recorrentes do app — shells de pagina, formularios, listas,
          kanban, dashboard e estados.
        </p>
      </div>

      {/* 5.1 — Page Shells */}
      <ShowcaseSection
        id="page-shells"
        titulo="Page Shells"
        descricao="Layout padrao de paginas com titulo, descricao e acoes"
      >
        <ComponentPreview titulo="Shell com acoes">
          <div className="space-y-4 rounded-lg border border-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Titulo da Pagina</h2>
                <p className="text-sm text-muted-foreground">
                  Descricao breve do conteudo desta pagina
                </p>
              </div>
              <Botao size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Novo Item
              </Botao>
            </div>
            <Separador />
            <div className="h-32 rounded-md bg-muted/30 flex items-center justify-center text-sm text-muted-foreground">
              Conteudo da pagina
            </div>
          </div>
        </ComponentPreview>
      </ShowcaseSection>

      {/* 5.2 — Form Patterns */}
      <ShowcaseSection
        id="form-patterns"
        titulo="Form Patterns"
        descricao="Padroes de formulario (criacao, edicao, filtros)"
      >
        <div className="space-y-4">
          <ComponentPreview titulo="Formulario de criacao">
            <div className="max-w-md space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Titulo</label>
                <div className="h-10 rounded-md border border-input bg-background px-3" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Descricao</label>
                <div className="h-20 rounded-md border border-input bg-background px-3" />
              </div>
              <div className="flex gap-2">
                <Botao variant="outline">Cancelar</Botao>
                <Botao>Salvar</Botao>
              </div>
            </div>
          </ComponentPreview>

          <ComponentPreview titulo="Barra de filtros">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex h-9 w-64 items-center gap-2 rounded-md border border-input bg-background px-3">
                <Search className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Buscar...</span>
              </div>
              <Botao variant="outline" size="sm">Todos</Botao>
              <Botao variant="secondary" size="sm">Ativos</Botao>
              <Botao variant="outline" size="sm">Concluidos</Botao>
            </div>
          </ComponentPreview>
        </div>
      </ShowcaseSection>

      {/* 5.3 — List Patterns */}
      <ShowcaseSection
        id="list-patterns"
        titulo="List Patterns"
        descricao="Listas simples, com acoes e agrupadas"
      >
        <ComponentPreview titulo="Lista com acoes">
          <div className="divide-y divide-border rounded-lg border border-border">
            {["Completar modulo de React", "Estudar TypeScript", "Revisar PRD"].map(
              (item, i) => (
                <div
                  key={item}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${i === 0 ? "bg-primary" : "bg-muted"}`} />
                    <span className="text-sm">{item}</span>
                  </div>
                  <Botao variant="ghost" size="sm">
                    <Check className="h-4 w-4" />
                  </Botao>
                </div>
              )
            )}
          </div>
        </ComponentPreview>
      </ShowcaseSection>

      {/* 5.4 — Kanban Pattern */}
      <ShowcaseSection
        id="kanban-pattern"
        titulo="Kanban Pattern"
        descricao="Colunas drag-and-drop para gestao de tarefas"
      >
        <ComponentPreview titulo="Kanban board">
          <div className="flex gap-4 overflow-x-auto pb-2">
            {[
              { titulo: "A Fazer", cor: "bg-chart-5", itens: ["Tarefa A", "Tarefa B"] },
              { titulo: "Em Andamento", cor: "bg-primary", itens: ["Tarefa C"] },
              { titulo: "Concluido", cor: "bg-green-500", itens: ["Tarefa D", "Tarefa E", "Tarefa F"] },
            ].map(({ titulo, cor, itens }) => (
              <div key={titulo} className="w-60 shrink-0 rounded-lg bg-muted/30 p-3">
                <div className="mb-3 flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${cor}`} />
                  <h4 className="text-sm font-semibold">{titulo}</h4>
                  <span className="ml-auto rounded-full bg-muted px-2 text-xs text-muted-foreground">
                    {itens.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {itens.map((item) => (
                    <div
                      key={item}
                      className="rounded-md border border-border bg-card p-3 text-sm shadow-sm"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ComponentPreview>
      </ShowcaseSection>

      {/* 5.5 — Dashboard Pattern */}
      <ShowcaseSection
        id="dashboard-pattern"
        titulo="Dashboard Pattern"
        descricao="Cards de metricas e resumo"
      >
        <ComponentPreview titulo="Grid de metricas">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { titulo: "Foco Hoje", valor: "2h 30m", icone: Clock },
              { titulo: "Tarefas", valor: "8/12", icone: Check },
              { titulo: "Streak", valor: "15 dias", icone: Target },
              { titulo: "XP Hoje", valor: "+450", icone: Plus },
            ].map(({ titulo, valor, icone: Icone }) => (
              <Cartao key={titulo}>
                <CartaoConteudo className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">{titulo}</p>
                      <p className="text-xl font-bold">{valor}</p>
                    </div>
                    <Icone className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CartaoConteudo>
              </Cartao>
            ))}
          </div>
        </ComponentPreview>
      </ShowcaseSection>

      {/* 5.6 — Loading States */}
      <ShowcaseSection
        id="loading-states"
        titulo="Loading States"
        descricao="Skeleton de cada pattern"
      >
        <div className="space-y-4">
          <ComponentPreview titulo="Skeleton de cartao">
            <div className="max-w-sm">
              <EsqueletoCartao comCabecalho comDescricao comRodape />
            </div>
          </ComponentPreview>
          <ComponentPreview titulo="Skeleton kanban">
            <EsqueletoKanban cartoesPorColuna={[2, 1, 3]} />
          </ComponentPreview>
        </div>
      </ShowcaseSection>

      {/* 5.7 — Error States */}
      <ShowcaseSection
        id="error-states"
        titulo="Error States"
        descricao="404, 500, error boundary"
      >
        <div className="space-y-4">
          <ComponentPreview titulo="Erro generico">
            <Cartao className="border-destructive/30 bg-destructive/5">
              <CartaoConteudo className="p-6 text-center">
                <p className="text-lg font-semibold text-destructive">Erro ao carregar dados</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Ocorreu um erro inesperado. Tente novamente.
                </p>
                <Botao variant="outline" size="sm" className="mt-4">
                  Tentar novamente
                </Botao>
              </CartaoConteudo>
            </Cartao>
          </ComponentPreview>

          <ComponentPreview titulo="Estado vazio (sem dados)">
            <EstadoVazio
              titulo="Nenhum dado disponivel"
              descricao="Comece adicionando seu primeiro item."
            />
          </ComponentPreview>
        </div>
      </ShowcaseSection>

      {/* 5.8 — Navigation Patterns */}
      <ShowcaseSection
        id="navigation-patterns"
        titulo="Navigation Patterns"
        descricao="Sidebar, topbar e mobile bottom nav"
      >
        <ComponentPreview titulo="Bottom Tab Bar (mobile)">
          <div className="rounded-lg border border-border bg-card p-2">
            <div className="flex items-center justify-around">
              {[
                { label: "Foco", icone: Target },
                { label: "Tarefas", icone: Check },
                { label: "Habitos", icone: Clock },
                { label: "Inicio", icone: Plus },
              ].map(({ label, icone: Icone }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-0.5 px-3 py-1.5"
                >
                  <Icone className="h-5 w-5 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </ComponentPreview>
      </ShowcaseSection>
    </div>
  )
}
