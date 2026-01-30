import { Skeleton } from '@/componentes/ui/skeleton'

export default function AgendaLoading() {
  return (
    <main className="flex-1 px-6 py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-36" />
          </div>
          <Skeleton className="h-9 w-36 rounded-md" />
        </section>
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <Skeleton className="h-96 rounded-xl" />
          <div className="flex flex-col gap-4">
            <Skeleton className="h-10 rounded-lg" />
            <Skeleton className="h-24 rounded-lg" />
            <Skeleton className="h-24 rounded-lg" />
            <Skeleton className="h-24 rounded-lg" />
          </div>
        </div>
      </div>
    </main>
  )
}
