"use client"

import { Check, Clock, Plus, Target, Zap } from "lucide-react"

import { PagePreviewFrame } from "@/componentes/design-system/page-preview-frame"
import { ShowcaseSection } from "@/componentes/design-system/showcase-section"
import { Botao } from "@/componentes/ui/botao"
import {
  Cartao,
  CartaoConteudo,
} from "@/componentes/ui/cartao"
import { Progresso } from "@/componentes/ui/progresso"

export default function PaginasPage() {
  return (
    <div className="space-y-12">
      <div className="space-y-2">
        <h1 className="font-titulo text-3xl font-bold tracking-tight">
          Pages Showcase
        </h1>
        <p className="text-muted-foreground">
          Mini-previews estaticas de cada pagina principal do app.
        </p>
      </div>

      {/* 6.2 — Foco */}
      <ShowcaseSection id="foco" titulo="Foco (Pomodoro)">
        <PagePreviewFrame titulo="Foco" descricao="Timer de foco profundo com sessoes e estatisticas">
          <div className="flex flex-col items-center gap-6 py-8">
            <div className="flex h-40 w-40 items-center justify-center rounded-full border-4 border-primary">
              <div className="text-center">
                <p className="font-titulo text-3xl font-bold">25:00</p>
                <p className="text-xs text-muted-foreground">Deep Work</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Botao>Iniciar</Botao>
              <Botao variant="outline">Configurar</Botao>
            </div>
            <div className="w-full max-w-xs">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Sessao 1/4</span>
                <span>1h 40m restantes</span>
              </div>
              <Progresso value={25} className="mt-1" />
            </div>
          </div>
        </PagePreviewFrame>
      </ShowcaseSection>

      {/* 6.3 — Tarefas */}
      <ShowcaseSection id="tarefas" titulo="Tarefas (Kanban)">
        <PagePreviewFrame titulo="Tarefas" descricao="Board Kanban com drag-and-drop">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Minhas Tarefas</h3>
              <Botao size="sm">
                <Plus className="mr-2 h-3 w-3" />
                Nova Tarefa
              </Botao>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {[
                { titulo: "A Fazer", itens: 3, cor: "bg-chart-5" },
                { titulo: "Fazendo", itens: 2, cor: "bg-primary" },
                { titulo: "Feito", itens: 5, cor: "bg-green-500" },
              ].map(({ titulo, itens, cor }) => (
                <div key={titulo} className="w-44 shrink-0 rounded-md bg-muted/30 p-2">
                  <div className="mb-2 flex items-center gap-1.5">
                    <div className={`h-1.5 w-1.5 rounded-full ${cor}`} />
                    <span className="text-xs font-medium">{titulo}</span>
                    <span className="ml-auto text-[10px] text-muted-foreground">{itens}</span>
                  </div>
                  <div className="space-y-1.5">
                    {Array.from({ length: Math.min(itens, 2) }).map((_, i) => (
                      <div
                        key={`${titulo}-${i}`}
                        className="rounded border border-border bg-card p-2 text-[10px]"
                      >
                        Tarefa exemplo {i + 1}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </PagePreviewFrame>
      </ShowcaseSection>

      {/* 6.4 — Habitos */}
      <ShowcaseSection id="habitos" titulo="Habitos">
        <PagePreviewFrame titulo="Habitos" descricao="Tracking de habitos com streaks e categorias">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Hoje</h3>
              <span className="text-xs text-muted-foreground">3/5 concluidos</span>
            </div>
            {[
              { nome: "Meditar 10min", streak: 15, concluido: true },
              { nome: "Exercicio", streak: 8, concluido: true },
              { nome: "Leitura 30min", streak: 22, concluido: true },
              { nome: "Estudar ingles", streak: 3, concluido: false },
              { nome: "Journaling", streak: 0, concluido: false },
            ].map(({ nome, streak, concluido }) => (
              <div key={nome} className="flex items-center gap-3 rounded-md border border-border p-2.5">
                <div className={`flex h-5 w-5 items-center justify-center rounded ${concluido ? "bg-primary text-primary-foreground" : "border border-input"}`}>
                  {concluido && <Check className="h-3 w-3" />}
                </div>
                <span className={`flex-1 text-xs ${concluido ? "line-through text-muted-foreground" : ""}`}>
                  {nome}
                </span>
                <div className="flex items-center gap-1">
                  <Zap className="h-3 w-3 text-chart-5" />
                  <span className="text-[10px] font-medium">{streak}</span>
                </div>
              </div>
            ))}
          </div>
        </PagePreviewFrame>
      </ShowcaseSection>

      {/* 6.5 — Agenda */}
      <ShowcaseSection id="agenda" titulo="Agenda">
        <PagePreviewFrame titulo="Agenda" descricao="Calendario com eventos integrados">
          <div className="space-y-3">
            <div className="grid grid-cols-7 gap-1 text-center">
              {["D", "S", "T", "Q", "Q", "S", "S"].map((dia, i) => (
                <span key={`${dia}-${i}`} className="text-[10px] text-muted-foreground">
                  {dia}
                </span>
              ))}
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={`dia-${i}`}
                  className={`flex h-8 w-8 items-center justify-center rounded-md text-xs ${
                    i === 3
                      ? "bg-primary text-primary-foreground font-medium"
                      : "hover:bg-muted"
                  }`}
                >
                  {i + 27}
                </div>
              ))}
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 rounded-md border-l-2 border-primary bg-primary/5 p-2">
                <Clock className="h-3 w-3 text-primary" />
                <span className="text-[10px]">09:00 — Reuniao de equipe</span>
              </div>
              <div className="flex items-center gap-2 rounded-md border-l-2 border-chart-5 bg-chart-5/5 p-2">
                <Clock className="h-3 w-3 text-chart-5" />
                <span className="text-[10px]">14:00 — Review de sprint</span>
              </div>
            </div>
          </div>
        </PagePreviewFrame>
      </ShowcaseSection>

      {/* 6.6 — Inicio (Dashboard) */}
      <ShowcaseSection id="inicio" titulo="Inicio (Dashboard)">
        <PagePreviewFrame titulo="Inicio" descricao="Dashboard com metricas e acoes rapidas">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Foco", valor: "2h30m", icone: Target },
                { label: "Tarefas", valor: "8/12", icone: Check },
                { label: "Streak", valor: "15d", icone: Zap },
                { label: "XP", valor: "2.450", icone: Plus },
              ].map(({ label, valor, icone: Icone }) => (
                <Cartao key={label}>
                  <CartaoConteudo className="p-2.5">
                    <div className="flex items-center gap-2">
                      <Icone className="h-3.5 w-3.5 text-muted-foreground" />
                      <div>
                        <p className="text-[10px] text-muted-foreground">{label}</p>
                        <p className="text-sm font-bold">{valor}</p>
                      </div>
                    </div>
                  </CartaoConteudo>
                </Cartao>
              ))}
            </div>
            <Cartao>
              <CartaoConteudo className="p-2.5">
                <p className="text-xs font-medium">Nivel 12</p>
                <Progresso value={65} className="mt-1" />
                <p className="mt-0.5 text-[10px] text-muted-foreground">2.450 / 3.800 XP</p>
              </CartaoConteudo>
            </Cartao>
          </div>
        </PagePreviewFrame>
      </ShowcaseSection>
    </div>
  )
}
