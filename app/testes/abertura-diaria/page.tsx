"use client";
import {
  CalendarCheck,
  Flame,
  Sparkles,
  Star,
  Timer,
  WandSparkles,
  Zap,
} from "lucide-react";

import { Botao } from "@/componentes/ui/botao";
import {
  Dialogo,
  DialogoConteudo,
  DialogoGatilho,
} from "@/componentes/ui/dialogo";
import { Progresso } from "@/componentes/ui/progresso";
import { cn } from "@/lib/utilidades";

const questsDiarias = [
  { id: "login", texto: "Login diário", xp: "+10 XP", concluida: true },
  { id: "habito", texto: "Check hábito matinal", xp: "+15 XP", concluida: true },
  { id: "tarefas", texto: "Complete 3 tarefas", xp: "+50 XP", concluida: false },
  { id: "foco", texto: "2 sessões de foco de 25min", xp: "+40 XP", concluida: false },
  { id: "refeicoes", texto: "Registre suas refeições", xp: "+30 XP", concluida: false },
];

const estatisticas = [
  { id: "streak", label: "Streak", valor: "12 dias", icone: Flame },
  { id: "energia", label: "Energia", valor: "100%", icone: Zap },
  { id: "level", label: "Level", valor: "7", icone: Star },
];

const textoAssistant =
  "Ontem você foi incrível! 8 tarefas completas e 2h45min de foco — acima da sua média. Hoje tem 5 tarefas pendentes, 2 de alta prioridade. Bora manter o ritmo?";

function BlocoAssistant({ compacto = false }: { compacto?: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <WandSparkles className="h-4 w-4 text-muted-foreground" />
        Builder Assistant
      </div>
      <p className={cn("mt-3 text-sm text-muted-foreground", compacto && "text-xs")}>
        &ldquo;{textoAssistant}&rdquo;
      </p>
      <Botao variant="secondary" className="mt-4">
        Falar com Assistant
      </Botao>
    </div>
  );
}

function BlocoMetricas({ compacto = false }: { compacto?: boolean }) {
  return (
    <div className={cn("grid gap-3", compacto ? "grid-cols-3" : "grid-cols-3")}>
      {estatisticas.map((item) => (
        <div
          key={item.id}
          className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4"
        >
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {item.label}
            <item.icone className="h-4 w-4" aria-hidden="true" />
          </div>
          <p className={cn("font-titulo font-semibold", compacto ? "text-lg" : "text-xl")}>
            {item.valor}
          </p>
          {item.id === "level" ? (
            <div className="space-y-1">
              <Progresso value={68} />
              <span className="text-[11px] text-muted-foreground">68% concluído</span>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function BlocoQuests({ compacto = false }: { compacto?: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          Daily Quests
        </div>
        <span className="text-xs text-muted-foreground">2/5 ✓</span>
      </div>
      <div className={cn("mt-4 space-y-3", compacto && "space-y-2")}>
        {questsDiarias.map((quest) => (
          <div key={quest.id} className="flex items-center justify-between text-sm">
            <span
              className={cn(
                "flex items-center gap-2",
                quest.concluida ? "text-foreground" : "text-muted-foreground"
              )}
            >
              <span className="text-sm">{quest.concluida ? "✓" : "○"}</span>
              {quest.texto}
            </span>
            <span className="text-muted-foreground">{quest.xp}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AcoesRapidas({ compacto = false }: { compacto?: boolean }) {
  return (
    <div className={cn("flex flex-wrap gap-3", compacto && "gap-2")}>
      <Botao variant="outline" className="gap-2">
        <Sparkles className="h-4 w-4" />
        Tarefas
      </Botao>
      <Botao className="gap-2">
        <Timer className="h-4 w-4" />
        Iniciar foco
      </Botao>
    </div>
  );
}

function Cabecalho({ saudacao }: { saudacao: string }) {
  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
        Daily Start
      </p>
      <h2 className="font-titulo text-xl font-semibold text-foreground">
        {saudacao}
      </h2>
    </div>
  );
}

export default function PaginaTesteDailyStart() {
  const saudacao = "☀️ Bom dia, Mateus!";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
        <header className="space-y-2">
          <h1 className="font-titulo text-2xl font-semibold">
            Testes • Daily Start
          </h1>
          <p className="text-sm text-muted-foreground">
            Escolha uma versão de modal para avaliar antes de aplicar na tela
            principal.
          </p>
        </header>

        <div className="grid gap-4 lg:grid-cols-2">
          <Dialogo>
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="font-titulo text-lg font-semibold">Versão 1</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Estrutura completa, alinhada ao layout do escopo.
              </p>
              <DialogoGatilho asChild>
                <Botao className="mt-4">Abrir modal</Botao>
              </DialogoGatilho>
            </div>
            <DialogoConteudo className="max-w-3xl rounded-2xl border-border p-6">
              <Cabecalho saudacao={saudacao} />
              <BlocoAssistant />
              <BlocoMetricas />
              <BlocoQuests />
              <AcoesRapidas />
            </DialogoConteudo>
          </Dialogo>

          <Dialogo>
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="font-titulo text-lg font-semibold">Versão 2</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Colunas com foco no assistant e nas métricas.
              </p>
              <DialogoGatilho asChild>
                <Botao className="mt-4">Abrir modal</Botao>
              </DialogoGatilho>
            </div>
            <DialogoConteudo className="max-w-4xl rounded-2xl border-border p-6">
              <Cabecalho saudacao={saudacao} />
              <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
                <BlocoAssistant />
                <div className="flex flex-col gap-4">
                  <BlocoMetricas compacto />
                  <AcoesRapidas compacto />
                </div>
              </div>
              <BlocoQuests />
            </DialogoConteudo>
          </Dialogo>

          <Dialogo>
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="font-titulo text-lg font-semibold">Versão 3</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Compacta com foco em decisões rápidas.
              </p>
              <DialogoGatilho asChild>
                <Botao className="mt-4">Abrir modal</Botao>
              </DialogoGatilho>
            </div>
            <DialogoConteudo className="max-w-3xl rounded-2xl border-border p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <Cabecalho saudacao={saudacao} />
                <AcoesRapidas compacto />
              </div>
              <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
                <BlocoMetricas compacto />
                <BlocoAssistant compacto />
              </div>
              <BlocoQuests compacto />
            </DialogoConteudo>
          </Dialogo>

          <Dialogo>
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="font-titulo text-lg font-semibold">Versão 4</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Minimalista, com blocos empilhados e foco em rotina.
              </p>
              <DialogoGatilho asChild>
                <Botao className="mt-4">Abrir modal</Botao>
              </DialogoGatilho>
            </div>
            <DialogoConteudo className="max-w-3xl rounded-2xl border-border p-6">
              <Cabecalho saudacao={saudacao} />
              <div className="flex flex-col gap-4">
                <BlocoMetricas />
                <BlocoAssistant compacto />
                <BlocoQuests compacto />
                <AcoesRapidas />
              </div>
            </DialogoConteudo>
          </Dialogo>
        </div>
      </div>
    </div>
  );
}
