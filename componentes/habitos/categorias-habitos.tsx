"use client"

import {
  Cartao,
  CartaoCabecalho,
  CartaoConteudo,
  CartaoDescricao,
  CartaoTitulo,
} from "@/componentes/ui/cartao"
import { Progresso } from "@/componentes/ui/progresso"
import type { CategoriaHabitoUI } from "./tipos-habitos"
import { HabitoCard } from "./habito-card"

export type CategoriasHabitosProps = {
  categoria: CategoriaHabitoUI
  onAlternarHabito: (categoriaId: string, habitoId: string) => void
  disabled?: boolean
}

export function CategoriasHabitos({
  categoria,
  onAlternarHabito,
  disabled = false,
}: CategoriasHabitosProps) {
  const feitos = categoria.habitos.filter((habito) => habito.feitoHoje).length
  const total = categoria.habitos.length
  const percentual = total > 0 ? Math.round((feitos / total) * 100) : 0
  const Icone = categoria.icone

  return (
    <Cartao>
      <CartaoCabecalho className="flex-row items-center justify-between space-y-0">
        <div>
          <CartaoTitulo className="text-base">
            {categoria.titulo}
          </CartaoTitulo>
          <CartaoDescricao>
            {feitos}/{total} concluidos
          </CartaoDescricao>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icone className="h-4 w-4" />
        </div>
      </CartaoCabecalho>
      <CartaoConteudo className="space-y-3">
        <Progresso value={percentual} />
        {total === 0 ? (
          <p className="text-xs text-muted-foreground">
            Nenhum habito nesta categoria.
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
  )
}
