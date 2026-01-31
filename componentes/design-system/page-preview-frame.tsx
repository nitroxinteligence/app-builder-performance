import { cn } from "@/lib/utilidades"

interface PagePreviewFrameProps {
  readonly titulo: string
  readonly descricao?: string
  readonly children: React.ReactNode
  readonly className?: string
}

export function PagePreviewFrame({
  titulo,
  descricao,
  children,
  className,
}: PagePreviewFrameProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div>
        <h3 className="text-sm font-semibold">{titulo}</h3>
        {descricao && (
          <p className="text-xs text-muted-foreground">{descricao}</p>
        )}
      </div>
      <div className="overflow-hidden rounded-lg border border-border">
        <div className="flex items-center gap-1.5 border-b border-border bg-muted/50 px-3 py-2">
          <div className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-chart-5/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
          <span className="ml-2 font-mono text-[10px] text-muted-foreground">
            /{titulo.toLowerCase().replace(/\s+/g, "-")}
          </span>
        </div>
        <div className="bg-background p-4">{children}</div>
      </div>
    </div>
  )
}
