import { cn } from "@/lib/utilidades"

interface ComponentPreviewProps {
  readonly titulo: string
  readonly descricao?: string
  readonly children: React.ReactNode
  readonly className?: string
}

export function ComponentPreview({
  titulo,
  descricao,
  children,
  className,
}: ComponentPreviewProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="space-y-0.5">
        <h3 className="text-sm font-semibold">{titulo}</h3>
        {descricao && (
          <p className="text-xs text-muted-foreground">{descricao}</p>
        )}
      </div>
      <div className="rounded-lg border border-border bg-card p-4">
        {children}
      </div>
    </div>
  )
}
