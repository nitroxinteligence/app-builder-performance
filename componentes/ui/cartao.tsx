"use client"

import * as React from "react"
import { motion, type HTMLMotionProps } from "framer-motion"

import { cn } from "@/lib/utilidades"
import {
  variantesHover,
  variantesEntrada,
  transicaoRapida,
} from "@/lib/animacoes"

interface PropsCartao extends HTMLMotionProps<"div"> {
  interativo?: boolean
}

const Cartao = React.forwardRef<HTMLDivElement, PropsCartao>(
  ({ className, interativo = false, ...props }, ref) => (
    <motion.div
      ref={ref}
      variants={variantesEntrada}
      initial="oculto"
      animate="visivel"
      whileHover={interativo ? variantesHover.escalaComSombra : undefined}
      transition={transicaoRapida}
      className={cn(
        "rounded-2xl border border-[color:var(--borda-cartao)] bg-card text-card-foreground",
        interativo && "cursor-pointer",
        className
      )}
      {...props}
    />
  )
)

Cartao.displayName = "Cartao"

const CartaoCabecalho = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col gap-1.5 p-6", className)}
    {...props}
  />
))

CartaoCabecalho.displayName = "CartaoCabecalho"

const CartaoTitulo = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("font-titulo text-lg font-semibold", className)}
    {...props}
  />
))

CartaoTitulo.displayName = "CartaoTitulo"

const CartaoDescricao = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))

CartaoDescricao.displayName = "CartaoDescricao"

const CartaoConteudo = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))

CartaoConteudo.displayName = "CartaoConteudo"

const CartaoRodape = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))

CartaoRodape.displayName = "CartaoRodape"

export {
  Cartao,
  CartaoCabecalho,
  CartaoConteudo,
  CartaoDescricao,
  CartaoRodape,
  CartaoTitulo,
}

export type { PropsCartao }
