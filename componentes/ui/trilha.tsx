import * as React from "react"
import { ChevronRight } from "lucide-react"

import { cn } from "@/lib/utilidades"

const Trilha = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>(({ className, ...props }, ref) => (
  <nav
    ref={ref}
    aria-label="Navegacao estrutural"
    className={cn("flex items-center", className)}
    {...props}
  />
))
Trilha.displayName = "Trilha"

const TrilhaLista = React.forwardRef<
  HTMLOListElement,
  React.OlHTMLAttributes<HTMLOListElement>
>(({ className, ...props }, ref) => (
  <ol
    ref={ref}
    className={cn("flex items-center gap-1.5 text-sm", className)}
    {...props}
  />
))
TrilhaLista.displayName = "TrilhaLista"

const TrilhaItem = React.forwardRef<
  HTMLLIElement,
  React.LiHTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    className={cn("inline-flex items-center gap-1.5", className)}
    {...props}
  />
))
TrilhaItem.displayName = "TrilhaItem"

const TrilhaLink = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement>
>(({ className, ...props }, ref) => (
  <a
    ref={ref}
    className={cn(
      "text-muted-foreground transition-colors hover:text-foreground",
      className
    )}
    {...props}
  />
))
TrilhaLink.displayName = "TrilhaLink"

const TrilhaPagina = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    aria-current="page"
    className={cn("font-medium text-foreground", className)}
    {...props}
  />
))
TrilhaPagina.displayName = "TrilhaPagina"

function TrilhaSeparador({ className }: { readonly className?: string }) {
  return (
    <li role="presentation" aria-hidden="true">
      <ChevronRight
        className={cn("h-3.5 w-3.5 text-muted-foreground", className)}
      />
    </li>
  )
}

export {
  Trilha,
  TrilhaLista,
  TrilhaItem,
  TrilhaLink,
  TrilhaPagina,
  TrilhaSeparador,
}
