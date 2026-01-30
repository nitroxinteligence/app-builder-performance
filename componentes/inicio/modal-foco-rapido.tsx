"use client"

import * as React from "react"
import {
  CheckCircle2,
  Pause,
  Play,
  RotateCcw,
  Square,
} from "lucide-react"

import { Botao } from "@/componentes/ui/botao"
import { Progresso } from "@/componentes/ui/progresso"
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
import { Entrada } from "@/componentes/ui/entrada"
import { useTarefas } from "@/hooks/useTarefas"

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const modosFoco = [
  { id: "pomodoro", titulo: "Pomodoro", duracao: 25 },
  { id: "deep-work", titulo: "Deep Work", duracao: 45 },
  { id: "flowtime", titulo: "Flowtime", duracao: 60 },
  { id: "custom", titulo: "Personalizado", duracao: 30 },
] as const

const formatarTempo = (segundos: number) => {
  const minutos = Math.floor(segundos / 60)
  const restante = segundos % 60
  return `${String(minutos).padStart(2, "0")}:${String(restante).padStart(2, "0")}`
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface ModalFocoRapidoProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ModalFocoRapido({ open, onOpenChange }: ModalFocoRapidoProps) {
  const { data: tarefas = [] } = useTarefas()

  const tarefasDisponiveis = React.useMemo(
    () =>
      tarefas
        .filter((tarefa) => tarefa.coluna !== "concluido")
        .map((tarefa) => ({ id: tarefa.id, titulo: tarefa.titulo })),
    [tarefas]
  )

  const [modoSelecionado, setModoSelecionado] = React.useState(
    modosFoco[0].id as string
  )
  const [duracaoPersonalizada, setDuracaoPersonalizada] = React.useState(30)
  const [tarefaSelecionada, setTarefaSelecionada] = React.useState("")
  const [segundosRestantes, setSegundosRestantes] = React.useState(0)
  const [rodando, setRodando] = React.useState(false)
  const [sessaoIniciada, setSessaoIniciada] = React.useState(false)
  const [sessaoConcluida, setSessaoConcluida] = React.useState(false)

  const modoAtual =
    modoSelecionado === "custom"
      ? { ...modosFoco[3], duracao: duracaoPersonalizada }
      : modosFoco.find((m) => m.id === modoSelecionado) ?? modosFoco[0]
  const totalSegundos = (modoAtual.duracao ?? 25) * 60

  React.useEffect(() => {
    if (tarefasDisponiveis.length > 0 && !tarefaSelecionada) {
      setTarefaSelecionada(tarefasDisponiveis[0].id)
    }
  }, [tarefasDisponiveis, tarefaSelecionada])

  React.useEffect(() => {
    setSegundosRestantes(totalSegundos)
    setRodando(false)
    setSessaoIniciada(false)
    setSessaoConcluida(false)
  }, [totalSegundos])

  React.useEffect(() => {
    if (!rodando) return
    const intervalo = window.setInterval(() => {
      setSegundosRestantes((prev) => {
        if (prev <= 1) {
          setRodando(false)
          setSessaoConcluida(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => window.clearInterval(intervalo)
  }, [rodando])

  const progresso = totalSegundos
    ? (totalSegundos - segundosRestantes) / totalSegundos
    : 0

  const iniciarFoco = () => {
    setSessaoIniciada(true)
    setSessaoConcluida(false)
    setRodando(true)
  }

  const pausarFoco = () => setRodando(false)

  const reiniciarFoco = () => {
    setSegundosRestantes(totalSegundos)
    setRodando(false)
    setSessaoConcluida(false)
  }

  const encerrarFoco = () => {
    setSegundosRestantes(totalSegundos)
    setRodando(false)
    setSessaoIniciada(false)
    setSessaoConcluida(false)
  }

  return (
    <Dialogo open={open} onOpenChange={onOpenChange}>
      <DialogoConteudo className="max-w-2xl rounded-2xl border-border p-6">
        <DialogoCabecalho>
          <DialogoTitulo>Modo foco rápido</DialogoTitulo>
          <DialogoDescricao>
            Inicie uma sessão agora mesmo sem sair do dashboard.
          </DialogoDescricao>
        </DialogoCabecalho>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-border bg-card p-5 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Tempo restante
            </p>
            <p className="mt-3 font-titulo text-4xl font-semibold">
              {formatarTempo(segundosRestantes)}
            </p>
            <Progresso value={progresso * 100} className="mt-4" />
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {!rodando ? (
                <Botao onClick={iniciarFoco} className="gap-2">
                  <Play className="h-4 w-4" />
                  {sessaoIniciada ? "Retomar" : "Iniciar"}
                </Botao>
              ) : (
                <Botao variant="secondary" onClick={pausarFoco} className="gap-2">
                  <Pause className="h-4 w-4" />
                  Pausar
                </Botao>
              )}
              <Botao variant="outline" onClick={reiniciarFoco} className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Reiniciar
              </Botao>
              {sessaoIniciada ? (
                <Botao variant="destructive" onClick={encerrarFoco} className="gap-2">
                  <Square className="h-4 w-4" />
                  Encerrar
                </Botao>
              ) : null}
            </div>
            {sessaoConcluida ? (
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-success">
                <CheckCircle2 className="h-4 w-4" />
                Sessão concluída!
              </div>
            ) : null}
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="modo-foco-rapido">
                Modo
              </label>
              <Seletor value={modoSelecionado} onValueChange={setModoSelecionado}>
                <SeletorGatilho id="modo-foco-rapido">
                  <SeletorValor placeholder="Selecione" />
                </SeletorGatilho>
                <SeletorConteudo>
                  {modosFoco.map((modo) => (
                    <SeletorItem key={modo.id} value={modo.id}>
                      {modo.titulo}
                    </SeletorItem>
                  ))}
                </SeletorConteudo>
              </Seletor>
            </div>
            {modoSelecionado === "custom" ? (
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="tempo-personalizado">
                  Tempo (min)
                </label>
                <Entrada
                  id="tempo-personalizado"
                  type="number"
                  min={5}
                  max={180}
                  value={duracaoPersonalizada}
                  onChange={(event) =>
                    setDuracaoPersonalizada(Number(event.target.value || 0))
                  }
                />
              </div>
            ) : null}
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="tarefa-foco-rapido">
                Tarefa
              </label>
              <Seletor value={tarefaSelecionada} onValueChange={setTarefaSelecionada}>
                <SeletorGatilho id="tarefa-foco-rapido">
                  <SeletorValor placeholder="Selecione" />
                </SeletorGatilho>
                <SeletorConteudo>
                  {tarefasDisponiveis.map((tarefa) => (
                    <SeletorItem key={tarefa.id} value={tarefa.id}>
                      {tarefa.titulo}
                    </SeletorItem>
                  ))}
                </SeletorConteudo>
              </Seletor>
            </div>
            <DialogoRodape className="mt-4 sm:justify-end">
              <DialogoFechar asChild>
                <Botao variant="secondary">Fechar</Botao>
              </DialogoFechar>
            </DialogoRodape>
          </div>
        </div>
      </DialogoConteudo>
    </Dialogo>
  )
}
