import {
  BookOpen,
  Briefcase,
  Dumbbell,
  GraduationCap,
  HeartPulse,
  Leaf,
  Sparkles,
} from "lucide-react";

import type {
  Objetivo,
  Meta,
  StatusObjetivo,
  StatusMeta,
} from "@/lib/supabase/types";

// ==========================================
// UI TYPES
// ==========================================

export type AbaHabitos = "individual" | "metas";

export type StatusHabitoUI = "a-fazer" | "em-andamento" | "concluido";

export type HabitoDiarioUI = {
  id: string;
  titulo: string;
  streak: number;
  feitoHoje: boolean;
};

export type CategoriaHabitoUI = {
  id: string;
  titulo: string;
  icone: typeof BookOpen;
  habitos: HabitoDiarioUI[];
};

export type ObjetivoKanban = {
  id: string;
  titulo: string;
  descricao: string;
  progressoAtual: number;
  progressoTotal: number;
  status: StatusHabitoUI;
  habitosChave: string[];
  categoria: string;
};

export type MetaAnoKanban = {
  id: string;
  titulo: string;
  descricao: string;
  progressoAtual: number;
  progressoTotal: number;
  status: StatusHabitoUI;
  prazo: string;
};

export type ColunasHabitos<T extends { status: StatusHabitoUI }> = Record<
  StatusHabitoUI,
  T[]
>;

export type FormularioObjetivo = {
  titulo: string;
  descricao: string;
  progressoAtual: string;
  progressoTotal: string;
  status: StatusHabitoUI;
  categoria: string;
  habitosChave: string;
};

export type FormularioMeta = {
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

export const mapStatusObjetivoToUI = (status: StatusObjetivo): StatusHabitoUI => {
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

export const mapStatusMetaToUI = (status: StatusMeta): StatusHabitoUI => {
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

export const mapUIStatusToObjetivo = (status: StatusHabitoUI): StatusObjetivo => {
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

export const mapUIStatusToMeta = (status: StatusHabitoUI): StatusMeta => {
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

export const transformObjetivoToKanban = (
  objetivo: Objetivo,
  colunaTitulo: string
): ObjetivoKanban => ({
  id: objetivo.id,
  titulo: objetivo.titulo,
  descricao: objetivo.descricao || "Objetivo em evolu\u00e7\u00e3o.",
  progressoAtual: objetivo.progresso_atual,
  progressoTotal: objetivo.progresso_total,
  status: mapStatusObjetivoToUI(objetivo.status),
  habitosChave: objetivo.tags.length > 0 ? objetivo.tags : ["Definir rotina"],
  categoria: colunaTitulo,
});

export const transformMetaToKanban = (meta: Meta): MetaAnoKanban => ({
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

// ==========================================
// ICON MAPPING
// ==========================================

const iconePorCategoria: Record<string, typeof BookOpen> = {
  saude: Dumbbell,
  produtividade: Sparkles,
  "bem-estar": Leaf,
  estudos: GraduationCap,
  profissional: Briefcase,
  pessoal: HeartPulse,
};

export const getIconeCategoria = (nome: string): typeof BookOpen => {
  const nomeNormalizado = nome
    .toLowerCase()
    .replace(/[\u00e1\u00e0\u00e3]/g, "a")
    .replace(/[\u00e9\u00ea]/g, "e")
    .replace(/[\u00ed\u00ee]/g, "i")
    .replace(/[\u00f3\u00f4]/g, "o")
    .replace(/[\u00fa\u00fb]/g, "u");
  return iconePorCategoria[nomeNormalizado] || BookOpen;
};

// ==========================================
// CONSTANTS
// ==========================================

export const colunasStatus = [
  {
    id: "a-fazer" as const,
    titulo: "A fazer",
    descricao: "O que precisa sair do papel.",
  },
  {
    id: "em-andamento" as const,
    titulo: "Em andamento",
    descricao: "Metas que j\u00e1 est\u00e3o em execu\u00e7\u00e3o.",
  },
  {
    id: "concluido" as const,
    titulo: "Conclu\u00eddo",
    descricao: "Vit\u00f3rias registradas e celebradas.",
  },
];

export const formularioObjetivoVazio: FormularioObjetivo = {
  titulo: "",
  descricao: "",
  progressoAtual: "0",
  progressoTotal: "10",
  status: "a-fazer",
  categoria: "Pessoal",
  habitosChave: "",
};

export const formularioMetaVazio: FormularioMeta = {
  titulo: "",
  descricao: "",
  progressoAtual: "0",
  progressoTotal: "100",
  status: "a-fazer",
  prazo: "",
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

export const criarColunas = <T extends { status: StatusHabitoUI }>(
  itens: T[]
): ColunasHabitos<T> => ({
  "a-fazer": itens.filter((item) => item.status === "a-fazer"),
  "em-andamento": itens.filter((item) => item.status === "em-andamento"),
  concluido: itens.filter((item) => item.status === "concluido"),
});

export const lerNumero = (valor: string, fallback: number) => {
  const numero = Number.parseInt(valor, 10);
  return Number.isFinite(numero) ? numero : fallback;
};

export const getTodayDateString = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};
