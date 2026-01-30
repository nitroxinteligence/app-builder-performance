import { Esqueleto } from '@/componentes/ui/esqueleto'

export default function AgendaLoading() {
  return (
    <main className="flex-1 px-6 py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Esqueleto className="h-8 w-8 rounded-md" />
            <Esqueleto className="h-8 w-36" />
          </div>
          <Esqueleto className="h-9 w-36 rounded-md" />
        </section>
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <Esqueleto className="h-96 rounded-xl" />
          <div className="flex flex-col gap-4">
            <Esqueleto className="h-10 rounded-lg" />
            <Esqueleto className="h-24 rounded-lg" />
            <Esqueleto className="h-24 rounded-lg" />
            <Esqueleto className="h-24 rounded-lg" />
          </div>
        </div>
      </div>
    </main>
  )
}
