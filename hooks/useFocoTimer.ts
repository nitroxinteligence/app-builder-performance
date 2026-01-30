"use client"

import * as React from "react"

import { FOCUS_MODES, type FocusModeOption } from "@/app/(protegido)/foco/types"

interface UseFocoTimerOptions {
  onComplete: () => void
}

interface UseFocoTimerReturn {
  // Mode
  modoSelecionado: string
  modoAtual: FocusModeOption | undefined
  duracaoPersonalizada: number
  totalSegundos: number
  aoSelecionarModo: (valor: string) => void
  aoAtualizarDuracaoPersonalizada: (valor: number) => void
  // Timer
  segundosRestantes: number
  setSegundosRestantes: React.Dispatch<React.SetStateAction<number>>
  rodando: boolean
  setRodando: React.Dispatch<React.SetStateAction<boolean>>
  progresso: number
  angulo: number
  tempoFocadoAtual: number
  // Audio
  somAtivado: boolean
  setSomAtivado: React.Dispatch<React.SetStateAction<boolean>>
  prepararSom: () => void
  tocarAlarme: () => void
  testarSom: () => void
  // Hydration
  estadoHidratado: boolean
  setEstadoHidratado: React.Dispatch<React.SetStateAction<boolean>>
  // Refs
  alarmeDisparadoRef: React.MutableRefObject<boolean>
  // Toggle classes
  toggleSomClasses: string
  togglePinoSomClasses: string
}

export function useFocoTimer({ onComplete }: UseFocoTimerOptions): UseFocoTimerReturn {
  const [modoSelecionado, setModoSelecionado] = React.useState(
    FOCUS_MODES[0]?.id ?? "pomodoro"
  )
  const [duracaoPersonalizada, setDuracaoPersonalizada] = React.useState(30)
  const [segundosRestantes, setSegundosRestantes] = React.useState(0)
  const [rodando, setRodando] = React.useState(false)
  const [somAtivado, setSomAtivado] = React.useState(true)
  const [estadoHidratado, setEstadoHidratado] = React.useState(false)

  const audioContextRef = React.useRef<AudioContext | null>(null)
  const alarmeDisparadoRef = React.useRef(false)

  const modoAtual = React.useMemo(() => {
    const modoBase =
      FOCUS_MODES.find((modo) => modo.id === modoSelecionado) ?? FOCUS_MODES[0]

    if (modoBase?.id === "custom") {
      return { ...modoBase, duracao: duracaoPersonalizada }
    }
    return modoBase
  }, [modoSelecionado, duracaoPersonalizada])

  const totalSegundos = modoAtual?.duracao ? modoAtual.duracao * 60 : 0
  const progresso = totalSegundos
    ? (totalSegundos - segundosRestantes) / totalSegundos
    : 0
  const angulo = Math.min(360, Math.max(0, progresso * 360))
  const tempoFocadoAtual = totalSegundos - segundosRestantes

  // Audio functions
  const prepararSom = React.useCallback(() => {
    if (typeof window === "undefined") return

    const AudioContextGlobal =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext

    if (!AudioContextGlobal) return

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextGlobal()
    }
    if (audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume()
    }
  }, [])

  const tocarAlarme = React.useCallback(() => {
    if (!somAtivado || typeof window === "undefined") return

    const AudioContextGlobal =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext

    if (!AudioContextGlobal) return

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

  const testarSom = React.useCallback(() => {
    if (!somAtivado) return
    prepararSom()
    tocarAlarme()
  }, [somAtivado, prepararSom, tocarAlarme])

  // Mode change handlers
  const aoSelecionarModo = React.useCallback(
    (valor: string) => {
      setModoSelecionado(valor)
      const modo = FOCUS_MODES.find((m) => m.id === valor)
      const duracao =
        valor === "custom"
          ? duracaoPersonalizada
          : modo?.duracao ?? FOCUS_MODES[0]?.duracao ?? 25
      setSegundosRestantes(duracao * 60)
    },
    [duracaoPersonalizada]
  )

  const aoAtualizarDuracaoPersonalizada = React.useCallback(
    (valor: number) => {
      const novaDuracao = Math.min(180, Math.max(5, Math.round(valor)))
      setDuracaoPersonalizada(novaDuracao)
      if (modoSelecionado === "custom") {
        setSegundosRestantes(novaDuracao * 60)
      }
    },
    [modoSelecionado]
  )

  // Timer countdown effect
  React.useEffect(() => {
    if (!rodando || !estadoHidratado) return

    if (segundosRestantes <= 0) {
      if (!alarmeDisparadoRef.current) {
        alarmeDisparadoRef.current = true
        onComplete()
      }
      return
    }

    const timeout = window.setTimeout(() => {
      setSegundosRestantes((prev) => Math.max(prev - 1, 0))
    }, 1000)

    return () => window.clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rodando, segundosRestantes, estadoHidratado])

  // Cleanup AudioContext on unmount
  React.useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close()
        audioContextRef.current = null
      }
    }
  }, [])

  // Toggle classes (computed)
  const toggleSomClasses = [
    "inline-flex h-5 w-9 items-center rounded-full border border-border p-0.5 transition-colors",
    somAtivado ? "bg-foreground" : "bg-secondary",
  ].join(" ")

  const togglePinoSomClasses = [
    "h-4 w-4 rounded-full bg-background transition-transform",
    somAtivado ? "translate-x-4" : "translate-x-0",
  ].join(" ")

  return {
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
    toggleSomClasses,
    togglePinoSomClasses,
  }
}
