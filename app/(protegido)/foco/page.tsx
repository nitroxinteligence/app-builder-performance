"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Botao } from "@/componentes/ui/botao"
import { ConfiguracaoTimer } from "@/componentes/foco/configuracao-timer"
import { EstatisticasFoco } from "@/componentes/foco/estatisticas-foco"
import { HistoricoSessoes } from "@/componentes/foco/historico-sessoes"
import { ModalConclusao } from "@/componentes/foco/modal-conclusao"
import { ModalTarefa } from "@/componentes/foco/modal-tarefa"
import { TimerDisplay } from "@/componentes/foco/timer-display"
import { useFocoTimer } from "@/hooks/useFocoTimer"
import { useFocoHistorico } from "@/hooks/useFocoHistorico"
import { useFocoSessao } from "@/hooks/useFocoSessao"

export default function PaginaFoco() {
  const inicializadoRef = React.useRef(false)

  // =========================================================================
  // DATA HOOK
  // =========================================================================
  const {
    usuario,
    setUsuario,
    tarefasDisponiveis,
    setTarefasDisponiveis,
    estatisticas,
    setEstatisticas,
    historico,
    historicoTotal,
    historicoPagina,
    carregandoHistorico,
    carregando,
    erro,
    setErro,
    carregarDados,
    carregarHistorico,
  } = useFocoHistorico()

  // =========================================================================
  // TIMER HOOK
  // =========================================================================
  const {
    modoSelecionado,
    modoAtual,
    duracaoPersonalizada,
    totalSegundos,
    aoSelecionarModo,
    aoAtualizarDuracaoPersonalizada,
    segundosRestantes,
    setSegundosRestantes,
    rodando,
    setRodando,
    progresso,
    angulo,
    tempoFocadoAtual,
    somAtivado,
    setSomAtivado,
    prepararSom,
    tocarAlarme,
    testarSom,
    estadoHidratado,
    setEstadoHidratado,
    alarmeDisparadoRef,
  } = useFocoTimer({
    onComplete: () => {
      // This will be called by the timer hook when countdown reaches 0.
      // The actual finalizarSessao is called from the session hook below.
      // We rely on the effect-based approach in useFocoSessao.
    },
  })

  // =========================================================================
  // SESSION HOOK
  // =========================================================================
  const {
    sessaoIniciada,
    sessaoConcluida,
    xpGanho,
    levelUp,
    mostrarModalTarefa,
    setMostrarModalTarefa,
    tarefaSelecionada,
    setTarefaSelecionada,
    alternarSessao,
    finalizarSessao,
    encerrarSessao,
    reiniciarSessao,
    atualizarModalConclusao,
    marcarTarefaConcluida,
    inicializarSessao,
  } = useFocoSessao({
    modoSelecionado,
    totalSegundos,
    tempoFocadoAtual,
    segundosRestantes,
    setSegundosRestantes,
    setRodando,
    setEstadoHidratado,
    alarmeDisparadoRef,
    prepararSom,
    tocarAlarme,
    setUsuario,
    usuario,
    setEstatisticas,
    setTarefasDisponiveis,
    setErro,
    carregarDados,
    carregarHistorico,
  })

  // =========================================================================
  // COMPUTED VALUES
  // =========================================================================
  const tarefaAtual = tarefasDisponiveis.find(
    (tarefa) => tarefa.id === tarefaSelecionada
  )

  // =========================================================================
  // INITIALIZATION
  // =========================================================================
  React.useEffect(() => {
    if (inicializadoRef.current) return
    inicializadoRef.current = true
    inicializarSessao()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Wire up the timer onComplete to actually call finalizarSessao
  React.useEffect(() => {
    if (!rodando || !estadoHidratado) return
    if (segundosRestantes <= 0) {
      if (!alarmeDisparadoRef.current) {
        alarmeDisparadoRef.current = true
        finalizarSessao()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rodando, segundosRestantes, estadoHidratado])

  // =========================================================================
  // SOUND TOGGLE HANDLER
  // =========================================================================
  const alternarSom = () => {
    setSomAtivado((prev) => {
      const novoValor = !prev
      if (novoValor) {
        prepararSom()
      }
      return novoValor
    })
  }

  // =========================================================================
  // MODE CHANGE HANDLER (blocks during session)
  // =========================================================================
  const aoSelecionarModoProtegido = (valor: string) => {
    if (sessaoIniciada) return
    aoSelecionarModo(valor)
  }

  const aoAtualizarDuracaoProtegida = (valor: number) => {
    if (sessaoIniciada) return
    aoAtualizarDuracaoPersonalizada(valor)
  }

  // =========================================================================
  // RENDER
  // =========================================================================
  if (carregando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Exibição de Erro */}
      {erro && (
        <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2">
          <div className="mx-auto max-w-md rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-destructive">
            <p className="text-sm font-medium">{erro}</p>
            <Botao
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => {
                setErro(null)
                carregarDados()
              }}
            >
              Tentar novamente
            </Botao>
          </div>
        </div>
      )}

      {/* Modal: Sessão Concluída */}
      <ModalConclusao
        aberto={sessaoConcluida}
        onOpenChange={atualizarModalConclusao}
        levelUp={levelUp}
        nivelUsuario={usuario?.level ?? 1}
        tituloTarefa={tarefaAtual?.titulo ?? null}
        tempoFocadoAtual={tempoFocadoAtual}
        xpGanho={xpGanho}
      />

      {/* Modal: Marcar Tarefa como Concluída */}
      <ModalTarefa
        aberto={mostrarModalTarefa}
        onOpenChange={setMostrarModalTarefa}
        tarefaAtual={tarefaAtual}
        onMarcarConcluida={marcarTarefaConcluida}
      />

      <main id="main-content" className="flex-1 px-6 py-10">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
            {/* Header */}
            <section className="flex items-center gap-3">
              <Link
                href="/inicio"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition hover:text-foreground"
                aria-label="Voltar para início"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div>
                <h1 className="font-titulo text-2xl font-semibold">Foco</h1>
                <p className="text-sm text-muted-foreground">
                  Modo imersivo para sessões profundas.
                </p>
              </div>
            </section>

            {/* Stats Cards */}
            {estatisticas && (
              <EstatisticasFoco estatisticas={estatisticas} />
            )}

            {/* Task and Mode Selection */}
            <ConfiguracaoTimer
              modoSelecionado={modoSelecionado}
              aoSelecionarModo={aoSelecionarModoProtegido}
              tarefaSelecionada={tarefaSelecionada}
              aoSelecionarTarefa={setTarefaSelecionada}
              tarefasDisponiveis={tarefasDisponiveis}
              duracaoPersonalizada={duracaoPersonalizada}
              aoAtualizarDuracaoPersonalizada={aoAtualizarDuracaoProtegida}
              sessaoIniciada={sessaoIniciada}
            />

            {/* Timer */}
            <TimerDisplay
              segundosRestantes={segundosRestantes}
              totalSegundos={totalSegundos}
              progresso={progresso}
              angulo={angulo}
              modoAtual={modoAtual}
              tarefaAtual={tarefaAtual}
              rodando={rodando}
              sessaoIniciada={sessaoIniciada}
              tempoFocadoAtual={tempoFocadoAtual}
              somAtivado={somAtivado}
              onAlternarSessao={alternarSessao}
              onReiniciarSessao={reiniciarSessao}
              onEncerrarSessao={encerrarSessao}
              onAlternarSom={alternarSom}
              onTestarSom={testarSom}
            />

            {/* History */}
            <HistoricoSessoes
              historico={historico}
              historicoTotal={historicoTotal}
              historicoPagina={historicoPagina}
              carregandoHistorico={carregandoHistorico}
              onCarregarHistorico={carregarHistorico}
            />
          </div>
        </main>
    </>
  )
}
