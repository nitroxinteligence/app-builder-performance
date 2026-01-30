"use client";

import * as React from "react";
import { BookOpen } from "lucide-react";
import type { DropResult } from "@hello-pangea/dnd";

import {
  useHabitos,
  useCategoriasHabitos,
  useHistoricoHabitos,
  useCreateHabito,
  useRegistrarHabito,
} from "@/hooks/useHabitos";
import {
  useMetas,
  useObjetivos,
  useColunasObjetivo,
  useCreateMeta,
  useUpdateMeta,
  useCreateObjetivo,
  useUpdateObjetivo,
  useMoverObjetivo,
} from "@/hooks/useMetas";

import type { Habito } from "@/lib/supabase/types";
import type {
  AbaHabitos,
  CategoriaHabitoUI,
  StatusHabitoUI,
  ObjetivoKanban,
  MetaAnoKanban,
  FormularioObjetivo,
  FormularioMeta,
} from "./tipos-habitos";
import {
  getIconeCategoria,
  transformObjetivoToKanban,
  transformMetaToKanban,
  criarColunas,
  getTodayDateString,
  lerNumero,
  mapUIStatusToObjetivo,
  mapUIStatusToMeta,
  formularioObjetivoVazio,
  formularioMetaVazio,
} from "./tipos-habitos";

// ==========================================
// HOOK
// ==========================================

export function useHabitosPage() {
  // ==========================================
  // DATA FETCHING
  // ==========================================

  const {
    data: habitosDB = [],
    isLoading: isLoadingHabitos,
    error: errorHabitos,
  } = useHabitos();
  const {
    data: categoriasDB = [],
    isLoading: isLoadingCategorias,
    error: errorCategorias,
  } = useCategoriasHabitos();
  const {
    data: historicoHabitos = [],
    isLoading: isLoadingHistorico,
  } = useHistoricoHabitos();
  const {
    data: objetivosDB = [],
    isLoading: isLoadingObjetivos,
    error: errorObjetivos,
  } = useObjetivos();
  const {
    data: colunasObjetivoDB = [],
    isLoading: isLoadingColunasObjetivo,
  } = useColunasObjetivo();
  const {
    data: metasDB = [],
    isLoading: isLoadingMetas,
    error: errorMetas,
  } = useMetas();

  // ==========================================
  // MUTATIONS
  // ==========================================

  const createHabitoMutation = useCreateHabito();
  const registrarHabitoMutation = useRegistrarHabito();
  const createObjetivoMutation = useCreateObjetivo();
  const updateObjetivoMutation = useUpdateObjetivo();
  const moverObjetivoMutation = useMoverObjetivo();
  const createMetaMutation = useCreateMeta();
  const updateMetaMutation = useUpdateMeta();

  // ==========================================
  // UI STATE
  // ==========================================

  const [abaAtiva, setAbaAtiva] = React.useState<AbaHabitos>("individual");
  const [modalNovoHabitoAberto, setModalNovoHabitoAberto] = React.useState(false);
  const [modalNovoPlanoAberto, setModalNovoPlanoAberto] = React.useState(false);
  const [modalNovaMetaAberto, setModalNovaMetaAberto] = React.useState(false);

  const [objetivoEditando, setObjetivoEditando] = React.useState<ObjetivoKanban | null>(null);
  const [formObjetivo, setFormObjetivo] = React.useState<FormularioObjetivo>(formularioObjetivoVazio);
  const [metaEditando, setMetaEditando] = React.useState<MetaAnoKanban | null>(null);
  const [formMeta, setFormMeta] = React.useState<FormularioMeta>(formularioMetaVazio);

  // ==========================================
  // DERIVED DATA
  // ==========================================

  const todayStr = getTodayDateString();

  const categoriasHabitos: CategoriaHabitoUI[] = React.useMemo(() => {
    if (categoriasDB.length === 0 && habitosDB.length === 0) return [];

    const completionsToday = new Set(
      historicoHabitos
        .filter((h) => h.data === todayStr && h.concluido)
        .map((h) => h.habito_id)
    );

    const habitosPorCategoria = new Map<string, Habito[]>();
    const habitosSemCategoria: Habito[] = [];

    habitosDB.forEach((habito) => {
      if (habito.categoria_id) {
        const existing = habitosPorCategoria.get(habito.categoria_id) || [];
        habitosPorCategoria.set(habito.categoria_id, [...existing, habito]);
      } else {
        habitosSemCategoria.push(habito);
      }
    });

    const categorias: CategoriaHabitoUI[] = categoriasDB.map((cat) => ({
      id: cat.id,
      titulo: cat.nome,
      icone: getIconeCategoria(cat.nome),
      habitos: (habitosPorCategoria.get(cat.id) || []).map((habito) => ({
        id: habito.id,
        titulo: habito.titulo,
        streak: habito.streak_atual,
        feitoHoje: completionsToday.has(habito.id),
      })),
    }));

    if (habitosSemCategoria.length > 0) {
      categorias.push({
        id: "sem-categoria",
        titulo: "Outros",
        icone: BookOpen,
        habitos: habitosSemCategoria.map((habito) => ({
          id: habito.id,
          titulo: habito.titulo,
          streak: habito.streak_atual,
          feitoHoje: completionsToday.has(habito.id),
        })),
      });
    }

    return categorias;
  }, [categoriasDB, habitosDB, historicoHabitos, todayStr]);

  const objetivosKanban = React.useMemo(() => {
    const colunaMap = new Map(colunasObjetivoDB.map((c) => [c.id, c.titulo]));
    return objetivosDB.map((obj) =>
      transformObjetivoToKanban(
        obj,
        obj.coluna_id ? colunaMap.get(obj.coluna_id) || "Pessoal" : "Pessoal"
      )
    );
  }, [objetivosDB, colunasObjetivoDB]);

  const metasKanban = React.useMemo(() => metasDB.map(transformMetaToKanban), [metasDB]);
  const colunasObjetivos = React.useMemo(() => criarColunas(objetivosKanban), [objetivosKanban]);
  const colunasMetas = React.useMemo(() => criarColunas(metasKanban), [metasKanban]);

  const isLoading =
    isLoadingHabitos || isLoadingCategorias || isLoadingHistorico ||
    isLoadingObjetivos || isLoadingColunasObjetivo || isLoadingMetas;

  const hasError = errorHabitos || errorCategorias || errorObjetivos || errorMetas;
  const errorMessage =
    errorHabitos?.message ||
    errorCategorias?.message ||
    errorObjetivos?.message ||
    errorMetas?.message ||
    "Ocorreu um erro ao carregar os dados. Tente novamente.";

  // ==========================================
  // MUTATION HANDLERS
  // ==========================================

  const alternarHabito = async (categoriaId: string, habitoId: string) => {
    const categoria = categoriasHabitos.find((c) => c.id === categoriaId);
    const habito = categoria?.habitos.find((h) => h.id === habitoId);
    if (!habito) return;

    try {
      await registrarHabitoMutation.mutateAsync({
        habito_id: habitoId,
        data: todayStr,
        concluido: !habito.feitoHoje,
      });
    } catch {
      // Error is handled by React Query
    }
  };

  const criarHabito = async (dados: {
    titulo: string;
    categoriaId: string;
    frequencia: "diario" | "semanal";
    duracao: string;
    observacao: string;
  }) => {
    await createHabitoMutation.mutateAsync({
      titulo: dados.titulo,
      descricao: dados.observacao || null,
      frequencia: dados.frequencia,
      categoria_id: dados.categoriaId || null,
      icone: "check",
      dificuldade: "medio",
      dias_semana: [0, 1, 2, 3, 4, 5, 6],
      ordem: "0|100000:",
      ativo: true,
    });
    setModalNovoHabitoAberto(false);
  };

  const criarPlanoIndividual = async (dados: {
    titulo: string;
    descricao: string;
    categoria: string;
    metaTotal: string;
    status: StatusHabitoUI;
    habitosChave: string;
  }) => {
    const total = Math.max(1, lerNumero(dados.metaTotal, 10));
    const habitosChave = dados.habitosChave
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    await createObjetivoMutation.mutateAsync({
      titulo: dados.titulo,
      descricao: dados.descricao || "Objetivo em evolução.",
      progresso_atual: 0,
      progresso_total: total,
      status: mapUIStatusToObjetivo(dados.status),
      tags: habitosChave.length > 0 ? habitosChave : ["Definir rotina"],
      prioridade: "media",
      arquivado: false,
      ordem: "0|100000:",
    });
    setModalNovoPlanoAberto(false);
  };

  const criarMetaAno = async (dados: {
    titulo: string;
    descricao: string;
    prazo: string;
    progressoTotal: string;
    progressoAtual: string;
    status: StatusHabitoUI;
  }) => {
    const total = Math.max(1, lerNumero(dados.progressoTotal, 100));
    const atualBruto = Math.max(0, lerNumero(dados.progressoAtual, 0));
    const atual = dados.status === "concluido" ? total : Math.min(atualBruto, total);

    await createMetaMutation.mutateAsync({
      titulo: dados.titulo,
      descricao: dados.descricao || "Meta priorizada para este ano.",
      progresso_atual: atual,
      progresso_total: total,
      status: mapUIStatusToMeta(dados.status),
      cor: "#6366f1",
      icone: "target",
      tags: [],
      ano: new Date().getFullYear(),
      prioridade: "media",
      visibilidade: "privada",
      ordem: "0|100000:",
    });
    setModalNovaMetaAberto(false);
  };

  // ==========================================
  // EDIT HANDLERS
  // ==========================================

  const abrirEdicaoObjetivo = (objetivo: ObjetivoKanban) => {
    setObjetivoEditando(objetivo);
    setFormObjetivo({
      titulo: objetivo.titulo,
      descricao: objetivo.descricao,
      progressoAtual: String(objetivo.progressoAtual),
      progressoTotal: String(objetivo.progressoTotal),
      status: objetivo.status,
      categoria: objetivo.categoria,
      habitosChave: objetivo.habitosChave.join(", "),
    });
  };

  const salvarEdicaoObjetivo = async () => {
    if (!objetivoEditando) return;

    const total = Math.max(1, lerNumero(formObjetivo.progressoTotal, 10));
    const atualBruto = Math.max(0, lerNumero(formObjetivo.progressoAtual, 0));
    const atual = formObjetivo.status === "concluido" ? total : Math.min(atualBruto, total);
    const habitosChave = formObjetivo.habitosChave
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    try {
      await updateObjetivoMutation.mutateAsync({
        id: objetivoEditando.id,
        data: {
          titulo: formObjetivo.titulo.trim() || objetivoEditando.titulo,
          descricao: formObjetivo.descricao.trim() || objetivoEditando.descricao,
          progresso_atual: atual,
          progresso_total: total,
          status: mapUIStatusToObjetivo(formObjetivo.status),
          tags: habitosChave.length > 0 ? habitosChave : objetivoEditando.habitosChave,
        },
      });
      setObjetivoEditando(null);
      setFormObjetivo(formularioObjetivoVazio);
    } catch {
      // Error is handled by React Query
    }
  };

  const abrirEdicaoMeta = (meta: MetaAnoKanban) => {
    setMetaEditando(meta);
    setFormMeta({
      titulo: meta.titulo,
      descricao: meta.descricao,
      progressoAtual: String(meta.progressoAtual),
      progressoTotal: String(meta.progressoTotal),
      status: meta.status,
      prazo: meta.prazo,
    });
  };

  const salvarEdicaoMeta = async () => {
    if (!metaEditando) return;

    const total = Math.max(1, lerNumero(formMeta.progressoTotal, 100));
    const atualBruto = Math.max(0, lerNumero(formMeta.progressoAtual, 0));
    const atual = formMeta.status === "concluido" ? total : Math.min(atualBruto, total);

    try {
      await updateMetaMutation.mutateAsync({
        id: metaEditando.id,
        data: {
          titulo: formMeta.titulo.trim() || metaEditando.titulo,
          descricao: formMeta.descricao.trim() || metaEditando.descricao,
          progresso_atual: atual,
          progresso_total: total,
          status: mapUIStatusToMeta(formMeta.status),
        },
      });
      setMetaEditando(null);
      setFormMeta(formularioMetaVazio);
    } catch {
      // Error is handled by React Query
    }
  };

  const fecharEdicaoObjetivo = () => {
    setObjetivoEditando(null);
    setFormObjetivo(formularioObjetivoVazio);
  };

  const fecharEdicaoMeta = () => {
    setMetaEditando(null);
    setFormMeta(formularioMetaVazio);
  };

  const atualizarFormObjetivo = (parcial: Partial<FormularioObjetivo>) =>
    setFormObjetivo((prev) => ({ ...prev, ...parcial }));

  const atualizarFormMeta = (parcial: Partial<FormularioMeta>) =>
    setFormMeta((prev) => ({ ...prev, ...parcial }));

  // ==========================================
  // DRAG AND DROP
  // ==========================================

  const aoFinalizarArrasteObjetivos = async (resultado: DropResult) => {
    const { source, destination, draggableId } = resultado;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const destinoId = destination.droppableId as StatusHabitoUI;
    const objetivoId = draggableId.replace("objetivo-", "");

    try {
      await moverObjetivoMutation.mutateAsync({
        id: objetivoId,
        status: mapUIStatusToObjetivo(destinoId),
        ordem: `0|${destination.index}:`,
      });
    } catch {
      // Error is handled by React Query
    }
  };

  const aoFinalizarArrasteMetas = async (resultado: DropResult) => {
    const { source, destination, draggableId } = resultado;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const destinoId = destination.droppableId as StatusHabitoUI;
    const metaId = draggableId.replace("meta-", "");

    try {
      await updateMetaMutation.mutateAsync({
        id: metaId,
        data: {
          status: mapUIStatusToMeta(destinoId),
          ordem: `0|${destination.index}:`,
        },
      });
    } catch {
      // Error is handled by React Query
    }
  };

  // ==========================================
  // RETURN
  // ==========================================

  return {
    // Loading / Error
    isLoading,
    hasError,
    errorMessage,

    // Tab state
    abaAtiva,
    setAbaAtiva,

    // Modal state
    modalNovoHabitoAberto,
    setModalNovoHabitoAberto,
    modalNovoPlanoAberto,
    setModalNovoPlanoAberto,
    modalNovaMetaAberto,
    setModalNovaMetaAberto,

    // Data
    categoriasHabitos,
    colunasObjetivos,
    colunasMetas,

    // Edit state
    objetivoEditando,
    formObjetivo,
    metaEditando,
    formMeta,

    // Mutation pending states
    isCreatingHabito: createHabitoMutation.isPending,
    isRegistrandoHabito: registrarHabitoMutation.isPending,
    isCreatingObjetivo: createObjetivoMutation.isPending,
    isUpdatingObjetivo: updateObjetivoMutation.isPending,
    isCreatingMeta: createMetaMutation.isPending,
    isUpdatingMeta: updateMetaMutation.isPending,

    // Handlers
    alternarHabito,
    criarHabito,
    criarPlanoIndividual,
    criarMetaAno,
    abrirEdicaoObjetivo,
    salvarEdicaoObjetivo,
    fecharEdicaoObjetivo,
    atualizarFormObjetivo,
    abrirEdicaoMeta,
    salvarEdicaoMeta,
    fecharEdicaoMeta,
    atualizarFormMeta,
    aoFinalizarArrasteObjetivos,
    aoFinalizarArrasteMetas,
  };
}
