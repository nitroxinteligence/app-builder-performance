import * as React from "react"

import { cn } from "@/lib/utilidades"

const Abas = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("w-full", className)} {...props} />
))
Abas.displayName = "Abas"

const AbasLista = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    role="tablist"
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
      className
    )}
    {...props}
  />
))
AbasLista.displayName = "AbasLista"

interface PropsAbaGatilho extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  readonly ativo?: boolean
}

const AbaGatilho = React.forwardRef<HTMLButtonElement, PropsAbaGatilho>(
  ({ className, ativo, ...props }, ref) => (
    <button
      ref={ref}
      role="tab"
      aria-selected={ativo}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        ativo
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground",
        className
      )}
      {...props}
    />
  )
)
AbaGatilho.displayName = "AbaGatilho"

const AbaConteudo = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    role="tabpanel"
    tabIndex={0}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
AbaConteudo.displayName = "AbaConteudo"

export { Abas, AbasLista, AbaGatilho, AbaConteudo }
