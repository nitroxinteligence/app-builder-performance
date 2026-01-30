"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  MailCheck,
  UserRound,
} from "lucide-react";

import { Botao } from "@/componentes/ui/botao";
import { CaixaSelecao } from "@/componentes/ui/caixa-selecao";
import { cn } from "@/lib/utilidades";
import { signUpWithEmail } from "@/lib/supabase/auth";

const papeis = [
  "Aluno da Builders",
  "Empreendedor",
  "Dono de agência",
  "Dono de negócio físico",
  "Freelancer",
  "Gestor de equipe",
  "Outro",
];

export default function PaginaCriarConta() {
  const router = useRouter();
  const [passo, setPasso] = React.useState<
    | "perfil"
    | "papel"
    | "email-enviado"
    | "email-confirmando"
    | "email-confirmado"
  >("perfil");
  const [mostrarSenha, setMostrarSenha] = React.useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = React.useState(false);
  const [papelSelecionado, setPapelSelecionado] = React.useState<string | null>(
    null
  );
  const [papelOutro, setPapelOutro] = React.useState("");
  const [nomeCompleto, setNomeCompleto] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [telefone, setTelefone] = React.useState("");
  const [senha, setSenha] = React.useState("");
  const [confirmarSenha, setConfirmarSenha] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [erro, setErro] = React.useState<string | null>(null);
  const emailConfirmacao = email.trim() || "samlee.mobbin@gmail.com";
  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const telefoneValido = telefone.replace(/\D/g, "").length === 11;
  const senhasCoincidem =
    senha.trim().length > 0 &&
    confirmarSenha.trim().length > 0 &&
    senha === confirmarSenha;
  const papelPrecisaDescricao = papelSelecionado === "Outro";
  const papelValido = Boolean(
    papelSelecionado && (!papelPrecisaDescricao || papelOutro.trim().length > 0)
  );
  const formularioValido =
    nomeCompleto.trim().length > 0 &&
    emailValido &&
    telefoneValido &&
    senhasCoincidem;

  const formatarTelefone = (valor: string) => {
    const digitos = valor.replace(/\D/g, "").slice(0, 11);
    if (!digitos.length) {
      return "";
    }
    if (digitos.length <= 2) {
      return `(${digitos}`;
    }
    const ddd = digitos.slice(0, 2);
    if (digitos.length <= 6) {
      return `(${ddd}) ${digitos.slice(2)}`;
    }
    if (digitos.length <= 10) {
      return `(${ddd}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
    }
    return `(${ddd}) ${digitos.slice(2, 3)}.${digitos.slice(3, 7)}-${digitos.slice(7)}`;
  };

  const handleCriarConta = async () => {
    setErro(null);
    setIsLoading(true);

    try {
      const papel = papelSelecionado === "Outro" ? papelOutro : papelSelecionado;
      const { success, error } = await signUpWithEmail(email, senha, {
        full_name: nomeCompleto,
        phone: telefone.replace(/\D/g, ""),
        role: papel,
      });

      if (!success) {
        setErro(error ?? "Erro ao criar conta. Tente novamente.");
        return;
      }

      setPasso("email-enviado");
    } catch {
      setErro("Ocorreu um erro inesperado. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (passo !== "email-confirmando") {
      return;
    }
    const timeout = window.setTimeout(() => {
      setPasso("email-confirmado");
    }, 1600);
    return () => window.clearTimeout(timeout);
  }, [passo]);

  const voltarEtapa = () => {
    if (passo === "papel") {
      setPasso("perfil");
      return;
    }
    if (passo === "email-enviado") {
      setPasso("papel");
      return;
    }
    if (passo === "email-confirmado" || passo === "email-confirmando") {
      setPasso("email-enviado");
      return;
    }
    router.push("/entrar");
  };

  const mostrarProgresso = passo === "perfil" || passo === "papel";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={voltarEtapa}
            className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </button>
        </div>

        {mostrarProgresso ? (
          <div className="mt-6 h-1 w-full rounded-full bg-secondary">
            <div
              className={cn(
                "h-full rounded-full bg-primary transition-all",
                passo === "perfil" ? "w-1/2" : "w-full"
              )}
            />
          </div>
        ) : null}

        <div className="flex flex-1 items-center justify-center">
          {passo === "perfil" ? (
            <div className="w-full max-w-md space-y-6 text-center">
              <div className="space-y-2">
                <h1 className="font-titulo text-2xl font-semibold sm:text-3xl">
                  Crie seu perfil
                </h1>
                <p className="text-sm text-muted-foreground">
                  É assim que você será visto no Builders Performance.
                </p>
              </div>

              <div className="flex flex-col items-center gap-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                  <UserRound className="h-6 w-6" />
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  <Camera className="h-3.5 w-3.5" />
                  Enviar imagem
                </button>
              </div>

              <div className="space-y-4 text-left">
                <div className="space-y-2">
                  <label htmlFor="nome" className="text-sm font-medium">
                    Nome completo
                  </label>
                  <input
                    id="nome"
                    type="text"
                    placeholder="Digite seu nome"
                    value={nomeCompleto}
                    onChange={(event) => setNomeCompleto(event.target.value)}
                    required
                    className="h-11 w-full rounded-full border border-input bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    E-mail válido
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="nome@exemplo.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    aria-invalid={email.length > 0 && !emailValido}
                    className="h-11 w-full rounded-full border border-input bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="telefone" className="text-sm font-medium">
                    Número de telefone
                  </label>
                  <input
                    id="telefone"
                    type="tel"
                    inputMode="tel"
                    placeholder="(00) 0.0000-0000"
                    value={telefone}
                    onChange={(event) =>
                      setTelefone(formatarTelefone(event.target.value))
                    }
                    required
                    aria-invalid={telefone.length > 0 && !telefoneValido}
                    className="h-11 w-full rounded-full border border-input bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>

                <div className="space-y-3 rounded-2xl border border-border bg-background/60 p-4">
                  <div className="space-y-2">
                    <label htmlFor="senha" className="text-sm font-medium">
                      Senha
                    </label>
                    <div className="relative">
                      <input
                        id="senha"
                        type={mostrarSenha ? "text" : "password"}
                        placeholder="Defina uma senha"
                        value={senha}
                        onChange={(event) => setSenha(event.target.value)}
                        required
                        className="h-11 w-full rounded-full border border-input bg-background px-4 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                      <button
                        type="button"
                        onClick={() => setMostrarSenha((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label={
                          mostrarSenha ? "Ocultar senha" : "Mostrar senha"
                        }
                      >
                        {mostrarSenha ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="confirmar" className="text-sm font-medium">
                      Confirmar senha
                    </label>
                    <div className="relative">
                      <input
                        id="confirmar"
                        type={mostrarConfirmacao ? "text" : "password"}
                        placeholder="Confirme a senha"
                        value={confirmarSenha}
                        onChange={(event) => setConfirmarSenha(event.target.value)}
                        required
                        aria-invalid={
                          confirmarSenha.length > 0 && !senhasCoincidem
                        }
                        className="h-11 w-full rounded-full border border-input bg-background px-4 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setMostrarConfirmacao((prev) => !prev)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label={
                          mostrarConfirmacao
                            ? "Ocultar senha"
                            : "Mostrar senha"
                        }
                      >
                        {mostrarConfirmacao ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {senhasCoincidem ? (
                      <div className="flex items-center gap-2 text-xs text-emerald-600">
                        <CheckCircle2 className="h-4 w-4" />
                        Senhas conferem
                      </div>
                    ) : confirmarSenha.length > 0 ? (
                      <p className="text-xs text-rose-500">
                        Senhas não conferem
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>

              <Botao
                className="h-11 w-full rounded-full bg-foreground text-background hover:bg-foreground/90"
                onClick={() => setPasso("papel")}
                disabled={!formularioValido}
              >
                Continuar
              </Botao>

              <label
                htmlFor="comunicacoes"
                className="flex items-center justify-center gap-2 text-xs text-muted-foreground"
              >
                <CaixaSelecao id="comunicacoes" />
                Concordo em receber comunicações da Builders.
              </label>
            </div>
          ) : passo === "papel" ? (
            <div className="w-full max-w-md space-y-6 text-center">
              <div className="space-y-2">
                <h1 className="font-titulo text-2xl font-semibold sm:text-3xl">
                  Qual é o seu papel?
                </h1>
                <p className="text-sm text-muted-foreground">
                  Vamos personalizar o Builders para o seu trabalho.
                </p>
              </div>

              <div className="space-y-2 text-left">
                {papeis.map((papel) => {
                  const ativo = papelSelecionado === papel;
                  return (
                    <button
                      key={papel}
                      type="button"
                      onClick={() => setPapelSelecionado(papel)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-2xl border border-border px-4 py-3 text-sm transition",
                        ativo
                          ? "border-primary bg-secondary/70 text-foreground"
                          : "bg-background hover:bg-secondary/40"
                      )}
                    >
                      <span>{papel}</span>
                      {ativo ? (
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <CheckCircle2 className="h-4 w-4" />
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>

              {papelSelecionado === "Outro" ? (
                <div className="space-y-2 text-left">
                  <label htmlFor="papel-outro" className="text-sm font-medium">
                    Qual é o seu papel?
                  </label>
                  <input
                    id="papel-outro"
                    type="text"
                    placeholder="Descreva seu papel"
                    value={papelOutro}
                    onChange={(event) => setPapelOutro(event.target.value)}
                    required
                    aria-invalid={papelOutro.trim().length === 0}
                    className="h-11 w-full rounded-full border border-input bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              ) : null}

              {erro ? (
                <div className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs text-rose-600 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-400">
                  {erro}
                </div>
              ) : null}

              <div className="space-y-2">
                <Botao
                  className="h-11 w-full rounded-full bg-foreground text-background hover:bg-foreground/90"
                  disabled={!papelValido || isLoading}
                  onClick={handleCriarConta}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando conta...
                    </>
                  ) : (
                    "Criar conta"
                  )}
                </Botao>
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => setPasso("perfil")}
                  disabled={isLoading}
                >
                  Voltar
                </button>
              </div>
            </div>
          ) : passo === "email-enviado" ? (
            <div className="w-full max-w-md space-y-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                <MailCheck className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h1 className="font-titulo text-2xl font-semibold sm:text-3xl">
                  Enviamos um email
                </h1>
                <p className="text-sm text-muted-foreground">
                  Um link de confirmação foi enviado para:
                </p>
                <div className="mx-auto w-fit rounded-full border border-border bg-background px-4 py-2 text-xs font-medium text-muted-foreground">
                  {emailConfirmacao}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Não recebeu?{" "}
                <button
                  type="button"
                  className="text-primary hover:underline"
                  onClick={() => setPasso("email-enviado")}
                >
                  Reenviar link
                </button>
              </p>
              <Botao
                className="h-11 w-full rounded-full bg-foreground text-background hover:bg-foreground/90"
                onClick={() => setPasso("email-confirmando")}
              >
                Confirmar email
              </Botao>
            </div>
          ) : passo === "email-confirmando" ? (
            <div className="w-full max-w-md space-y-6 text-center">
              <div className="space-y-2">
                <h1 className="font-titulo text-2xl font-semibold sm:text-3xl">
                  Confirmando seu email
                </h1>
                <p className="text-sm text-muted-foreground">
                  Aguarde alguns segundos.
                </p>
              </div>
              <div className="flex items-center justify-center">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
              </div>
            </div>
          ) : (
            <div className="w-full max-w-md space-y-6 text-center">
              <div className="space-y-2">
                <h1 className="font-titulo text-2xl font-semibold sm:text-3xl">
                  Email confirmado!
                </h1>
                <p className="text-sm text-muted-foreground">
                  Agora você pode continuar.
                </p>
              </div>
              <Botao
                className="h-11 w-full rounded-full bg-foreground text-background hover:bg-foreground/90"
                onClick={() => router.push("/onboarding")}
              >
                Continuar
              </Botao>
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
