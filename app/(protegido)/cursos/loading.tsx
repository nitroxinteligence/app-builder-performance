import { Esqueleto } from '@/componentes/ui/esqueleto'

export default function CursosLoading() {
  return (
    <main className="flex-1 px-6 py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <Esqueleto className="h-8 w-48" />
            <Esqueleto className="h-4 w-64" />
          </div>
          <div className="flex items-center gap-2">
            <Esqueleto className="h-9 w-52 rounded-[var(--radius-sm)]" />
            {Array.from({ length: 3 }).map((_, i) => (
              <Esqueleto key={i} className="h-9 w-20 rounded-md" />
            ))}
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-[color:var(--borda-cartao)] bg-card p-5"
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex-1 space-y-2">
                  <Esqueleto className="h-5 w-3/4" />
                  <Esqueleto className="h-4 w-1/2" />
                </div>
                <Esqueleto className="h-6 w-20 rounded-full" />
              </div>
              <div className="flex items-center gap-2 mb-4">
                <Esqueleto className="h-5 w-16 rounded-full" />
                <Esqueleto className="h-4 w-14" />
                <Esqueleto className="h-4 w-24" />
              </div>
              <Esqueleto className="h-2 w-full rounded-full mb-4" />
              <Esqueleto className="h-9 w-28 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
