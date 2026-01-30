"use client"

import * as React from "react"
import Link from "next/link"
import {
  BookOpenText,
  Lock,
  Search,
  Award,
} from "lucide-react"
import { Botao } from "@/componentes/ui/botao"
import {
  Cartao,
  CartaoConteudo,
  CartaoDescricao,
  CartaoTitulo,
} from "@/componentes/ui/cartao"
import { Emblema } from "@/componentes/ui/emblema"
import { Progresso } from "@/componentes/ui/progresso"
import { AnimacaoPagina, SecaoAnimada } from "@/componentes/ui/animacoes"
import { Esqueleto } from "@/componentes/ui/esqueleto"
import { useCursosData } from "@/hooks/useCursos"

export default function PaginaCursos() {
  const [categoriaAtiva, setCategoriaAtiva] = React.useState("Todos")
  const [busca, setBusca] = React.useState("")

  const {
    cursos,
    categorias,
    cursosDestaque,
    cursosContinuar,
    novosConteudos,
    isLoading,
    error,
  } = useCursosData()

  const textoBusca = busca.trim().toLowerCase()

  const cursosFiltrados = React.useMemo(() => {
    return cursos.filter(({ curso }) => {
      if (categoriaAtiva !== "Todos" && curso.categoria !== categoriaAtiva) {
        return false
      }

      if (!textoBusca) {
        return true
      }

      return (
        curso.titulo.toLowerCase().includes(textoBusca) ||
        (curso.descricao?.toLowerCase().includes(textoBusca) ?? false)
      )
    })
  }, [cursos, categoriaAtiva, textoBusca])

  const semConteudo =
    !isLoading &&
    !error &&
    cursos.length === 0 &&
    novosConteudos.length === 0

  if (isLoading || semConteudo) {
    return (
      <main id="main-content" className="flex-1 px-6 py-10">
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

  if (error) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="text-destructive">Erro ao carregar cursos: {error.message}</p>
      </main>
    )
  }

  return (
    <main id="main-content" className="flex-1 px-6 py-10">
      <AnimacaoPagina className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <SecaoAnimada className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="font-titulo text-2xl font-semibold">
              Cursos e aulas
            </h1>
            <p className="text-sm text-muted-foreground">
              Evolua sua rotina com nossos cursos.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                placeholder="Buscar cursos"
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
                className="h-9 w-52 rounded-[var(--radius-sm)] border border-input bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            {categorias.map((categoria) => (
              <Botao
                key={categoria}
                type="button"
                variant={categoriaAtiva === categoria ? "default" : "ghost"}
                size="sm"
                onClick={() => setCategoriaAtiva(categoria)}
              >
                {categoria}
              </Botao>
            ))}
          </div>
        </SecaoAnimada>

        {cursosContinuar.length > 0 && (
          <SecaoAnimada className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-titulo text-lg font-semibold">
                Continue assistindo
              </h2>
            </div>
            <div className="-mx-6 overflow-x-auto px-6">
              <div className="flex min-w-[640px] gap-4">
                {cursosContinuar.map(({ curso, resumo }) => (
                  <Cartao
                    key={curso.id}
                    interativo
                    className="min-w-[260px] overflow-hidden"
                  >
                    <div className="h-28 bg-gradient-to-br from-primary/10 via-accent to-background p-4">
                      <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                        <Emblema variant="outline">{curso.categoria}</Emblema>
                        <BookOpenText className="h-4 w-4" />
                      </div>
                      <p className="mt-6 text-sm font-semibold text-foreground">
                        {curso.titulo}
                      </p>
                    </div>
                    <CartaoConteudo className="space-y-3 p-4">
                      <div>
                        <CartaoTitulo className="text-base">
                          {curso.nivel}
                        </CartaoTitulo>
                        <CartaoDescricao>
                          {resumo.aulasConcluidas} de {resumo.totalAulas}{" "}
                          aulas concluidas
                        </CartaoDescricao>
                      </div>
                      <div className="space-y-2">
                        <Progresso value={resumo.progresso} />
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <Emblema variant={resumo.progresso === 100 ? "sucesso" : "secondary"}>
                            {resumo.progresso}% completo
                          </Emblema>
                          <Link
                            href={`/cursos/${curso.slug}`}
                            className="font-semibold text-primary hover:underline"
                          >
                            Retomar
                          </Link>
                        </div>
                      </div>
                    </CartaoConteudo>
                  </Cartao>
                ))}
              </div>
            </div>
          </SecaoAnimada>
        )}

        {cursosDestaque.length > 0 && (
          <SecaoAnimada className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-titulo text-lg font-semibold">
                Em destaque
              </h2>
            </div>
            <div className="-mx-6 overflow-x-auto px-6">
              <div className="flex min-w-[640px] gap-4">
                {cursosDestaque.map(({ curso, resumo }) => (
                  <Cartao
                    key={curso.id}
                    interativo
                    className="min-w-[260px] overflow-hidden"
                  >
                    <div className="h-28 bg-gradient-to-br from-primary/10 via-accent to-background p-4">
                      <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                        <Emblema variant="outline">{curso.categoria}</Emblema>
                        <BookOpenText className="h-4 w-4" />
                      </div>
                      <p className="mt-6 text-sm font-semibold text-foreground">
                        {curso.titulo}
                      </p>
                    </div>
                    <CartaoConteudo className="space-y-3 p-4">
                      <div>
                        <CartaoTitulo className="text-base">
                          {curso.nivel}
                        </CartaoTitulo>
                        <CartaoDescricao>
                          {resumo.totalAulas} aulas • {resumo.progresso}%{" "}
                          concluido
                        </CartaoDescricao>
                      </div>
                      {resumo.progresso === 100 ? (
                        <Emblema variant="sucesso" className="gap-1">
                          <Award className="h-3 w-3" />
                          Concluido
                        </Emblema>
                      ) : (
                        <Botao asChild variant="outline" size="sm">
                          <Link href={`/cursos/${curso.slug}`}>
                            Ver curso
                          </Link>
                        </Botao>
                      )}
                    </CartaoConteudo>
                  </Cartao>
                ))}
              </div>
            </div>
          </SecaoAnimada>
        )}

        {novosConteudos.length > 0 && (
          <SecaoAnimada className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-titulo text-lg font-semibold">
                Novos conteudos
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {novosConteudos.map((curso) => (
                <Cartao key={curso.id} className="overflow-hidden">
                  <div className="h-24 bg-gradient-to-br from-muted via-background to-secondary p-4">
                    <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                      <Emblema variant="secondary">Em breve</Emblema>
                      <Lock className="h-4 w-4" />
                    </div>
                    <p className="mt-5 text-sm font-semibold text-foreground">
                      {curso.titulo}
                    </p>
                  </div>
                  <CartaoConteudo className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CartaoTitulo className="text-base">
                          {curso.nivel}
                        </CartaoTitulo>
                        <CartaoDescricao>{curso.descricao}</CartaoDescricao>
                      </div>
                      <Emblema variant="outline">
                        Bloqueado
                      </Emblema>
                    </div>
                    <Botao variant="outline" size="sm" disabled>
                      Acesso bloqueado
                    </Botao>
                  </CartaoConteudo>
                </Cartao>
              ))}
            </div>
          </SecaoAnimada>
        )}

        <SecaoAnimada className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {cursosFiltrados.map(({ curso, resumo }) => (
              <Cartao key={curso.id} interativo>
                <CartaoConteudo className="space-y-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CartaoTitulo className="text-base">
                        {curso.titulo}
                      </CartaoTitulo>
                      <CartaoDescricao>{curso.descricao}</CartaoDescricao>
                    </div>
                    <Emblema variant="secondary">
                      {curso.nivel}
                    </Emblema>
                  </div>
                  <div className="flex items-center gap-2">
                    <Emblema variant="outline">{curso.categoria}</Emblema>
                    <span className="text-xs text-muted-foreground">
                      {resumo.totalAulas} aulas
                    </span>
                    {resumo.progresso === 100 ? (
                      <Emblema variant="sucesso" className="gap-1">
                        <Award className="h-3 w-3" />
                        Concluido
                      </Emblema>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {resumo.progresso}% concluido
                      </span>
                    )}
                  </div>
                  <Progresso value={resumo.progresso} />
                  <Botao asChild variant="secondary" size="sm">
                    <Link href={`/cursos/${curso.slug}`}>
                      Ver conteudo
                    </Link>
                  </Botao>
                </CartaoConteudo>
              </Cartao>
            ))}
          </div>
        </SecaoAnimada>
      </AnimacaoPagina>
    </main>
  )
}
