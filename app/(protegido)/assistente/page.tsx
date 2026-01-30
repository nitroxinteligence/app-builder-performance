"use client";

import * as React from "react";
import { Clock, Mic, Plus, Search, Send } from "lucide-react";

import { Botao } from "@/componentes/ui/botao";
import { Cartao, CartaoConteudo } from "@/componentes/ui/cartao";
import {
  Dica,
  DicaConteudo,
  DicaGatilho,
  ProvedorDica,
} from "@/componentes/ui/dica";
import { cn } from "@/lib/utilidades";
import { useAuth } from "@/lib/providers/auth-provider";

import {
  cartoesSugestao,
  conversasIniciais,
  type ConversaAssistente,
  type MensagemAssistente,
} from "./dados-assistente";

const criarId = () => Math.random().toString(36).slice(2, 9);

export default function PaginaAssistente() {
  const [conversas, setConversas] = React.useState<ConversaAssistente[]>(
    conversasIniciais
  );
  const [conversaAtivaId, setConversaAtivaId] = React.useState(
    conversasIniciais[0]?.id ?? ""
  );
  const [textoAtual, setTextoAtual] = React.useState("");
  const containerMensagensRef = React.useRef<HTMLDivElement>(null);
  const fimMensagensRef = React.useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const nomeUsuario =
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Usuário";
  const primeiroNome = nomeUsuario.split(" ")[0] ?? nomeUsuario;

  const rolarParaBaixo = React.useCallback(
    (behavior: ScrollBehavior = "auto") => {
      const container = containerMensagensRef.current;
      if (!container) {
        return;
      }
      const scroll = () => {
        container.scrollTo({
          top: container.scrollHeight,
          behavior,
        });
        fimMensagensRef.current?.scrollIntoView({
          behavior,
          block: "end",
        });
      };
      scroll();
      window.requestAnimationFrame(scroll);
      window.setTimeout(scroll, 120);
    },
    []
  );

  const conversaAtiva =
    conversas.find((conversa) => conversa.id === conversaAtivaId) ??
    conversas[0];
  const mensagens = conversaAtiva?.mensagens ?? [];
  const mostrarHero =
    mensagens.length <= 1 && mensagens[0]?.autor === "assistente";

  React.useLayoutEffect(() => {
    rolarParaBaixo("auto");
  }, [mensagens.length, conversaAtivaId, rolarParaBaixo]);

  const criarNovaConversa = () => {
    const novaMensagem: MensagemAssistente = {
      id: criarId(),
      autor: "assistente",
      conteudo: "Vamos começar uma nova conversa. Como posso ajudar?",
      detalhes: [
        "Planejar tarefas do dia",
        "Criar blocos de foco",
        "Acompanhar hábitos",
      ],
    };
    const novaConversa: ConversaAssistente = {
      id: criarId(),
      titulo: "Nova conversa",
      ultimaMensagem: novaMensagem.conteudo,
      atualizadoEm: "Agora",
      mensagens: [novaMensagem],
    };
    setConversas((prev) => [novaConversa, ...prev]);
    setConversaAtivaId(novaConversa.id);
    setTextoAtual("");
  };

  const enviarMensagem = (conteudo?: string) => {
    const texto = (conteudo ?? textoAtual).trim();
    if (!texto || !conversaAtiva) {
      return;
    }

    const mensagemUsuario: MensagemAssistente = {
      id: criarId(),
      autor: "usuario",
      conteudo: texto,
    };
    const respostaAssistente: MensagemAssistente = {
      id: criarId(),
      autor: "assistente",
      conteudo: `Entendi: "${texto}". Quer que eu gere um resumo com próximos passos?`,
      acoes: ["Sim, gerar resumo", "Depois"],
    };

    setConversas((prev) =>
      prev.map((conversa) => {
        if (conversa.id !== conversaAtiva.id) {
          return conversa;
        }
        const novasMensagens = [
          ...conversa.mensagens,
          mensagemUsuario,
          respostaAssistente,
        ];
        return {
          ...conversa,
          mensagens: novasMensagens,
          ultimaMensagem: respostaAssistente.conteudo,
          atualizadoEm: "Agora",
        };
      })
    );
    setTextoAtual("");
    window.requestAnimationFrame(() => {
      rolarParaBaixo("smooth");
    });
  };

  const tratarEnvio = () => enviarMensagem();

  const tratarTecla = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      tratarEnvio();
    }
  };

  return (
    <>
      <aside className="w-full border-b border-border bg-sidebar p-6 lg:fixed lg:left-0 lg:top-0 lg:z-30 lg:ml-16 lg:h-screen lg:w-64 lg:border-b-0 lg:border-r lg:transition-all lg:duration-300">
          <ProvedorDica delayDuration={150} skipDelayDuration={0}>
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Builder Assistant</p>
              </div>

              <div className="mt-6">
                <Botao className="w-full gap-2" onClick={criarNovaConversa}>
                  <Plus className="h-4 w-4" />
                  Novo chat
                </Botao>
              </div>

              <div className="relative mt-4">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  placeholder="Buscar conversa"
                  className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div className="kanban-scroll mt-4 flex-1 space-y-6 overflow-y-auto">
                <div className="relative space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Suas conversas
                  </p>
                  <div className="space-y-2">
                    {conversas.map((conversa) => {
                      const ativa = conversa.id === conversaAtivaId;
                      return (
                        <button
                          key={conversa.id}
                          type="button"
                          onClick={() => setConversaAtivaId(conversa.id)}
                          className={cn(
                            "flex w-full flex-col gap-2 rounded-xl border border-border px-3 py-3 text-left transition",
                            ativa
                              ? "bg-secondary text-secondary-foreground"
                              : "bg-background/60 text-foreground hover:bg-secondary/60"
                          )}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold">
                              {conversa.titulo}
                            </p>
                            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {conversa.atualizadoEm}
                            </span>
                          </div>
                          <p className="line-clamp-2 text-xs text-muted-foreground">
                            {conversa.ultimaMensagem}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-border bg-background/60 p-3 text-xs text-muted-foreground">
                Sugestão: organize conversas por tema para acelerar respostas.
              </div>
            </div>
          </ProvedorDica>
        </aside>

        <main
          className={cn(
            "flex-1 px-6 pt-10 pb-20 lg:transition-[padding] lg:duration-300",
            "lg:pl-72"
          )}
        >
          <div className="mx-auto flex min-h-[calc(100vh-120px)] w-full max-w-5xl flex-col gap-8">
            <div className="flex min-h-0 flex-1 flex-col gap-8 pb-8">
              {mostrarHero ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-8 text-center">
                  <div className="space-y-2">
                    <p className="text-3xl font-semibold text-muted-foreground sm:text-4xl">
                      Olá,{" "}
                      <span className="bg-gradient-to-r from-primary to-amber-500 bg-clip-text text-transparent">
                        {primeiroNome}
                      </span>
                    </p>
                    <p className="text-2xl font-semibold text-muted-foreground sm:text-3xl">
                      Como posso ajudar hoje?
                    </p>
                  </div>
                  <div className="grid w-full max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {cartoesSugestao.map((cartao) => (
                      <button
                        key={cartao.id}
                        type="button"
                        onClick={() => enviarMensagem(cartao.acao)}
                        className="text-left"
                      >
                        <Cartao className="h-full transition hover:bg-secondary/50">
                          <CartaoConteudo className="flex h-full flex-col gap-4 p-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                              <cartao.icone className="h-4 w-4" />
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm font-semibold">
                                {cartao.titulo}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {cartao.descricao}
                              </p>
                            </div>
                            <ul className="space-y-1 text-xs text-muted-foreground">
                              {cartao.itens.map((item) => (
                                <li key={item}>• {item}</li>
                              ))}
                            </ul>
                          </CartaoConteudo>
                        </Cartao>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col">
                  <div
                    ref={containerMensagensRef}
                    className="min-h-0 flex-1 space-y-4 overflow-y-auto pb-4 pr-2 scroll-pb-24"
                  >
                    {mensagens.map((mensagem) => {
                      const ehUsuario = mensagem.autor === "usuario";
                      return (
                        <div
                          key={mensagem.id}
                          className={cn(
                            "flex",
                            ehUsuario ? "justify-end" : "justify-start"
                          )}
                        >
                          <div
                            className={cn(
                              "max-w-[75%] space-y-3 rounded-2xl border border-border px-4 py-3 text-sm",
                              ehUsuario
                                ? "bg-sidebar text-[#1f1f1f] dark:text-foreground"
                                : "bg-background/60"
                            )}
                          >
                            <p>{mensagem.conteudo}</p>
                            {mensagem.detalhes ? (
                              <ul className="space-y-1 text-xs text-muted-foreground">
                                {mensagem.detalhes.map((item) => (
                                  <li key={item}>• {item}</li>
                                ))}
                              </ul>
                            ) : null}
                            {mensagem.acoes ? (
                              <div className="flex flex-wrap gap-2">
                                {mensagem.acoes.map((acao) => (
                                  <Botao
                                    key={acao}
                                    size="sm"
                                    variant="secondary"
                                    className="gap-1 text-xs"
                                    onClick={() => enviarMensagem(acao)}
                                  >
                                    {acao}
                                  </Botao>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                    <div ref={fimMensagensRef} className="h-1 w-full" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

      <div className="fixed bottom-6 left-0 right-0 z-30 px-6 lg:pl-24">
        <div className="mx-auto w-full max-w-3xl lg:pl-64">
          <div className="flex items-center gap-2 rounded-full border border-border bg-[#F4F4F4] px-4 py-2">
            <textarea
              value={textoAtual}
              onChange={(event) => setTextoAtual(event.target.value)}
              onKeyDown={tratarTecla}
              rows={1}
              placeholder="Digite sua mensagem..."
              className="h-11 min-h-[44px] w-full resize-none bg-transparent px-2 py-0 text-sm leading-[44px] text-foreground placeholder:text-muted-foreground focus-visible:outline-none"
            />
            <Botao
              variant="ghost"
              size="icon"
              aria-label="Mensagem por voz"
              className="rounded-full"
            >
              <Mic className="h-4 w-4" />
            </Botao>
            <Botao
              size="icon"
              aria-label="Enviar mensagem"
              onClick={tratarEnvio}
              disabled={!textoAtual.trim()}
              className="rounded-full"
            >
              <Send className="h-4 w-4" />
            </Botao>
          </div>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            O Assistant pode cometer erros. Verifique informações críticas.
          </p>
        </div>
      </div>
    </>
  );
}
