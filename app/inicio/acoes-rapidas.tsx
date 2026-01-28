"use client";

import * as React from "react";
import Link from "next/link";
import {
  Bot,
  CalendarDays,
  CheckCircle2,
  ListTodo,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Sparkles,
  Square,
  Timer,
} from "lucide-react";

import { Botao } from "@/componentes/ui/botao";
import { Progresso } from "@/componentes/ui/progresso";
import {
  Dialogo,
  DialogoCabecalho,
  DialogoConteudo,
  DialogoDescricao,
  DialogoFechar,
  DialogoRodape,
  DialogoTitulo,
} from "@/componentes/ui/dialogo";
import {
  Dica,
  DicaConteudo,
  DicaGatilho,
  ProvedorDica,
} from "@/componentes/ui/dica";
import {
  MenuSuspenso,
  MenuSuspensoConteudo,
  MenuSuspensoGatilho,
  MenuSuspensoItem,
} from "@/componentes/ui/menu-suspenso";
import {
  Seletor,
  SeletorConteudo,
  SeletorGatilho,
  SeletorItem,
  SeletorValor,
} from "@/componentes/ui/seletor";
import { cn } from "@/lib/utilidades";
import {
  CHAVE_EVENTOS_AGENDA,
  lerLocalStorage,
  salvarLocalStorage,
} from "@/lib/armazenamento";

import {
  categoriasAgenda,
  eventosAgenda,
  type EventoAgenda,
  type IntegracaoCalendario,
  type StatusEvento,
} from "../agenda/dados-agenda";
import { useTarefas } from "@/hooks/useTarefas";
import { useCategoriasHabitos, useCreateHabito } from "@/hooks/useHabitos";
import { useCreatePendencia } from "@/hooks/usePendencias";
import { useAuth } from "@/lib/providers/auth-provider";
import type { Prioridade } from "@/types/database";

// Tipos locais para a UI de hábitos rápidos
type HabitoDiarioUI = {
  id: string;
  titulo: string;
  streak: number;
  feitoHoje: boolean;
};

type CategoriaHabitoUI = {
  id: string;
  titulo: string;
  habitos: HabitoDiarioUI[];
};

type FormularioEvento = {
  titulo: string;
  descricao: string;
  data: string;
  horarioInicio: string;
  horarioFim: string;
  categoria: string;
  local: string;
  status: StatusEvento;
  calendario: IntegracaoCalendario;
};

type FormularioPendencia = {
  titulo: string;
  prazo: string;
  prioridade: Prioridade;
  categoria: string;
  descricao: string;
};

type FormularioHabito = {
  titulo: string;
  categoriaId: string;
  frequencia: string;
  duracao: string;
  observacao: string;
};

const criarId = () => Math.random().toString(36).slice(2, 9);

const modosFoco = [
  { id: "pomodoro", titulo: "Pomodoro", duracao: 25 },
  { id: "deep-work", titulo: "Deep Work", duracao: 45 },
  { id: "flowtime", titulo: "Flowtime", duracao: 60 },
  { id: "custom", titulo: "Personalizado", duracao: 30 },
];

const formatarTempo = (segundos: number) => {
  const minutos = Math.floor(segundos / 60);
  const restante = segundos % 60;
  return `${String(minutos).padStart(2, "0")}:${String(restante).padStart(
    2,
    "0"
  )}`;
};

export default function AcoesRapidasInicio() {
  // Hooks do Supabase
  const { user } = useAuth();
  const { data: tarefas = [] } = useTarefas();
  const { data: categoriasHabitosDB = [] } = useCategoriasHabitos();
  const createPendenciaMutation = useCreatePendencia();
  const createHabitoMutation = useCreateHabito();

  // Mapeia as categorias do banco para o formato da UI
  const categoriasHabitos = React.useMemo<CategoriaHabitoUI[]>(
    () =>
      categoriasHabitosDB.map((cat) => ({
        id: cat.id,
        titulo: cat.nome,
        habitos: [],
      })),
    [categoriasHabitosDB]
  );

  const [menuAberto, setMenuAberto] = React.useState(false);
  const [modalFocoAberto, setModalFocoAberto] = React.useState(false);
  const [modalAgendamentoAberto, setModalAgendamentoAberto] =
    React.useState(false);
  const [modalTarefaAberto, setModalTarefaAberto] = React.useState(false);
  const [modalHabitoAberto, setModalHabitoAberto] = React.useState(false);

  const dataHoje = React.useMemo(
    () => new Date().toISOString().slice(0, 10),
    []
  );

  const formularioEventoPadrao = React.useMemo<FormularioEvento>(
    () => ({
      titulo: "",
      descricao: "",
      data: dataHoje,
      horarioInicio: "09:00",
      horarioFim: "09:30",
      categoria: "Reunião",
      local: "",
      status: "confirmado",
      calendario: "Manual",
    }),
    [dataHoje]
  );

  const [formEvento, setFormEvento] =
    React.useState<FormularioEvento>(formularioEventoPadrao);
  const [formPendencia, setFormPendencia] =
    React.useState<FormularioPendencia>({
      titulo: "",
      prazo: "Hoje",
      prioridade: "media",
      categoria: "",
      descricao: "",
    });
  const [formHabito, setFormHabito] = React.useState<FormularioHabito>({
    titulo: "",
    categoriaId: "",
    frequencia: "diario",
    duracao: "21",
    observacao: "",
  });

  const [modoSelecionado, setModoSelecionado] = React.useState(
    modosFoco[0]?.id ?? "pomodoro"
  );
  const [duracaoPersonalizada, setDuracaoPersonalizada] = React.useState(30);
  const modoAtual =
    modoSelecionado === "custom"
      ? { ...modosFoco[3], duracao: duracaoPersonalizada }
      : modosFoco.find((modo) => modo.id === modoSelecionado) ?? modosFoco[0];
  const totalSegundos = (modoAtual?.duracao ?? 25) * 60;
  const [segundosRestantes, setSegundosRestantes] =
    React.useState(totalSegundos);
  const [rodando, setRodando] = React.useState(false);
  const [sessaoIniciada, setSessaoIniciada] = React.useState(false);
  const [sessaoConcluida, setSessaoConcluida] = React.useState(false);

  const tarefasDisponiveis = React.useMemo(
    () =>
      tarefas
        .filter((tarefa) => tarefa.coluna !== "concluido")
        .map((tarefa) => ({
          id: tarefa.id,
          titulo: tarefa.titulo,
        })),
    [tarefas]
  );
  const [tarefaSelecionada, setTarefaSelecionada] = React.useState(
    tarefasDisponiveis[0]?.id ?? ""
  );

  React.useEffect(() => {
    if (!modalAgendamentoAberto) {
      return;
    }
    setFormEvento({
      ...formularioEventoPadrao,
      data: dataHoje,
    });
  }, [modalAgendamentoAberto, formularioEventoPadrao, dataHoje]);

  React.useEffect(() => {
    if (!modalTarefaAberto) {
      return;
    }
    setFormPendencia({
      titulo: "",
      prazo: "Hoje",
      prioridade: "media",
      categoria: "",
      descricao: "",
    });
  }, [modalTarefaAberto]);

  React.useEffect(() => {
    if (!modalHabitoAberto) {
      return;
    }
    setFormHabito({
      titulo: "",
      categoriaId: categoriasHabitos[0]?.id ?? "",
      frequencia: "diario",
      duracao: "21",
      observacao: "",
    });
  }, [modalHabitoAberto, categoriasHabitos]);

  React.useEffect(() => {
    setSegundosRestantes(totalSegundos);
    setRodando(false);
    setSessaoIniciada(false);
    setSessaoConcluida(false);
  }, [totalSegundos]);

  React.useEffect(() => {
    if (!rodando) {
      return;
    }
    const intervalo = window.setInterval(() => {
      setSegundosRestantes((prev) => {
        if (prev <= 1) {
          setRodando(false);
          setSessaoConcluida(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(intervalo);
  }, [rodando]);

  const progresso = totalSegundos
    ? (totalSegundos - segundosRestantes) / totalSegundos
    : 0;

  const iniciarFoco = () => {
    setSessaoIniciada(true);
    setSessaoConcluida(false);
    setRodando(true);
  };

  const pausarFoco = () => setRodando(false);

  const reiniciarFoco = () => {
    setSegundosRestantes(totalSegundos);
    setRodando(false);
    setSessaoConcluida(false);
  };

  const encerrarFoco = () => {
    setSegundosRestantes(totalSegundos);
    setRodando(false);
    setSessaoIniciada(false);
    setSessaoConcluida(false);
  };

  const atualizarFormEvento = (parcial: Partial<FormularioEvento>) =>
    setFormEvento((prev) => ({ ...prev, ...parcial }));

  const criarEvento = () => {
    if (!formEvento.titulo.trim()) {
      return;
    }
    const listaAtual =
      lerLocalStorage<EventoAgenda[]>(CHAVE_EVENTOS_AGENDA) ?? eventosAgenda;
    const novoEvento: EventoAgenda = {
      id: criarId(),
      ...formEvento,
    };
    salvarLocalStorage(CHAVE_EVENTOS_AGENDA, [novoEvento, ...listaAtual]);
    setModalAgendamentoAberto(false);
  };

  const criarPendencia = () => {
    if (!formPendencia.titulo.trim() || !user) {
      return;
    }
    createPendenciaMutation.mutate(
      {
        titulo: formPendencia.titulo,
        prazo: formPendencia.prazo,
        prioridade: formPendencia.prioridade,
        categoria: formPendencia.categoria || null,
        descricao: formPendencia.descricao || null,
        data_vencimento: null,
      },
      {
        onSuccess: () => setModalTarefaAberto(false),
      }
    );
  };

  const criarHabito = () => {
    if (!formHabito.titulo.trim() || !user) {
      return;
    }
    createHabitoMutation.mutate(
      {
        titulo: formHabito.titulo,
        descricao: formHabito.observacao || null,
        icone: "sparkles",
        cor: null,
        dificuldade: "medio",
        frequencia: formHabito.frequencia === "diario" ? "diario" : "semanal",
        dias_semana: formHabito.frequencia === "diario" ? [0, 1, 2, 3, 4, 5, 6] : [1, 3, 5],
        categoria_id: formHabito.categoriaId || null,
        objetivo_id: null,
        ordem: "0",
        ativo: true,
      },
      {
        onSuccess: () => setModalHabitoAberto(false),
      }
    );
  };

  return (
    <>
      <Dialogo open={modalFocoAberto} onOpenChange={setModalFocoAberto}>
        <DialogoConteudo className="max-w-2xl rounded-2xl border-border p-6">
          <DialogoCabecalho>
            <DialogoTitulo>Modo foco rápido</DialogoTitulo>
            <DialogoDescricao>
              Inicie uma sessão agora mesmo sem sair do dashboard.
            </DialogoDescricao>
          </DialogoCabecalho>
          <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-2xl border border-border bg-card p-5 text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Tempo restante
              </p>
              <p className="mt-3 font-titulo text-4xl font-semibold">
                {formatarTempo(segundosRestantes)}
              </p>
              <Progresso value={progresso * 100} className="mt-4" />
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                {!rodando ? (
                  <Botao onClick={iniciarFoco} className="gap-2">
                    <Play className="h-4 w-4" />
                    {sessaoIniciada ? "Retomar" : "Iniciar"}
                  </Botao>
                ) : (
                  <Botao variant="secondary" onClick={pausarFoco} className="gap-2">
                    <Pause className="h-4 w-4" />
                    Pausar
                  </Botao>
                )}
                <Botao variant="outline" onClick={reiniciarFoco} className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Reiniciar
                </Botao>
                {sessaoIniciada ? (
                  <Botao variant="destructive" onClick={encerrarFoco} className="gap-2">
                    <Square className="h-4 w-4" />
                    Encerrar
                  </Botao>
                ) : null}
              </div>
              {sessaoConcluida ? (
                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-emerald-500">
                  <CheckCircle2 className="h-4 w-4" />
                  Sessão concluída!
                </div>
              ) : null}
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="modo-foco-rapido">
                  Modo
                </label>
                <Seletor
                  value={modoSelecionado}
                  onValueChange={setModoSelecionado}
                >
                  <SeletorGatilho id="modo-foco-rapido">
                    <SeletorValor placeholder="Selecione" />
                  </SeletorGatilho>
                  <SeletorConteudo>
                    {modosFoco.map((modo) => (
                      <SeletorItem key={modo.id} value={modo.id}>
                        {modo.titulo}
                      </SeletorItem>
                    ))}
                  </SeletorConteudo>
                </Seletor>
              </div>
              {modoSelecionado === "custom" ? (
                <div className="space-y-2">
                  <label
                    className="text-sm font-medium"
                    htmlFor="tempo-personalizado"
                  >
                    Tempo (min)
                  </label>
                  <input
                    id="tempo-personalizado"
                    type="number"
                    min={5}
                    max={180}
                    value={duracaoPersonalizada}
                    onChange={(event) =>
                      setDuracaoPersonalizada(
                        Number(event.target.value || 0)
                      )
                    }
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              ) : null}
              <div className="space-y-2">
                <label
                  className="text-sm font-medium"
                  htmlFor="tarefa-foco-rapido"
                >
                  Tarefa
                </label>
                <Seletor
                  value={tarefaSelecionada}
                  onValueChange={setTarefaSelecionada}
                >
                  <SeletorGatilho id="tarefa-foco-rapido">
                    <SeletorValor placeholder="Selecione" />
                  </SeletorGatilho>
                  <SeletorConteudo>
                    {tarefasDisponiveis.map((tarefa) => (
                      <SeletorItem key={tarefa.id} value={tarefa.id}>
                        {tarefa.titulo}
                      </SeletorItem>
                    ))}
                  </SeletorConteudo>
                </Seletor>
              </div>
              <DialogoRodape className="mt-4 sm:justify-end">
                <DialogoFechar asChild>
                  <Botao variant="secondary">Fechar</Botao>
                </DialogoFechar>
              </DialogoRodape>
            </div>
          </div>
        </DialogoConteudo>
      </Dialogo>

      <Dialogo
        open={modalAgendamentoAberto}
        onOpenChange={setModalAgendamentoAberto}
      >
        <DialogoConteudo className="rounded-2xl border-border p-6">
          <DialogoCabecalho>
            <DialogoTitulo>Novo agendamento</DialogoTitulo>
            <DialogoDescricao>
              Crie um evento rápido e envie direto para a agenda.
            </DialogoDescricao>
          </DialogoCabecalho>
          <div className="mt-5 grid gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="acao-evento-titulo">
                Título
              </label>
              <input
                id="acao-evento-titulo"
                value={formEvento.titulo}
                onChange={(event) =>
                  atualizarFormEvento({ titulo: event.target.value })
                }
                placeholder="Ex: Call com cliente"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="acao-evento-data">
                  Data
                </label>
                <input
                  id="acao-evento-data"
                  type="date"
                  value={formEvento.data}
                  onChange={(event) =>
                    atualizarFormEvento({ data: event.target.value })
                  }
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="space-y-2">
                <label
                  className="text-sm font-medium"
                  htmlFor="acao-evento-categoria"
                >
                  Categoria
                </label>
                <Seletor
                  value={formEvento.categoria}
                  onValueChange={(valor) =>
                    atualizarFormEvento({ categoria: valor })
                  }
                >
                  <SeletorGatilho id="acao-evento-categoria">
                    <SeletorValor placeholder="Selecione" />
                  </SeletorGatilho>
                  <SeletorConteudo>
                    {categoriasAgenda.map((categoria) => (
                      <SeletorItem key={categoria.id} value={categoria.titulo}>
                        {categoria.titulo}
                      </SeletorItem>
                    ))}
                  </SeletorConteudo>
                </Seletor>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label
                  className="text-sm font-medium"
                  htmlFor="acao-evento-inicio"
                >
                  Início
                </label>
                <input
                  id="acao-evento-inicio"
                  type="time"
                  value={formEvento.horarioInicio}
                  onChange={(event) =>
                    atualizarFormEvento({ horarioInicio: event.target.value })
                  }
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="space-y-2">
                <label
                  className="text-sm font-medium"
                  htmlFor="acao-evento-fim"
                >
                  Fim
                </label>
                <input
                  id="acao-evento-fim"
                  type="time"
                  value={formEvento.horarioFim}
                  onChange={(event) =>
                    atualizarFormEvento({ horarioFim: event.target.value })
                  }
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label
                  className="text-sm font-medium"
                  htmlFor="acao-evento-status"
                >
                  Status
                </label>
                <Seletor
                  value={formEvento.status}
                  onValueChange={(valor) =>
                    atualizarFormEvento({ status: valor as StatusEvento })
                  }
                >
                  <SeletorGatilho id="acao-evento-status">
                    <SeletorValor placeholder="Selecione" />
                  </SeletorGatilho>
                  <SeletorConteudo>
                    <SeletorItem value="confirmado">Confirmado</SeletorItem>
                    <SeletorItem value="pendente">Pendente</SeletorItem>
                    <SeletorItem value="foco">Foco</SeletorItem>
                  </SeletorConteudo>
                </Seletor>
              </div>
              <div className="space-y-2">
                <label
                  className="text-sm font-medium"
                  htmlFor="acao-evento-calendario"
                >
                  Calendário
                </label>
                <Seletor
                  value={formEvento.calendario}
                  onValueChange={(valor) =>
                    atualizarFormEvento({
                      calendario: valor as IntegracaoCalendario,
                    })
                  }
                >
                  <SeletorGatilho id="acao-evento-calendario">
                    <SeletorValor placeholder="Selecione" />
                  </SeletorGatilho>
                  <SeletorConteudo>
                    <SeletorItem value="Manual">Manual</SeletorItem>
                    <SeletorItem value="Google">Google</SeletorItem>
                    <SeletorItem value="Outlook">Outlook</SeletorItem>
                  </SeletorConteudo>
                </Seletor>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="acao-evento-local">
                Local
              </label>
              <input
                id="acao-evento-local"
                value={formEvento.local}
                onChange={(event) =>
                  atualizarFormEvento({ local: event.target.value })
                }
                placeholder="Ex: Google Meet"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="space-y-2">
              <label
                className="text-sm font-medium"
                htmlFor="acao-evento-descricao"
              >
                Descrição
              </label>
              <textarea
                id="acao-evento-descricao"
                value={formEvento.descricao}
                onChange={(event) =>
                  atualizarFormEvento({ descricao: event.target.value })
                }
                placeholder="Contexto do evento."
                className="min-h-[90px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>
          <DialogoRodape className="mt-6 sm:justify-between">
            <DialogoFechar asChild>
              <Botao variant="secondary">Cancelar</Botao>
            </DialogoFechar>
            <div className="flex items-center gap-2">
              <Botao asChild variant="outline">
                <Link href="/agenda">Abrir agenda</Link>
              </Botao>
              <Botao onClick={criarEvento}>Criar evento</Botao>
            </div>
          </DialogoRodape>
        </DialogoConteudo>
      </Dialogo>

      <Dialogo open={modalTarefaAberto} onOpenChange={setModalTarefaAberto}>
        <DialogoConteudo className="max-w-xl rounded-2xl border-border p-6">
          <DialogoCabecalho>
            <DialogoTitulo>Nova tarefa pendente</DialogoTitulo>
            <DialogoDescricao>
              Registre uma tarefa rápida para organizar depois.
            </DialogoDescricao>
          </DialogoCabecalho>
          <div className="mt-5 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="acao-tarefa-titulo">
                Título
              </label>
              <input
                id="acao-tarefa-titulo"
                value={formPendencia.titulo}
                onChange={(event) =>
                  setFormPendencia((prev) => ({
                    ...prev,
                    titulo: event.target.value,
                  }))
                }
                placeholder="Ex: Revisar relatório"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label
                  className="text-sm font-medium"
                  htmlFor="acao-tarefa-prioridade"
                >
                  Prioridade
                </label>
                <Seletor
                  value={formPendencia.prioridade}
                  onValueChange={(valor) =>
                    setFormPendencia((prev) => ({
                      ...prev,
                      prioridade: valor as Prioridade,
                    }))
                  }
                >
                  <SeletorGatilho id="acao-tarefa-prioridade">
                    <SeletorValor placeholder="Selecione" />
                  </SeletorGatilho>
                  <SeletorConteudo>
                    <SeletorItem value="alta">Alta</SeletorItem>
                    <SeletorItem value="media">Média</SeletorItem>
                    <SeletorItem value="baixa">Baixa</SeletorItem>
                  </SeletorConteudo>
                </Seletor>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="acao-tarefa-prazo">
                  Prazo
                </label>
                <Seletor
                  value={formPendencia.prazo}
                  onValueChange={(valor) =>
                    setFormPendencia((prev) => ({ ...prev, prazo: valor }))
                  }
                >
                  <SeletorGatilho id="acao-tarefa-prazo">
                    <SeletorValor placeholder="Selecione" />
                  </SeletorGatilho>
                  <SeletorConteudo>
                    <SeletorItem value="Hoje">Hoje</SeletorItem>
                    <SeletorItem value="Amanhã">Amanhã</SeletorItem>
                    <SeletorItem value="Esta semana">Esta semana</SeletorItem>
                    <SeletorItem value="Próxima semana">
                      Próxima semana
                    </SeletorItem>
                  </SeletorConteudo>
                </Seletor>
              </div>
            </div>
            <div className="space-y-2">
              <label
                className="text-sm font-medium"
                htmlFor="acao-tarefa-categoria"
              >
                Categoria
              </label>
              <input
                id="acao-tarefa-categoria"
                value={formPendencia.categoria}
                onChange={(event) =>
                  setFormPendencia((prev) => ({
                    ...prev,
                    categoria: event.target.value,
                  }))
                }
                placeholder="Ex: Planejamento"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="space-y-2">
              <label
                className="text-sm font-medium"
                htmlFor="acao-tarefa-descricao"
              >
                Observações
              </label>
              <textarea
                id="acao-tarefa-descricao"
                value={formPendencia.descricao}
                onChange={(event) =>
                  setFormPendencia((prev) => ({
                    ...prev,
                    descricao: event.target.value,
                  }))
                }
                placeholder="Detalhes importantes para lembrar depois."
                className="min-h-[90px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>
          <DialogoRodape className="mt-6 sm:justify-between">
            <DialogoFechar asChild>
              <Botao variant="secondary">Cancelar</Botao>
            </DialogoFechar>
            <div className="flex items-center gap-2">
              <Botao asChild variant="outline">
                <Link href="/tarefas">Abrir tarefas</Link>
              </Botao>
              <Botao onClick={criarPendencia}>Adicionar pendência</Botao>
            </div>
          </DialogoRodape>
        </DialogoConteudo>
      </Dialogo>

      <Dialogo open={modalHabitoAberto} onOpenChange={setModalHabitoAberto}>
        <DialogoConteudo className="rounded-2xl border-border p-6">
          <DialogoCabecalho>
            <DialogoTitulo>Novo hábito de hoje</DialogoTitulo>
            <DialogoDescricao>
              Registre um hábito diário para acompanhar agora.
            </DialogoDescricao>
          </DialogoCabecalho>
          <div className="mt-5 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="acao-habito-titulo">
                Título
              </label>
              <input
                id="acao-habito-titulo"
                value={formHabito.titulo}
                onChange={(event) =>
                  setFormHabito((prev) => ({
                    ...prev,
                    titulo: event.target.value,
                  }))
                }
                placeholder="Ex: Meditar 10 min"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label
                  className="text-sm font-medium"
                  htmlFor="acao-habito-categoria"
                >
                  Categoria
                </label>
                <Seletor
                  value={formHabito.categoriaId}
                  onValueChange={(valor) =>
                    setFormHabito((prev) => ({
                      ...prev,
                      categoriaId: valor,
                    }))
                  }
                >
                  <SeletorGatilho id="acao-habito-categoria">
                    <SeletorValor placeholder="Selecione" />
                  </SeletorGatilho>
                  <SeletorConteudo>
                    {categoriasHabitos.map((categoria) => (
                      <SeletorItem key={categoria.id} value={categoria.id}>
                        {categoria.titulo}
                      </SeletorItem>
                    ))}
                  </SeletorConteudo>
                </Seletor>
              </div>
              <div className="space-y-2">
                <label
                  className="text-sm font-medium"
                  htmlFor="acao-habito-frequencia"
                >
                  Frequência
                </label>
                <Seletor
                  value={formHabito.frequencia}
                  onValueChange={(valor) =>
                    setFormHabito((prev) => ({ ...prev, frequencia: valor }))
                  }
                >
                  <SeletorGatilho id="acao-habito-frequencia">
                    <SeletorValor placeholder="Selecione" />
                  </SeletorGatilho>
                  <SeletorConteudo>
                    <SeletorItem value="diario">Diário</SeletorItem>
                    <SeletorItem value="semanal">Semanal</SeletorItem>
                    <SeletorItem value="alternado">Dias alternados</SeletorItem>
                  </SeletorConteudo>
                </Seletor>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="acao-habito-duracao">
                Duração (dias)
              </label>
              <Seletor
                value={formHabito.duracao}
                onValueChange={(valor) =>
                  setFormHabito((prev) => ({ ...prev, duracao: valor }))
                }
              >
                <SeletorGatilho id="acao-habito-duracao">
                  <SeletorValor placeholder="Selecione" />
                </SeletorGatilho>
                <SeletorConteudo>
                  <SeletorItem value="7">7 dias</SeletorItem>
                  <SeletorItem value="14">14 dias</SeletorItem>
                  <SeletorItem value="21">21 dias</SeletorItem>
                  <SeletorItem value="30">30 dias</SeletorItem>
                  <SeletorItem value="60">60 dias</SeletorItem>
                  <SeletorItem value="90">90 dias</SeletorItem>
                </SeletorConteudo>
              </Seletor>
            </div>
            <div className="space-y-2">
              <label
                className="text-sm font-medium"
                htmlFor="acao-habito-observacao"
              >
                Observações
              </label>
              <textarea
                id="acao-habito-observacao"
                value={formHabito.observacao}
                onChange={(event) =>
                  setFormHabito((prev) => ({
                    ...prev,
                    observacao: event.target.value,
                  }))
                }
                placeholder="Detalhes que ajudam a manter a rotina."
                className="min-h-[90px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>
          <DialogoRodape className="mt-6 sm:justify-between">
            <DialogoFechar asChild>
              <Botao variant="secondary">Cancelar</Botao>
            </DialogoFechar>
            <div className="flex items-center gap-2">
              <Botao asChild variant="outline">
                <Link href="/habitos">Abrir hábitos</Link>
              </Botao>
              <Botao onClick={criarHabito}>Adicionar hábito</Botao>
            </div>
          </DialogoRodape>
        </DialogoConteudo>
      </Dialogo>

      <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
        <ProvedorDica delayDuration={150} skipDelayDuration={0}>
          <div className="flex items-center gap-1.5 rounded-full bg-[#111111] px-1.5 py-1.5 shadow-lg">
            <MenuSuspenso modal={false} onOpenChange={setMenuAberto}>
              <MenuSuspensoGatilho asChild>
                <Botao
                  size="icon"
                  variant="ghost"
                  aria-label="Abrir ações rápidas"
                  className="h-9 w-9 rounded-full text-white hover:bg-white/10"
                >
                  <Plus
                    className={cn(
                      "h-4.5 w-4.5 transition-transform",
                      menuAberto ? "rotate-45" : "rotate-0"
                    )}
                  />
                </Botao>
              </MenuSuspensoGatilho>
            <MenuSuspensoConteudo
              side="top"
              align="center"
              className="w-56 rounded-2xl border-border/60 bg-background/95 p-3 shadow-lg backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
            >
                <div className="flex flex-col gap-2">
                  <MenuSuspensoItem
                    className="gap-3 rounded-xl px-3 py-2 text-sm font-medium"
                    onSelect={() => setModalAgendamentoAberto(true)}
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                      <CalendarDays className="h-4 w-4" />
                    </span>
                    Agendamento
                  </MenuSuspensoItem>
                  <MenuSuspensoItem
                    className="gap-3 rounded-xl px-3 py-2 text-sm font-medium"
                    onSelect={() => setModalTarefaAberto(true)}
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                      <ListTodo className="h-4 w-4" />
                    </span>
                    Criar tarefa
                  </MenuSuspensoItem>
                  <MenuSuspensoItem
                    className="gap-3 rounded-xl px-3 py-2 text-sm font-medium"
                    onSelect={() => setModalHabitoAberto(true)}
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                      <Sparkles className="h-4 w-4" />
                    </span>
                    Hábito
                  </MenuSuspensoItem>
                </div>
              </MenuSuspensoConteudo>
            </MenuSuspenso>

            <Dica>
              <DicaGatilho asChild>
                <Botao
                  size="icon"
                  variant="ghost"
                  aria-label="Abrir modo foco"
                  className="h-9 w-9 rounded-full text-white hover:bg-white/10"
                  onClick={() => setModalFocoAberto(true)}
                >
                  <Timer className="h-4.5 w-4.5" />
                </Botao>
              </DicaGatilho>
              <DicaConteudo
                side="top"
                sideOffset={10}
                className="rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background"
              >
                Modo foco rápido
              </DicaConteudo>
            </Dica>

            <Dica>
              <DicaGatilho asChild>
                <Botao
                  size="icon"
                  variant="ghost"
                  aria-label="Abrir assistente"
                  className="h-9 w-9 rounded-full text-white hover:bg-white/10"
                  asChild
                >
                  <Link href="/assistente">
                    <Bot className="h-4.5 w-4.5" />
                  </Link>
                </Botao>
              </DicaGatilho>
              <DicaConteudo
                side="top"
                sideOffset={10}
                className="rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background"
              >
                Assistente
              </DicaConteudo>
            </Dica>
          </div>
        </ProvedorDica>
      </div>
    </>
  );
}
