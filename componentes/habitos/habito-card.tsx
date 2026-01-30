"use client";

import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utilidades";
import type { HabitoDiarioUI } from "./tipos-habitos";

// ==========================================
// PROPS
// ==========================================

export type HabitoCardProps = {
  habito: HabitoDiarioUI;
  categoriaId: string;
  onAlternar: (categoriaId: string, habitoId: string) => void;
  disabled?: boolean;
};

// ==========================================
// COMPONENT
// ==========================================

export function HabitoCard({
  habito,
  categoriaId,
  onAlternar,
  disabled = false,
}: HabitoCardProps) {
  return (
    <button
      type="button"
      onClick={() => onAlternar(categoriaId, habito.id)}
      aria-pressed={habito.feitoHoje}
      disabled={disabled}
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
        <p className="text-sm font-medium">{habito.titulo}</p>
        <p className="text-xs text-muted-foreground">{habito.streak} dias</p>
      </div>
      {!habito.feitoHoje ? (
        <span className="text-xs font-medium text-amber-600">Fazer hoje</span>
      ) : (
        <span className="text-xs font-medium text-emerald-600">Concluído</span>
      )}
    </button>
  );
}
