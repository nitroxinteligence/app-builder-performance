'use client'

import { useState, useCallback } from 'react'

export interface EstadoConfirmar {
  aberto: boolean
  confirmar: () => Promise<boolean>
  onConfirmar: () => void
  onCancelar: () => void
}

export function useConfirmar(): EstadoConfirmar {
  const [aberto, setAberto] = useState(false)
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(
    null
  )

  const confirmar = useCallback(() => {
    return new Promise<boolean>((resolve) => {
      setResolver(() => resolve)
      setAberto(true)
    })
  }, [])

  const onConfirmar = useCallback(() => {
    resolver?.(true)
    setAberto(false)
    setResolver(null)
  }, [resolver])

  const onCancelar = useCallback(() => {
    resolver?.(false)
    setAberto(false)
    setResolver(null)
  }, [resolver])

  return { aberto, confirmar, onConfirmar, onCancelar }
}

export interface OpcoesDadosConfirmar<T> {
  dados: T | null
}

export interface EstadoConfirmarComDados<T> extends EstadoConfirmar {
  dados: T | null
  confirmarCom: (dados: T) => Promise<boolean>
}

export function useConfirmarComDados<T>(): EstadoConfirmarComDados<T> {
  const [aberto, setAberto] = useState(false)
  const [dados, setDados] = useState<T | null>(null)
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(
    null
  )

  const confirmar = useCallback(() => {
    return new Promise<boolean>((resolve) => {
      setResolver(() => resolve)
      setAberto(true)
    })
  }, [])

  const confirmarCom = useCallback((novosDados: T) => {
    return new Promise<boolean>((resolve) => {
      setDados(novosDados)
      setResolver(() => resolve)
      setAberto(true)
    })
  }, [])

  const onConfirmar = useCallback(() => {
    resolver?.(true)
    setAberto(false)
    setResolver(null)
  }, [resolver])

  const onCancelar = useCallback(() => {
    resolver?.(false)
    setAberto(false)
    setDados(null)
    setResolver(null)
  }, [resolver])

  return { aberto, dados, confirmar, confirmarCom, onConfirmar, onCancelar }
}
