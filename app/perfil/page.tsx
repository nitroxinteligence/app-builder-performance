"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Camera,
  Mail,
  ShieldCheck,
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
import { useAuth } from "@/lib/providers/auth-provider";
import { Sidebar } from "@/componentes/layout/sidebar";

export default function PaginaPerfil() {
  const [sidebarAberta, setSidebarAberta] = React.useState(false);
  const { user } = useAuth();

  const nomeUsuario = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Usuário";
  const emailUsuario = user?.email || "";
  const iniciaisUsuario = nomeUsuario
    .split(" ")
    .map((parte: string) => parte[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const [email, setEmail] = React.useState(emailUsuario);
  const [senhaNova, setSenhaNova] = React.useState("");
  const [senhaConfirmacao, setSenhaConfirmacao] = React.useState("");
  const [preferencias, setPreferencias] = React.useState({
    notificacoesEmail: true,
    lembretesFoco: true,
    resumoSemanal: false,
    atualizacoesCursos: true,
  });

  React.useEffect(() => {
    if (emailUsuario) {
      setEmail(emailUsuario);
    }
  }, [emailUsuario]);

  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const senhaFoiDigitada =
    senhaNova.trim().length > 0 || senhaConfirmacao.trim().length > 0;
  const senhasConferem =
    senhaNova.trim().length > 0 &&
    senhaNova.trim() === senhaConfirmacao.trim();

  const alternarPreferencia = (chave: keyof typeof preferencias) => {
    setPreferencias((estado) => ({ ...estado, [chave]: !estado[chave] }));
  };

  const itensPreferencias = [
    {
      id: "notificacoesEmail",
      titulo: "Notificações por email",
      descricao: "Receba alertas importantes sobre tarefas e metas.",
    },
    {
      id: "lembretesFoco",
      titulo: "Lembretes do modo foco",
      descricao: "Seja avisado antes do início das sessões.",
    },
    {
      id: "resumoSemanal",
      titulo: "Resumo semanal",
      descricao: "Envio automático do seu desempenho na semana.",
    },
    {
      id: "atualizacoesCursos",
      titulo: "Atualizações de cursos",
      descricao: "Novas aulas e trilhas recomendadas.",
    },
  ] as const;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar open={sidebarAberta} onOpenChange={setSidebarAberta} />

      <div
        className={cn(
          "flex min-h-screen flex-col transition-[padding] duration-300",
          sidebarAberta ? "lg:pl-56" : "lg:pl-16"
        )}
      >
        <main id="main-content" className="flex-1 px-6 py-10">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
            <section className="flex items-center gap-3">
              <Link
                href="/inicio"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition hover:text-foreground"
                aria-label="Voltar para início"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div>
                <h1 className="font-titulo text-2xl font-semibold">Perfil</h1>
                <p className="text-sm text-muted-foreground">
                  Gerencie suas informações e preferências.
                </p>
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-6">
                <Cartao>
                  <CartaoCabecalho>
                    <CartaoTitulo className="text-base">
                      Informações pessoais
                    </CartaoTitulo>
                    <CartaoDescricao>
                      Atualize seus dados principais.
                    </CartaoDescricao>
                  </CartaoCabecalho>
                  <CartaoConteudo className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="nome">
                          Nome completo
                        </label>
                        <input
                          id="nome"
                          defaultValue={nomeUsuario}
                          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="email">
                          Email
                        </label>
                        <div className="relative">
                          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <input
                            id="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          />
                        </div>
                        <p
                          className={cn(
                            "text-xs",
                            emailValido
                              ? "text-emerald-600"
                              : "text-destructive"
                          )}
                        >
                          {emailValido
                            ? "Email válido."
                            : "Informe um email válido."}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Botao variant="secondary">Salvar alterações</Botao>
                    </div>
                  </CartaoConteudo>
                </Cartao>

                <Cartao>
                  <CartaoCabecalho>
                    <CartaoTitulo className="text-base">Segurança</CartaoTitulo>
                    <CartaoDescricao>
                      Atualize sua senha periodicamente.
                    </CartaoDescricao>
                  </CartaoCabecalho>
                  <CartaoConteudo className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="senha-atual">
                        Senha atual
                      </label>
                      <input
                        id="senha-atual"
                        type="password"
                        placeholder="Digite sua senha atual"
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="senha-nova">
                          Nova senha
                        </label>
                      <input
                        id="senha-nova"
                        type="password"
                        placeholder="Nova senha"
                        value={senhaNova}
                        onChange={(event) => setSenhaNova(event.target.value)}
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="senha-confirmacao">
                        Confirmar senha
                      </label>
                      <input
                        id="senha-confirmacao"
                        type="password"
                        placeholder="Confirme a senha"
                        value={senhaConfirmacao}
                        onChange={(event) =>
                          setSenhaConfirmacao(event.target.value)
                        }
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                      {senhaFoiDigitada ? (
                        <p
                          className={cn(
                            "text-xs",
                            senhasConferem
                              ? "text-emerald-600"
                              : "text-destructive"
                          )}
                        >
                          {senhasConferem
                            ? "Senhas conferem."
                            : "As senhas não conferem."}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Botao variant="secondary">Atualizar senha</Botao>
                  </div>
                </CartaoConteudo>
              </Cartao>

              <Cartao>
                <CartaoCabecalho>
                  <CartaoTitulo className="text-base">Preferências</CartaoTitulo>
                  <CartaoDescricao>
                    Ajuste como deseja receber avisos e recomendações.
                  </CartaoDescricao>
                </CartaoCabecalho>
                <CartaoConteudo className="space-y-4">
                  {itensPreferencias.map((item) => {
                    const ativo = preferencias[item.id];
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{item.titulo}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.descricao}
                          </p>
                        </div>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={ativo}
                          onClick={() => alternarPreferencia(item.id)}
                          className={cn(
                            "inline-flex h-5 w-9 items-center rounded-full border border-border p-0.5 transition-colors",
                            ativo ? "bg-primary" : "bg-secondary"
                          )}
                        >
                          <span
                            className={cn(
                              "h-4 w-4 rounded-full bg-background shadow-sm transition-transform",
                              ativo ? "translate-x-4" : "translate-x-0"
                            )}
                          />
                        </button>
                      </div>
                    );
                  })}
                </CartaoConteudo>
              </Cartao>
            </div>

              <div className="space-y-4">
                <Cartao>
                  <CartaoConteudo className="space-y-4 p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground">
                        {iniciaisUsuario}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {nomeUsuario}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {emailUsuario}
                        </p>
                      </div>
                    </div>
                    <Botao variant="outline" size="sm" className="gap-2">
                      <Camera className="h-4 w-4" />
                      Alterar foto
                    </Botao>
                  </CartaoConteudo>
                </Cartao>

                <Cartao>
                  <CartaoConteudo className="space-y-3 p-5">
                    <CartaoTitulo className="text-base">
                      Status da conta
                    </CartaoTitulo>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                      Conta verificada
                    </div>
                    <div className="rounded-xl border border-border bg-secondary/40 px-4 py-3 text-xs text-muted-foreground">
                      Mantenha seus dados atualizados para garantir acesso às
                      aulas e conquistas.
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
