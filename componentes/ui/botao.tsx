"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { motion, type HTMLMotionProps } from "framer-motion"

import { cn } from "@/lib/utilidades"
import { transicaoRapida } from "@/lib/animacoes"

const estilosBotao = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-secondary hover:text-secondary-foreground",
        ghost:
          "hover:bg-secondary hover:text-secondary-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        link:
          "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 rounded-sm px-3 text-xs",
        lg: "h-11 rounded-sm px-8",
        icon: "h-10 w-10 rounded-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface PropsBotao
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof estilosBotao> {
  asChild?: boolean
}

const Botao = React.forwardRef<HTMLButtonElement, PropsBotao>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    if (asChild) {
      return (
        <Slot
          ref={ref}
          className={cn(estilosBotao({ variant, size, className }))}
          {...props}
        />
      )
    }

    return (
      <motion.button
        ref={ref}
        transition={transicaoRapida}
        className={cn(estilosBotao({ variant, size, className }))}
        {...(props as HTMLMotionProps<"button">)}
      />
    )
  }
)

Botao.displayName = "Botao"

export { Botao, estilosBotao }
