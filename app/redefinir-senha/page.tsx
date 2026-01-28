"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
} from "lucide-react";

import { Botao } from "@/componentes/ui/botao";
import { updatePassword } from "@/lib/supabase/auth";

export default function PaginaRedefinirSenha() {
  const router = useRouter();
  const [senha, setSenha] = React.useState("");
  const [confirmarSenha, setConfirmarSenha] = React.useState("");
  const [mostrarSenha, setMostrarSenha] = React.useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [erro, setErro] = React.useState<string | null>(null);
  const [sucesso, setSucesso] = React.useState(false);

  const senhaValida = senha.length >= 6;
  const senhasCoincidem = senha === confirmarSenha && senha.length > 0;
  const formularioValido = senhaValida && senhasCoincidem;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErro(null);
    setIsLoading(true);

    try {
      const { success, error } = await updatePassword(senha);

      if (!success) {
        setErro(error ?? "Erro ao redefinir senha. Tente novamente.");
        return;
      }

      setSucesso(true);
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
          {sucesso ? (
            <div className="w-full max-w-md space-y-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="space-y-2">
                <h1 className="font-titulo text-2xl font-semibold sm:text-3xl">
                  Senha redefinida!
                </h1>
                <p className="text-sm text-muted-foreground">
                  Sua senha foi alterada com sucesso. Agora você pode fazer login
                  com sua nova senha.
                </p>
              </div>
              <Botao
                onClick={() => router.push("/entrar")}
                className="h-11 w-full rounded-full"
              >
                Ir para login
              </Botao>
            </div>
          ) : (
            <div className="w-full max-w-md space-y-6 text-center">
              <div className="space-y-2">
                <h1 className="font-titulo text-2xl font-semibold sm:text-3xl">
                  Criar nova senha
                </h1>
                <p className="text-sm text-muted-foreground">
                  Digite sua nova senha abaixo.
                </p>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2 text-left">
                  <label htmlFor="senha" className="text-sm font-medium">
                    Nova senha
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="senha"
                      type={mostrarSenha ? "text" : "password"}
                      placeholder="Mínimo 6 caracteres"
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

                <div className="space-y-2 text-left">
                  <label htmlFor="confirmar" className="text-sm font-medium">
                    Confirmar nova senha
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="confirmar"
                      type={mostrarConfirmacao ? "text" : "password"}
                      placeholder="Confirme a nova senha"
                      value={confirmarSenha}
                      onChange={(e) => setConfirmarSenha(e.target.value)}
                      disabled={isLoading}
                      className="h-11 w-full rounded-full border border-input bg-background pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarConfirmacao((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={
                        mostrarConfirmacao ? "Ocultar senha" : "Mostrar senha"
                      }
                    >
                      {mostrarConfirmacao ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {senhasCoincidem && confirmarSenha.length > 0 ? (
                    <div className="flex items-center gap-2 text-xs text-emerald-600">
                      <CheckCircle2 className="h-4 w-4" />
                      Senhas conferem
                    </div>
                  ) : confirmarSenha.length > 0 ? (
                    <p className="text-xs text-rose-500">Senhas não conferem</p>
                  ) : null}
                </div>

                {erro ? (
                  <div className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs text-rose-600 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-400">
                    {erro}
                  </div>
                ) : null}

                <Botao
                  type="submit"
                  disabled={!formularioValido || isLoading}
                  className="h-11 w-full rounded-full bg-foreground text-background hover:bg-foreground/90"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar nova senha"
                  )}
                </Botao>
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
