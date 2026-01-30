"use client"

import * as React from "react"

import {
  getAvailableTasks,
  getCurrentUser,
  getFocusHistory,
  getFocusStats,
} from "@/app/(protegido)/foco/actions"
import type {
  FocusHistoryItem,
  FocusStatsDisplay,
  FocusTask,
} from "@/app/(protegido)/foco/types"

interface UseFocoHistoricoReturn {
  usuario: { name: string; totalXp: number; level: number } | null
  setUsuario: React.Dispatch<
    React.SetStateAction<{ name: string; totalXp: number; level: number } | null>
  >
  tarefasDisponiveis: FocusTask[]
  setTarefasDisponiveis: React.Dispatch<React.SetStateAction<FocusTask[]>>
  estatisticas: FocusStatsDisplay | null
  setEstatisticas: React.Dispatch<React.SetStateAction<FocusStatsDisplay | null>>
  historico: FocusHistoryItem[]
  historicoTotal: number
  historicoPagina: number
  totalPaginas: number
  carregandoHistorico: boolean
  carregando: boolean
  erro: string | null
  setErro: React.Dispatch<React.SetStateAction<string | null>>
  carregarDados: () => Promise<void>
  carregarHistorico: (pagina: number) => Promise<void>
}

export function useFocoHistorico(): UseFocoHistoricoReturn {
  const [usuario, setUsuario] = React.useState<{
    name: string
    totalXp: number
    level: number
  } | null>(null)
  const [tarefasDisponiveis, setTarefasDisponiveis] = React.useState<FocusTask[]>([])
  const [estatisticas, setEstatisticas] = React.useState<FocusStatsDisplay | null>(null)
  const [historico, setHistorico] = React.useState<FocusHistoryItem[]>([])
  const [historicoTotal, setHistoricoTotal] = React.useState(0)
  const [historicoPagina, setHistoricoPagina] = React.useState(1)
  const [carregandoHistorico, setCarregandoHistorico] = React.useState(false)
  const [carregando, setCarregando] = React.useState(true)
  const [erro, setErro] = React.useState<string | null>(null)

  const totalPaginas = Math.ceil(historicoTotal / 5)

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
    } finally {
      setCarregando(false)
    }
  }, [])

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

  return {
    usuario,
    setUsuario,
    tarefasDisponiveis,
    setTarefasDisponiveis,
    estatisticas,
    setEstatisticas,
    historico,
    historicoTotal,
    historicoPagina,
    totalPaginas,
    carregandoHistorico,
    carregando,
    erro,
    setErro,
    carregarDados,
    carregarHistorico,
  }
}
