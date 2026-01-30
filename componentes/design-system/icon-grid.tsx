import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utilidades"

interface IconGridProps {
  readonly icones: ReadonlyArray<{
    readonly nome: string
    readonly Icone: LucideIcon
  }>
  readonly className?: string
}

export function IconGrid({ icones, className }: IconGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-4 gap-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10",
        className
      )}
    >
      {icones.map(({ nome, Icone }) => (
        <div
          key={nome}
          className="flex flex-col items-center gap-1.5 rounded-md border border-border p-3 transition-colors hover:bg-muted"
        >
          <Icone className="h-5 w-5 text-foreground" />
          <span className="text-center text-[10px] text-muted-foreground">
            {nome}
          </span>
        </div>
      ))}
    </div>
  )
}
