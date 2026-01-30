"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarCheck,
  Check,
  ChevronDown,
  ChevronRight,
  Circle,
  Flame,
  ListTodo,
  Star,
  Sun,
  Timer,
  Moon,
  WandSparkles,
  Zap,
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
import { Separador } from "@/componentes/ui/separador";
import {
  Dialogo,
  DialogoConteudo,
  DialogoTitulo,
} from "@/componentes/ui/dialogo";
import { EsqueletoCartao, EsqueletoEstatistica } from "@/componentes/ui/esqueleto";
import { EstadoVazioGenerico } from "@/componentes/ui/estado-vazio";
import { ErrorBoundary } from "@/componentes/erro";
import { cn } from "@/lib/utilidades";
import { useAuth } from "@/lib/providers/auth-provider";

import { useDashboardData } from "@/hooks/useDashboard";
import type {
  CardResumo,
  DailyMission,
  WeeklyMission,
  ProgressoItem,
} from "@/types/dashboard";
import AcoesRapidasInicio from "./acoes-rapidas";

interface CartaoResumoProps {
  card: CardResumo;
}

const CartaoResumo = React.memo(function CartaoResumo({ card }: CartaoResumoProps) {
  return (
    <Cartao>
      <CartaoConteudo className="space-y-3 p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {card.titulo}
          </p>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
            <card.icone className="h-4 w-4" aria-hidden="true" />
          </div>
        </div>
        <div className="space-y-1">
          <p className="font-titulo text-xl font-semibold">
            {card.valor}
          </p>
          <p className="text-sm text-muted-foreground">
            {card.detalhe}
          </p>
        </div>
      </CartaoConteudo>
    </Cartao>
  );
});

interface ItemMissaoDiariaProps {
  missao: DailyMission;
}

const ItemMissaoDiaria = React.memo(function ItemMissaoDiaria({ missao }: ItemMissaoDiariaProps) {
  return (
    <div className="flex items-center gap-3" role="listitem">
      <div className="flex h-5 w-5 items-center justify-center">
        {missao.concluida ? (
          <Check className="h-4 w-4 text-primary" aria-hidden="true" />
        ) : (
          <Circle className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        )}
      </div>
      <div className="flex flex-1 items-center justify-between text-sm">
        <span
          className={
            missao.concluida
              ? "text-foreground"
              : "text-muted-foreground"
          }
        >
          {missao.texto}
        </span>
        <span className="text-muted-foreground">
          {missao.xp}
        </span>
      </div>
    </div>
  );
});

interface ItemMissaoSemanalProps {
  desafio: WeeklyMission;
  isLast: boolean;
}

const ItemMissaoSemanal = React.memo(function ItemMissaoSemanal({ desafio, isLast }: ItemMissaoSemanalProps) {
  return (
    <div className="space-y-2" role="listitem">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium">{desafio.texto}</p>
        <span className="rounded-full border border-border px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          {desafio.recompensa}
        </span>
      </div>
      {!isLast ? <Separador /> : null}
    </div>
  );
});

interface ItemProgressoSemanalProps {
  item: ProgressoItem;
}

const ItemProgressoSemanal = React.memo(function ItemProgressoSemanal({ item }: ItemProgressoSemanalProps) {
  return (
    <div className="space-y-2" role="listitem">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{item.titulo}</span>
        <span className="text-muted-foreground">
          {item.detalhe}
        </span>
      </div>
      <Progresso value={item.percentual} aria-label={`${item.titulo}: ${item.percentual}%`} />
    </div>
  );
});

function ConteudoPaginaInicio() {
  const { user } = useAuth();
  const {
    userLevel,
    cardsResumo,
    progressoSemanal,
    missoesDiarias,
    missoesSemanais,
    isLoading: carregando,
  } = useDashboardData();

  const nomeUsuario = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Usuário";
  const primeiroNome = nomeUsuario.split(" ")[0] ?? nomeUsuario;
  const agora = new Date();
  const horaAtual = agora.getHours();
  const dataHoraFormatada = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(agora);
  const IconeSaudacao = horaAtual >= 6 && horaAtual < 18 ? Sun : Moon;
  const saudacao =
    horaAtual < 12
      ? `Olá, ${primeiroNome}! Bom dia. O que você quer fazer hoje?`
      : horaAtual < 18
        ? `Olá, ${primeiroNome}! Boa tarde. Como está o seu dia?`
        : `Olá, ${primeiroNome}! Boa noite. Dia produtivo por aí?`;
  const saudacaoDailyStart =
    horaAtual < 12
      ? `☀️ Bom dia, ${primeiroNome}!`
      : horaAtual < 18
        ? `🌤️ Boa tarde, ${primeiroNome}!`
        : `🌙 Boa noite, ${primeiroNome}!`;
  const [dailyStartAberto, setDailyStartAberto] = React.useState(false);
  const questsConcluidas = missoesDiarias.filter(
    (missao) => missao.concluida
  ).length;
  const estatisticasDailyStart = React.useMemo(() => [
    { id: "streak", label: "Streak", valor: `${userLevel.streakAtual} dias`, icone: Flame },
    { id: "energia", label: "Energia", valor: "100%", icone: Zap },
    {
      id: "level",
      label: "Level",
      valor: String(userLevel.nivel),
      icone: Star,
    },
  ], [userLevel.streakAtual, userLevel.nivel]);
  const textoAssistant =
    "Ontem você foi incrível! 8 tarefas completas e 2h45min de foco — acima da sua média. Hoje tem 5 tarefas pendentes, 2 de alta prioridade. Bora manter o ritmo?";

  React.useEffect(() => {
    const chave = "daily-start-ultima-exibicao";
    const agora = Date.now();
    const ultimaExibicao = Number(localStorage.getItem(chave) ?? 0);

    if (!ultimaExibicao || agora - ultimaExibicao >= 24 * 60 * 60 * 1000) {
      setDailyStartAberto(true);
    }
  }, []);

  const atualizarAberturaDailyStart = React.useCallback((aberto: boolean) => {
    setDailyStartAberto(aberto);

    if (!aberto) {
      localStorage.setItem("daily-start-ultima-exibicao", String(Date.now()));
    }
  }, []);

  const renderCardsResumo = () => {
    if (carregando) {
      return (
        <>
          {[1, 2, 3, 4].map((i) => (
            <EsqueletoEstatistica key={i} />
          ))}
        </>
      );
    }

    if (cardsResumo.length === 0) {
      return (
        <div className="col-span-full">
          <EstadoVazioGenerico
            titulo="Sem dados disponíveis"
            descricao="Nenhum resumo de atividade disponível no momento."
          />
        </div>
      );
    }

    return cardsResumo.map((card) => (
      <CartaoResumo key={card.id} card={card} />
    ));
  };

  const renderProgressoSemanal = () => {
    if (carregando) {
      return <EsqueletoCartao linhasConteudo={6} />;
    }

    if (progressoSemanal.length === 0) {
      return (
        <Cartao>
          <CartaoCabecalho>
            <CartaoTitulo>Progresso semanal</CartaoTitulo>
            <CartaoDescricao>
              Acompanhe o ritmo das últimas semanas.
            </CartaoDescricao>
          </CartaoCabecalho>
          <CartaoConteudo>
            <EstadoVazioGenerico
              titulo="Sem progresso registrado"
              descricao="Complete tarefas e sessões de foco para ver seu progresso."
            />
          </CartaoConteudo>
        </Cartao>
      );
    }

    return (
      <Cartao>
        <CartaoCabecalho>
          <CartaoTitulo>Progresso semanal</CartaoTitulo>
          <CartaoDescricao>
            Acompanhe o ritmo das últimas semanas.
          </CartaoDescricao>
        </CartaoCabecalho>
        <CartaoConteudo className="space-y-5">
          <div role="list" aria-label="Lista de progresso semanal">
            {progressoSemanal.map((item) => (
              <ItemProgressoSemanal key={item.id} item={item} />
            ))}
          </div>
        </CartaoConteudo>
      </Cartao>
    );
  };

  const renderMissoesDiarias = () => {
    if (carregando) {
      return <EsqueletoCartao linhasConteudo={5} />;
    }

    if (missoesDiarias.length === 0) {
      return (
        <Cartao>
          <CartaoCabecalho>
            <CartaoTitulo>Missões diárias</CartaoTitulo>
            <CartaoDescricao>Nenhuma missão hoje</CartaoDescricao>
          </CartaoCabecalho>
          <CartaoConteudo>
            <EstadoVazioGenerico
              titulo="Sem missões disponíveis"
              descricao="Novas missões serão adicionadas em breve."
            />
          </CartaoConteudo>
        </Cartao>
      );
    }

    return (
      <Cartao>
        <CartaoCabecalho>
          <CartaoTitulo>Missões diárias</CartaoTitulo>
          <CartaoDescricao>{questsConcluidas}/{missoesDiarias.length} concluídas hoje</CartaoDescricao>
        </CartaoCabecalho>
        <CartaoConteudo className="space-y-3">
          <div role="list" aria-label="Lista de missões diárias">
            {missoesDiarias.map((missao) => (
              <ItemMissaoDiaria key={missao.id} missao={missao} />
            ))}
          </div>
        </CartaoConteudo>
      </Cartao>
    );
  };

  const renderMissoesSemanais = () => {
    if (carregando) {
      return <EsqueletoCartao linhasConteudo={8} />;
    }

    if (missoesSemanais.length === 0) {
      return (
        <Cartao>
          <CartaoCabecalho>
            <CartaoTitulo>Missões semanais</CartaoTitulo>
            <CartaoDescricao>
              Desafios renovados toda segunda-feira.
            </CartaoDescricao>
          </CartaoCabecalho>
          <CartaoConteudo>
            <EstadoVazioGenerico
              titulo="Sem desafios semanais"
              descricao="Novos desafios serão disponibilizados na próxima segunda-feira."
            />
          </CartaoConteudo>
        </Cartao>
      );
    }

    return (
      <Cartao>
        <CartaoCabecalho>
          <CartaoTitulo>Missões semanais</CartaoTitulo>
          <CartaoDescricao>
            Desafios renovados toda segunda-feira.
          </CartaoDescricao>
        </CartaoCabecalho>
        <CartaoConteudo className="space-y-4">
          <div role="list" aria-label="Lista de missões semanais">
            {missoesSemanais.map((desafio, index) => (
              <ItemMissaoSemanal
                key={desafio.id}
                desafio={desafio}
                isLast={index === missoesSemanais.length - 1}
              />
            ))}
          </div>
        </CartaoConteudo>
      </Cartao>
    );
  };

  return (
    <>
      <Dialogo open={dailyStartAberto} onOpenChange={atualizarAberturaDailyStart}>
        <DialogoConteudo className="max-w-4xl rounded-2xl border-border p-6" aria-describedby="daily-start-description">
          <div className="space-y-5">
            <div className="space-y-2">
              <DialogoTitulo className="font-titulo text-xl font-semibold text-foreground sm:text-2xl">
                {saudacaoDailyStart}
              </DialogoTitulo>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5" id="daily-start-description">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <WandSparkles className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                Builder Assistant
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                &ldquo;{textoAssistant}&rdquo;
              </p>
              <Botao asChild variant="secondary" className="mt-4">
                <Link href="/assistente" aria-label="Falar com o Builder Assistant">Falar com Assistant</Link>
              </Botao>
            </div>

            <div className="grid gap-3 sm:grid-cols-3" role="list" aria-label="Estatísticas do dia">
              {estatisticasDailyStart.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4"
                  role="listitem"
                >
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {item.label}
                    <item.icone className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <p className="font-titulo text-xl font-semibold">
                    {item.valor}
                  </p>
                  {item.id === "level" ? (
                    <div className="space-y-1">
                      <Progresso value={userLevel.percentual} aria-label={`Nível ${userLevel.nivel}: ${userLevel.percentual}% completo`} />
                      <span className="text-[11px] text-muted-foreground">
                        {userLevel.percentual}% concluído
                      </span>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <CalendarCheck className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  Daily Quests
                </div>
                <span className="text-xs text-muted-foreground" aria-label={`${questsConcluidas} de ${missoesDiarias.length} missões concluídas`}>
                  {questsConcluidas}/{missoesDiarias.length} ✓
                </span>
              </div>
              <div className="mt-4 space-y-3" role="list" aria-label="Lista de missões diárias">
                {missoesDiarias.map((missao) => (
                  <div key={missao.id} className="flex items-center justify-between text-sm" role="listitem">
                    <span
                      className={cn(
                        "flex items-center gap-2",
                        missao.concluida ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      <span className="text-sm" aria-hidden="true">{missao.concluida ? "✓" : "○"}</span>
                      <span className="sr-only">{missao.concluida ? "Concluída:" : "Pendente:"}</span>
                      {missao.texto}
                    </span>
                    <span className="text-muted-foreground">{missao.xp}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Botao asChild variant="outline" className="gap-2">
                <Link href="/tarefas" aria-label="Ver lista de tarefas">
                  <ListTodo className="h-4 w-4" aria-hidden="true" />
                  Tarefas
                </Link>
              </Botao>
              <Botao asChild className="gap-2">
                <Link href="/foco" aria-label="Iniciar sessão de foco">
                  <Timer className="h-4 w-4" aria-hidden="true" />
                  Iniciar foco
                </Link>
              </Botao>
            </div>
          </div>
        </DialogoConteudo>
      </Dialogo>

      <main id="main-content" className="flex-1 px-6 py-10" role="main" aria-label="Conteúdo principal do painel">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
            <section className="flex flex-col items-center gap-2 text-center" aria-labelledby="saudacao-titulo">
              <h1 id="saudacao-titulo" className="font-titulo text-2xl font-semibold text-foreground sm:text-3xl">
                {saudacao}
              </h1>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <IconeSaudacao className="h-4 w-4" aria-hidden="true" />
                <span className="capitalize">{dataHoraFormatada}</span>
              </div>
            </section>

            <section className="mx-auto w-full max-w-3xl" aria-labelledby="assistente-titulo">
              <Cartao>
                <CartaoCabecalho className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    <span id="assistente-titulo">Pergunte ao Builder Assistant</span>
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-secondary-foreground">
                      Beta
                    </span>
                  </div>
                  <CartaoDescricao>
                    Faça um check-in rápido para organizar o dia.
                  </CartaoDescricao>
                </CartaoCabecalho>
                <CartaoConteudo className="space-y-4">
                  <div className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3">
                    <p className="flex-1 text-sm text-muted-foreground">
                      Como posso ajudar hoje?
                    </p>
                    <Botao size="icon" className="h-9 w-9 rounded-full" aria-label="Enviar pergunta ao assistente">
                      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </Botao>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                    <button
                      type="button"
                      aria-label="Selecionar foco do assistente"
                      aria-haspopup="listbox"
                      className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-[11px] font-medium text-foreground"
                    >
                      Foco: Builders Performance
                      <ChevronDown className="h-3 w-3" aria-hidden="true" />
                    </button>
                    <span>
                      Assistant pode errar, revise respostas importantes.
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Botao asChild variant="secondary">
                      <Link href="/assistente" className="flex items-center gap-2" aria-label="Abrir chat com o assistente">
                        Falar com Assistant
                        <ChevronRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </Botao>
                    <Botao asChild variant="outline">
                      <Link href="/tarefas" className="flex items-center gap-2" aria-label="Abrir lista de tarefas">
                        <ListTodo className="h-4 w-4" aria-hidden="true" />
                        Abrir tarefas
                      </Link>
                    </Botao>
                  </div>
                </CartaoConteudo>
              </Cartao>
            </section>

            <section className="space-y-4" aria-labelledby="guia-rapido-titulo">
              <div className="flex items-center justify-between">
                <h2 id="guia-rapido-titulo" className="text-sm font-semibold text-foreground">
                  Guia rápido
                </h2>
                <button
                  type="button"
                  aria-label="Dispensar guia rápido"
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Não agora
                </button>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {renderCardsResumo()}
              </div>
            </section>

            <section className="space-y-4" aria-labelledby="progresso-titulo">
              <h2 id="progresso-titulo" className="text-sm font-semibold text-foreground">
                Seu progresso
              </h2>
              {carregando ? (
                <EsqueletoCartao linhasConteudo={4} />
              ) : (
                <Cartao>
                  <CartaoCabecalho>
                    <CartaoTitulo>
                      LEVEL {userLevel.nivel} — {userLevel.titulo}
                    </CartaoTitulo>
                    <CartaoDescricao>
                      {userLevel.xpAtual} / {userLevel.xpTotal} XP para Level {userLevel.nivel + 1}
                    </CartaoDescricao>
                  </CartaoCabecalho>
                  <CartaoConteudo className="space-y-3">
                    <Progresso value={userLevel.percentual} aria-label={`Progresso para o próximo nível: ${userLevel.percentual}%`} />
                    <p className="text-sm text-muted-foreground">
                      {userLevel.percentual}% concluído
                    </p>
                  </CartaoConteudo>
                </Cartao>
              )}
            </section>

            <section className="grid gap-6 lg:grid-cols-2" aria-label="Progresso e missões">
              {renderProgressoSemanal()}
              {renderMissoesDiarias()}
            </section>

            <section aria-labelledby="missoes-semanais-titulo">
              {renderMissoesSemanais()}
            </section>
          </div>
      </main>
      <AcoesRapidasInicio />
    </>
  );
}

export default function PaginaInicio() {
  return (
    <ErrorBoundary>
      <ConteudoPaginaInicio />
    </ErrorBoundary>
  );
}
