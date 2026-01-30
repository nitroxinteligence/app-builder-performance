"use client";

import {
  Cartao,
  CartaoCabecalho,
  CartaoConteudo,
  CartaoDescricao,
  CartaoTitulo,
} from "@/componentes/ui/cartao";
import { cn } from "@/lib/utilidades";

// ==========================================
// PROPS
// ==========================================

export type EstatisticasHabitosProps = {
  consistencia: number[];
};

// ==========================================
// HELPERS
// ==========================================

const obterCorConsistencia = (valor: number) =>
  cn(
    "h-3 w-3 rounded-[4px]",
    valor === 0 && "bg-muted",
    valor === 1 && "bg-secondary",
    valor === 2 && "bg-primary/30 dark:bg-primary/20",
    valor >= 3 && "bg-primary/70 dark:bg-primary/60"
  );

// ==========================================
// COMPONENT
// ==========================================

export function EstatisticasHabitos({
  consistencia,
}: EstatisticasHabitosProps) {
  const diasConsistentes = consistencia.filter((valor) => valor > 0).length;
  const percentualConsistencia = Math.round(
    (diasConsistentes / consistencia.length) * 100
  );

  return (
    <Cartao>
      <CartaoCabecalho>
        <CartaoTitulo className="text-base">
          Consistência (últimos 30 dias)
        </CartaoTitulo>
        <CartaoDescricao>
          {diasConsistentes}/30 dias — {percentualConsistencia}% de consistência
        </CartaoDescricao>
      </CartaoCabecalho>
      <CartaoConteudo>
        <div className="grid grid-cols-5 gap-1 sm:grid-cols-7 md:grid-cols-10">
          {consistencia.map((valor, index) => (
            <span
              key={`${valor}-${index}`}
              className={obterCorConsistencia(valor)}
            />
          ))}
        </div>
      </CartaoConteudo>
    </Cartao>
  );
}
