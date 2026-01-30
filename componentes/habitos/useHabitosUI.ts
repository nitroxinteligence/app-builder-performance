"use client";

import * as React from "react";

import type {
  AbaHabitos,
  ObjetivoKanban,
  MetaAnoKanban,
  FormularioObjetivo,
  FormularioMeta,
} from "./tipos-habitos";
import { formularioObjetivoVazio, formularioMetaVazio } from "./tipos-habitos";

// ---------------------------------------------------------------------------
// Hook: UI state for tabs, modals, and edit forms
// ---------------------------------------------------------------------------

export function useHabitosUI() {
  // Tab state
  const [abaAtiva, setAbaAtiva] = React.useState<AbaHabitos>("individual");

  // Modal state
  const [modalNovoHabitoAberto, setModalNovoHabitoAberto] = React.useState(false);
  const [modalNovoPlanoAberto, setModalNovoPlanoAberto] = React.useState(false);
  const [modalNovaMetaAberto, setModalNovaMetaAberto] = React.useState(false);

  // Edit state — Objetivo
  const [objetivoEditando, setObjetivoEditando] = React.useState<ObjetivoKanban | null>(null);
  const [formObjetivo, setFormObjetivo] = React.useState<FormularioObjetivo>(formularioObjetivoVazio);

  // Edit state — Meta
  const [metaEditando, setMetaEditando] = React.useState<MetaAnoKanban | null>(null);
  const [formMeta, setFormMeta] = React.useState<FormularioMeta>(formularioMetaVazio);

  // Edit helpers
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

  const fecharEdicaoObjetivo = () => {
    setObjetivoEditando(null);
    setFormObjetivo(formularioObjetivoVazio);
  };

  const atualizarFormObjetivo = (parcial: Partial<FormularioObjetivo>) =>
    setFormObjetivo((prev) => ({ ...prev, ...parcial }));

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

  const fecharEdicaoMeta = () => {
    setMetaEditando(null);
    setFormMeta(formularioMetaVazio);
  };

  const atualizarFormMeta = (parcial: Partial<FormularioMeta>) =>
    setFormMeta((prev) => ({ ...prev, ...parcial }));

  return {
    // Tab
    abaAtiva,
    setAbaAtiva,

    // Modals
    modalNovoHabitoAberto,
    setModalNovoHabitoAberto,
    modalNovoPlanoAberto,
    setModalNovoPlanoAberto,
    modalNovaMetaAberto,
    setModalNovaMetaAberto,

    // Edit — Objetivo
    objetivoEditando,
    formObjetivo,
    abrirEdicaoObjetivo,
    fecharEdicaoObjetivo,
    atualizarFormObjetivo,

    // Edit — Meta
    metaEditando,
    formMeta,
    abrirEdicaoMeta,
    fecharEdicaoMeta,
    atualizarFormMeta,
  };
}
