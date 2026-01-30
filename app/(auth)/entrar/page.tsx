"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Apple, Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";

import { Botao } from "@/componentes/ui/botao";
import { cn } from "@/lib/utilidades";
import { signInWithEmail, signInWithOAuth } from "@/lib/supabase/auth";

import { marcaSidebar } from "@/app/(protegido)/inicio/dados-dashboard";

export default function PaginaEntrar() {
  const router = useRouter();
  const [mostrarSenha, setMostrarSenha] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [senha, setSenha] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [erro, setErro] = React.useState<string | null>(null);

  const lidarSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErro(null);
    setIsLoading(true);

    try {
      const { error } = await signInWithEmail(email, senha);

      if (error) {
        setErro(error);
        return;
      }

      router.push("/foco");
    } catch {
      setErro("Ocorreu um erro inesperado. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const lidarOAuth = async (provider: "google" | "apple") => {
    setErro(null);
    setIsLoading(true);

    try {
      const { error } = await signInWithOAuth(provider);

      if (error) {
        setErro(error);
      }
    } catch {
      setErro("Ocorreu um erro inesperado. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-6 py-8 lg:flex-row lg:items-stretch">
        <aside className="relative flex min-h-[420px] w-full flex-col justify-between overflow-hidden rounded-[32px] border border-border bg-card/70 p-8 lg:w-[48%]">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-white via-[#fff7ed] to-[#fff1e6] dark:from-[#1f1f1f] dark:via-[#2a1d16] dark:to-[#2f1c12]" />
            <div className="absolute left-10 top-16 h-64 w-64 rounded-full bg-[#f97316]/25 blur-[140px] dark:bg-[#fb923c]/20" />
            <div className="absolute right-6 top-28 h-72 w-72 rounded-full bg-[#fdba74]/35 blur-[150px] dark:bg-[#fb923c]/25" />
            <div className="absolute bottom-6 left-6 h-60 w-60 rounded-full bg-[#f59e0b]/20 blur-[150px] dark:bg-[#f97316]/20" />
          </div>

          <div className="relative flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <marcaSidebar.icone className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="leading-tight">
              <p className="font-titulo text-base font-semibold">
                {marcaSidebar.titulo.replace("Builders ", "")}
              </p>
            </div>
          </div>

          <div className="relative max-w-sm space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Rotina Builder
            </p>
            <h2 className="font-titulo text-2xl font-semibold text-foreground sm:text-3xl">
              Sua rotina de alta performance em um só lugar
            </h2>
            <p className="text-sm text-muted-foreground">
              Foco, tarefas, hábitos e IA organizados para acelerar sua evolução.
            </p>
          </div>
        </aside>

        <main className="flex flex-1 flex-col items-center justify-center">
          <div className="w-full max-w-md space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="font-titulo text-2xl font-semibold sm:text-3xl">
                Entrar
              </h1>
              <p className="text-sm text-muted-foreground">
                Acesse sua conta para continuar.
              </p>
            </div>

            <div className="space-y-3">
              <Botao
                variant="outline"
                className="h-11 w-full gap-2 rounded-full border-border text-sm"
                onClick={() => lidarOAuth("apple")}
                disabled={isLoading}
              >
                <Apple className="h-4 w-4" />
                Entrar com Apple
              </Botao>
              <Botao
                variant="outline"
                className="h-11 w-full gap-2 rounded-full border-border text-sm"
                onClick={() => lidarOAuth("google")}
                disabled={isLoading}
              >
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white">
                  <svg
                    viewBox="0 0 48 48"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.15 0 5.27 1.36 6.49 2.5l4.41-4.42C32.14 4.74 28.42 3 24 3 14.95 3 7.22 8.43 4 16.2l5.17 4.02C11.03 14.1 17.04 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M44.5 24.5c0-1.54-.14-2.99-.4-4.4H24v8.32h11.52c-.5 2.7-2.07 4.99-4.42 6.52l6.77 5.25c3.95-3.64 6.63-9 6.63-15.69z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M9.17 28.22a14.68 14.68 0 0 1 0-8.44L4 15.76a23.98 23.98 0 0 0 0 16.48l5.17-4.02z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 45c6.42 0 11.8-2.12 15.73-5.74l-6.77-5.25c-1.87 1.25-4.27 2-8.96 2-6.96 0-12.97-4.6-14.83-10.78L4 32.24C7.22 39.57 14.95 45 24 45z"
                    />
                  </svg>
                </span>
                Entrar com Google
              </Botao>
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-border" />
              ou
              <span className="h-px flex-1 bg-border" />
            </div>

            <form className="space-y-4" onSubmit={lidarSubmit}>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="email"
                    type="email"
                    placeholder="seuemail@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="h-11 w-full rounded-full border border-input bg-background pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="senha" className="text-sm font-medium">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="senha"
                    type={mostrarSenha ? "text" : "password"}
                    placeholder="••••••••"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    disabled={isLoading}
                    className="h-11 w-full rounded-full border border-input bg-background pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {mostrarSenha ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {erro ? (
                <div className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs text-rose-600 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-400">
                  {erro}
                </div>
              ) : null}

              <Botao
                type="submit"
                disabled={isLoading}
                className={cn(
                  "h-11 w-full rounded-full bg-foreground text-background hover:bg-foreground/90",
                  erro && "bg-foreground"
                )}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Botao>
            </form>

            <div className="flex flex-col items-center gap-2 text-xs text-muted-foreground">
              <Link href="/recuperar-senha" className="text-primary hover:underline">
                Esqueceu a senha?
              </Link>
              <p>
                Não tem conta?{" "}
                <Link href="/criar-conta" className="text-primary hover:underline">
                  Criar conta
                </Link>
              </p>
            </div>

            <div className="flex items-center justify-center gap-4 pt-4 text-[11px] text-muted-foreground">
              <Link href="/privacidade" className="hover:text-foreground">
                Privacidade
              </Link>
              <span className="text-border">•</span>
              <Link href="/termos" className="hover:text-foreground">
                Termos
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
