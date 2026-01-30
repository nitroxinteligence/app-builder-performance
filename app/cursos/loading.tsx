import { Skeleton } from '@/componentes/ui/skeleton'

export default function CursosLoading() {
  return (
    <div className="flex min-h-screen flex-col lg:pl-56">
      <main className="flex-1 px-6 py-10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
          <section className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-36" />
            </div>
          </section>
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-24 rounded-full" />
            ))}
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
