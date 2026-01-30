"use client"

import {
  Pause,
  Play,
  RotateCcw,
  Square,
  Timer,
  Zap,
} from "lucide-react"
import { motion } from "framer-motion"

import { Botao } from "@/componentes/ui/botao"
import { Emblema } from "@/componentes/ui/emblema"
import { cn } from "@/lib/utilidades"
import { variantesEntrada, transicaoSuave } from "@/lib/animacoes"
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
    "h-4 w-4 rounded-full bg-background transition-transform",
    somAtivado ? "translate-x-4" : "translate-x-0"
  )

  return (
    <motion.section
      variants={variantesEntrada}
      initial="oculto"
      animate="visivel"
      className={cn(
        "flex flex-col items-center gap-6 rounded-3xl border px-4 py-8 sm:px-6 sm:py-12 text-center transition-colors duration-500",
        sessaoIniciada
          ? "border-primary/20 bg-[#1A1A1A] text-[#F5F5F5] dark:border-primary/30 dark:bg-[#111111]"
          : "border-[color:var(--borda-cartao)] bg-card"
      )}
    >
      <div className="relative flex h-36 w-36 sm:h-48 sm:w-48 items-center justify-center">
        <div
          className={cn(
            "absolute inset-0 rounded-[32px]",
            sessaoIniciada ? "bg-[#2A2A2A]" : "bg-muted"
          )}
          aria-hidden="true"
        />
        <div
          className="absolute inset-1 rounded-[30px]"
          style={{
            background: `conic-gradient(var(--primary) ${angulo}deg, ${sessaoIniciada ? '#2A2A2A' : 'var(--muted)'} 0deg)`,
          }}
          aria-hidden="true"
        />
        <div
          className={cn(
            "absolute inset-3 rounded-[26px]",
            sessaoIniciada ? "bg-[#1A1A1A] dark:bg-[#111111]" : "bg-card"
          )}
        />
        <div className="relative z-10 flex flex-col items-center gap-2">
          <motion.span
            key={segundosRestantes}
            initial={{ scale: 1.05, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={transicaoSuave}
            className="text-4xl font-semibold"
          >
            {formatDuration(segundosRestantes)}
          </motion.span>
          <div className={cn(
            "h-1 w-20 rounded-full",
            sessaoIniciada ? "bg-[#333333]" : "bg-muted"
          )}>
            <div
              className="h-1 rounded-full bg-gradient-to-r from-primary to-primary/70 transition-[width]"
              style={{ width: `${Math.round(progresso * 100)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <p className={cn(
          "text-xs font-semibold uppercase tracking-[0.3em]",
          sessaoIniciada ? "text-[#A0A0A0]" : "text-muted-foreground"
        )}>
          Sessao de foco
        </p>
        <div className="flex items-center justify-center gap-2 text-lg font-semibold">
          <Timer className={cn(
            "h-4 w-4",
            sessaoIniciada ? "text-[#A0A0A0]" : "text-muted-foreground"
          )} />
          {modoAtual?.titulo} {modoAtual?.duracao}min
        </div>
        <p className={cn(
          "text-sm",
          sessaoIniciada ? "text-[#A0A0A0]" : "text-muted-foreground"
        )}>
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
              className={cn(
                "gap-2",
                sessaoIniciada
                  ? "border-[#444] text-[#A0A0A0] hover:text-[#F5F5F5] hover:border-[#666]"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={onReiniciarSessao}
            >
              <RotateCcw className="h-4 w-4" />
              Reiniciar
            </Botao>
            <Botao
              type="button"
              variant="outline"
              className={cn(
                "gap-2",
                sessaoIniciada
                  ? "border-[#444] text-[#A0A0A0] hover:text-[#F5F5F5] hover:border-[#666]"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={onEncerrarSessao}
            >
              <Square className="h-4 w-4" />
              Encerrar
            </Botao>
          </>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-xs font-semibold uppercase tracking-[0.2em]",
            sessaoIniciada ? "text-[#A0A0A0]" : "text-muted-foreground"
          )}>
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
          className={cn(
            "gap-2",
            sessaoIniciada
              ? "border-[#444] text-[#A0A0A0] hover:text-[#F5F5F5]"
              : "text-muted-foreground hover:text-foreground"
          )}
          onClick={onTestarSom}
          disabled={!somAtivado}
        >
          Testar som
        </Botao>
      </div>

      <div className={cn(
        "flex items-center gap-2 text-sm",
        sessaoIniciada ? "text-[#A0A0A0]" : "text-muted-foreground"
      )}>
        <Emblema variant="default" className="gap-1">
          <Zap className="h-3 w-3" />
          {sessaoIniciada
            ? `+${xpPreview} XP (1 XP/min)`
            : `+${Math.floor(totalSegundos / 60)} XP (1 XP/min)`}
        </Emblema>
      </div>
    </motion.section>
  )
}
