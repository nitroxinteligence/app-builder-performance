"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  History,
  Pause,
  Play,
  RotateCcw,
  Square,
  Target,
  Timer,
  TrendingUp,
  Zap,
} from "lucide-react"

import { Botao } from "@/componentes/ui/botao"
import {
  Cartao,
  CartaoConteudo,
  CartaoDescricao,
  CartaoTitulo,
} from "@/componentes/ui/cartao"
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
import { Sidebar } from "@/componentes/layout/sidebar"
import { cn } from "@/lib/utilidades"
import {
  cancelFocusSession,
  completeFocusSession,
  createFocusSession,
  getActiveSession,
  getAvailableTasks,
  getCurrentUser,
  getFocusHistory,
  getFocusStats,
  markTaskAsCompleted,
  updateFocusSession,
} from "./actions"
import {
  FOCUS_MODES,
  formatDuration,
  formatDurationLong,
  type ActiveSessionState,
  type FocusHistoryItem,
  type FocusPause,
  type FocusStatsDisplay,
  type FocusTask,
} from "./types"

const obterDuracaoPorModo = (modoId: string, duracaoCustomizada: number) => {
  if (modoId === "custom") {
    return duracaoCustomizada
  }

  const modo = FOCUS_MODES.find((item) => item.id === modoId)
  return modo?.duracao ?? FOCUS_MODES[0]?.duracao ?? 25
}

export default function PaginaFoco() {
  // =========================================================================
  // SIDEBAR STATE
  // =========================================================================
  const [sidebarAberta, setSidebarAberta] = React.useState(false)

  // =========================================================================
  // USER STATE
  // =========================================================================
  const [usuario, setUsuario] = React.useState<{
    name: string
    totalXp: number
    level: number
  } | null>(null)

  // =========================================================================
  // DATA STATE
  // =========================================================================
  const [tarefasDisponiveis, setTarefasDisponiveis] = React.useState<FocusTask[]>([])
  const [estatisticas, setEstatisticas] = React.useState<FocusStatsDisplay | null>(null)
  const [historico, setHistorico] = React.useState<FocusHistoryItem[]>([])
  const [historicoTotal, setHistoricoTotal] = React.useState(0)
  const [historicoPagina, setHistoricoPagina] = React.useState(1)
  const [carregando, setCarregando] = React.useState(true)
  const [erro, setErro] = React.useState<string | null>(null)
  const [carregandoHistorico, setCarregandoHistorico] = React.useState(false)

  // =========================================================================
  // TIMER STATE
  // =========================================================================
  const [modoSelecionado, setModoSelecionado] = React.useState(
    FOCUS_MODES[0]?.id ?? "pomodoro"
  )
  const [tarefaSelecionada, setTarefaSelecionada] = React.useState("")
  const [duracaoPersonalizada, setDuracaoPersonalizada] = React.useState(30)
  const [sessionId, setSessionId] = React.useState<string | null>(null)
  const [segundosRestantes, setSegundosRestantes] = React.useState(0)
  const [rodando, setRodando] = React.useState(false)
  const [sessaoIniciada, setSessaoIniciada] = React.useState(false)
  const [pausas, setPausas] = React.useState<FocusPause[]>([])
  const [pausaAtualInicio, setPausaAtualInicio] = React.useState<string | null>(null)
  const [sessaoStartedAt, setSessaoStartedAt] = React.useState<string | null>(null)

  // =========================================================================
  // MODAL STATE
  // =========================================================================
  const [sessaoConcluida, setSessaoConcluida] = React.useState(false)
  const [xpGanho, setXpGanho] = React.useState(0)
  const [levelUp, setLevelUp] = React.useState(false)
  const [mostrarModalTarefa, setMostrarModalTarefa] = React.useState(false)

  // =========================================================================
  // AUDIO STATE
  // =========================================================================
  const [somAtivado, setSomAtivado] = React.useState(true)
  const [estadoHidratado, setEstadoHidratado] = React.useState(false)
  const audioContextRef = React.useRef<AudioContext | null>(null)
  const alarmeDisparadoRef = React.useRef(false)
  const inicializadoRef = React.useRef(false)

  // =========================================================================
  // COMPUTED VALUES
  // =========================================================================
  const modoAtual = React.useMemo(() => {
    const modoBase =
      FOCUS_MODES.find((modo) => modo.id === modoSelecionado) ?? FOCUS_MODES[0]

    if (modoBase?.id === "custom") {
      return {
        ...modoBase,
        duracao: duracaoPersonalizada,
      }
    }

    return modoBase
  }, [modoSelecionado, duracaoPersonalizada])

  const totalSegundos = modoAtual?.duracao ? modoAtual.duracao * 60 : 0
  const tarefaAtual = tarefasDisponiveis.find(
    (tarefa) => tarefa.id === tarefaSelecionada
  )
  const progresso = totalSegundos
    ? (totalSegundos - segundosRestantes) / totalSegundos
    : 0
  const angulo = Math.min(360, Math.max(0, progresso * 360))
  const tempoFocadoAtual = totalSegundos - segundosRestantes

  // =========================================================================
  // STYLE CLASSES
  // =========================================================================
  const toggleSomClasses = cn(
    "inline-flex h-5 w-9 items-center rounded-full border border-border p-0.5 transition-colors",
    somAtivado ? "bg-foreground" : "bg-secondary"
  )
  const togglePinoSomClasses = cn(
    "h-4 w-4 rounded-full bg-background shadow-sm transition-transform",
    somAtivado ? "translate-x-4" : "translate-x-0"
  )

  // =========================================================================
  // AUDIO FUNCTIONS
  // =========================================================================
  const prepararSom = React.useCallback(() => {
    if (typeof window === "undefined") {
      return
    }

    const AudioContextGlobal =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext

    if (!AudioContextGlobal) {
      return
    }

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextGlobal()
    }

    if (audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume()
    }
  }, [])

  const tocarAlarme = React.useCallback(() => {
    if (!somAtivado) {
      return
    }

    if (typeof window === "undefined") {
      return
    }

    const AudioContextGlobal =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext

    if (!AudioContextGlobal) {
      return
    }

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextGlobal()
    }

    const contexto = audioContextRef.current

    if (contexto.state === "suspended") {
      contexto.resume()
    }

    const agora = contexto.currentTime
    const frequencias = [980, 1170, 980, 1170]
    const duracaoPulso = 0.35
    const intervalo = 0.45

    const criarPulso = (offset: number, frequencia: number) => {
      const oscilador = contexto.createOscillator()
      const ganho = contexto.createGain()
      oscilador.type = "square"
      oscilador.frequency.value = frequencia
      ganho.gain.value = 0.0001
      oscilador.connect(ganho)
      ganho.connect(contexto.destination)
      oscilador.start(agora + offset)
      ganho.gain.exponentialRampToValueAtTime(0.35, agora + offset + 0.03)
      ganho.gain.exponentialRampToValueAtTime(
        0.0001,
        agora + offset + duracaoPulso
      )
      oscilador.stop(agora + offset + duracaoPulso + 0.05)
    }

    frequencias.forEach((freq, index) => {
      criarPulso(intervalo * index, freq)
    })
  }, [somAtivado])

  const testarSom = () => {
    if (!somAtivado) {
      return
    }
    prepararSom()
    tocarAlarme()
  }

  // =========================================================================
  // DATA FETCHING
  // =========================================================================
  const carregarDados = React.useCallback(async () => {
    try {
      const [tarefasRes, statsRes, historicoRes, usuarioRes] = await Promise.all([
        getAvailableTasks(),
        getFocusStats(),
        getFocusHistory({}, { page: 1, limit: 5 }),
        getCurrentUser(),
      ])

      if (tarefasRes.success && tarefasRes.data) {
        setTarefasDisponiveis(tarefasRes.data)
        if (tarefasRes.data.length > 0 && !tarefaSelecionada) {
          setTarefaSelecionada(tarefasRes.data[0].id)
        }
      }

      if (statsRes.success && statsRes.data) {
        setEstatisticas(statsRes.data)
      }

      if (historicoRes.success && historicoRes.data) {
        setHistorico(historicoRes.data.data)
        setHistoricoTotal(historicoRes.data.total)
      }

      if (usuarioRes.success && usuarioRes.data) {
        setUsuario(usuarioRes.data)
      }
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : "Erro ao carregar dados"
      setErro(mensagem)
    }
  }, [tarefaSelecionada])

  const carregarHistorico = React.useCallback(async (pagina: number) => {
    setCarregandoHistorico(true)
    try {
      const res = await getFocusHistory({}, { page: pagina, limit: 5 })
      if (res.success && res.data) {
        setHistorico(res.data.data)
        setHistoricoTotal(res.data.total)
        setHistoricoPagina(pagina)
      }
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : "Erro ao carregar histórico"
      setErro(mensagem)
    } finally {
      setCarregandoHistorico(false)
    }
  }, [])

  // =========================================================================
  // SESSION MANAGEMENT
  // =========================================================================
  const iniciarSessao = async () => {
    prepararSom()
    alarmeDisparadoRef.current = false

    const duracaoSegundos = modoAtual?.duracao ? modoAtual.duracao * 60 : 1500

    const res = await createFocusSession({
      taskId: tarefaSelecionada || null,
      modo: modoSelecionado,
      duracaoPlanejada: duracaoSegundos,
    })

    if (res.success && res.data) {
      setSessionId(res.data.sessionId)
      setSegundosRestantes(duracaoSegundos)
      setSessaoIniciada(true)
      setSessaoConcluida(false)
      setRodando(true)
      setPausas([])
      setPausaAtualInicio(null)
      setSessaoStartedAt(new Date().toISOString())

      // Save to localStorage for recovery
      salvarEstadoLocal({
        sessionId: res.data.sessionId,
        taskId: tarefaSelecionada || null,
        modo: modoSelecionado,
        duracaoPlanejada: duracaoSegundos,
        segundosRestantes: duracaoSegundos,
        rodando: true,
        pausas: [],
        startedAt: new Date().toISOString(),
        currentPauseStart: null,
      })
    } else {
      setErro(res.error ?? "Erro ao iniciar sessão")
    }
  }

  const pausarSessao = async () => {
    setRodando(false)
    const pauseStart = new Date().toISOString()
    setPausaAtualInicio(pauseStart)

    if (sessionId) {
      await updateFocusSession({
        sessionId,
        status: "paused",
        duracaoReal: tempoFocadoAtual,
      })

      salvarEstadoLocal({
        sessionId,
        taskId: tarefaSelecionada || null,
        modo: modoSelecionado,
        duracaoPlanejada: totalSegundos,
        segundosRestantes,
        rodando: false,
        pausas,
        startedAt: sessaoStartedAt ?? new Date().toISOString(),
        currentPauseStart: pauseStart,
      })
    }
  }

  const retomarSessao = async () => {
    prepararSom()

    if (pausaAtualInicio) {
      const pausaDuracao = Math.floor(
        (Date.now() - new Date(pausaAtualInicio).getTime()) / 1000
      )
      const novaPausa: FocusPause = {
        started_at: pausaAtualInicio,
        ended_at: new Date().toISOString(),
        duration: pausaDuracao,
      }
      const novasPausas = [...pausas, novaPausa]
      setPausas(novasPausas)
      setPausaAtualInicio(null)

      if (sessionId) {
        await updateFocusSession({
          sessionId,
          status: "active",
          pausas: novasPausas,
        })
      }
    }

    setRodando(true)

    if (sessionId) {
      salvarEstadoLocal({
        sessionId,
        taskId: tarefaSelecionada || null,
        modo: modoSelecionado,
        duracaoPlanejada: totalSegundos,
        segundosRestantes,
        rodando: true,
        pausas,
        startedAt: sessaoStartedAt ?? new Date().toISOString(),
        currentPauseStart: null,
      })
    }
  }

  const alternarSessao = () => {
    if (!sessaoIniciada) {
      iniciarSessao()
      return
    }

    if (rodando) {
      pausarSessao()
    } else {
      retomarSessao()
    }
  }

  const finalizarSessao = async () => {
    if (!sessionId) return

    setRodando(false)
    tocarAlarme()

    const res = await completeFocusSession({
      sessionId,
      duracaoReal: tempoFocadoAtual,
    })

    if (res.success && res.data) {
      setXpGanho(res.data.xpEarned)
      setLevelUp(res.data.levelUp)

      // Update local user state
      if (usuario) {
        setUsuario({
          ...usuario,
          totalXp: res.data.newTotalXp,
          level: res.data.newLevel,
        })
      }
    }

    setSessaoConcluida(true)
    limparEstadoLocal()

    // Reload stats and history
    await Promise.all([
      getFocusStats().then((r) => r.success && r.data && setEstatisticas(r.data)),
      carregarHistorico(1),
    ])

    // If there's a task, show the task completion modal
    if (tarefaSelecionada) {
      setMostrarModalTarefa(true)
    }
  }

  const encerrarSessao = async () => {
    if (sessionId) {
      await cancelFocusSession(sessionId)
    }
    resetarSessao()
    limparEstadoLocal()
  }

  const reiniciarSessao = async () => {
    if (sessionId) {
      await cancelFocusSession(sessionId)
    }
    setSessionId(null)
    setSessaoIniciada(false)
    setSessaoConcluida(false)
    setRodando(false)
    setSegundosRestantes(totalSegundos)
    setPausas([])
    setPausaAtualInicio(null)
    alarmeDisparadoRef.current = false
    limparEstadoLocal()
  }

  const resetarSessao = () => {
    setSessionId(null)
    setSessaoIniciada(false)
    setSessaoConcluida(false)
    setRodando(false)
    setSegundosRestantes(totalSegundos)
    setPausas([])
    setPausaAtualInicio(null)
    alarmeDisparadoRef.current = false
  }

  // =========================================================================
  // LOCAL STORAGE
  // =========================================================================
  const salvarEstadoLocal = (estado: ActiveSessionState) => {
    try {
      localStorage.setItem("foco-sessao", JSON.stringify(estado))
    } catch {
      // Ignore localStorage errors
    }
  }

  const limparEstadoLocal = () => {
    try {
      localStorage.removeItem("foco-sessao")
    } catch {
      // Ignore
    }
  }

  const restaurarEstadoLocal = React.useCallback(async () => {
    try {
      const armazenado = localStorage.getItem("foco-sessao")
      if (!armazenado) return false

      const estado: ActiveSessionState = JSON.parse(armazenado)

      // Check if session still exists in DB
      const activeRes = await getActiveSession()
      if (!activeRes.success || !activeRes.data) {
        limparEstadoLocal()
        return false
      }

      // Restore state
      setSessionId(estado.sessionId)
      setTarefaSelecionada(estado.taskId ?? "")
      setModoSelecionado(estado.modo)

      const duracaoMinutos = estado.duracaoPlanejada / 60
      if (estado.modo === "custom") {
        setDuracaoPersonalizada(duracaoMinutos)
      }

      setPausas(estado.pausas)
      setSessaoStartedAt(estado.startedAt)
      setSessaoIniciada(true)

      if (estado.rodando) {
        // Calculate elapsed time since last save
        const tempoDecorrido = Math.floor(
          (Date.now() - new Date(estado.startedAt).getTime()) / 1000
        )
        const tempoEmPausas = estado.pausas.reduce((acc, p) => acc + p.duration, 0)
        const tempoFocado = tempoDecorrido - tempoEmPausas
        const restante = Math.max(0, estado.duracaoPlanejada - tempoFocado)

        if (restante > 0) {
          setSegundosRestantes(restante)
          setRodando(true)
        } else {
          // Session should have ended
          setSegundosRestantes(0)
          setRodando(false)
          finalizarSessao()
        }
      } else {
        setSegundosRestantes(estado.segundosRestantes)
        setRodando(false)
        if (estado.currentPauseStart) {
          setPausaAtualInicio(estado.currentPauseStart)
        }
      }

      return true
    } catch {
      limparEstadoLocal()
      return false
    }
    // Note: finalizarSessao is intentionally not in deps to avoid stale closure issues
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // =========================================================================
  // EFFECTS
  // =========================================================================

  // Initial data load - uses ref to prevent double initialization in StrictMode
  React.useEffect(() => {
    if (inicializadoRef.current) return
    inicializadoRef.current = true

    const init = async () => {
      await carregarDados()
      const restored = await restaurarEstadoLocal()
      if (!restored) {
        setSegundosRestantes(totalSegundos)
      }
      setEstadoHidratado(true)
      setCarregando(false)
    }
    init()
    // Note: carregarDados, restaurarEstadoLocal, and totalSegundos are intentionally not
    // in deps to prevent re-initialization on every change. The ref guards against re-runs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Timer countdown
  // Note: finalizarSessao is intentionally not in deps to avoid stale closure issues.
  // The alarmeDisparadoRef prevents multiple calls when segundosRestantes reaches 0.
  React.useEffect(() => {
    if (!rodando || !estadoHidratado) return

    if (segundosRestantes <= 0) {
      if (!alarmeDisparadoRef.current) {
        alarmeDisparadoRef.current = true
        finalizarSessao()
      }
      return
    }

    const timeout = window.setTimeout(() => {
      setSegundosRestantes((prev) => Math.max(prev - 1, 0))
    }, 1000)

    return () => window.clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rodando, segundosRestantes, estadoHidratado])

  // Update localStorage when state changes
  React.useEffect(() => {
    if (!estadoHidratado || !sessionId || !sessaoIniciada) return

    salvarEstadoLocal({
      sessionId,
      taskId: tarefaSelecionada || null,
      modo: modoSelecionado,
      duracaoPlanejada: totalSegundos,
      segundosRestantes,
      rodando,
      pausas,
      startedAt: sessaoStartedAt ?? new Date().toISOString(),
      currentPauseStart: pausaAtualInicio,
    })
  }, [
    estadoHidratado,
    sessionId,
    sessaoIniciada,
    segundosRestantes,
    rodando,
    pausas,
    pausaAtualInicio,
    tarefaSelecionada,
    modoSelecionado,
    totalSegundos,
    sessaoStartedAt,
  ])

  // Save partial session on page unload
  React.useEffect(() => {
    const handleBeforeUnload = () => {
      if (sessionId && sessaoIniciada && tempoFocadoAtual > 0) {
        // Use sendBeacon for reliable delivery
        const payload = JSON.stringify({
          sessionId,
          duracaoReal: tempoFocadoAtual,
          pausas,
        })

        navigator.sendBeacon?.(
          "/api/foco/save-partial",
          new Blob([payload], { type: "application/json" })
        )
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [sessionId, sessaoIniciada, tempoFocadoAtual, pausas])

  // Cleanup AudioContext on unmount to prevent memory leak
  React.useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close()
        audioContextRef.current = null
      }
    }
  }, [])

  // Handle mode change
  const aoSelecionarModo = (valor: string) => {
    if (sessaoIniciada) return // Don't change mode during session

    setModoSelecionado(valor)
    const duracaoBase = obterDuracaoPorModo(valor, duracaoPersonalizada)
    setSegundosRestantes(duracaoBase * 60)
  }

  const aoAtualizarDuracaoPersonalizada = (valor: number) => {
    if (sessaoIniciada) return

    const novaDuracao = Math.min(180, Math.max(5, Math.round(valor)))
    setDuracaoPersonalizada(novaDuracao)

    if (modoSelecionado === "custom") {
      setSegundosRestantes(novaDuracao * 60)
    }
  }

  // =========================================================================
  // TASK COMPLETION
  // =========================================================================
  const marcarTarefaConcluida = async () => {
    if (!tarefaSelecionada) return

    await markTaskAsCompleted(tarefaSelecionada)
    setMostrarModalTarefa(false)

    // Reload tasks
    const res = await getAvailableTasks()
    if (res.success && res.data) {
      setTarefasDisponiveis(res.data)
      if (res.data.length > 0) {
        setTarefaSelecionada(res.data[0].id)
      } else {
        setTarefaSelecionada("")
      }
    }
  }

  // =========================================================================
  // MODAL HANDLERS
  // =========================================================================
  const atualizarModalConclusao = (aberto: boolean) => {
    setSessaoConcluida(aberto)
    if (!aberto) {
      resetarSessao()
    }
  }

  // =========================================================================
  // UI HELPERS
  // =========================================================================
  const textoBotaoControle = rodando
    ? "Pausar"
    : sessaoIniciada
      ? "Retomar"
      : "Iniciar"
  const IconeControle = rodando ? Pause : Play

  // Calculate XP preview
  const xpPreview = Math.floor(tempoFocadoAtual / 60)

  // Pagination
  const totalPaginas = Math.ceil(historicoTotal / 5)

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
    <div className="min-h-screen bg-background text-foreground">
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
      <Dialogo open={sessaoConcluida} onOpenChange={atualizarModalConclusao}>
        <DialogoConteudo className="max-w-lg rounded-2xl border-border p-6">
          <DialogoCabecalho>
            <DialogoTitulo>
              {levelUp ? "🎉 Você subiu de nível!" : "Sessão finalizada"}
            </DialogoTitulo>
            <DialogoDescricao>
              {levelUp
                ? `Parabéns! Você alcançou o nível ${usuario?.level ?? 1}!`
                : "Excelente foco! Sua sessão foi registrada com sucesso."}
            </DialogoDescricao>
          </DialogoCabecalho>
          <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">
              {tarefaAtual?.titulo ?? "Sessão livre"}
            </p>
            <div className="mt-2 flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatDurationLong(tempoFocadoAtual)}
              </span>
              <span className="flex items-center gap-1 text-primary">
                <Zap className="h-4 w-4" />
                +{xpGanho} XP
              </span>
            </div>
          </div>
          <DialogoRodape className="mt-6 sm:justify-between">
            <DialogoFechar asChild>
              <Botao variant="outline">Continuar no foco</Botao>
            </DialogoFechar>
            <Botao asChild>
              <Link href="/tarefas">Ir para tarefas</Link>
            </Botao>
          </DialogoRodape>
        </DialogoConteudo>
      </Dialogo>

      {/* Modal: Marcar Tarefa como Concluída */}
      <Dialogo open={mostrarModalTarefa} onOpenChange={setMostrarModalTarefa}>
        <DialogoConteudo className="max-w-lg rounded-2xl border-border p-6">
          <DialogoCabecalho>
            <DialogoTitulo>Marcar tarefa como concluída?</DialogoTitulo>
            <DialogoDescricao>
              Você completou uma sessão de foco na tarefa abaixo. Deseja
              marcá-la como concluída no Kanban?
            </DialogoDescricao>
          </DialogoCabecalho>
          <div className="rounded-xl border border-border bg-card p-4 text-sm">
            <p className="font-medium text-foreground">
              {tarefaAtual?.titulo ?? "Tarefa"}
            </p>
            <p className="text-muted-foreground">{tarefaAtual?.coluna}</p>
          </div>
          <DialogoRodape className="mt-6 sm:justify-between">
            <Botao
              variant="outline"
              onClick={() => setMostrarModalTarefa(false)}
            >
              Não, continuar depois
            </Botao>
            <Botao onClick={marcarTarefaConcluida}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Sim, concluir tarefa
            </Botao>
          </DialogoRodape>
        </DialogoConteudo>
      </Dialogo>

      {/* Sidebar */}
      <Sidebar open={sidebarAberta} onOpenChange={setSidebarAberta} />

      {/* Main Content */}
      <div
        className={cn(
          "flex min-h-screen flex-col transition-[padding] duration-300",
          sidebarAberta ? "lg:pl-56" : "lg:pl-16"
        )}
      >
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
              <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Cartao>
                  <CartaoConteudo className="flex items-center gap-4 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Target className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-semibold">
                        {estatisticas.totalSessions}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Sessões totais
                      </p>
                    </div>
                  </CartaoConteudo>
                </Cartao>
                <Cartao>
                  <CartaoConteudo className="flex items-center gap-4 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-semibold">
                        {estatisticas.totalHours}h {estatisticas.totalMinutes}m
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Tempo total
                      </p>
                    </div>
                  </CartaoConteudo>
                </Cartao>
                <Cartao>
                  <CartaoConteudo className="flex items-center gap-4 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 text-green-500">
                      <Zap className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-semibold">
                        {estatisticas.totalXp}
                      </p>
                      <p className="text-xs text-muted-foreground">XP ganho</p>
                    </div>
                  </CartaoConteudo>
                </Cartao>
                <Cartao>
                  <CartaoConteudo className="flex items-center gap-4 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-semibold">
                        {estatisticas.averageMinutes}min
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Média por sessão
                      </p>
                    </div>
                  </CartaoConteudo>
                </Cartao>
              </section>
            )}

            {/* Task and Mode Selection */}
            <section className="grid gap-4 lg:grid-cols-2">
              <Cartao>
                <CartaoConteudo className="space-y-3 p-5">
                  <div>
                    <CartaoTitulo className="text-base">
                      Tarefa do Kanban
                    </CartaoTitulo>
                    <CartaoDescricao>
                      Escolha o que você quer concluir nesta sessão.
                    </CartaoDescricao>
                  </div>
                  <Seletor
                    value={tarefaSelecionada}
                    onValueChange={setTarefaSelecionada}
                    disabled={sessaoIniciada}
                  >
                    <SeletorGatilho>
                      <SeletorValor placeholder="Selecione uma tarefa" />
                    </SeletorGatilho>
                    <SeletorConteudo>
                      {tarefasDisponiveis.length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground">
                          Nenhuma tarefa disponível
                        </div>
                      ) : (
                        tarefasDisponiveis.map((tarefa) => (
                          <SeletorItem key={tarefa.id} value={tarefa.id}>
                            {tarefa.titulo} • {tarefa.coluna}
                          </SeletorItem>
                        ))
                      )}
                    </SeletorConteudo>
                  </Seletor>
                </CartaoConteudo>
              </Cartao>

              <Cartao>
                <CartaoConteudo className="space-y-3 p-5">
                  <div>
                    <CartaoTitulo className="text-base">
                      Modo de foco
                    </CartaoTitulo>
                    <CartaoDescricao>
                      Defina a duração que melhor combina com seu ritmo.
                    </CartaoDescricao>
                  </div>
                  <Seletor
                    value={modoSelecionado}
                    onValueChange={aoSelecionarModo}
                    disabled={sessaoIniciada}
                  >
                    <SeletorGatilho>
                      <SeletorValor placeholder="Selecione o modo" />
                    </SeletorGatilho>
                    <SeletorConteudo>
                      {FOCUS_MODES.map((modo) => (
                        <SeletorItem key={modo.id} value={modo.id}>
                          {modo.titulo} •{" "}
                          {modo.id === "custom"
                            ? `${duracaoPersonalizada} min`
                            : `${modo.duracao} min`}
                        </SeletorItem>
                      ))}
                    </SeletorConteudo>
                  </Seletor>
                  {modoSelecionado === "custom" && !sessaoIniciada ? (
                    <div className="flex flex-col gap-2 rounded-xl border border-border bg-muted/40 p-3">
                      <label
                        htmlFor="duracao-personalizada"
                        className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"
                      >
                        Defina o tempo (min)
                      </label>
                      <input
                        id="duracao-personalizada"
                        type="number"
                        min={5}
                        max={180}
                        step={5}
                        value={duracaoPersonalizada}
                        onChange={(event) => {
                          const valor = Number(event.target.value)
                          if (Number.isNaN(valor)) {
                            return
                          }
                          aoAtualizarDuracaoPersonalizada(valor)
                        }}
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                      <p className="text-xs text-muted-foreground">
                        Ajuste entre 5 e 180 minutos.
                      </p>
                    </div>
                  ) : null}
                </CartaoConteudo>
              </Cartao>
            </section>

            {/* Timer */}
            <section className="flex flex-col items-center gap-6 rounded-3xl border border-border bg-card px-6 py-12 text-center">
              <div className="relative flex h-48 w-48 items-center justify-center">
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
                  onClick={alternarSessao}
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
                      onClick={reiniciarSessao}
                    >
                      <RotateCcw className="h-4 w-4" />
                      Reiniciar
                    </Botao>
                    <Botao
                      type="button"
                      variant="outline"
                      className="gap-2 text-muted-foreground hover:text-foreground"
                      onClick={encerrarSessao}
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
                    onClick={() => {
                      setSomAtivado((prev) => {
                        const novoValor = !prev
                        if (novoValor) {
                          prepararSom()
                        }
                        return novoValor
                      })
                    }}
                  >
                    <span className={togglePinoSomClasses} />
                  </button>
                </div>
                <Botao
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2 text-muted-foreground hover:text-foreground"
                  onClick={testarSom}
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

            {/* History */}
            {historico.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <History className="h-5 w-5 text-muted-foreground" />
                    <h2 className="font-titulo text-lg font-semibold">
                      Histórico de Sessões
                    </h2>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {historicoTotal} sessões completadas
                  </p>
                </div>

                <div className="space-y-2">
                  {historico.map((sessao) => (
                    <div
                      key={sessao.id}
                      className="flex items-center justify-between rounded-xl border border-border bg-card p-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                          <Timer className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {sessao.taskTitulo ?? "Sessão livre"}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{sessao.modoDisplay}</span>
                            <span>•</span>
                            <span>
                              {new Date(sessao.startedAt).toLocaleDateString(
                                "pt-BR",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {formatDurationLong(sessao.duracaoReal)}
                        </div>
                        <div className="flex items-center gap-1 text-primary">
                          <Zap className="h-4 w-4" />
                          +{sessao.xpGanho} XP
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPaginas > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    <Botao
                      variant="outline"
                      size="sm"
                      onClick={() => carregarHistorico(historicoPagina - 1)}
                      disabled={historicoPagina === 1 || carregandoHistorico}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Botao>
                    <span className="text-sm text-muted-foreground">
                      Página {historicoPagina} de {totalPaginas}
                    </span>
                    <Botao
                      variant="outline"
                      size="sm"
                      onClick={() => carregarHistorico(historicoPagina + 1)}
                      disabled={historicoPagina === totalPaginas || carregandoHistorico}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Botao>
                  </div>
                )}
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
