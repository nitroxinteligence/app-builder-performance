"use client";

import * as React from "react";
import { useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle2,
  Loader2,
  Pencil,
  Plus,
  Search,
  Settings,
  Trash2,
} from "lucide-react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from "@hello-pangea/dnd";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Botao } from "@/componentes/ui/botao";
import {
  Dialogo,
  DialogoCabecalho,
  DialogoConteudo,
  DialogoDescricao,
  DialogoFechar,
  DialogoGatilho,
  DialogoRodape,
  DialogoTitulo,
} from "@/componentes/ui/dialogo";
import {
  Flutuante,
  FlutuanteConteudo,
  FlutuanteGatilho,
} from "@/componentes/ui/flutuante";
import {
  Seletor,
  SeletorConteudo,
  SeletorGatilho,
  SeletorItem,
  SeletorValor,
} from "@/componentes/ui/seletor";
import { Calendario } from "@/componentes/ui/calendario";
import { EsqueletoKanban } from "@/componentes/ui/esqueleto";
import { EstadoVazioTarefas } from "@/componentes/ui/estado-vazio";
import { ErrorBoundary } from "@/componentes/erro";
import { Sidebar } from "@/componentes/layout/sidebar";
import { cn } from "@/lib/utilidades";
import { useAuth } from "@/lib/providers/auth-provider";

import {
  useTarefas,
  useCreateTarefa,
  useUpdateTarefa,
  useDeleteTarefa,
  useMoverTarefa,
  useReordenarTarefas,
} from "@/hooks/useTarefas";
import {
  usePendencias,
  useCreatePendencia,
  useDeletePendencia,
} from "@/hooks/usePendencias";
import { useConfirmarComDados } from "@/hooks/useConfirmar";
import { ConfirmarExclusao } from "@/componentes/ui/confirmar";
import type { Tarefa, Pendencia, Prioridade, Estagio } from "@/types/database";

const estilosPrioridade: Record<Prioridade, string> = {
  urgente: "border-purple-200 bg-purple-50 text-purple-600 dark:border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-300",
  alta: "border-red-200 bg-red-50 text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300",
  media:
    "border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
  baixa:
    "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300",
};

const estagiosKanban: { id: Estagio; titulo: string; dica?: string }[] = [
  { id: "backlog", titulo: "Backlog", dica: "Arraste para mover cards" },
  { id: "a_fazer", titulo: "A fazer" },
  { id: "em_andamento", titulo: "Em andamento" },
  { id: "concluido", titulo: "Concluído" },
];

type FormularioTarefa = {
  titulo: string;
  prioridade: Prioridade;
  prazo: string;
  dataVencimento?: Date;
  categoria: string;
  coluna: Estagio;
  descricao: string;
};

const formularioVazio: FormularioTarefa = {
  titulo: "",
  prioridade: "media",
  prazo: "",
  categoria: "",
  coluna: "backlog",
  descricao: "",
};

const formatarData = (data?: Date) =>
  data ? format(data, "dd/MM/yyyy", { locale: ptBR }) : "";

export default function PaginaTarefas() {
  const [sidebarAberta, setSidebarAberta] = React.useState(false);

  // Hooks do Supabase
  const { user } = useAuth();
  const { data: tarefas = [], isLoading: carregandoTarefas } = useTarefas();
  const { data: pendencias = [], isLoading: carregandoPendencias } =
    usePendencias();

  const createTarefa = useCreateTarefa();
  const updateTarefa = useUpdateTarefa();
  const deleteTarefa = useDeleteTarefa();
  const moverTarefa = useMoverTarefa();
  const _reordenarTarefas = useReordenarTarefas();
  const createPendencia = useCreatePendencia();
  const deletePendencia = useDeletePendencia();

  // Estados locais
  const [pendenciasAberto, setPendenciasAberto] = React.useState(false);
  const [novaTarefaAberta, setNovaTarefaAberta] = React.useState(false);
  const [formNova, setFormNova] =
    React.useState<FormularioTarefa>(formularioVazio);
  const [tarefaEditando, setTarefaEditando] = React.useState<Tarefa | null>(
    null
  );
  const [formEdicao, setFormEdicao] =
    React.useState<FormularioTarefa>(formularioVazio);
  const {
    aberto: confirmarExclusaoAberto,
    dados: tarefaParaExcluir,
    confirmarCom,
    onConfirmar: onConfirmarExclusao,
    onCancelar: onCancelarExclusao,
  } = useConfirmarComDados<Tarefa>();
  const [mostrarCampoPendencia, setMostrarCampoPendencia] =
    React.useState(false);
  const [novaPendenciaTexto, setNovaPendenciaTexto] = React.useState("");
  const [buscaTarefa, setBuscaTarefa] = React.useState("");

  // Agrupar tarefas por estágio
  const tarefasPorEstagio = React.useMemo(() => {
    const filtradas = buscaTarefa
      ? tarefas.filter((t) =>
          t.titulo.toLowerCase().includes(buscaTarefa.toLowerCase())
        )
      : tarefas;

    return estagiosKanban.map((estagio) => ({
      ...estagio,
      tarefas: filtradas
        .filter((t) => t.coluna === estagio.id)
        .sort((a, b) => a.ordem - b.ordem),
    }));
  }, [tarefas, buscaTarefa]);

  const atualizarFormNova = (parcial: Partial<FormularioTarefa>) =>
    setFormNova((prev) => ({ ...prev, ...parcial }));
  const atualizarFormEdicao = (parcial: Partial<FormularioTarefa>) =>
    setFormEdicao((prev) => ({ ...prev, ...parcial }));

  React.useEffect(() => {
    if (novaTarefaAberta) {
      setFormNova(formularioVazio);
    }
  }, [novaTarefaAberta]);

  React.useEffect(() => {
    if (!pendenciasAberto) {
      setMostrarCampoPendencia(false);
      setNovaPendenciaTexto("");
    }
  }, [pendenciasAberto]);

  const obterPrazo = (formulario: FormularioTarefa) =>
    formulario.dataVencimento
      ? formatarData(formulario.dataVencimento)
      : formulario.prazo || "Sem prazo";

  const aoFinalizarArraste = useCallback(
    async (resultado: DropResult) => {
      const { source, destination, draggableId } = resultado;

      if (!destination) return;
      if (
        source.droppableId === destination.droppableId &&
        source.index === destination.index
      )
        return;

      const novoEstagio = destination.droppableId as Estagio;
      const tarefasDestino = tarefasPorEstagio.find(
        (e) => e.id === novoEstagio
      )?.tarefas;

      if (!tarefasDestino) return;

      // Calcular nova ordem
      let novaOrdem: number;
      if (tarefasDestino.length === 0) {
        novaOrdem = 0;
      } else if (destination.index === 0) {
        novaOrdem = (tarefasDestino[0]?.ordem ?? 0) - 1;
      } else if (destination.index >= tarefasDestino.length) {
        novaOrdem = (tarefasDestino[tarefasDestino.length - 1]?.ordem ?? 0) + 1;
      } else {
        const anterior = tarefasDestino[destination.index - 1]?.ordem ?? 0;
        const posterior = tarefasDestino[destination.index]?.ordem ?? 0;
        novaOrdem = (anterior + posterior) / 2;
      }

      moverTarefa.mutate({
        id: draggableId,
        novoEstagio,
        novaOrdem,
      });
    },
    [tarefasPorEstagio, moverTarefa]
  );

  const abrirEdicaoTarefa = useCallback((tarefa: Tarefa) => {
    setTarefaEditando(tarefa);
    setFormEdicao({
      titulo: tarefa.titulo,
      prioridade: tarefa.prioridade,
      prazo: tarefa.data_limite || "",
      dataVencimento: undefined,
      categoria: "",
      coluna: tarefa.coluna,
      descricao: tarefa.descricao || "",
    });
  }, []);

  const salvarEdicao = () => {
    if (!tarefaEditando) return;

    const prazoFinal = obterPrazo(formEdicao);

    updateTarefa.mutate(
      {
        id: tarefaEditando.id,
        data: {
          titulo: formEdicao.titulo,
          prioridade: formEdicao.prioridade,
          data_limite: prazoFinal !== "Sem prazo" ? prazoFinal : null,
          coluna: formEdicao.coluna,
          descricao: formEdicao.descricao || null,
          status: formEdicao.coluna === "concluido" ? "concluido" : undefined,
          concluida_em:
            formEdicao.coluna === "concluido"
              ? new Date().toISOString()
              : null,
        },
      },
      {
        onSuccess: () => setTarefaEditando(null),
      }
    );
  };

  const adicionarNovaTarefa = () => {
    if (!formNova.titulo.trim() || !user) return;

    const prazoFinal = obterPrazo(formNova);

    createTarefa.mutate(
      {
        titulo: formNova.titulo,
        prioridade: formNova.prioridade,
        data_limite: prazoFinal !== "Sem prazo" ? prazoFinal : null,
        coluna: formNova.coluna,
        status: formNova.coluna === "concluido" ? "concluido" : "pendente",
        descricao: formNova.descricao || null,
        xp_recompensa: 30,
        ordem: 0,
        tags: [],
      },
      {
        onSuccess: () => setNovaTarefaAberta(false),
      }
    );
  };

  const aprovarPendencia = (pendencia: Pendencia) => {
    if (!user) return;

    createTarefa.mutate(
      {
        titulo: pendencia.titulo,
        prioridade: pendencia.prioridade,
        data_limite: pendencia.data_vencimento || null,
        coluna: "a_fazer",
        status: "pendente",
        descricao: pendencia.descricao || null,
        xp_recompensa: 20,
        ordem: 0,
        tags: [],
      },
      {
        onSuccess: () => {
          deletePendencia.mutate(pendencia.id);
        },
      }
    );
  };

  const adicionarPendencia = () => {
    if (!novaPendenciaTexto.trim() || !user) return;

    createPendencia.mutate(
      {
        titulo: novaPendenciaTexto.trim(),
        prazo: "Hoje",
        prioridade: "media",
        categoria: null,
        descricao: null,
        data_vencimento: null,
      },
      {
        onSuccess: () => {
          setNovaPendenciaTexto("");
          setMostrarCampoPendencia(false);
        },
      }
    );
  };

  const handleExcluir = useCallback(
    async (tarefa: Tarefa) => {
      const confirmado = await confirmarCom(tarefa);
      if (confirmado) {
        deleteTarefa.mutate(tarefa.id);
      }
    },
    [confirmarCom, deleteTarefa]
  );

  const concluirTarefa = useCallback(
    (tarefa: Tarefa) => {
      moverTarefa.mutate({
        id: tarefa.id,
        novoEstagio: "concluido",
        novaOrdem: 0,
      });
    },
    [moverTarefa]
  );

  if (carregandoTarefas) {
    return (
      <div className="min-h-screen bg-background px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <EsqueletoKanban cartoesPorColuna={[3, 2, 2, 1]} />
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background text-foreground">
        <Sidebar open={sidebarAberta} onOpenChange={setSidebarAberta} />

        <div
        className={cn(
          "flex min-h-screen flex-col transition-[padding] duration-300",
          sidebarAberta ? "lg:pl-56" : "lg:pl-16"
        )}
      >
        <main className="flex-1 px-6 py-10">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
            <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <Link
                  href="/inicio"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition hover:text-foreground"
                  aria-label="Voltar para início"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Link>
                <div>
                  <h1 className="font-titulo text-2xl font-semibold">
                    Tarefas
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Kanban de alta produtividade para o dia.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="search"
                    placeholder="Buscar tarefas"
                    value={buscaTarefa}
                    onChange={(e) => setBuscaTarefa(e.target.value)}
                    className="h-9 w-52 rounded-md border border-input bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <Botao variant="ghost" size="icon" aria-label="Configurações">
                  <Settings className="h-4 w-4" />
                </Botao>

                {/* Modal Pendências */}
                <Dialogo
                  open={pendenciasAberto}
                  onOpenChange={setPendenciasAberto}
                >
                  <DialogoGatilho asChild>
                    <Botao variant="outline">
                      Pendentes
                      {pendencias.length > 0 && (
                        <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-[10px] text-primary-foreground">
                          {pendencias.length}
                        </span>
                      )}
                    </Botao>
                  </DialogoGatilho>
                  <DialogoConteudo className="max-w-xl rounded-2xl border-border p-6">
                    <DialogoCabecalho>
                      <DialogoTitulo>Pendentes</DialogoTitulo>
                      <DialogoDescricao>
                        Organize tarefas pendentes e atribua prioridades.
                      </DialogoDescricao>
                    </DialogoCabecalho>
                    <div className="mt-5 space-y-3">
                      {carregandoPendencias ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      ) : pendencias.length ? (
                        pendencias.map((pendencia) => (
                          <div
                            key={pendencia.id}
                            className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3"
                          >
                            <div className="space-y-1">
                              <p className="text-sm font-medium">
                                {pendencia.titulo}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Prazo: {pendencia.prazo || "Sem prazo"}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              <Botao
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                aria-label="Aprovar pendência"
                                onClick={() => aprovarPendencia(pendencia)}
                                disabled={createTarefa.isPending}
                              >
                                <Check className="h-4 w-4 text-muted-foreground" />
                              </Botao>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Nenhuma pendência por enquanto.
                        </p>
                      )}
                    </div>
                    {mostrarCampoPendencia ? (
                      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                        <input
                          value={novaPendenciaTexto}
                          onChange={(event) =>
                            setNovaPendenciaTexto(event.target.value)
                          }
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              event.preventDefault();
                              adicionarPendencia();
                            }
                          }}
                          placeholder="Nova pendência"
                          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                        <Botao
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={adicionarPendencia}
                          disabled={createPendencia.isPending}
                        >
                          {createPendencia.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Adicionar"
                          )}
                        </Botao>
                      </div>
                    ) : null}
                    <DialogoRodape className="mt-6 sm:justify-between">
                      <Botao
                        type="button"
                        variant="outline"
                        onClick={() => setMostrarCampoPendencia(true)}
                      >
                        Adicionar pendência
                      </Botao>
                      <DialogoFechar asChild>
                        <Botao>Fechar</Botao>
                      </DialogoFechar>
                    </DialogoRodape>
                  </DialogoConteudo>
                </Dialogo>

                {/* Modal Nova Tarefa */}
                <Dialogo
                  open={novaTarefaAberta}
                  onOpenChange={setNovaTarefaAberta}
                >
                  <DialogoGatilho asChild>
                    <Botao className="gap-2">
                      <Plus className="h-4 w-4" />
                      Nova tarefa
                    </Botao>
                  </DialogoGatilho>
                  <DialogoConteudo className="max-w-xl rounded-2xl border-border p-6">
                    <DialogoCabecalho>
                      <DialogoTitulo>Nova tarefa</DialogoTitulo>
                      <DialogoDescricao>
                        Preencha as informações para criar uma nova tarefa.
                      </DialogoDescricao>
                    </DialogoCabecalho>
                    <form
                      className="mt-5 space-y-4"
                      onSubmit={(event) => {
                        event.preventDefault();
                        adicionarNovaTarefa();
                      }}
                    >
                      <div className="space-y-2">
                        <label
                          htmlFor="titulo-nova"
                          className="text-sm font-medium"
                        >
                          Título
                        </label>
                        <input
                          id="titulo-nova"
                          value={formNova.titulo}
                          onChange={(event) =>
                            atualizarFormNova({ titulo: event.target.value })
                          }
                          placeholder="Ex: Finalizar relatório"
                          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label
                            htmlFor="prioridade-nova"
                            className="text-sm font-medium"
                          >
                            Prioridade
                          </label>
                          <Seletor
                            value={formNova.prioridade}
                            onValueChange={(valor) =>
                              atualizarFormNova({
                                prioridade: valor as Prioridade,
                              })
                            }
                          >
                            <SeletorGatilho id="prioridade-nova">
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
                          <label
                            htmlFor="vencimento-novo"
                            className="text-sm font-medium"
                          >
                            Data de vencimento
                          </label>
                          <Flutuante>
                            <FlutuanteGatilho asChild>
                              <Botao
                                id="vencimento-novo"
                                type="button"
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !formNova.dataVencimento &&
                                    !formNova.prazo &&
                                    "text-muted-foreground"
                                )}
                              >
                                <CalendarDays className="mr-2 h-4 w-4" />
                                {formNova.dataVencimento
                                  ? formatarData(formNova.dataVencimento)
                                  : formNova.prazo || "Selecionar data"}
                              </Botao>
                            </FlutuanteGatilho>
                            <FlutuanteConteudo
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendario
                                mode="single"
                                selected={formNova.dataVencimento}
                                onSelect={(data) =>
                                  atualizarFormNova({
                                    dataVencimento: data ?? undefined,
                                    prazo: "",
                                  })
                                }
                                locale={ptBR}
                                initialFocus
                              />
                            </FlutuanteConteudo>
                          </Flutuante>
                        </div>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label
                            htmlFor="categoria-nova"
                            className="text-sm font-medium"
                          >
                            Categoria
                          </label>
                          <input
                            id="categoria-nova"
                            value={formNova.categoria}
                            onChange={(event) =>
                              atualizarFormNova({
                                categoria: event.target.value,
                              })
                            }
                            placeholder="Ex: Financeiro"
                            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          />
                        </div>
                        <div className="space-y-2">
                          <label
                            htmlFor="estagio-novo"
                            className="text-sm font-medium"
                          >
                            Estágio
                          </label>
                          <Seletor
                            value={formNova.coluna}
                            onValueChange={(valor) =>
                              atualizarFormNova({ coluna: valor as Estagio })
                            }
                          >
                            <SeletorGatilho id="estagio-novo">
                              <SeletorValor placeholder="Selecione" />
                            </SeletorGatilho>
                            <SeletorConteudo>
                              {estagiosKanban.map((estagio) => (
                                <SeletorItem key={estagio.id} value={estagio.id}>
                                  {estagio.titulo}
                                </SeletorItem>
                              ))}
                            </SeletorConteudo>
                          </Seletor>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor="descricao-nova"
                          className="text-sm font-medium"
                        >
                          Descrição
                        </label>
                        <textarea
                          id="descricao-nova"
                          value={formNova.descricao}
                          onChange={(event) =>
                            atualizarFormNova({ descricao: event.target.value })
                          }
                          placeholder="Observações rápidas sobre a tarefa..."
                          className="min-h-[90px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                      </div>
                    </form>
                    <DialogoRodape className="mt-6 sm:justify-between">
                      <DialogoFechar asChild>
                        <Botao variant="outline">Cancelar</Botao>
                      </DialogoFechar>
                      <Botao
                        type="button"
                        onClick={adicionarNovaTarefa}
                        disabled={createTarefa.isPending}
                      >
                        {createTarefa.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Criar tarefa
                      </Botao>
                    </DialogoRodape>
                  </DialogoConteudo>
                </Dialogo>

                {/* Modal Edição */}
                <Dialogo
                  open={Boolean(tarefaEditando)}
                  onOpenChange={(aberto) => {
                    if (!aberto) setTarefaEditando(null);
                  }}
                >
                  <DialogoConteudo className="max-w-xl rounded-2xl border-border p-6">
                    <DialogoCabecalho>
                      <DialogoTitulo>Editar tarefa</DialogoTitulo>
                      <DialogoDescricao>
                        Atualize os detalhes e o estágio desta tarefa.
                      </DialogoDescricao>
                    </DialogoCabecalho>
                    <form
                      className="mt-5 space-y-4"
                      onSubmit={(event) => {
                        event.preventDefault();
                        salvarEdicao();
                      }}
                    >
                      <div className="space-y-2">
                        <label
                          htmlFor="titulo-edicao"
                          className="text-sm font-medium"
                        >
                          Título
                        </label>
                        <input
                          id="titulo-edicao"
                          value={formEdicao.titulo}
                          onChange={(event) =>
                            atualizarFormEdicao({ titulo: event.target.value })
                          }
                          placeholder="Ex: Finalizar relatório"
                          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label
                            htmlFor="prioridade-edicao"
                            className="text-sm font-medium"
                          >
                            Prioridade
                          </label>
                          <Seletor
                            value={formEdicao.prioridade}
                            onValueChange={(valor) =>
                              atualizarFormEdicao({
                                prioridade: valor as Prioridade,
                              })
                            }
                          >
                            <SeletorGatilho id="prioridade-edicao">
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
                          <label
                            htmlFor="vencimento-edicao"
                            className="text-sm font-medium"
                          >
                            Data de vencimento
                          </label>
                          <Flutuante>
                            <FlutuanteGatilho asChild>
                              <Botao
                                id="vencimento-edicao"
                                type="button"
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !formEdicao.dataVencimento &&
                                    !formEdicao.prazo &&
                                    "text-muted-foreground"
                                )}
                              >
                                <CalendarDays className="mr-2 h-4 w-4" />
                                {formEdicao.dataVencimento
                                  ? formatarData(formEdicao.dataVencimento)
                                  : formEdicao.prazo || "Selecionar data"}
                              </Botao>
                            </FlutuanteGatilho>
                            <FlutuanteConteudo
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendario
                                mode="single"
                                selected={formEdicao.dataVencimento}
                                onSelect={(data) =>
                                  atualizarFormEdicao({
                                    dataVencimento: data ?? undefined,
                                    prazo: "",
                                  })
                                }
                                locale={ptBR}
                                initialFocus
                              />
                            </FlutuanteConteudo>
                          </Flutuante>
                        </div>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label
                            htmlFor="categoria-edicao"
                            className="text-sm font-medium"
                          >
                            Categoria
                          </label>
                          <input
                            id="categoria-edicao"
                            value={formEdicao.categoria}
                            onChange={(event) =>
                              atualizarFormEdicao({
                                categoria: event.target.value,
                              })
                            }
                            placeholder="Ex: Financeiro"
                            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          />
                        </div>
                        <div className="space-y-2">
                          <label
                            htmlFor="estagio-edicao"
                            className="text-sm font-medium"
                          >
                            Estágio
                          </label>
                          <Seletor
                            value={formEdicao.coluna}
                            onValueChange={(valor) =>
                              atualizarFormEdicao({ coluna: valor as Estagio })
                            }
                          >
                            <SeletorGatilho id="estagio-edicao">
                              <SeletorValor placeholder="Selecione" />
                            </SeletorGatilho>
                            <SeletorConteudo>
                              {estagiosKanban.map((estagio) => (
                                <SeletorItem key={estagio.id} value={estagio.id}>
                                  {estagio.titulo}
                                </SeletorItem>
                              ))}
                            </SeletorConteudo>
                          </Seletor>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor="descricao-edicao"
                          className="text-sm font-medium"
                        >
                          Descrição
                        </label>
                        <textarea
                          id="descricao-edicao"
                          value={formEdicao.descricao}
                          onChange={(event) =>
                            atualizarFormEdicao({
                              descricao: event.target.value,
                            })
                          }
                          placeholder="Observações rápidas sobre a tarefa..."
                          className="min-h-[90px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                      </div>
                    </form>
                    <DialogoRodape className="mt-6 sm:justify-between">
                      <DialogoFechar asChild>
                        <Botao variant="outline">Cancelar</Botao>
                      </DialogoFechar>
                      <Botao
                        type="button"
                        onClick={salvarEdicao}
                        disabled={updateTarefa.isPending}
                      >
                        {updateTarefa.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Salvar alterações
                      </Botao>
                    </DialogoRodape>
                  </DialogoConteudo>
                </Dialogo>

                {/* Dialog Exclusão */}
                <ConfirmarExclusao
                  aberto={confirmarExclusaoAberto}
                  nomeItem={tarefaParaExcluir?.titulo}
                  onConfirmar={onConfirmarExclusao}
                  onCancelar={onCancelarExclusao}
                />
              </div>
            </section>

            {/* Kanban Board */}
            {tarefas.length === 0 ? (
              <EstadoVazioTarefas
                acao={
                  <Botao onClick={() => setNovaTarefaAberta(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Nova tarefa
                  </Botao>
                }
              />
            ) : (
              <DragDropContext onDragEnd={aoFinalizarArraste}>
                <section className="-mx-6 overflow-x-auto px-6 pb-2 lg:overflow-visible">
                  <div className="flex min-w-[980px] gap-4 lg:min-w-0 lg:grid lg:grid-cols-3">
                    {tarefasPorEstagio.map((coluna) => (
                    <div
                      key={coluna.id}
                      className="flex w-[280px] flex-col gap-4 rounded-2xl border border-border bg-card p-4 lg:w-auto"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                            <span>{coluna.titulo}</span>
                            <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-secondary-foreground">
                              {coluna.tarefas.length}
                            </span>
                          </div>
                          {coluna.id === "concluido" ? (
                            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                          ) : null}
                        </div>
                        {coluna.dica ? (
                          <p className="text-xs text-muted-foreground">
                            {coluna.dica}
                          </p>
                        ) : null}
                      </div>
                      <Droppable droppableId={coluna.id}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className="kanban-scroll flex h-[calc(100vh-320px)] min-h-[300px] max-h-[600px] flex-col gap-3 pr-2"
                          >
                            {coluna.tarefas.map((tarefa, index) => (
                              <Draggable
                                key={tarefa.id}
                                draggableId={tarefa.id}
                                index={index}
                              >
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    style={provided.draggableProps.style}
                                    className="rounded-xl border border-border bg-background p-4"
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <span
                                        className={cn(
                                          "rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em]",
                                          estilosPrioridade[tarefa.prioridade]
                                        )}
                                      >
                                        {tarefa.prioridade}
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        +{tarefa.xp_recompensa} XP
                                      </span>
                                    </div>
                                    <p className="mt-2 text-sm font-medium text-foreground">
                                      {tarefa.titulo}
                                    </p>
                                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                                      <span className="flex items-center gap-1">
                                        <CalendarDays className="h-3 w-3" />
                                        {tarefa.data_limite || "Sem prazo"}
                                      </span>
                                      <div className="flex items-center gap-1">
                                        {tarefa.coluna !== "concluido" ? (
                                          <Botao
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            aria-label="Concluir tarefa"
                                            onClick={() =>
                                              concluirTarefa(tarefa)
                                            }
                                          >
                                            <Check className="h-4 w-4" />
                                          </Botao>
                                        ) : null}
                                        <Botao
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8"
                                          aria-label="Editar tarefa"
                                          onClick={() =>
                                            abrirEdicaoTarefa(tarefa)
                                          }
                                        >
                                          <Pencil className="h-4 w-4" />
                                        </Botao>
                                        <Botao
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 text-destructive hover:text-destructive"
                                          aria-label="Excluir tarefa"
                                          onClick={() => handleExcluir(tarefa)}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Botao>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  ))}
                  </div>
                </section>
              </DragDropContext>
            )}
          </div>
        </main>
      </div>
      </div>
    </ErrorBoundary>
  );
}
