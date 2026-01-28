"use client";

import * as React from "react";
import {
  Bot,
  CalendarDays,
  CheckCircle2,
  Flame,
  ListTodo,
  Timer,
} from "lucide-react";

import { Botao } from "@/componentes/ui/botao";
import {
  Dialogo,
  DialogoCabecalho,
  DialogoConteudo,
  DialogoDescricao,
  DialogoTitulo,
} from "@/componentes/ui/dialogo";
import { Progresso } from "@/componentes/ui/progresso";
import { cn } from "@/lib/utilidades";

import { etapasOnboarding } from "./dados-onboarding";

type PropsFluxoOnboarding = {
  aoFinalizar?: () => void;
};

const IlustracaoVisaoGeral = () => (
  <div className="grid gap-3 sm:grid-cols-2">
    {[
      { titulo: "Tarefas", icone: ListTodo },
      { titulo: "Foco", icone: Timer },
      { titulo: "Hábitos", icone: Flame },
      { titulo: "Agenda", icone: CalendarDays },
    ].map((item) => (
      <div
        key={item.titulo}
        className="rounded-2xl border border-border bg-background/60 p-4 text-left"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
          <item.icone className="h-4 w-4" />
        </div>
        <p className="mt-3 text-sm font-semibold">{item.titulo}</p>
        <p className="text-xs text-muted-foreground">
          Organize rapidamente.
        </p>
      </div>
    ))}
  </div>
);

const IlustracaoTarefas = () => (
  <div className="grid gap-3 rounded-3xl border border-border bg-background/60 p-6 text-left">
    {["A fazer", "Em progresso", "Concluído"].map((coluna) => (
      <div
        key={coluna}
        className="rounded-2xl border border-border bg-card p-4"
      >
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {coluna}
          <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-secondary-foreground">
            3
          </span>
        </div>
        <div className="mt-3 space-y-2 text-xs text-muted-foreground">
          <div className="rounded-xl border border-border bg-background/60 px-3 py-2">
            Revisar relatório
          </div>
          <div className="rounded-xl border border-border bg-background/60 px-3 py-2">
            Planejar sprint
          </div>
        </div>
      </div>
    ))}
  </div>
);

const IlustracaoFoco = () => (
  <div className="rounded-3xl border border-border bg-background/60 p-8 text-center">
    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
      Sessão de foco
    </p>
    <p className="mt-4 font-titulo text-4xl font-semibold">25:00</p>
    <Progresso value={45} className="mt-4" />
    <p className="mt-3 text-xs text-muted-foreground">
      Preparar apresentação
    </p>
  </div>
);

const IlustracaoHabitos = () => (
  <div className="space-y-3 rounded-3xl border border-border bg-background/60 p-6 text-left">
    {["Meditar 10 min", "Beber água", "Ler 20 min"].map((habito) => (
      <div
        key={habito}
        className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 text-sm"
      >
        <span>{habito}</span>
        <CheckCircle2 className="h-4 w-4 text-primary" />
      </div>
    ))}
  </div>
);

const IlustracaoAgenda = () => (
  <div className="rounded-3xl border border-border bg-background/60 p-6 text-left">
    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
      Agenda
    </p>
    <div className="mt-4 space-y-3">
      {[
        { hora: "09:00", texto: "Revisão semanal" },
        { hora: "14:00", texto: "Foco profundo" },
      ].map((evento) => (
        <div
          key={evento.texto}
          className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 text-sm"
        >
          <span className="text-xs text-muted-foreground">{evento.hora}</span>
          <span>{evento.texto}</span>
        </div>
      ))}
    </div>
  </div>
);

const IlustracaoAssistente = () => (
  <div className="rounded-3xl border border-border bg-background/60 p-6 text-left">
    <div className="flex items-center gap-2 text-sm font-semibold">
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
        <Bot className="h-4 w-4" />
      </div>
      Builder Assistant
    </div>
    <div className="mt-4 space-y-2 text-sm text-muted-foreground">
      <div className="rounded-2xl bg-secondary/60 px-4 py-3">
        Organize minhas prioridades de hoje.
      </div>
      <div className="rounded-2xl border border-border bg-card px-4 py-3">
        Claro! Vamos dividir em 3 blocos de foco.
      </div>
    </div>
  </div>
);

const IlustracaoCursos = () => (
  <div className="grid gap-3 rounded-3xl border border-border bg-background/60 p-6 text-left sm:grid-cols-2">
    {["Curso Builder", "Rotina em alta", "Foco avançado", "Hábitos líderes"].map(
      (curso) => (
        <div
          key={curso}
          className="rounded-2xl border border-border bg-card p-4 text-sm"
        >
          <p className="font-semibold">{curso}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Progresso 40%
          </p>
        </div>
      )
    )}
  </div>
);

const renderIlustracao = (id: string) => {
  switch (id) {
    case "visao-geral":
      return <IlustracaoVisaoGeral />;
    case "tarefas":
      return <IlustracaoTarefas />;
    case "foco":
      return <IlustracaoFoco />;
    case "habitos":
      return <IlustracaoHabitos />;
    case "agenda":
      return <IlustracaoAgenda />;
    case "assistente":
      return <IlustracaoAssistente />;
    case "cursos":
      return <IlustracaoCursos />;
    default:
      return null;
  }
};

export default function FluxoOnboarding({ aoFinalizar }: PropsFluxoOnboarding) {
  const [indiceAtual, setIndiceAtual] = React.useState(0);
  const [videoAberto, setVideoAberto] = React.useState(false);
  const [visivel, setVisivel] = React.useState(true);
  const [animando, setAnimando] = React.useState(false);
  const duracaoTransicao = 300;

  const etapaAtual = etapasOnboarding[indiceAtual];
  const ultimaEtapa = indiceAtual === etapasOnboarding.length - 1;

  const trocarEtapa = (novoIndice: number) => {
    if (animando || novoIndice === indiceAtual) {
      return;
    }
    setAnimando(true);
    setVisivel(false);
    window.setTimeout(() => {
      setIndiceAtual(novoIndice);
      setVisivel(true);
      window.setTimeout(() => setAnimando(false), duracaoTransicao);
    }, duracaoTransicao);
  };

  const avancar = () => {
    if (ultimaEtapa) {
      setAnimando(true);
      setVisivel(false);
      window.setTimeout(() => {
        aoFinalizar?.();
      }, duracaoTransicao);
      return;
    }
    trocarEtapa(Math.min(indiceAtual + 1, etapasOnboarding.length - 1));
  };

  const voltar = () => {
    trocarEtapa(Math.max(indiceAtual - 1, 0));
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Dialogo open={videoAberto} onOpenChange={setVideoAberto}>
        <DialogoConteudo className="max-w-4xl rounded-2xl border-border p-6">
          <DialogoCabecalho>
            <DialogoTitulo>Visão Geral</DialogoTitulo>
            <DialogoDescricao>{etapaAtual.titulo}</DialogoDescricao>
          </DialogoCabecalho>
          <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-background">
            <video
              key={etapaAtual.id}
              className="aspect-video w-full"
              controls
              playsInline
              preload="metadata"
              src={etapaAtual.videoUrl}
            />
          </div>
        </DialogoConteudo>
      </Dialogo>

      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10">
        <header className="flex items-center justify-between text-xs text-muted-foreground">
          <button
            type="button"
            onClick={voltar}
            aria-disabled={animando}
            tabIndex={animando ? -1 : 0}
            className={cn(
              "flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs font-medium transition",
              indiceAtual === 0 && "opacity-0 pointer-events-none",
              animando && "pointer-events-none opacity-50"
            )}
          >
            Voltar
          </button>
          <span>
            Etapa {indiceAtual + 1} de {etapasOnboarding.length}
          </span>
        </header>

        <main
          className={cn(
            "flex flex-1 items-center justify-center transition-opacity duration-300",
            visivel ? "opacity-100" : "opacity-0"
            ,
            animando && "pointer-events-none"
          )}
        >
          {etapaAtual.layout === "centro" ? (
            <div className="w-full max-w-xl space-y-6 text-center">
              <div className="space-y-3">
                {etapaAtual.id === "bem-vindo" ? (
                  <>
                    <h2 className="text-base font-medium text-muted-foreground sm:text-lg">
                      Bem-vindo ao
                    </h2>
                    <h1 className="font-titulo text-4xl font-semibold sm:text-5xl">
                      <span className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-400 bg-clip-text text-transparent">
                        Builders Performance
                      </span>
                    </h1>
                  </>
                ) : (
                  <h1 className="font-titulo text-3xl font-semibold sm:text-4xl">
                    {etapaAtual.titulo}
                  </h1>
                )}
                <p className="text-sm text-muted-foreground">
                  {etapaAtual.descricao}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Botao
                  variant="outline"
                  onClick={() => setVideoAberto(true)}
                  className="rounded-full"
                  aria-disabled={animando}
                  tabIndex={animando ? -1 : 0}
                >
                  Ver vídeo
                </Botao>
                <Botao
                  className="rounded-full bg-foreground text-background hover:bg-foreground/90"
                  onClick={avancar}
                  aria-disabled={animando}
                  tabIndex={animando ? -1 : 0}
                >
                  {etapaAtual.botao ?? "Continuar"}
                </Botao>
              </div>
            </div>
          ) : (
            <div className="grid w-full max-w-5xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
              <div>{renderIlustracao(etapaAtual.id)}</div>
              <div className="space-y-4 text-left">
                <h2 className="font-titulo text-2xl font-semibold sm:text-3xl">
                  {etapaAtual.titulo}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {etapaAtual.descricao}
                </p>
                <div className="flex flex-wrap gap-3">
                  <Botao
                    variant="outline"
                    onClick={() => setVideoAberto(true)}
                    className="rounded-full"
                    aria-disabled={animando}
                    tabIndex={animando ? -1 : 0}
                  >
                    Ver vídeo
                  </Botao>
                  <Botao
                    className="rounded-full bg-foreground text-background hover:bg-foreground/90"
                    onClick={avancar}
                    aria-disabled={animando}
                    tabIndex={animando ? -1 : 0}
                  >
                    {ultimaEtapa ? "Concluir" : "Continuar"}
                  </Botao>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
