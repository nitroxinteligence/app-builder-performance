"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Circle,
  Pencil,
  Plus,
  Loader2,
  AlertCircle,
  BookOpen,
  Briefcase,
  Dumbbell,
  GraduationCap,
  HeartPulse,
  Leaf,
  Sparkles,
} from "lucide-react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from "@hello-pangea/dnd";

import { Botao } from "@/componentes/ui/botao";
import {
  Cartao,
  CartaoCabecalho,
  CartaoConteudo,
  CartaoDescricao,
  CartaoTitulo,
} from "@/componentes/ui/cartao";
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
import { Progresso } from "@/componentes/ui/progresso";
import {
  Seletor,
  SeletorConteudo,
  SeletorGatilho,
  SeletorItem,
  SeletorValor,
} from "@/componentes/ui/seletor";
import { cn } from "@/lib/utilidades";
import { useAuth } from "@/lib/providers/auth-provider";
import { Sidebar } from "@/componentes/layout/sidebar";

// Hooks
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

// Types from database
import type {
  Habito,
  Objetivo,
  Meta,
  StatusObjetivo,
  StatusMeta,
} from "@/types/database";

// ==========================================
// UI TYPES (local to this page)
// ==========================================

type AbaHabitos = "individual" | "metas";

type StatusHabitoUI = "a-fazer" | "em-andamento" | "concluido";

type HabitoDiarioUI = {
  id: string;
  titulo: string;
  streak: number;
  feitoHoje: boolean;
};

type CategoriaHabitoUI = {
  id: string;
  titulo: string;
  icone: typeof BookOpen;
  habitos: HabitoDiarioUI[];
};

type ObjetivoKanban = {
  id: string;
  titulo: string;
  descricao: string;
  progressoAtual: number;
  progressoTotal: number;
  status: StatusHabitoUI;
  habitosChave: string[];
  categoria: string;
};

type MetaAnoKanban = {
  id: string;
  titulo: string;
  descricao: string;
  progressoAtual: number;
  progressoTotal: number;
  status: StatusHabitoUI;
  prazo: string;
};

type ColunasHabitos<T extends { status: StatusHabitoUI }> = Record<
  StatusHabitoUI,
  T[]
>;

type FormularioObjetivo = {
  titulo: string;
  descricao: string;
  progressoAtual: string;
  progressoTotal: string;
  status: StatusHabitoUI;
  categoria: string;
  habitosChave: string;
};

type FormularioMeta = {
  titulo: string;
  descricao: string;
  progressoAtual: string;
  progressoTotal: string;
  status: StatusHabitoUI;
  prazo: string;
};

// ==========================================
// STATUS MAPPING FUNCTIONS
// ==========================================

const mapStatusObjetivoToUI = (status: StatusObjetivo): StatusHabitoUI => {
  switch (status) {
    case "backlog":
    case "a_fazer":
      return "a-fazer";
    case "em_andamento":
    case "em_revisao":
      return "em-andamento";
    case "concluido":
      return "concluido";
    default:
      return "a-fazer";
  }
};

const mapStatusMetaToUI = (status: StatusMeta): StatusHabitoUI => {
  switch (status) {
    case "nao_iniciada":
      return "a-fazer";
    case "em_andamento":
    case "pausada":
    case "atrasada":
      return "em-andamento";
    case "concluida":
      return "concluido";
    default:
      return "a-fazer";
  }
};

const mapUIStatusToObjetivo = (status: StatusHabitoUI): StatusObjetivo => {
  switch (status) {
    case "a-fazer":
      return "a_fazer";
    case "em-andamento":
      return "em_andamento";
    case "concluido":
      return "concluido";
    default:
      return "a_fazer";
  }
};

const mapUIStatusToMeta = (status: StatusHabitoUI): StatusMeta => {
  switch (status) {
    case "a-fazer":
      return "nao_iniciada";
    case "em-andamento":
      return "em_andamento";
    case "concluido":
      return "concluida";
    default:
      return "nao_iniciada";
  }
};

// ==========================================
// DATA TRANSFORMATION FUNCTIONS
// ==========================================

const transformObjetivoToKanban = (
  objetivo: Objetivo,
  colunaTitulo: string
): ObjetivoKanban => ({
  id: objetivo.id,
  titulo: objetivo.titulo,
  descricao: objetivo.descricao || "Objetivo em evolução.",
  progressoAtual: objetivo.progresso_atual,
  progressoTotal: objetivo.progresso_total,
  status: mapStatusObjetivoToUI(objetivo.status),
  habitosChave: objetivo.tags.length > 0 ? objetivo.tags : ["Definir rotina"],
  categoria: colunaTitulo,
});

const transformMetaToKanban = (meta: Meta): MetaAnoKanban => ({
  id: meta.id,
  titulo: meta.titulo,
  descricao: meta.descricao || "Meta priorizada para este ano.",
  progressoAtual: meta.progresso_atual,
  progressoTotal: meta.progresso_total,
  status: mapStatusMetaToUI(meta.status),
  prazo: meta.data_fim
    ? new Date(meta.data_fim).toLocaleDateString("pt-BR", { month: "long" })
    : "Sem prazo",
});

// Default icon map for categories
const iconePorCategoria: Record<string, typeof BookOpen> = {
  saude: Dumbbell,
  produtividade: Sparkles,
  "bem-estar": Leaf,
  estudos: GraduationCap,
  profissional: Briefcase,
  pessoal: HeartPulse,
};

const getIconeCategoria = (nome: string): typeof BookOpen => {
  const nomeNormalizado = nome.toLowerCase().replace(/[áàã]/g, "a").replace(/[éê]/g, "e").replace(/[íî]/g, "i").replace(/[óô]/g, "o").replace(/[úû]/g, "u");
  return iconePorCategoria[nomeNormalizado] || BookOpen;
};

// ==========================================
// CONSTANTS
// ==========================================

const colunasStatus = [
  {
    id: "a-fazer" as const,
    titulo: "A fazer",
    descricao: "O que precisa sair do papel.",
  },
  {
    id: "em-andamento" as const,
    titulo: "Em andamento",
    descricao: "Metas que já estão em execução.",
  },
  {
    id: "concluido" as const,
    titulo: "Concluído",
    descricao: "Vitórias registradas e celebradas.",
  },
];

const formularioObjetivoVazio: FormularioObjetivo = {
  titulo: "",
  descricao: "",
  progressoAtual: "0",
  progressoTotal: "10",
  status: "a-fazer",
  categoria: "Pessoal",
  habitosChave: "",
};

const formularioMetaVazio: FormularioMeta = {
  titulo: "",
  descricao: "",
  progressoAtual: "0",
  progressoTotal: "100",
  status: "a-fazer",
  prazo: "",
};

const consistenciaUltimos30Dias = [
  2, 3, 2, 1, 0, 3, 2, 2, 3, 1, 0, 2, 3, 3, 2,
  1, 2, 3, 2, 2, 3, 1, 2, 0, 3, 2, 3, 2, 2, 3,
];

// ==========================================
// HELPER FUNCTIONS
// ==========================================

const criarColunas = <T extends { status: StatusHabitoUI }>(
  itens: T[]
): ColunasHabitos<T> => ({
  "a-fazer": itens.filter((item) => item.status === "a-fazer"),
  "em-andamento": itens.filter((item) => item.status === "em-andamento"),
  concluido: itens.filter((item) => item.status === "concluido"),
});

const _criarLimitesIniciais = <T extends { status: StatusHabitoUI }>(
  colunas: ColunasHabitos<T>
): Record<StatusHabitoUI, number> => ({
  "a-fazer": Math.min(5, colunas["a-fazer"].length),
  "em-andamento": Math.min(5, colunas["em-andamento"].length),
  concluido: Math.min(5, colunas.concluido.length),
});

const lerNumero = (valor: string, fallback: number) => {
  const numero = Number.parseInt(valor, 10);
  return Number.isFinite(numero) ? numero : fallback;
};

const getTodayDateString = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function PaginaHabitos() {
  const { user } = useAuth();

  // ==========================================
  // DATA FETCHING HOOKS
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
  // MUTATION HOOKS
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

  const [sidebarAberta, setSidebarAberta] = React.useState(false);
  const [abaAtiva, setAbaAtiva] = React.useState<AbaHabitos>("individual");
  const [modalNovoHabitoAberto, setModalNovoHabitoAberto] = React.useState(false);
  const [modalNovoPlanoAberto, setModalNovoPlanoAberto] = React.useState(false);
  const [modalNovaMetaAberto, setModalNovaMetaAberto] = React.useState(false);

  // Form state for new habit
  const [novoHabitoTitulo, setNovoHabitoTitulo] = React.useState("");
  const [novaCategoriaId, setNovaCategoriaId] = React.useState("");
  const [novaFrequencia, setNovaFrequencia] = React.useState<"diario" | "semanal">("diario");
  const [novoHabitoDuracao, setNovoHabitoDuracao] = React.useState("21");
  const [novaObservacao, setNovaObservacao] = React.useState("");

  // Form state for new plan (objetivo)
  const [novoPlanoTitulo, setNovoPlanoTitulo] = React.useState("");
  const [novoPlanoCategoria, setNovoPlanoCategoria] = React.useState("Pessoal");
  const [novoPlanoMetaTotal, setNovoPlanoMetaTotal] = React.useState("10");
  const [novoPlanoStatus, setNovoPlanoStatus] = React.useState<StatusHabitoUI>("a-fazer");
  const [novoPlanoHabitosChave, setNovoPlanoHabitosChave] = React.useState("");
  const [novoPlanoDescricao, setNovoPlanoDescricao] = React.useState("");

  // Form state for new meta
  const [novaMetaTitulo, setNovaMetaTitulo] = React.useState("");
  const [novaMetaDescricao, setNovaMetaDescricao] = React.useState("");
  const [novaMetaPrazo, setNovaMetaPrazo] = React.useState("");
  const [novaMetaProgressoTotal, setNovaMetaProgressoTotal] = React.useState("100");
  const [novaMetaProgressoAtual, setNovaMetaProgressoAtual] = React.useState("0");
  const [novaMetaStatus, setNovaMetaStatus] = React.useState<StatusHabitoUI>("a-fazer");

  // Edit state
  const [objetivoEditando, setObjetivoEditando] = React.useState<ObjetivoKanban | null>(null);
  const [formObjetivo, setFormObjetivo] = React.useState<FormularioObjetivo>(formularioObjetivoVazio);
  const [metaEditando, setMetaEditando] = React.useState<MetaAnoKanban | null>(null);
  const [formMeta, setFormMeta] = React.useState<FormularioMeta>(formularioMetaVazio);

  // Pagination state
  const [limitesObjetivos, setLimitesObjetivos] = React.useState<Record<StatusHabitoUI, number>>({
    "a-fazer": 5,
    "em-andamento": 5,
    concluido: 5,
  });
  const [limitesMetas, setLimitesMetas] = React.useState<Record<StatusHabitoUI, number>>({
    "a-fazer": 5,
    "em-andamento": 5,
    concluido: 5,
  });

  // ==========================================
  // DERIVED DATA
  // ==========================================

  const todayStr = getTodayDateString();

  // Transform database categories and habits to UI format
  const categoriasHabitos: CategoriaHabitoUI[] = React.useMemo(() => {
    if (categoriasDB.length === 0 && habitosDB.length === 0) {
      return [];
    }

    // Create a map of today's completions
    const completionsToday = new Set(
      historicoHabitos
        .filter((h) => h.data === todayStr && h.concluido)
        .map((h) => h.habito_id)
    );

    // Group habits by category
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

    // Transform categories
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

    // Add uncategorized habits if any
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

  // Transform objectives to kanban format
  const objetivosKanban: ObjetivoKanban[] = React.useMemo(() => {
    const colunaMap = new Map(colunasObjetivoDB.map((c) => [c.id, c.titulo]));

    return objetivosDB.map((obj) =>
      transformObjetivoToKanban(obj, obj.coluna_id ? colunaMap.get(obj.coluna_id) || "Pessoal" : "Pessoal")
    );
  }, [objetivosDB, colunasObjetivoDB]);

  // Transform metas to kanban format
  const metasKanban: MetaAnoKanban[] = React.useMemo(() => {
    return metasDB.map(transformMetaToKanban);
  }, [metasDB]);

  // Create columns for objectives
  const colunasObjetivos = React.useMemo(() => {
    return criarColunas(objetivosKanban);
  }, [objetivosKanban]);

  // Create columns for metas
  const colunasMetas = React.useMemo(() => {
    return criarColunas(metasKanban);
  }, [metasKanban]);

  // ==========================================
  // LOADING AND ERROR STATE
  // ==========================================

  const isLoading = isLoadingHabitos || isLoadingCategorias || isLoadingHistorico ||
                    isLoadingObjetivos || isLoadingColunasObjetivo || isLoadingMetas;

  const hasError = errorHabitos || errorCategorias || errorObjetivos || errorMetas;

  // ==========================================
  // CONSISTENCY METRICS
  // ==========================================

  const diasConsistentes = consistenciaUltimos30Dias.filter(
    (valor) => valor > 0
  ).length;
  const percentualConsistencia = Math.round(
    (diasConsistentes / consistenciaUltimos30Dias.length) * 100
  );

  // ==========================================
  // EFFECTS
  // ==========================================

  // Set default category when categories load
  React.useEffect(() => {
    if (categoriasDB.length > 0 && !novaCategoriaId) {
      setNovaCategoriaId(categoriasDB[0].id);
    }
  }, [categoriasDB, novaCategoriaId]);

  // Reset form when modal opens
  React.useEffect(() => {
    if (!modalNovoHabitoAberto) return;
    setNovoHabitoTitulo("");
    setNovaCategoriaId(categoriasDB[0]?.id ?? "");
    setNovaFrequencia("diario");
    setNovoHabitoDuracao("21");
    setNovaObservacao("");
  }, [modalNovoHabitoAberto, categoriasDB]);

  React.useEffect(() => {
    if (!modalNovoPlanoAberto) return;
    setNovoPlanoTitulo("");
    setNovoPlanoCategoria("Pessoal");
    setNovoPlanoMetaTotal("10");
    setNovoPlanoStatus("a-fazer");
    setNovoPlanoHabitosChave("");
    setNovoPlanoDescricao("");
  }, [modalNovoPlanoAberto]);

  React.useEffect(() => {
    if (!modalNovaMetaAberto) return;
    setNovaMetaTitulo("");
    setNovaMetaDescricao("");
    setNovaMetaPrazo("");
    setNovaMetaProgressoTotal("100");
    setNovaMetaProgressoAtual("0");
    setNovaMetaStatus("a-fazer");
  }, [modalNovaMetaAberto]);

  // Update limits when columns change
  React.useEffect(() => {
    setLimitesObjetivos((prev) => {
      let mudou = false;
      const atualizado = { ...prev };

      colunasStatus.forEach((coluna) => {
        const itens = colunasObjetivos[coluna.id];
        const minimo = Math.min(5, itens.length);
        const existe = Object.prototype.hasOwnProperty.call(prev, coluna.id);
        const atual = existe ? prev[coluna.id] : minimo;
        const novo = Math.min(Math.max(atual, minimo), itens.length);

        if (!existe || novo !== atual) {
          atualizado[coluna.id] = novo;
          mudou = true;
        }
      });

      return mudou ? atualizado : prev;
    });
  }, [colunasObjetivos]);

  React.useEffect(() => {
    setLimitesMetas((prev) => {
      let mudou = false;
      const atualizado = { ...prev };

      colunasStatus.forEach((coluna) => {
        const itens = colunasMetas[coluna.id];
        const minimo = Math.min(5, itens.length);
        const existe = Object.prototype.hasOwnProperty.call(prev, coluna.id);
        const atual = existe ? prev[coluna.id] : minimo;
        const novo = Math.min(Math.max(atual, minimo), itens.length);

        if (!existe || novo !== atual) {
          atualizado[coluna.id] = novo;
          mudou = true;
        }
      });

      return mudou ? atualizado : prev;
    });
  }, [colunasMetas]);

  // ==========================================
  // FORM HANDLERS
  // ==========================================

  const atualizarFormObjetivo = (parcial: Partial<FormularioObjetivo>) =>
    setFormObjetivo((prev) => ({ ...prev, ...parcial }));
  const atualizarFormMeta = (parcial: Partial<FormularioMeta>) =>
    setFormMeta((prev) => ({ ...prev, ...parcial }));

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

  const criarHabito = async () => {
    if (!novoHabitoTitulo.trim()) return;

    try {
      await createHabitoMutation.mutateAsync({
        titulo: novoHabitoTitulo.trim(),
        descricao: novaObservacao.trim() || null,
        frequencia: novaFrequencia as 'diario' | 'semanal',
        categoria_id: novaCategoriaId || null,
        icone: 'check',
        dificuldade: 'medio',
        dias_semana: [0, 1, 2, 3, 4, 5, 6],
        ordem: '0|100000:',
        ativo: true,
      });
      setModalNovoHabitoAberto(false);
    } catch {
      // Error is handled by React Query
    }
  };

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

    const total = Math.max(
      1,
      lerNumero(formObjetivo.progressoTotal, 10)
    );
    const atualBruto = Math.max(
      0,
      lerNumero(formObjetivo.progressoAtual, 0)
    );
    const atual =
      formObjetivo.status === "concluido"
        ? total
        : Math.min(atualBruto, total);
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

    const total = Math.max(
      1,
      lerNumero(formMeta.progressoTotal, 100)
    );
    const atualBruto = Math.max(
      0,
      lerNumero(formMeta.progressoAtual, 0)
    );
    const atual =
      formMeta.status === "concluido"
        ? total
        : Math.min(atualBruto, total);

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

  const criarPlanoIndividual = async () => {
    if (!novoPlanoTitulo.trim()) return;

    const total = Math.max(1, lerNumero(novoPlanoMetaTotal, 10));
    const habitosChave = novoPlanoHabitosChave
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    try {
      await createObjetivoMutation.mutateAsync({
        titulo: novoPlanoTitulo.trim(),
        descricao: novoPlanoDescricao.trim() || "Objetivo em evolução.",
        progresso_atual: 0,
        progresso_total: total,
        status: mapUIStatusToObjetivo(novoPlanoStatus),
        tags: habitosChave.length > 0 ? habitosChave : ["Definir rotina"],
        prioridade: 'media',
        arquivado: false,
        ordem: '0|100000:',
      });
      setModalNovoPlanoAberto(false);
    } catch {
      // Error is handled by React Query
    }
  };

  const criarMetaAno = async () => {
    if (!novaMetaTitulo.trim()) return;

    const total = Math.max(1, lerNumero(novaMetaProgressoTotal, 100));
    const atualBruto = Math.max(0, lerNumero(novaMetaProgressoAtual, 0));
    const atual =
      novaMetaStatus === "concluido"
        ? total
        : Math.min(atualBruto, total);

    try {
      await createMetaMutation.mutateAsync({
        titulo: novaMetaTitulo.trim(),
        descricao: novaMetaDescricao.trim() || "Meta priorizada para este ano.",
        progresso_atual: atual,
        progresso_total: total,
        status: mapUIStatusToMeta(novaMetaStatus),
        cor: '#6366f1',
        icone: 'target',
        tags: [],
        ano: new Date().getFullYear(),
        prioridade: 'media',
        visibilidade: 'privada',
        ordem: '0|100000:',
      });
      setModalNovaMetaAberto(false);
    } catch {
      // Error is handled by React Query
    }
  };

  // ==========================================
  // DRAG AND DROP HANDLERS
  // ==========================================

  const aoFinalizarArrasteObjetivos = async (resultado: DropResult) => {
    const { source, destination, draggableId } = resultado;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const destinoId = destination.droppableId as StatusHabitoUI;
    const objetivoId = draggableId.replace("objetivo-", "");

    try {
      await moverObjetivoMutation.mutateAsync({
        id: objetivoId,
        status: mapUIStatusToObjetivo(destinoId),
        ordem: `0|${destination.index}:`,
      });
    } catch {
      // Error is handled by React Query - will rollback optimistic update
    }
  };

  const aoFinalizarArrasteMetas = async (resultado: DropResult) => {
    const { source, destination, draggableId } = resultado;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

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
  // UI HELPER FUNCTIONS
  // ==========================================

  const obterCorConsistencia = (valor: number) =>
    cn(
      "h-3 w-3 rounded-[4px]",
      valor === 0 && "bg-muted",
      valor === 1 && "bg-secondary",
      valor === 2 && "bg-primary/30 dark:bg-primary/20",
      valor >= 3 && "bg-primary/70 dark:bg-primary/60"
    );

  const obterLimiteObjetivos = (colunaId: StatusHabitoUI, total: number) =>
    limitesObjetivos[colunaId] ?? Math.min(5, total);

  const obterLimiteMetas = (colunaId: StatusHabitoUI, total: number) =>
    limitesMetas[colunaId] ?? Math.min(5, total);

  const carregarMaisObjetivos = React.useCallback(
    (colunaId: StatusHabitoUI, total: number) => {
      setLimitesObjetivos((prev) => {
        const atual = prev[colunaId] ?? Math.min(5, total);
        const proximo = Math.min(atual + 10, total);

        if (proximo === atual) return prev;

        return { ...prev, [colunaId]: proximo };
      });
    },
    []
  );

  const carregarMaisMetas = React.useCallback(
    (colunaId: StatusHabitoUI, total: number) => {
      setLimitesMetas((prev) => {
        const atual = prev[colunaId] ?? Math.min(5, total);
        const proximo = Math.min(atual + 10, total);

        if (proximo === atual) return prev;

        return { ...prev, [colunaId]: proximo };
      });
    },
    []
  );

  const aoRolarColunaObjetivos =
    (colunaId: StatusHabitoUI, total: number) =>
    (event: React.UIEvent<HTMLDivElement>) => {
      const alvo = event.currentTarget;

      if (alvo.scrollTop + alvo.clientHeight < alvo.scrollHeight - 32) return;

      carregarMaisObjetivos(colunaId, total);
    };

  const aoRolarWheelColunaObjetivos =
    (colunaId: StatusHabitoUI, total: number) =>
    (event: React.WheelEvent<HTMLDivElement>) => {
      if (event.deltaY <= 0) return;

      const alvo = event.currentTarget;
      const alturaVisivel = alvo.clientHeight;
      const alturaTotal = alvo.scrollHeight;
      const semScroll = alturaTotal <= alturaVisivel + 2;
      const noFim = alvo.scrollTop + alturaVisivel >= alturaTotal - 32;

      if (semScroll || noFim) {
        carregarMaisObjetivos(colunaId, total);
      }
    };

  const aoRolarColunaMetas =
    (colunaId: StatusHabitoUI, total: number) =>
    (event: React.UIEvent<HTMLDivElement>) => {
      const alvo = event.currentTarget;

      if (alvo.scrollTop + alvo.clientHeight < alvo.scrollHeight - 32) return;

      carregarMaisMetas(colunaId, total);
    };

  const aoRolarWheelColunaMetas =
    (colunaId: StatusHabitoUI, total: number) =>
    (event: React.WheelEvent<HTMLDivElement>) => {
      if (event.deltaY <= 0) return;

      const alvo = event.currentTarget;
      const alturaVisivel = alvo.clientHeight;
      const alturaTotal = alvo.scrollHeight;
      const semScroll = alturaTotal <= alturaVisivel + 2;
      const noFim = alvo.scrollTop + alturaVisivel >= alturaTotal - 32;

      if (semScroll || noFim) {
        carregarMaisMetas(colunaId, total);
      }
    };

  // ==========================================
  // LOADING STATE
  // ==========================================

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // ==========================================
  // ERROR STATE
  // ==========================================

  if (hasError) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center max-w-md px-6">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <h2 className="text-lg font-semibold">Erro ao carregar dados</h2>
          <p className="text-sm text-muted-foreground">
            {errorHabitos?.message || errorCategorias?.message || errorObjetivos?.message || errorMetas?.message || "Ocorreu um erro ao carregar os dados. Tente novamente."}
          </p>
          <Botao onClick={() => window.location.reload()}>
            Tentar novamente
          </Botao>
        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN RENDER
  // ==========================================

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
            <section className="flex flex-wrap items-center justify-between gap-4">
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
                    Hábitos
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Organize metas e mantenha consistência diária.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {abaAtiva === "individual" ? (
                  <>
                    <Dialogo
                      open={modalNovoHabitoAberto}
                      onOpenChange={setModalNovoHabitoAberto}
                    >
                      <DialogoGatilho asChild>
                        <Botao className="gap-2">
                          <Plus className="h-4 w-4" />
                          Novo hábito
                        </Botao>
                      </DialogoGatilho>
                      <DialogoConteudo className="rounded-2xl border-border p-6">
                        <DialogoCabecalho>
                          <DialogoTitulo>Novo hábito</DialogoTitulo>
                          <DialogoDescricao>
                            Adicione um hábito para acompanhar diariamente.
                          </DialogoDescricao>
                        </DialogoCabecalho>
                        <div className="grid gap-4">
                          <div className="space-y-2">
                            <label
                              htmlFor="novo-habito-titulo"
                              className="text-sm font-medium"
                            >
                              Título
                            </label>
                            <input
                              id="novo-habito-titulo"
                              value={novoHabitoTitulo}
                              onChange={(event) =>
                                setNovoHabitoTitulo(event.target.value)
                              }
                              placeholder="Ex: Meditar 10 min"
                              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                          </div>
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <label
                                htmlFor="novo-habito-categoria"
                                className="text-sm font-medium"
                              >
                                Categoria
                              </label>
                              <Seletor
                                value={novaCategoriaId}
                                onValueChange={setNovaCategoriaId}
                              >
                                <SeletorGatilho id="novo-habito-categoria">
                                  <SeletorValor placeholder="Selecione" />
                                </SeletorGatilho>
                                <SeletorConteudo>
                                  {categoriasHabitos.map((categoria) => (
                                    <SeletorItem
                                      key={categoria.id}
                                      value={categoria.id}
                                    >
                                      {categoria.titulo}
                                    </SeletorItem>
                                  ))}
                                </SeletorConteudo>
                              </Seletor>
                            </div>
                            <div className="space-y-2">
                              <label
                                htmlFor="novo-habito-frequencia"
                                className="text-sm font-medium"
                              >
                                Frequência
                              </label>
                              <Seletor
                                value={novaFrequencia}
                                onValueChange={(v) => setNovaFrequencia(v as "diario" | "semanal")}
                              >
                                <SeletorGatilho id="novo-habito-frequencia">
                                  <SeletorValor placeholder="Selecione" />
                                </SeletorGatilho>
                                <SeletorConteudo>
                                  <SeletorItem value="diario">Diário</SeletorItem>
                                  <SeletorItem value="semanal">Semanal</SeletorItem>
                                </SeletorConteudo>
                              </Seletor>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label
                              htmlFor="novo-habito-duracao"
                              className="text-sm font-medium"
                            >
                              Duração (dias)
                            </label>
                            <Seletor
                              value={novoHabitoDuracao}
                              onValueChange={setNovoHabitoDuracao}
                            >
                              <SeletorGatilho id="novo-habito-duracao">
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
                              htmlFor="novo-habito-nota"
                              className="text-sm font-medium"
                            >
                              Observações
                            </label>
                            <textarea
                              id="novo-habito-nota"
                              value={novaObservacao}
                              onChange={(event) =>
                                setNovaObservacao(event.target.value)
                              }
                              placeholder="Detalhes que ajudam a manter a rotina."
                              className="min-h-[90px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                          </div>
                        </div>
                        <DialogoRodape>
                          <DialogoFechar asChild>
                            <Botao variant="secondary">Cancelar</Botao>
                          </DialogoFechar>
                          <Botao
                            onClick={criarHabito}
                            disabled={createHabitoMutation.isPending}
                          >
                            {createHabitoMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : null}
                            Adicionar hábito
                          </Botao>
                        </DialogoRodape>
                      </DialogoConteudo>
                    </Dialogo>

                    <Dialogo
                      open={modalNovoPlanoAberto}
                      onOpenChange={setModalNovoPlanoAberto}
                    >
                      <DialogoGatilho asChild>
                        <Botao variant="secondary" className="gap-2">
                          <Plus className="h-4 w-4" />
                          Novo plano
                        </Botao>
                      </DialogoGatilho>
                      <DialogoConteudo className="rounded-2xl border-border p-6">
                        <DialogoCabecalho>
                          <DialogoTitulo>Novo plano individual</DialogoTitulo>
                          <DialogoDescricao>
                            Crie um objetivo para o seu desenvolvimento.
                          </DialogoDescricao>
                        </DialogoCabecalho>
                        <div className="grid gap-4">
                          <div className="space-y-2">
                            <label
                              htmlFor="novo-plano-titulo"
                              className="text-sm font-medium"
                            >
                              Objetivo principal
                            </label>
                            <input
                              id="novo-plano-titulo"
                              value={novoPlanoTitulo}
                              onChange={(event) =>
                                setNovoPlanoTitulo(event.target.value)
                              }
                              placeholder="Ex: Aprender inglês"
                              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                          </div>
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <label
                                htmlFor="novo-plano-categoria"
                                className="text-sm font-medium"
                              >
                                Categoria
                              </label>
                              <Seletor
                                value={novoPlanoCategoria}
                                onValueChange={setNovoPlanoCategoria}
                              >
                                <SeletorGatilho id="novo-plano-categoria">
                                  <SeletorValor placeholder="Selecione" />
                                </SeletorGatilho>
                                <SeletorConteudo>
                                  <SeletorItem value="Pessoal">Pessoal</SeletorItem>
                                  <SeletorItem value="Profissional">
                                    Profissional
                                  </SeletorItem>
                                  <SeletorItem value="Estudos">Estudos</SeletorItem>
                                </SeletorConteudo>
                              </Seletor>
                            </div>
                            <div className="space-y-2">
                              <label
                                htmlFor="novo-plano-status"
                                className="text-sm font-medium"
                              >
                                Estágio inicial
                              </label>
                              <Seletor
                                value={novoPlanoStatus}
                                onValueChange={(valor) =>
                                  setNovoPlanoStatus(valor as StatusHabitoUI)
                                }
                              >
                                <SeletorGatilho id="novo-plano-status">
                                  <SeletorValor placeholder="Selecione" />
                                </SeletorGatilho>
                                <SeletorConteudo>
                                  <SeletorItem value="a-fazer">A fazer</SeletorItem>
                                  <SeletorItem value="em-andamento">
                                    Em andamento
                                  </SeletorItem>
                                  <SeletorItem value="concluido">Concluído</SeletorItem>
                                </SeletorConteudo>
                              </Seletor>
                            </div>
                          </div>
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <label
                                htmlFor="novo-plano-meta-total"
                                className="text-sm font-medium"
                              >
                                Meta total
                              </label>
                              <input
                                id="novo-plano-meta-total"
                                type="number"
                                min={1}
                                value={novoPlanoMetaTotal}
                                onChange={(event) =>
                                  setNovoPlanoMetaTotal(event.target.value)
                                }
                                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              />
                            </div>
                            <div className="space-y-2">
                              <label
                                htmlFor="novo-plano-habitos"
                                className="text-sm font-medium"
                              >
                                Hábitos-chave
                              </label>
                              <input
                                id="novo-plano-habitos"
                                value={novoPlanoHabitosChave}
                                onChange={(event) =>
                                  setNovoPlanoHabitosChave(event.target.value)
                                }
                                placeholder="Ex: Leitura, prática, revisão"
                                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label
                              htmlFor="novo-plano-descricao"
                              className="text-sm font-medium"
                            >
                              Descrição
                            </label>
                            <textarea
                              id="novo-plano-descricao"
                              value={novoPlanoDescricao}
                              onChange={(event) =>
                                setNovoPlanoDescricao(event.target.value)
                              }
                              placeholder="Detalhes que orientam seu plano."
                              className="min-h-[90px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                          </div>
                        </div>
                        <DialogoRodape>
                          <DialogoFechar asChild>
                            <Botao variant="secondary">Cancelar</Botao>
                          </DialogoFechar>
                          <Botao
                            onClick={criarPlanoIndividual}
                            disabled={createObjetivoMutation.isPending}
                          >
                            {createObjetivoMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : null}
                            Criar plano
                          </Botao>
                        </DialogoRodape>
                      </DialogoConteudo>
                    </Dialogo>
                  </>
                ) : (
                  <Dialogo
                    open={modalNovaMetaAberto}
                    onOpenChange={setModalNovaMetaAberto}
                  >
                    <DialogoGatilho asChild>
                      <Botao className="gap-2">
                        <Plus className="h-4 w-4" />
                        Nova meta
                      </Botao>
                    </DialogoGatilho>
                    <DialogoConteudo className="rounded-2xl border-border p-6">
                      <DialogoCabecalho>
                        <DialogoTitulo>Nova meta anual</DialogoTitulo>
                        <DialogoDescricao>
                          Defina uma meta prioritária para o ano.
                        </DialogoDescricao>
                      </DialogoCabecalho>
                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <label
                            htmlFor="nova-meta-titulo"
                            className="text-sm font-medium"
                          >
                            Título
                          </label>
                          <input
                            id="nova-meta-titulo"
                            value={novaMetaTitulo}
                            onChange={(event) =>
                              setNovaMetaTitulo(event.target.value)
                            }
                            placeholder="Ex: 100 corridas"
                            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          />
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <label
                              htmlFor="nova-meta-status"
                              className="text-sm font-medium"
                            >
                              Estágio inicial
                            </label>
                            <Seletor
                              value={novaMetaStatus}
                              onValueChange={(valor) =>
                                setNovaMetaStatus(valor as StatusHabitoUI)
                              }
                            >
                              <SeletorGatilho id="nova-meta-status">
                                <SeletorValor placeholder="Selecione" />
                              </SeletorGatilho>
                              <SeletorConteudo>
                                <SeletorItem value="a-fazer">A fazer</SeletorItem>
                                <SeletorItem value="em-andamento">
                                  Em andamento
                                </SeletorItem>
                                <SeletorItem value="concluido">Concluído</SeletorItem>
                              </SeletorConteudo>
                            </Seletor>
                          </div>
                          <div className="space-y-2">
                            <label
                              htmlFor="nova-meta-prazo"
                              className="text-sm font-medium"
                            >
                              Prazo
                            </label>
                            <input
                              id="nova-meta-prazo"
                              value={novaMetaPrazo}
                              onChange={(event) =>
                                setNovaMetaPrazo(event.target.value)
                              }
                              placeholder="Ex: Dezembro"
                              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                          </div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <label
                              htmlFor="nova-meta-total"
                              className="text-sm font-medium"
                            >
                              Meta total
                            </label>
                            <input
                              id="nova-meta-total"
                              type="number"
                              min={1}
                              value={novaMetaProgressoTotal}
                              onChange={(event) =>
                                setNovaMetaProgressoTotal(event.target.value)
                              }
                              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                          </div>
                          <div className="space-y-2">
                            <label
                              htmlFor="nova-meta-atual"
                              className="text-sm font-medium"
                            >
                              Progresso atual
                            </label>
                            <input
                              id="nova-meta-atual"
                              type="number"
                              min={0}
                              value={novaMetaProgressoAtual}
                              onChange={(event) =>
                                setNovaMetaProgressoAtual(event.target.value)
                              }
                              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label
                            htmlFor="nova-meta-descricao"
                            className="text-sm font-medium"
                          >
                            Descrição
                          </label>
                          <textarea
                            id="nova-meta-descricao"
                            value={novaMetaDescricao}
                            onChange={(event) =>
                              setNovaMetaDescricao(event.target.value)
                            }
                            placeholder="Detalhes da meta anual."
                            className="min-h-[90px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          />
                        </div>
                      </div>
                      <DialogoRodape>
                        <DialogoFechar asChild>
                          <Botao variant="secondary">Cancelar</Botao>
                        </DialogoFechar>
                        <Botao
                          onClick={criarMetaAno}
                          disabled={createMetaMutation.isPending}
                        >
                          {createMetaMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : null}
                          Criar meta
                        </Botao>
                      </DialogoRodape>
                    </DialogoConteudo>
                  </Dialogo>
                )}

                <Dialogo
                  open={Boolean(objetivoEditando)}
                  onOpenChange={(aberto) => {
                    if (!aberto) {
                      setObjetivoEditando(null);
                      setFormObjetivo(formularioObjetivoVazio);
                    }
                  }}
                >
                  <DialogoConteudo className="rounded-2xl border-border p-6">
                    <DialogoCabecalho>
                      <DialogoTitulo>Editar plano</DialogoTitulo>
                      <DialogoDescricao>
                        Ajuste as informações e o progresso deste plano.
                      </DialogoDescricao>
                    </DialogoCabecalho>
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <label
                          htmlFor="editar-plano-titulo"
                          className="text-sm font-medium"
                        >
                          Objetivo principal
                        </label>
                        <input
                          id="editar-plano-titulo"
                          value={formObjetivo.titulo}
                          onChange={(event) =>
                            atualizarFormObjetivo({
                              titulo: event.target.value,
                            })
                          }
                          placeholder="Ex: Aprender inglês"
                          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <label
                            htmlFor="editar-plano-categoria"
                            className="text-sm font-medium"
                          >
                            Categoria
                          </label>
                          <Seletor
                            value={formObjetivo.categoria}
                            onValueChange={(valor) =>
                              atualizarFormObjetivo({ categoria: valor })
                            }
                          >
                            <SeletorGatilho id="editar-plano-categoria">
                              <SeletorValor placeholder="Selecione" />
                            </SeletorGatilho>
                            <SeletorConteudo>
                              <SeletorItem value="Pessoal">Pessoal</SeletorItem>
                              <SeletorItem value="Profissional">
                                Profissional
                              </SeletorItem>
                              <SeletorItem value="Estudos">Estudos</SeletorItem>
                            </SeletorConteudo>
                          </Seletor>
                        </div>
                        <div className="space-y-2">
                          <label
                            htmlFor="editar-plano-status"
                            className="text-sm font-medium"
                          >
                            Estágio
                          </label>
                          <Seletor
                            value={formObjetivo.status}
                            onValueChange={(valor) =>
                              atualizarFormObjetivo({
                                status: valor as StatusHabitoUI,
                              })
                            }
                          >
                            <SeletorGatilho id="editar-plano-status">
                              <SeletorValor placeholder="Selecione" />
                            </SeletorGatilho>
                            <SeletorConteudo>
                              <SeletorItem value="a-fazer">A fazer</SeletorItem>
                              <SeletorItem value="em-andamento">
                                Em andamento
                              </SeletorItem>
                              <SeletorItem value="concluido">Concluído</SeletorItem>
                            </SeletorConteudo>
                          </Seletor>
                        </div>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <label
                            htmlFor="editar-plano-total"
                            className="text-sm font-medium"
                          >
                            Meta total
                          </label>
                          <input
                            id="editar-plano-total"
                            type="number"
                            min={1}
                            value={formObjetivo.progressoTotal}
                            onChange={(event) =>
                              atualizarFormObjetivo({
                                progressoTotal: event.target.value,
                              })
                            }
                            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          />
                        </div>
                        <div className="space-y-2">
                          <label
                            htmlFor="editar-plano-atual"
                            className="text-sm font-medium"
                          >
                            Progresso atual
                          </label>
                          <input
                            id="editar-plano-atual"
                            type="number"
                            min={0}
                            value={formObjetivo.progressoAtual}
                            onChange={(event) =>
                              atualizarFormObjetivo({
                                progressoAtual: event.target.value,
                              })
                            }
                            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor="editar-plano-habitos"
                          className="text-sm font-medium"
                        >
                          Hábitos-chave
                        </label>
                        <input
                          id="editar-plano-habitos"
                          value={formObjetivo.habitosChave}
                          onChange={(event) =>
                            atualizarFormObjetivo({
                              habitosChave: event.target.value,
                            })
                          }
                          placeholder="Ex: Leitura, prática, revisão"
                          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor="editar-plano-descricao"
                          className="text-sm font-medium"
                        >
                          Descrição
                        </label>
                        <textarea
                          id="editar-plano-descricao"
                          value={formObjetivo.descricao}
                          onChange={(event) =>
                            atualizarFormObjetivo({
                              descricao: event.target.value,
                            })
                          }
                          placeholder="Detalhes que orientam seu plano."
                          className="min-h-[90px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                      </div>
                    </div>
                    <DialogoRodape>
                      <DialogoFechar asChild>
                        <Botao variant="secondary">Cancelar</Botao>
                      </DialogoFechar>
                      <Botao
                        onClick={salvarEdicaoObjetivo}
                        disabled={updateObjetivoMutation.isPending}
                      >
                        {updateObjetivoMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        Salvar alterações
                      </Botao>
                    </DialogoRodape>
                  </DialogoConteudo>
                </Dialogo>

                <Dialogo
                  open={Boolean(metaEditando)}
                  onOpenChange={(aberto) => {
                    if (!aberto) {
                      setMetaEditando(null);
                      setFormMeta(formularioMetaVazio);
                    }
                  }}
                >
                  <DialogoConteudo className="rounded-2xl border-border p-6">
                    <DialogoCabecalho>
                      <DialogoTitulo>Editar meta</DialogoTitulo>
                      <DialogoDescricao>
                        Ajuste o prazo e o progresso da meta anual.
                      </DialogoDescricao>
                    </DialogoCabecalho>
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <label
                          htmlFor="editar-meta-titulo"
                          className="text-sm font-medium"
                        >
                          Título
                        </label>
                        <input
                          id="editar-meta-titulo"
                          value={formMeta.titulo}
                          onChange={(event) =>
                            atualizarFormMeta({ titulo: event.target.value })
                          }
                          placeholder="Ex: 100 corridas"
                          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <label
                            htmlFor="editar-meta-status"
                            className="text-sm font-medium"
                          >
                            Estágio
                          </label>
                          <Seletor
                            value={formMeta.status}
                            onValueChange={(valor) =>
                              atualizarFormMeta({
                                status: valor as StatusHabitoUI,
                              })
                            }
                          >
                            <SeletorGatilho id="editar-meta-status">
                              <SeletorValor placeholder="Selecione" />
                            </SeletorGatilho>
                            <SeletorConteudo>
                              <SeletorItem value="a-fazer">A fazer</SeletorItem>
                              <SeletorItem value="em-andamento">
                                Em andamento
                              </SeletorItem>
                              <SeletorItem value="concluido">Concluído</SeletorItem>
                            </SeletorConteudo>
                          </Seletor>
                        </div>
                        <div className="space-y-2">
                          <label
                            htmlFor="editar-meta-prazo"
                            className="text-sm font-medium"
                          >
                            Prazo
                          </label>
                          <input
                            id="editar-meta-prazo"
                            value={formMeta.prazo}
                            onChange={(event) =>
                              atualizarFormMeta({ prazo: event.target.value })
                            }
                            placeholder="Ex: Dezembro"
                            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          />
                        </div>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <label
                            htmlFor="editar-meta-total"
                            className="text-sm font-medium"
                          >
                            Meta total
                          </label>
                          <input
                            id="editar-meta-total"
                            type="number"
                            min={1}
                            value={formMeta.progressoTotal}
                            onChange={(event) =>
                              atualizarFormMeta({
                                progressoTotal: event.target.value,
                              })
                            }
                            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          />
                        </div>
                        <div className="space-y-2">
                          <label
                            htmlFor="editar-meta-atual"
                            className="text-sm font-medium"
                          >
                            Progresso atual
                          </label>
                          <input
                            id="editar-meta-atual"
                            type="number"
                            min={0}
                            value={formMeta.progressoAtual}
                            onChange={(event) =>
                              atualizarFormMeta({
                                progressoAtual: event.target.value,
                              })
                            }
                            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor="editar-meta-descricao"
                          className="text-sm font-medium"
                        >
                          Descrição
                        </label>
                        <textarea
                          id="editar-meta-descricao"
                          value={formMeta.descricao}
                          onChange={(event) =>
                            atualizarFormMeta({
                              descricao: event.target.value,
                            })
                          }
                          placeholder="Detalhes da meta anual."
                          className="min-h-[90px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                      </div>
                    </div>
                    <DialogoRodape>
                      <DialogoFechar asChild>
                        <Botao variant="secondary">Cancelar</Botao>
                      </DialogoFechar>
                      <Botao
                        onClick={salvarEdicaoMeta}
                        disabled={updateMetaMutation.isPending}
                      >
                        {updateMetaMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        Salvar alterações
                      </Botao>
                    </DialogoRodape>
                  </DialogoConteudo>
                </Dialogo>
              </div>
            </section>

            <section className="flex flex-wrap items-center gap-2">
              <Botao
                type="button"
                variant="secondary"
                aria-pressed={abaAtiva === "individual"}
                onClick={() => setAbaAtiva("individual")}
                className={cn(
                  "rounded-full px-4",
                  abaAtiva === "individual"
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-secondary text-secondary-foreground"
                )}
              >
                Plano individual
              </Botao>
              <Botao
                type="button"
                variant="secondary"
                aria-pressed={abaAtiva === "metas"}
                onClick={() => setAbaAtiva("metas")}
                className={cn(
                  "rounded-full px-4",
                  abaAtiva === "metas"
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-secondary text-secondary-foreground"
                )}
              >
                Metas do ano
              </Botao>
            </section>

            {abaAtiva === "individual" ? (
              <>
                <section className="space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Plano individual
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Visualize o que precisa ser iniciado, o que está em
                      andamento e o que já foi concluído.
                    </p>
                  </div>
                  <DragDropContext onDragEnd={aoFinalizarArrasteObjetivos}>
                    <div className="-mx-6 overflow-x-auto px-6 pb-2 lg:overflow-visible">
                      <div className="flex min-w-[980px] gap-4 lg:min-w-0 lg:grid lg:grid-cols-3">
                        {colunasStatus.map((coluna) => {
                          const itens = colunasObjetivos[coluna.id];
                          return (
                            <div
                              key={coluna.id}
                              className="flex w-[300px] flex-col gap-4 rounded-2xl border border-border bg-card p-4 lg:w-auto"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                                    {coluna.titulo}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {coluna.descricao}
                                  </p>
                                </div>
                                <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-secondary-foreground">
                                  {itens.length}
                                </span>
                              </div>
                              <Droppable droppableId={coluna.id}>
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    onScroll={aoRolarColunaObjetivos(
                                      coluna.id,
                                      itens.length
                                    )}
                                    onWheel={aoRolarWheelColunaObjetivos(
                                      coluna.id,
                                      itens.length
                                    )}
                                    className="kanban-scroll flex max-h-[640px] min-h-[320px] flex-col gap-3 overflow-y-auto pr-1 lg:max-h-[720px]"
                                  >
                                    {itens.length === 0 ? (
                                      <p className="rounded-xl border border-dashed border-border px-3 py-4 text-xs text-muted-foreground">
                                        Sem itens por aqui.
                                      </p>
                                    ) : null}
                                    {itens
                                      .slice(
                                        0,
                                        obterLimiteObjetivos(
                                          coluna.id,
                                          itens.length
                                        )
                                      )
                                      .map((objetivo, index) => {
                                      const percentual = Math.round(
                                        (objetivo.progressoAtual /
                                          objetivo.progressoTotal) *
                                          100
                                      );
                                      return (
                                        <Draggable
                                          key={objetivo.id}
                                          draggableId={`objetivo-${objetivo.id}`}
                                          index={index}
                                        >
                                          {(provided, snapshot) => (
                                            <div
                                              ref={provided.innerRef}
                                              {...provided.draggableProps}
                                              {...provided.dragHandleProps}
                                              className={cn(
                                                "rounded-2xl border border-border bg-background/60 p-4 transition",
                                                snapshot.isDragging &&
                                                  "border-primary/40 bg-secondary/60"
                                              )}
                                            >
                                              <div className="flex items-start justify-between gap-2">
                                                <div>
                                                  <p className="text-sm font-semibold">
                                                    {objetivo.titulo}
                                                  </p>
                                                  <p className="text-xs text-muted-foreground">
                                                    {objetivo.descricao}
                                                  </p>
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                  <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-secondary-foreground">
                                                    {objetivo.categoria}
                                                  </span>
                                                  <Botao
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    aria-label="Editar plano"
                                                    onClick={() =>
                                                      abrirEdicaoObjetivo(objetivo)
                                                    }
                                                    className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
                                                  >
                                                    <Pencil className="h-4 w-4" />
                                                  </Botao>
                                                </div>
                                              </div>
                                              <Progresso
                                                value={percentual}
                                                className="mt-3"
                                              />
                                              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                                                <span>
                                                  {objetivo.progressoAtual}/
                                                  {objetivo.progressoTotal}
                                                </span>
                                                <span>{percentual}%</span>
                                              </div>
                                              <div className="mt-3 flex flex-wrap gap-2">
                                                {objetivo.habitosChave.map(
                                                  (habito) => (
                                                    <span
                                                      key={habito}
                                                      className="rounded-full bg-secondary px-2 py-1 text-[10px] font-medium text-secondary-foreground"
                                                    >
                                                      {habito}
                                                    </span>
                                                  )
                                                )}
                                              </div>
                                            </div>
                                          )}
                                        </Draggable>
                                      );
                                    })}
                                    {provided.placeholder}
                                  </div>
                                )}
                              </Droppable>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </DragDropContext>
                </section>

                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        Hoje
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Marque hábitos para manter o ritmo.
                      </p>
                    </div>
                  </div>
                  {categoriasHabitos.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border p-8 text-center">
                      <p className="text-sm text-muted-foreground">
                        Nenhum hábito cadastrado ainda. Crie seu primeiro hábito para começar.
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-4 lg:grid-cols-3">
                      {categoriasHabitos.map((categoria) => {
                        const feitos = categoria.habitos.filter(
                          (habito) => habito.feitoHoje
                        ).length;
                        return (
                          <Cartao key={categoria.id}>
                            <CartaoCabecalho className="flex-row items-center justify-between space-y-0">
                              <div>
                                <CartaoTitulo className="text-base">
                                  {categoria.titulo}
                                </CartaoTitulo>
                                <CartaoDescricao>
                                  {feitos}/{categoria.habitos.length} concluídos
                                </CartaoDescricao>
                              </div>
                              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                                <categoria.icone className="h-4 w-4" />
                              </div>
                            </CartaoCabecalho>
                            <CartaoConteudo className="space-y-3">
                              {categoria.habitos.length === 0 ? (
                                <p className="text-xs text-muted-foreground">
                                  Nenhum hábito nesta categoria.
                                </p>
                              ) : (
                                categoria.habitos.map((habito) => (
                                  <button
                                    key={habito.id}
                                    type="button"
                                    onClick={() =>
                                      alternarHabito(categoria.id, habito.id)
                                    }
                                    aria-pressed={habito.feitoHoje}
                                    disabled={registrarHabitoMutation.isPending}
                                    className="flex w-full items-center gap-3 rounded-xl border border-border bg-background px-3 py-2 text-left transition hover:bg-secondary/50 disabled:opacity-50"
                                  >
                                    <span
                                      className={cn(
                                        "flex h-7 w-7 items-center justify-center rounded-full border text-xs",
                                        habito.feitoHoje
                                          ? "border-primary/40 bg-primary/10 text-primary"
                                          : "border-border text-muted-foreground"
                                      )}
                                    >
                                      {habito.feitoHoje ? (
                                        <Check className="h-3.5 w-3.5" />
                                      ) : (
                                        <Circle className="h-3.5 w-3.5" />
                                      )}
                                    </span>
                                    <div className="flex-1">
                                      <p className="text-sm font-medium">
                                        {habito.titulo}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {habito.streak} dias
                                      </p>
                                    </div>
                                    {!habito.feitoHoje ? (
                                      <span className="text-xs font-medium text-amber-600">
                                        Fazer hoje
                                      </span>
                                    ) : (
                                      <span className="text-xs font-medium text-emerald-600">
                                        Concluído
                                      </span>
                                    )}
                                  </button>
                                ))
                              )}
                            </CartaoConteudo>
                          </Cartao>
                        );
                      })}
                    </div>
                  )}
                </section>
              </>
            ) : (
              <section className="space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Metas do ano
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Acompanhe metas prioritárias e organize o próximo passo.
                  </p>
                </div>
                <DragDropContext onDragEnd={aoFinalizarArrasteMetas}>
                  <div className="-mx-6 overflow-x-auto px-6 pb-2 lg:overflow-visible">
                    <div className="flex min-w-[980px] gap-4 lg:min-w-0 lg:grid lg:grid-cols-3">
                      {colunasStatus.map((coluna) => {
                        const itens = colunasMetas[coluna.id];
                        return (
                          <div
                            key={coluna.id}
                            className="flex w-[300px] flex-col gap-4 rounded-2xl border border-border bg-card p-4 lg:w-auto"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                                  {coluna.titulo}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {coluna.descricao}
                                </p>
                              </div>
                              <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-secondary-foreground">
                                {itens.length}
                              </span>
                            </div>
                            <Droppable droppableId={coluna.id}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.droppableProps}
                                  onScroll={aoRolarColunaMetas(
                                    coluna.id,
                                    itens.length
                                  )}
                                  onWheel={aoRolarWheelColunaMetas(
                                    coluna.id,
                                    itens.length
                                  )}
                                  className="kanban-scroll flex max-h-[640px] min-h-[320px] flex-col gap-3 overflow-y-auto pr-1 lg:max-h-[720px]"
                                >
                                  {itens.length === 0 ? (
                                    <p className="rounded-xl border border-dashed border-border px-3 py-4 text-xs text-muted-foreground">
                                      Sem metas nesta coluna.
                                    </p>
                                  ) : null}
                                  {itens
                                    .slice(
                                      0,
                                      obterLimiteMetas(coluna.id, itens.length)
                                    )
                                    .map((meta, index) => {
                                    const percentual = Math.round(
                                      (meta.progressoAtual /
                                        meta.progressoTotal) *
                                        100
                                    );
                                    return (
                                      <Draggable
                                        key={meta.id}
                                        draggableId={`meta-${meta.id}`}
                                        index={index}
                                      >
                                        {(provided, snapshot) => (
                                          <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            className={cn(
                                              "rounded-2xl border border-border bg-background/60 p-4 transition",
                                              snapshot.isDragging &&
                                                "border-primary/40 bg-secondary/60"
                                            )}
                                            >
                                              <div className="flex items-start justify-between gap-3">
                                                <div>
                                                  <p className="text-sm font-semibold">
                                                    {meta.titulo}
                                                  </p>
                                                  <p className="text-xs text-muted-foreground">
                                                    {meta.descricao}
                                                  </p>
                                                </div>
                                              <div className="flex flex-col items-end gap-2 text-xs text-muted-foreground">
                                                <span>{meta.prazo}</span>
                                                <Botao
                                                  type="button"
                                                  variant="ghost"
                                                  size="icon"
                                                  aria-label="Editar meta"
                                                  onClick={() => abrirEdicaoMeta(meta)}
                                                  className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
                                                >
                                                  <Pencil className="h-4 w-4" />
                                                </Botao>
                                              </div>
                                              </div>
                                              <Progresso
                                                value={percentual}
                                                className="mt-3"
                                            />
                                            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                                              <span>
                                                {meta.progressoAtual}/
                                                {meta.progressoTotal}
                                              </span>
                                              <span>{percentual}%</span>
                                            </div>
                                          </div>
                                        )}
                                      </Draggable>
                                    );
                                  })}
                                  {provided.placeholder}
                                </div>
                              )}
                            </Droppable>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </DragDropContext>
              </section>
            )}

            <Cartao>
              <CartaoCabecalho>
                <CartaoTitulo className="text-base">
                  Consistência (últimos 30 dias)
                </CartaoTitulo>
                <CartaoDescricao>
                  {diasConsistentes}/30 dias — {percentualConsistencia}% de
                  consistência
                </CartaoDescricao>
              </CartaoCabecalho>
              <CartaoConteudo>
                <div className="grid grid-cols-10 gap-1">
                  {consistenciaUltimos30Dias.map((valor, index) => (
                    <span
                      key={`${valor}-${index}`}
                      className={obterCorConsistencia(valor)}
                    />
                  ))}
                </div>
              </CartaoConteudo>
            </Cartao>
          </div>
        </main>
      </div>
    </div>
  );
}
