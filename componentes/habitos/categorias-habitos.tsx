"use client";

import {
  Cartao,
  CartaoCabecalho,
  CartaoConteudo,
  CartaoDescricao,
  CartaoTitulo,
} from "@/componentes/ui/cartao";
import type { CategoriaHabitoUI } from "./tipos-habitos";
import { HabitoCard } from "./habito-card";

// ==========================================
// PROPS
// ==========================================

export type CategoriasHabitosProps = {
  categoria: CategoriaHabitoUI;
  onAlternarHabito: (categoriaId: string, habitoId: string) => void;
  disabled?: boolean;
};

// ==========================================
// COMPONENT
// ==========================================

export function CategoriasHabitos({
  categoria,
  onAlternarHabito,
  disabled = false,
}: CategoriasHabitosProps) {
  const feitos = categoria.habitos.filter((habito) => habito.feitoHoje).length;
  const Icone = categoria.icone;

  return (
    <Cartao>
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
          <Icone className="h-4 w-4" />
        </div>
      </CartaoCabecalho>
      <CartaoConteudo className="space-y-3">
        {categoria.habitos.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Nenhum hábito nesta categoria.
          </p>
        ) : (
          categoria.habitos.map((habito) => (
            <HabitoCard
              key={habito.id}
              habito={habito}
              categoriaId={categoria.id}
              onAlternar={onAlternarHabito}
              disabled={disabled}
            />
          ))
        )}
      </CartaoConteudo>
    </Cartao>
  );
}
