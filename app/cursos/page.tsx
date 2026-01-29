"use client";

import * as React from "react";
import Link from "next/link";
import {
  BookOpenText,
  Lock,
  Search,
  Loader2,
} from "lucide-react";

import { Botao } from "@/componentes/ui/botao";
import {
  Cartao,
  CartaoConteudo,
  CartaoDescricao,
  CartaoTitulo,
} from "@/componentes/ui/cartao";
import { Progresso } from "@/componentes/ui/progresso";
import { cn } from "@/lib/utilidades";
import { Sidebar } from "@/componentes/layout/sidebar";
import { useCursosData } from "@/hooks/useCursos";

export default function PaginaCursos() {
  const [sidebarAberta, setSidebarAberta] = React.useState(false);
  const [categoriaAtiva, setCategoriaAtiva] = React.useState("Todos");
  const [busca, setBusca] = React.useState("");

  const {
    cursos,
    categorias,
    cursosDestaque,
    cursosContinuar,
    novosConteudos,
    isLoading,
    error,
  } = useCursosData();

  const textoBusca = busca.trim().toLowerCase();

  const cursosFiltrados = React.useMemo(() => {
    return cursos.filter(({ curso }) => {
      if (categoriaAtiva !== "Todos" && curso.categoria !== categoriaAtiva) {
        return false;
      }

      if (!textoBusca) {
        return true;
      }

      return (
        curso.titulo.toLowerCase().includes(textoBusca) ||
        (curso.descricao?.toLowerCase().includes(textoBusca) ?? false)
      );
    });
  }, [cursos, categoriaAtiva, textoBusca]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Sidebar open={sidebarAberta} onOpenChange={setSidebarAberta} />
        <div
          className={cn(
            "flex min-h-screen flex-col transition-[padding] duration-300",
            sidebarAberta ? "lg:pl-56" : "lg:pl-16"
          )}
        >
          <main className="flex flex-1 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Sidebar open={sidebarAberta} onOpenChange={setSidebarAberta} />
        <div
          className={cn(
            "flex min-h-screen flex-col transition-[padding] duration-300",
            sidebarAberta ? "lg:pl-56" : "lg:pl-16"
          )}
        >
          <main className="flex flex-1 items-center justify-center">
            <p className="text-destructive">Erro ao carregar cursos: {error.message}</p>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar open={sidebarAberta} onOpenChange={setSidebarAberta} />

      <div
        className={cn(
          "flex min-h-screen flex-col transition-[padding] duration-300",
          sidebarAberta ? "lg:pl-56" : "lg:pl-16"
        )}
      >
        <main className="flex-1 px-6 py-10">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
            <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="font-titulo text-2xl font-semibold">
                  Cursos e aulas
                </h1>
                <p className="text-sm text-muted-foreground">
                  Catálogo completo para evoluir sua rotina.
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
                    className="h-9 w-52 rounded-md border border-input bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                {categorias.map((categoria) => (
                  <Botao
                    key={categoria}
                    type="button"
                    variant={categoriaAtiva === categoria ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setCategoriaAtiva(categoria)}
                  >
                    {categoria}
                  </Botao>
                ))}
              </div>
            </section>

            {cursosContinuar.length > 0 && (
              <section className="space-y-4">
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
                        className="min-w-[260px] overflow-hidden"
                      >
                        <div className="h-28 bg-gradient-to-br from-secondary via-accent to-background p-4">
                          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                            <span>{curso.categoria}</span>
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
                              aulas concluídas
                            </CartaoDescricao>
                          </div>
                          <div className="space-y-2">
                            <Progresso value={resumo.progresso} />
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>{resumo.progresso}% completo</span>
                              <Link
                                href={`/cursos/${curso.slug}`}
                                className="font-semibold text-foreground"
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
              </section>
            )}

            {cursosDestaque.length > 0 && (
              <section className="space-y-4">
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
                        className="min-w-[260px] overflow-hidden"
                      >
                        <div className="h-28 bg-gradient-to-br from-secondary via-accent to-background p-4">
                          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                            <span>{curso.categoria}</span>
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
                              concluído
                            </CartaoDescricao>
                          </div>
                          <Botao asChild variant="outline" size="sm">
                            <Link href={`/cursos/${curso.slug}`}>
                              Ver curso
                            </Link>
                          </Botao>
                        </CartaoConteudo>
                      </Cartao>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {novosConteudos.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-titulo text-lg font-semibold">
                    Novos conteúdos
                  </h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {novosConteudos.map((curso) => (
                    <Cartao key={curso.id} className="overflow-hidden">
                      <div className="h-24 bg-gradient-to-br from-muted via-background to-secondary p-4">
                        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                          <span>Em breve</span>
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
                          <span className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                            Bloqueado
                          </span>
                        </div>
                        <Botao variant="outline" size="sm" disabled>
                          Acesso bloqueado
                        </Botao>
                      </CartaoConteudo>
                    </Cartao>
                  ))}
                </div>
              </section>
            )}

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-titulo text-lg font-semibold">
                  Catálogo completo
                </h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {cursosFiltrados.map(({ curso, resumo }) => (
                  <Cartao key={curso.id}>
                    <CartaoConteudo className="space-y-4 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <CartaoTitulo className="text-base">
                            {curso.titulo}
                          </CartaoTitulo>
                          <CartaoDescricao>{curso.descricao}</CartaoDescricao>
                        </div>
                        <span className="rounded-full border border-border bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
                          {curso.nivel}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{curso.categoria}</span>
                        <span>•</span>
                        <span>{resumo.totalAulas} aulas</span>
                        <span>•</span>
                        <span>{resumo.progresso}% concluído</span>
                      </div>
                      <Progresso value={resumo.progresso} />
                      <Botao asChild variant="secondary" size="sm">
                        <Link href={`/cursos/${curso.slug}`}>
                          Ver conteúdo
                        </Link>
                      </Botao>
                    </CartaoConteudo>
                  </Cartao>
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
