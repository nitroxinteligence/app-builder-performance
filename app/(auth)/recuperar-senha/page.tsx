"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Mail, CheckCircle2 } from "lucide-react";

import { Botao } from "@/componentes/ui/botao";
import { resetPassword } from "@/lib/supabase/auth";

export default function PaginaRecuperarSenha() {
  const [email, setEmail] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [erro, setErro] = React.useState<string | null>(null);
  const [emailEnviado, setEmailEnviado] = React.useState(false);

  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const enviarEmail = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErro(null);
    setIsLoading(true);

    try {
      const { success, error } = await resetPassword(email);

      if (!success) {
        setErro(error ?? "Erro ao enviar email. Tente novamente.");
        return;
      }

      setEmailEnviado(true);
    } catch {
      setErro("Ocorreu um erro inesperado. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8">
        <div className="flex items-center justify-between">
          <Link
            href="/entrar"
            className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center">
          {emailEnviado ? (
            <div className="w-full max-w-md space-y-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="space-y-2">
                <h1 className="font-titulo text-2xl font-semibold sm:text-3xl">
                  Email enviado!
                </h1>
                <p className="text-sm text-muted-foreground">
                  Enviamos um link de redefinição de senha para:
                </p>
                <p className="mx-auto w-fit rounded-full border border-border bg-background px-4 py-2 text-xs font-medium text-foreground">
                  {email}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Não recebeu?{" "}
                <button
                  type="button"
                  onClick={() => setEmailEnviado(false)}
                  className="text-primary hover:underline"
                >
                  Tentar novamente
                </button>
              </p>
              <Botao asChild className="h-11 w-full rounded-full">
                <Link href="/entrar">Voltar para login</Link>
              </Botao>
            </div>
          ) : (
            <div className="w-full max-w-md space-y-6 text-center">
              <div className="space-y-2">
                <h1 className="font-titulo text-2xl font-semibold sm:text-3xl">
                  Redefinir sua senha
                </h1>
                <p className="text-sm text-muted-foreground">
                  Enviaremos um link para redefinir sua senha.
                </p>
              </div>

              <form className="space-y-4" onSubmit={enviarEmail}>
                <div className="space-y-2 text-left">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="email"
                      type="email"
                      placeholder="Digite seu email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      className="h-11 w-full rounded-full border border-input bg-background pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                </div>

                {erro ? (
                  <div className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs text-rose-600 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-400">
                    {erro}
                  </div>
                ) : null}

                <Botao
                  type="submit"
                  disabled={!emailValido || isLoading}
                  className="h-11 w-full rounded-full bg-foreground text-background hover:bg-foreground/90"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar link de redefinição"
                  )}
                </Botao>
                <p className="text-xs text-muted-foreground">
                  Verifique sua caixa de spam caso não encontre o email.
                </p>
              </form>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-4 pb-4 text-[11px] text-muted-foreground">
          <Link href="/privacidade" className="hover:text-foreground">
            Privacidade
          </Link>
          <span className="text-border">•</span>
          <Link href="/termos" className="hover:text-foreground">
            Termos
          </Link>
        </div>
      </div>
    </div>
  );
}
