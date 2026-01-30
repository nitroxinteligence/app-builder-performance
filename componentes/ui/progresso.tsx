"use client"

import * as React from "react"
import * as ProgressoPrimitivo from "@radix-ui/react-progress"
import { motion } from "framer-motion"

import { cn } from "@/lib/utilidades"
import { transicaoSuave } from "@/lib/animacoes"

const Progresso = React.forwardRef<
  React.ElementRef<typeof ProgressoPrimitivo.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressoPrimitivo.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressoPrimitivo.Root
    ref={ref}
    className={cn(
      "relative h-2.5 w-full overflow-hidden rounded-full bg-muted",
      className
    )}
    {...props}
  >
    <motion.div
      className="h-full rounded-full bg-gradient-to-r from-primary to-primary/80"
      initial={{ width: 0 }}
      animate={{ width: `${value || 0}%` }}
      transition={transicaoSuave}
    />
  </ProgressoPrimitivo.Root>
))

Progresso.displayName = "Progresso"

export { Progresso }
