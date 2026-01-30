'use client'

export default function PerfilError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="flex flex-col items-center gap-2">
        <h2 className="font-titulo text-2xl font-semibold text-foreground">
          Erro no Perfil
        </h2>
        <p className="max-w-md text-muted-foreground">
          Ocorreu um erro ao carregar seu perfil. Seus dados estão seguros.
        </p>
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Tentar novamente
        </button>
        <a
          href="/inicio"
          className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          Voltar ao início
        </a>
      </div>
    </div>
  )
}
