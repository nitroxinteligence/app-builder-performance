"use client"

import * as React from "react"
import { motion, AnimatePresence, type HTMLMotionProps } from "framer-motion"

import {
  variantesPagina,
  variantesFilhoPagina,
  variantesLista,
  variantesItemLista,
  variantesEscala,
  variantesNotificacaoXp,
  variantesLevelUp,
  variantesStreakFogo,
  variantesBadgeUnlock,
} from "@/lib/animacoes"

// ---------------------------------------------------------------------------
// AnimacaoPagina — wrapper para animar paginas com stagger nos filhos
// ---------------------------------------------------------------------------

interface PropsAnimacaoPagina extends HTMLMotionProps<"div"> {
  children: React.ReactNode
}

export function AnimacaoPagina({ children, className, ...props }: PropsAnimacaoPagina) {
  return (
    <motion.div
      variants={variantesPagina}
      initial="oculto"
      animate="visivel"
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// SecaoAnimada — filho direto de AnimacaoPagina com variant filho
// ---------------------------------------------------------------------------

interface PropsSecaoAnimada extends HTMLMotionProps<"section"> {
  children: React.ReactNode
}

export function SecaoAnimada({ children, className, ...props }: PropsSecaoAnimada) {
  return (
    <motion.section
      variants={variantesFilhoPagina}
      className={className}
      {...props}
    >
      {children}
    </motion.section>
  )
}

// ---------------------------------------------------------------------------
// DivAnimada — filho direto de AnimacaoPagina com variant filho (div)
// ---------------------------------------------------------------------------

interface PropsDivAnimada extends HTMLMotionProps<"div"> {
  children?: React.ReactNode
}

export function DivAnimada({ children, className, ...props }: PropsDivAnimada) {
  return (
    <motion.div
      variants={variantesFilhoPagina}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// ListaAnimada — container para listas animadas com stagger
// ---------------------------------------------------------------------------

interface PropsListaAnimada extends HTMLMotionProps<"div"> {
  children: React.ReactNode
}

export function ListaAnimada({ children, className, ...props }: PropsListaAnimada) {
  return (
    <motion.div
      variants={variantesLista}
      initial="oculto"
      animate="visivel"
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// ItemListaAnimado — filho de ListaAnimada
// ---------------------------------------------------------------------------

interface PropsItemListaAnimado extends HTMLMotionProps<"div"> {
  children: React.ReactNode
}

export function ItemListaAnimado({ children, className, ...props }: PropsItemListaAnimado) {
  return (
    <motion.div
      variants={variantesItemLista}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// NotificacaoXp — popup de ganho de XP
// ---------------------------------------------------------------------------

interface PropsNotificacaoXp {
  xp: number
  visivel: boolean
  onSaiu?: () => void
}

export function NotificacaoXp({ xp, visivel, onSaiu }: PropsNotificacaoXp) {
  return (
    <AnimatePresence onExitComplete={onSaiu}>
      {visivel && (
        <motion.div
          variants={variantesNotificacaoXp}
          initial="oculto"
          animate="visivel"
          exit="saindo"
          className="fixed right-4 top-4 z-50 flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-4 py-2.5 text-sm font-semibold text-primary shadow-lg backdrop-blur-sm"
        >
          <span className="text-lg">⚡</span>
          +{xp} XP
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ---------------------------------------------------------------------------
// CelebracaoLevelUp — animacao de subida de nivel
// ---------------------------------------------------------------------------

interface PropsCelebracaoLevelUp {
  nivel: number
  visivel: boolean
  onSaiu?: () => void
}

export function CelebracaoLevelUp({ nivel, visivel, onSaiu }: PropsCelebracaoLevelUp) {
  return (
    <AnimatePresence onExitComplete={onSaiu}>
      {visivel && (
        <motion.div
          variants={variantesLevelUp}
          initial="oculto"
          animate="visivel"
          exit="oculto"
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
        >
          <div className="flex flex-col items-center gap-4 text-center">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 0.6,
                ease: "easeInOut",
              }}
              className="text-6xl"
            >
              🎉
            </motion.div>
            <h2 className="font-titulo text-3xl font-bold text-foreground">
              Level Up!
            </h2>
            <p className="text-lg text-muted-foreground">
              Voce alcancou o nivel {nivel}
            </p>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
              className="h-1 max-w-[200px] rounded-full bg-gradient-to-r from-primary via-[var(--warning)] to-primary"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ---------------------------------------------------------------------------
// AnimacaoStreakFogo — icone de fogo pulsante para streaks
// ---------------------------------------------------------------------------

interface PropsAnimacaoStreakFogo {
  children: React.ReactNode
  ativo?: boolean
}

export function AnimacaoStreakFogo({ children, ativo = true }: PropsAnimacaoStreakFogo) {
  if (!ativo) return <>{children}</>

  return (
    <motion.div
      variants={variantesStreakFogo}
      initial="oculto"
      animate="visivel"
      className="inline-flex"
    >
      {children}
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// AnimacaoBadgeUnlock — animacao de desbloqueio de badge
// ---------------------------------------------------------------------------

interface PropsAnimacaoBadgeUnlock {
  children: React.ReactNode
  visivel?: boolean
}

export function AnimacaoBadgeUnlock({ children, visivel = true }: PropsAnimacaoBadgeUnlock) {
  return (
    <AnimatePresence>
      {visivel && (
        <motion.div
          variants={variantesBadgeUnlock}
          initial="oculto"
          animate="visivel"
          exit="oculto"
          className="inline-flex"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ---------------------------------------------------------------------------
// AnimacaoEscala — pop-in generico com escala
// ---------------------------------------------------------------------------

interface PropsAnimacaoEscala extends HTMLMotionProps<"div"> {
  children: React.ReactNode
}

export function AnimacaoEscala({ children, className, ...props }: PropsAnimacaoEscala) {
  return (
    <motion.div
      variants={variantesEscala}
      initial="oculto"
      animate="visivel"
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}
