import { cn } from "@/lib/utilidades"

interface TokenDisplayProps {
  readonly nome: string
  readonly valor: string
  readonly preview?: React.ReactNode
  readonly className?: string
}

export function TokenDisplay({
  nome,
  valor,
  preview,
  className,
}: TokenDisplayProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-md border border-border px-4 py-3",
        className
      )}
    >
      {preview && <div className="shrink-0">{preview}</div>}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{nome}</p>
        <p className="truncate font-mono text-xs text-muted-foreground">
          {valor}
        </p>
      </div>
    </div>
  )
}
