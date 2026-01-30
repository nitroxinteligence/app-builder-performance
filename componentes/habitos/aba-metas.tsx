"use client";

import * as React from "react";
import { Pencil } from "lucide-react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from "@hello-pangea/dnd";

import { Botao } from "@/componentes/ui/botao";
import { Progresso } from "@/componentes/ui/progresso";
import { cn } from "@/lib/utilidades";

import type {
  StatusHabitoUI,
  ObjetivoKanban,
  MetaAnoKanban,
  ColunasHabitos,
} from "./tipos-habitos";
import { colunasStatus } from "./tipos-habitos";

// ==========================================
// SHARED KANBAN HOOKS
// ==========================================

function useLimitesColuna<T extends { status: StatusHabitoUI }>(
  colunas: ColunasHabitos<T>
) {
  const [limites, setLimites] = React.useState<Record<StatusHabitoUI, number>>({
    "a-fazer": 5,
    "em-andamento": 5,
    concluido: 5,
  });

  React.useEffect(() => {
    setLimites((prev) => {
      let mudou = false;
      const atualizado = { ...prev };

      colunasStatus.forEach((coluna) => {
        const itens = colunas[coluna.id];
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
  }, [colunas]);

  const obterLimite = React.useCallback(
    (colunaId: StatusHabitoUI, total: number) =>
      limites[colunaId] ?? Math.min(5, total),
    [limites]
  );

  const carregarMais = React.useCallback(
    (colunaId: StatusHabitoUI, total: number) => {
      setLimites((prev) => {
        const atual = prev[colunaId] ?? Math.min(5, total);
        const proximo = Math.min(atual + 10, total);
        if (proximo === atual) return prev;
        return { ...prev, [colunaId]: proximo };
      });
    },
    []
  );

  const aoRolarColuna = React.useCallback(
    (colunaId: StatusHabitoUI, total: number) =>
      (event: React.UIEvent<HTMLDivElement>) => {
        const alvo = event.currentTarget;
        if (alvo.scrollTop + alvo.clientHeight < alvo.scrollHeight - 32) return;
        carregarMais(colunaId, total);
      },
    [carregarMais]
  );

  const aoRolarWheelColuna = React.useCallback(
    (colunaId: StatusHabitoUI, total: number) =>
      (event: React.WheelEvent<HTMLDivElement>) => {
        if (event.deltaY <= 0) return;
        const alvo = event.currentTarget;
        const alturaVisivel = alvo.clientHeight;
        const alturaTotal = alvo.scrollHeight;
        const semScroll = alturaTotal <= alturaVisivel + 2;
        const noFim = alvo.scrollTop + alturaVisivel >= alturaTotal - 32;
        if (semScroll || noFim) {
          carregarMais(colunaId, total);
        }
      },
    [carregarMais]
  );

  return { obterLimite, aoRolarColuna, aoRolarWheelColuna };
}

// ==========================================
// KANBAN OBJETIVOS (Plano Individual)
// ==========================================

export type KanbanObjetivosProps = {
  colunasObjetivos: ColunasHabitos<ObjetivoKanban>;
  onDragEnd: (resultado: DropResult) => void;
  onEditarObjetivo: (objetivo: ObjetivoKanban) => void;
};

export function KanbanObjetivos({
  colunasObjetivos,
  onDragEnd,
  onEditarObjetivo,
}: KanbanObjetivosProps) {
  const { obterLimite, aoRolarColuna, aoRolarWheelColuna } =
    useLimitesColuna(colunasObjetivos);

  return (
    <section className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Plano individual
        </p>
        <p className="text-sm text-muted-foreground">
          Visualize o que precisa ser iniciado, o que está em andamento e o que
          já foi concluído.
        </p>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="-mx-6 overflow-x-auto px-6 pb-2 md:overflow-visible">
          <div className="flex flex-col gap-4 md:flex-row md:min-w-[980px] lg:min-w-0 lg:grid lg:grid-cols-3">
            {colunasStatus.map((coluna) => {
              const itens = colunasObjetivos[coluna.id];
              return (
                <div
                  key={coluna.id}
                  className="flex w-full flex-col gap-4 rounded-2xl border border-border bg-card p-4 md:w-[300px] lg:w-auto"
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
                        onScroll={aoRolarColuna(coluna.id, itens.length)}
                        onWheel={aoRolarWheelColuna(coluna.id, itens.length)}
                        className="kanban-scroll flex max-h-[640px] min-h-[320px] flex-col gap-3 overflow-y-auto pr-1 lg:max-h-[720px]"
                      >
                        {itens.length === 0 ? (
                          <p className="rounded-xl border border-dashed border-border px-3 py-4 text-xs text-muted-foreground">
                            Sem itens por aqui.
                          </p>
                        ) : null}
                        {itens
                          .slice(0, obterLimite(coluna.id, itens.length))
                          .map((objetivo, index) => (
                            <CartaoObjetivo
                              key={objetivo.id}
                              objetivo={objetivo}
                              index={index}
                              onEditar={onEditarObjetivo}
                            />
                          ))}
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
  );
}

// ==========================================
// CARTAO OBJETIVO (Draggable card)
// ==========================================

type CartaoObjetivoProps = {
  objetivo: ObjetivoKanban;
  index: number;
  onEditar: (objetivo: ObjetivoKanban) => void;
};

function CartaoObjetivo({ objetivo, index, onEditar }: CartaoObjetivoProps) {
  const percentual = Math.round(
    (objetivo.progressoAtual / objetivo.progressoTotal) * 100
  );

  return (
    <Draggable draggableId={`objetivo-${objetivo.id}`} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn(
            "rounded-2xl border border-border bg-background/60 p-4 transition",
            snapshot.isDragging && "border-primary/40 bg-secondary/60"
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">{objetivo.titulo}</p>
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
                onClick={() => onEditar(objetivo)}
                className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
              >
                <Pencil className="h-4 w-4" />
              </Botao>
            </div>
          </div>
          <Progresso value={percentual} className="mt-3" />
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {objetivo.progressoAtual}/{objetivo.progressoTotal}
            </span>
            <span>{percentual}%</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {objetivo.habitosChave.map((habito) => (
              <span
                key={habito}
                className="rounded-full bg-secondary px-2 py-1 text-[10px] font-medium text-secondary-foreground"
              >
                {habito}
              </span>
            ))}
          </div>
        </div>
      )}
    </Draggable>
  );
}

// ==========================================
// KANBAN METAS (Metas do Ano)
// ==========================================

export type KanbanMetasProps = {
  colunasMetas: ColunasHabitos<MetaAnoKanban>;
  onDragEnd: (resultado: DropResult) => void;
  onEditarMeta: (meta: MetaAnoKanban) => void;
};

export function KanbanMetas({
  colunasMetas,
  onDragEnd,
  onEditarMeta,
}: KanbanMetasProps) {
  const { obterLimite, aoRolarColuna, aoRolarWheelColuna } =
    useLimitesColuna(colunasMetas);

  return (
    <section className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Metas do ano
        </p>
        <p className="text-sm text-muted-foreground">
          Acompanhe metas prioritárias e organize o próximo passo.
        </p>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="-mx-6 overflow-x-auto px-6 pb-2 md:overflow-visible">
          <div className="flex flex-col gap-4 md:flex-row md:min-w-[980px] lg:min-w-0 lg:grid lg:grid-cols-3">
            {colunasStatus.map((coluna) => {
              const itens = colunasMetas[coluna.id];
              return (
                <div
                  key={coluna.id}
                  className="flex w-full flex-col gap-4 rounded-2xl border border-border bg-card p-4 md:w-[300px] lg:w-auto"
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
                        onScroll={aoRolarColuna(coluna.id, itens.length)}
                        onWheel={aoRolarWheelColuna(coluna.id, itens.length)}
                        className="kanban-scroll flex max-h-[640px] min-h-[320px] flex-col gap-3 overflow-y-auto pr-1 lg:max-h-[720px]"
                      >
                        {itens.length === 0 ? (
                          <p className="rounded-xl border border-dashed border-border px-3 py-4 text-xs text-muted-foreground">
                            Sem metas nesta coluna.
                          </p>
                        ) : null}
                        {itens
                          .slice(0, obterLimite(coluna.id, itens.length))
                          .map((meta, index) => (
                            <CartaoMeta
                              key={meta.id}
                              meta={meta}
                              index={index}
                              onEditar={onEditarMeta}
                            />
                          ))}
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
  );
}

// ==========================================
// CARTAO META (Draggable card)
// ==========================================

type CartaoMetaProps = {
  meta: MetaAnoKanban;
  index: number;
  onEditar: (meta: MetaAnoKanban) => void;
};

function CartaoMeta({ meta, index, onEditar }: CartaoMetaProps) {
  const percentual = Math.round(
    (meta.progressoAtual / meta.progressoTotal) * 100
  );

  return (
    <Draggable draggableId={`meta-${meta.id}`} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn(
            "rounded-2xl border border-border bg-background/60 p-4 transition",
            snapshot.isDragging && "border-primary/40 bg-secondary/60"
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">{meta.titulo}</p>
              <p className="text-xs text-muted-foreground">{meta.descricao}</p>
            </div>
            <div className="flex flex-col items-end gap-2 text-xs text-muted-foreground">
              <span>{meta.prazo}</span>
              <Botao
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Editar meta"
                onClick={() => onEditar(meta)}
                className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
              >
                <Pencil className="h-4 w-4" />
              </Botao>
            </div>
          </div>
          <Progresso value={percentual} className="mt-3" />
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {meta.progressoAtual}/{meta.progressoTotal}
            </span>
            <span>{percentual}%</span>
          </div>
        </div>
      )}
    </Draggable>
  );
}
