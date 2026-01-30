import { Skeleton } from '@/componentes/ui/skeleton'

export default function FocoLoading() {
  return (
    <div className="flex min-h-screen flex-col lg:pl-56">
      <main className="flex-1 px-6 py-10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
          <section className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-48" />
          </section>
          <div className="grid gap-8 lg:grid-cols-2">
            <Skeleton className="h-80 rounded-xl" />
            <div className="flex flex-col gap-4">
              <Skeleton className="h-12 rounded-lg" />
              <Skeleton className="h-12 rounded-lg" />
              <Skeleton className="h-12 rounded-lg" />
              <Skeleton className="h-32 rounded-lg" />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
