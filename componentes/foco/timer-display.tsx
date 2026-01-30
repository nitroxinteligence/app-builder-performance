"use client"

import {
  CheckCircle2,
  Pause,
  Play,
  RotateCcw,
  Square,
  Timer,
} from "lucide-react"

import { Botao } from "@/componentes/ui/botao"
import { cn } from "@/lib/utilidades"
import { formatDuration, type FocusModeOption, type FocusTask } from "@/app/(protegido)/foco/types"

interface TimerDisplayProps {
  segundosRestantes: number
  totalSegundos: number
  progresso: number
  angulo: number
  modoAtual: FocusModeOption | undefined
  tarefaAtual: FocusTask | undefined
  rodando: boolean
  sessaoIniciada: boolean
  tempoFocadoAtual: number
  somAtivado: boolean
  onAlternarSessao: () => void
  onReiniciarSessao: () => void
  onEncerrarSessao: () => void
  onAlternarSom: () => void
  onTestarSom: () => void
}

export function TimerDisplay({
  segundosRestantes,
  totalSegundos,
  progresso,
  angulo,
  modoAtual,
  tarefaAtual,
  rodando,
  sessaoIniciada,
  tempoFocadoAtual,
  somAtivado,
  onAlternarSessao,
  onReiniciarSessao,
  onEncerrarSessao,
  onAlternarSom,
  onTestarSom,
}: TimerDisplayProps) {
  const textoBotaoControle = rodando
    ? "Pausar"
    : sessaoIniciada
      ? "Retomar"
      : "Iniciar"
  const IconeControle = rodando ? Pause : Play

  const xpPreview = Math.floor(tempoFocadoAtual / 60)

  const toggleSomClasses = cn(
    "inline-flex h-5 w-9 items-center rounded-full border border-border p-0.5 transition-colors",
    somAtivado ? "bg-foreground" : "bg-secondary"
  )
  const togglePinoSomClasses = cn(
    "h-4 w-4 rounded-full bg-background shadow-sm transition-transform",
    somAtivado ? "translate-x-4" : "translate-x-0"
  )

  return (
    <section className="flex flex-col items-center gap-6 rounded-3xl border border-border bg-card px-4 py-8 sm:px-6 sm:py-12 text-center">
      <div className="relative flex h-36 w-36 sm:h-48 sm:w-48 items-center justify-center">
        <div
          className="absolute inset-0 rounded-[32px] bg-muted"
          aria-hidden="true"
        />
        <div
          className="absolute inset-1 rounded-[30px]"
          style={{
            background: `conic-gradient(var(--primary) ${angulo}deg, var(--muted) 0deg)`,
          }}
          aria-hidden="true"
        />
        <div className="absolute inset-3 rounded-[26px] bg-card" />
        <div className="relative z-10 flex flex-col items-center gap-2">
          <span className="text-4xl font-semibold text-foreground">
            {formatDuration(segundosRestantes)}
          </span>
          <div className="h-1 w-20 rounded-full bg-muted">
            <div
              className="h-1 rounded-full bg-primary transition-[width]"
              style={{ width: `${Math.round(progresso * 100)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          Sessão de foco
        </p>
        <div className="flex items-center justify-center gap-2 text-lg font-semibold">
          <Timer className="h-4 w-4 text-muted-foreground" />
          {modoAtual?.titulo} {modoAtual?.duracao}min
        </div>
        <p className="text-sm text-muted-foreground">
          {tarefaAtual?.titulo ?? "Selecione uma tarefa para focar"}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Botao
          type="button"
          onClick={onAlternarSessao}
          variant={rodando ? "secondary" : "default"}
          className="gap-2"
        >
          <IconeControle className="h-4 w-4" />
          {textoBotaoControle}
        </Botao>
        {sessaoIniciada ? (
          <>
            <Botao
              type="button"
              variant="outline"
              className="gap-2 text-muted-foreground hover:text-foreground"
              onClick={onReiniciarSessao}
            >
              <RotateCcw className="h-4 w-4" />
              Reiniciar
            </Botao>
            <Botao
              type="button"
              variant="outline"
              className="gap-2 text-muted-foreground hover:text-foreground"
              onClick={onEncerrarSessao}
            >
              <Square className="h-4 w-4" />
              Encerrar
            </Botao>
          </>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Som do alarme
          </span>
          <button
            type="button"
            aria-pressed={somAtivado}
            aria-label="Alternar som do alarme"
            className={toggleSomClasses}
            onClick={onAlternarSom}
          >
            <span className={togglePinoSomClasses} />
          </button>
        </div>
        <Botao
          type="button"
          variant="outline"
          size="sm"
          className="gap-2 text-muted-foreground hover:text-foreground"
          onClick={onTestarSom}
          disabled={!somAtivado}
        >
          Testar som
        </Botao>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
        {sessaoIniciada
          ? `Ao completar: +${xpPreview} XP (1 XP/min)`
          : `Ao completar: +${Math.floor(totalSegundos / 60)} XP (1 XP/min)`}
      </div>
    </section>
  )
}
