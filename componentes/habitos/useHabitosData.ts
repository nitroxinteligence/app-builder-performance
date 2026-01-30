"use client";

import * as React from "react";
import { BookOpen } from "lucide-react";

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
import type { CategoriaHabitoUI } from "./tipos-habitos";
import {
  getIconeCategoria,
  transformObjetivoToKanban,
  transformMetaToKanban,
  criarColunas,
  getTodayDateString,
} from "./tipos-habitos";

// ---------------------------------------------------------------------------
// Hook: Data fetching, mutations, and derived state
// ---------------------------------------------------------------------------

export function useHabitosData() {
  // Queries
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

  // Mutations
  const createHabitoMutation = useCreateHabito();
  const registrarHabitoMutation = useRegistrarHabito();
  const createObjetivoMutation = useCreateObjetivo();
  const updateObjetivoMutation = useUpdateObjetivo();
  const moverObjetivoMutation = useMoverObjetivo();
  const createMetaMutation = useCreateMeta();
  const updateMetaMutation = useUpdateMeta();

  // Derived data
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

  return {
    // Loading / Error
    isLoading,
    hasError,
    errorMessage,
    todayStr,

    // Derived data
    categoriasHabitos,
    colunasObjetivos,
    colunasMetas,

    // Mutations
    createHabitoMutation,
    registrarHabitoMutation,
    createObjetivoMutation,
    updateObjetivoMutation,
    moverObjetivoMutation,
    createMetaMutation,
    updateMetaMutation,
  };
}
