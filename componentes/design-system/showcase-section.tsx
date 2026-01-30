import { cn } from "@/lib/utilidades"

interface ShowcaseSectionProps {
  readonly titulo: string
  readonly descricao?: string
  readonly children: React.ReactNode
  readonly className?: string
  readonly id?: string
}

export function ShowcaseSection({
  titulo,
  descricao,
  children,
  className,
  id,
}: ShowcaseSectionProps) {
  return (
    <section id={id} className={cn("space-y-4", className)}>
      <div className="space-y-1">
        <h2 className="font-titulo text-2xl font-bold tracking-tight">
          {titulo}
        </h2>
        {descricao && (
          <p className="text-sm text-muted-foreground">{descricao}</p>
        )}
      </div>
      <div>{children}</div>
    </section>
  )
}
