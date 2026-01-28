"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  Clock,
  MessageSquare,
  PlayCircle,
  ThumbsUp,
} from "lucide-react";

import { Botao } from "@/componentes/ui/botao";
import {
  Cartao,
  CartaoCabecalho,
  CartaoConteudo,
  CartaoDescricao,
  CartaoTitulo,
} from "@/componentes/ui/cartao";
import { cn } from "@/lib/utilidades";
import { Sidebar } from "@/componentes/layout/sidebar";

import { cursos } from "../../dados-cursos";

const comentariosExemplo = [
  {
    id: "comentario-1",
    autor: "Larissa Souza",
    texto: "Gostei da explicação sobre rotina sustentável. Aplicável demais.",
    tempo: "há 2 horas",
  },
  {
    id: "comentario-2",
    autor: "Felipe Martins",
    texto: "O método ficou bem claro com os exemplos.",
    tempo: "há 1 dia",
  },
];

export default function PaginaAula() {
  const params = useParams();
  const cursoParam = params?.curso;
  const aulaParam = params?.aula;
  const cursoSlug = Array.isArray(cursoParam) ? cursoParam[0] : cursoParam;
  const aulaSlug = Array.isArray(aulaParam) ? aulaParam[0] : aulaParam;
  const [sidebarAberta, setSidebarAberta] = React.useState(false);
  const [sidebarAulasAberta, setSidebarAulasAberta] = React.useState(true);
  const [curtido, setCurtido] = React.useState(false);

  const cursoAtual = cursos.find((curso) => curso.slug === cursoSlug);
  const aulasDoCurso = cursoAtual
    ? cursoAtual.modulos.flatMap((modulo) =>
        modulo.aulas.map((aula) => ({
          ...aula,
          moduloId: modulo.id,
          moduloTitulo: modulo.titulo,
        }))
      )
    : [];
  const aulaAtual = aulasDoCurso.find((aula) => aula.id === aulaSlug);
  const indiceAula = aulaAtual
    ? aulasDoCurso.findIndex((aula) => aula.id === aulaAtual.id) + 1
    : 0;

  if (!cursoAtual || !aulaAtual) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-6 py-16 text-center">
          <h1 className="font-titulo text-2xl font-semibold">
            Aula não encontrada
          </h1>
          <p className="text-sm text-muted-foreground">
            Não encontramos esta aula no curso selecionado.
          </p>
          <Botao asChild className="self-center">
            <Link href="/cursos">Voltar para cursos</Link>
          </Botao>
        </main>
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
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
            <section className="flex items-center gap-3">
              <Link
                href={`/cursos/${cursoAtual.slug}`}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition hover:text-foreground"
                aria-label="Voltar para curso"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div>
                <h1 className="font-titulo text-2xl font-semibold">
                  {aulaAtual.titulo}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {cursoAtual.titulo} • {aulaAtual.moduloTitulo}
                </p>
              </div>
            </section>

            <section className="flex flex-col gap-6 lg:flex-row-reverse">
              <aside
                className={cn(
                  "rounded-2xl border border-border bg-card p-4 lg:sticky lg:top-6 lg:h-fit",
                  sidebarAulasAberta ? "lg:w-72" : "lg:w-16"
                )}
              >
                <div
                  className={cn(
                    "flex items-center",
                    sidebarAulasAberta ? "justify-between" : "justify-center"
                  )}
                >
                  {sidebarAulasAberta ? (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                        Conteúdo
                      </p>
                      <p className="text-sm font-semibold text-foreground">
                        {aulasDoCurso.length} aulas
                      </p>
                    </div>
                  ) : null}
                  <Botao
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Alternar lista de aulas"
                    onClick={() => setSidebarAulasAberta((prev) => !prev)}
                  >
                    <ChevronLeft
                      className={cn(
                        "h-4 w-4 transition-transform",
                        sidebarAulasAberta ? "rotate-0" : "rotate-180"
                      )}
                    />
                  </Botao>
                </div>

                {sidebarAulasAberta ? (
                  <div className="mt-4 space-y-4">
                    {cursoAtual.modulos.map((modulo) => (
                      <div key={modulo.id} className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                          {modulo.titulo}
                        </p>
                        <div className="space-y-1">
                          {modulo.aulas.map((aula) => {
                            const ativo = aula.id === aulaAtual.id;
                            return (
                              <Link
                                key={aula.id}
                                href={`/cursos/${cursoAtual.slug}/${aula.id}`}
                                className={cn(
                                  "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition",
                                  ativo
                                    ? "bg-secondary text-secondary-foreground"
                                    : "text-muted-foreground hover:bg-secondary/60 hover:text-secondary-foreground"
                                )}
                              >
                                <span className="truncate">{aula.titulo}</span>
                                {aula.concluida ? (
                                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                ) : null}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </aside>

              <div className="flex-1 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="rounded-full border border-border bg-secondary px-3 py-1 font-semibold text-secondary-foreground">
                      Aula {indiceAula} de {aulasDoCurso.length}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {aulaAtual.duracao}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Botao variant="secondary">Marcar como concluída</Botao>
                    <Botao
                      variant="outline"
                      className={cn(
                        "gap-2",
                        curtido
                          ? "border-emerald-200 bg-emerald-100 text-emerald-700 hover:bg-emerald-100/80 dark:border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-200"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                      onClick={() => setCurtido((prev) => !prev)}
                    >
                      <ThumbsUp className="h-4 w-4" />
                      {curtido ? "Curtido" : "Curtir"}
                    </Botao>
                  </div>
                </div>

                <div className="aspect-video rounded-3xl border border-border bg-foreground text-background">
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
                    <PlayCircle className="h-10 w-10" />
                    <p className="text-sm font-semibold">
                      Player de vídeo (prévia)
                    </p>
                    <p className="text-xs text-background/70">
                      Clique para iniciar a aula.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <Cartao>
                    <CartaoCabecalho className="pb-3">
                      <CartaoTitulo className="text-base">
                        Sobre a aula
                      </CartaoTitulo>
                      <CartaoDescricao>
                        {aulaAtual.descricao}
                      </CartaoDescricao>
                    </CartaoCabecalho>
                    <CartaoConteudo className="space-y-2 text-sm text-muted-foreground">
                      <p>
                        XP ao concluir: <span className="font-semibold">{aulaAtual.xp}</span>
                      </p>
                      <p>
                        Curso: <span className="font-semibold">{cursoAtual.titulo}</span>
                      </p>
                    </CartaoConteudo>
                  </Cartao>

                  <Cartao>
                    <CartaoCabecalho className="pb-3">
                      <CartaoTitulo className="text-base">
                        Notas rápidas
                      </CartaoTitulo>
                      <CartaoDescricao>
                        Registre os pontos mais importantes.
                      </CartaoDescricao>
                    </CartaoCabecalho>
                    <CartaoConteudo>
                      <textarea
                        placeholder="Escreva suas anotações..."
                        className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </CartaoConteudo>
                  </Cartao>
                </div>

                <Cartao>
                  <CartaoCabecalho className="pb-3">
                    <CartaoTitulo className="text-base">Comentários</CartaoTitulo>
                    <CartaoDescricao>
                      Compartilhe dúvidas e aprendizados com a turma.
                    </CartaoDescricao>
                  </CartaoCabecalho>
                  <CartaoConteudo className="space-y-4">
                    <div className="space-y-3">
                      {comentariosExemplo.map((comentario) => (
                        <div
                          key={comentario.id}
                          className="rounded-xl border border-border bg-background px-4 py-3"
                        >
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="font-semibold text-foreground">
                              {comentario.autor}
                            </span>
                            <span>{comentario.tempo}</span>
                          </div>
                          <p className="mt-2 text-sm text-muted-foreground">
                            {comentario.texto}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="novo-comentario"
                        className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"
                      >
                        Novo comentário
                      </label>
                      <textarea
                        id="novo-comentario"
                        placeholder="Deixe seu comentário..."
                        className="min-h-[90px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <MessageSquare className="h-3 w-3" />
                          Seu comentário fica visível para a turma.
                        </div>
                        <Botao variant="secondary" size="sm">
                          Enviar comentário
                        </Botao>
                      </div>
                    </div>
                  </CartaoConteudo>
                </Cartao>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
