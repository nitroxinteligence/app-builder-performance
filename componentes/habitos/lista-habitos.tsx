"use client";

import type { CategoriaHabitoUI } from "./tipos-habitos";
import { CategoriasHabitos } from "./categorias-habitos";

// ==========================================
// PROPS
// ==========================================

export type ListaHabitosProps = {
  categorias: CategoriaHabitoUI[];
  onAlternarHabito: (categoriaId: string, habitoId: string) => void;
  disabled?: boolean;
};

// ==========================================
// COMPONENT
// ==========================================

export function ListaHabitos({
  categorias,
  onAlternarHabito,
  disabled = false,
}: ListaHabitosProps) {
  return (
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
      {categorias.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhum hábito cadastrado ainda. Crie seu primeiro hábito para
            começar.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {categorias.map((categoria) => (
            <CategoriasHabitos
              key={categoria.id}
              categoria={categoria}
              onAlternarHabito={onAlternarHabito}
              disabled={disabled}
            />
          ))}
        </div>
      )}
    </section>
  );
}
