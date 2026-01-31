"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  BookOpenText,
  CheckCircle2,
  Clock,
  Loader2,
  PlayCircle,
} from "lucide-react";

import { Botao } from "@/componentes/ui/botao";
import {
  Cartao,
  CartaoCabecalho,
  CartaoConteudo,
  CartaoDescricao,
  CartaoTitulo,
} from "@/componentes/ui/cartao";
import { Progresso } from "@/componentes/ui/progresso";
import { useCursoBySlug } from "@/hooks/useCursos";
import type { CourseModuleWithLessons, LessonWithProgress } from "@/types/cursos";

export default function PaginaCurso() {
  const params = useParams();
  const cursoParam = params?.curso;
  const cursoSlug = Array.isArray(cursoParam) ? cursoParam[0] : cursoParam;
  const { data, isLoading, error } = useCursoBySlug(cursoSlug ?? "");

  if (isLoading) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-6 py-16 text-center">
        <h1 className="font-titulo text-2xl font-semibold">
          Curso não encontrado
        </h1>
        <p className="text-sm text-muted-foreground">
          {error?.message ?? "Não encontramos este curso no catálogo atual."}
        </p>
        <Botao asChild className="self-center">
          <Link href="/cursos">Voltar para cursos</Link>
        </Botao>
      </main>
    );
  }

  const { curso, modulos, resumo } = data;
  const primeiraAula = modulos[0]?.aulas[0];
  const linkPrimeiraAula = primeiraAula
    ? `/cursos/${curso.slug}/${primeiraAula.id}`
    : "/cursos";

  return (
    <main className="flex-1 px-6 py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
            <section className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div>
                  <h1 className="font-titulo text-2xl font-semibold">
                    {curso.titulo}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {curso.descricao}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-3 py-1 font-semibold text-secondary-foreground">
                  <BookOpenText className="h-3 w-3" />
                  {curso.categoria}
                </span>
                <span>{curso.nivel}</span>
                <span>•</span>
                <span>{resumo.totalAulas} aulas</span>
                <span>•</span>
                <span>{resumo.progresso}% concluído</span>
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-4">
                {modulos.map((modulo: CourseModuleWithLessons) => (
                  <Cartao key={modulo.id}>
                    <CartaoCabecalho className="pb-3">
                      <CartaoTitulo className="text-base">
                        {modulo.titulo}
                      </CartaoTitulo>
                      <CartaoDescricao>{modulo.descricao}</CartaoDescricao>
                    </CartaoCabecalho>
                    <CartaoConteudo className="space-y-3">
                      {modulo.aulas.map((aula: LessonWithProgress) => (
                        <Link
                          key={aula.id}
                          href={`/cursos/${curso.slug}/${aula.id}`}
                          className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3 text-sm transition hover:bg-secondary/40"
                        >
                          <div className="space-y-1">
                            <p className="font-medium text-foreground">
                              {aula.titulo}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {aula.duracao}
                              <span>•</span>
                              <span>{aula.xp}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {aula.concluida ? (
                              <>
                                <CheckCircle2 className="h-4 w-4 text-primary" />
                                <span className="font-semibold text-primary">
                                  Concluído
                                </span>
                              </>
                            ) : (
                              <>
                                <PlayCircle className="h-4 w-4 text-muted-foreground" />
                                Assistir
                              </>
                            )}
                          </div>
                        </Link>
                      ))}
                    </CartaoConteudo>
                  </Cartao>
                ))}
              </div>

              <div className="space-y-4">
                <Cartao>
                  <CartaoConteudo className="space-y-4 p-5">
                    <div>
                      <CartaoTitulo className="text-base">
                        Seu progresso
                      </CartaoTitulo>
                      <CartaoDescricao>
                        {resumo.aulasConcluidas} de {resumo.totalAulas} aulas
                        concluídas.
                      </CartaoDescricao>
                    </div>
                    <Progresso value={resumo.progresso} />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{resumo.progresso}% completo</span>
                      <span>{curso.nivel}</span>
                    </div>
                    <Botao asChild>
                      <Link href={linkPrimeiraAula}>Continuar</Link>
                    </Botao>
                  </CartaoConteudo>
                </Cartao>

                <Cartao>
                  <CartaoConteudo className="space-y-3 p-5">
                    <CartaoTitulo className="text-base">
                      Estrutura do curso
                    </CartaoTitulo>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      {modulos.map((modulo: CourseModuleWithLessons) => (
                        <div
                          key={`info-${modulo.id}`}
                          className="flex items-center justify-between"
                        >
                          <span>{modulo.titulo}</span>
                          <span>{modulo.aulas.length} aulas</span>
                        </div>
                      ))}
                    </div>
                  </CartaoConteudo>
                </Cartao>
              </div>
            </section>
      </div>
    </main>
  );
}
