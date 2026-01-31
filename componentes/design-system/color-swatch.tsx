import { cn } from "@/lib/utilidades"

interface ColorSwatchProps {
  readonly nome: string
  readonly variavel: string
  readonly className?: string
}

export function ColorSwatch({ nome, variavel, className }: ColorSwatchProps) {
  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div
        className="h-16 w-16 rounded-lg border border-border"
        style={{ backgroundColor: `var(${variavel})` }}
      />
      <div className="text-center">
        <p className="text-xs font-medium">{nome}</p>
        <p className="font-mono text-[10px] text-muted-foreground">
          {variavel}
        </p>
      </div>
    </div>
  )
}
