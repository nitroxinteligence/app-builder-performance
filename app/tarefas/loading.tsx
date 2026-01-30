import { Skeleton } from '@/componentes/ui/skeleton'

export default function TarefasLoading() {
  return (
    <div className="flex min-h-screen flex-col lg:pl-56">
      <main className="flex-1 px-6 py-10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
          <section className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-40" />
            </div>
            <Skeleton className="h-9 w-32 rounded-md" />
          </section>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-3">
                <Skeleton className="h-10 rounded-lg" />
                <Skeleton className="h-24 rounded-lg" />
                <Skeleton className="h-24 rounded-lg" />
                <Skeleton className="h-24 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
