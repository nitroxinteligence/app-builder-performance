"use client"

import { useState, useEffect, useRef } from "react"

interface OpcoesContador {
  duracao?: number
  atraso?: number
}

export function useContadorAnimado(
  alvo: number,
  opcoes: OpcoesContador = {}
): number {
  const { duracao = 800, atraso = 0 } = opcoes
  const [valor, setValor] = useState(0)
  const frameRef = useRef<number | null>(null)
  const inicioRef = useRef<number | null>(null)
  const alvoAnteriorRef = useRef(0)

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const valorInicial = alvoAnteriorRef.current
      alvoAnteriorRef.current = alvo

      const animar = (timestamp: number) => {
        if (inicioRef.current === null) {
          inicioRef.current = timestamp
        }

        const progresso = Math.min(
          (timestamp - inicioRef.current) / duracao,
          1
        )
        const easing = 1 - Math.pow(1 - progresso, 3)
        const valorAtual = Math.round(
          valorInicial + (alvo - valorInicial) * easing
        )

        setValor(valorAtual)

        if (progresso < 1) {
          frameRef.current = requestAnimationFrame(animar)
        }
      }

      inicioRef.current = null
      frameRef.current = requestAnimationFrame(animar)
    }, atraso)

    return () => {
      window.clearTimeout(timeout)
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [alvo, duracao, atraso])

  return valor
}
