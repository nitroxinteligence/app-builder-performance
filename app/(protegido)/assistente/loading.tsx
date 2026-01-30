import { Skeleton } from '@/componentes/ui/skeleton'

export default function AssistenteLoading() {
  return (
    <main className="flex-1 px-6 py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-40" />
        </section>
        <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
          <div className="hidden flex-col gap-2 lg:flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 rounded-lg" />
            ))}
          </div>
          <div className="flex flex-col gap-4">
            <Skeleton className="h-[400px] rounded-xl" />
            <Skeleton className="h-12 rounded-lg" />
          </div>
        </div>
      </div>
    </main>
  )
}
