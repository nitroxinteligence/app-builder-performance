"use client";

import * as React from "react";
import { Loader2, Plus } from "lucide-react";

import { Botao } from "@/componentes/ui/botao";
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
import {
  Seletor,
  SeletorConteudo,
  SeletorGatilho,
  SeletorItem,
  SeletorValor,
} from "@/componentes/ui/seletor";
import { Entrada, AreaTexto } from "@/componentes/ui/entrada";

import type { CategoriaHabitoUI } from "./tipos-habitos";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export type FormularioNovoHabitoProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categorias: CategoriaHabitoUI[];
  onSubmit: (dados: {
    titulo: string;
    categoriaId: string;
    frequencia: "diario" | "semanal";
    duracao: string;
    observacao: string;
  }) => Promise<void>;
  isPending: boolean;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function FormularioNovoHabito({
  open,
  onOpenChange,
  categorias,
  onSubmit,
  isPending,
}: FormularioNovoHabitoProps) {
  const [titulo, setTitulo] = React.useState("");
  const [categoriaId, setCategoriaId] = React.useState("");
  const [frequencia, setFrequencia] = React.useState<"diario" | "semanal">("diario");
  const [duracao, setDuracao] = React.useState("21");
  const [observacao, setObservacao] = React.useState("");

  React.useEffect(() => {
    if (!open) return;
    setTitulo("");
    setCategoriaId(categorias[0]?.id ?? "");
    setFrequencia("diario");
    setDuracao("21");
    setObservacao("");
  }, [open, categorias]);

  const handleSubmit = async () => {
    if (!titulo.trim()) return;
    await onSubmit({
      titulo: titulo.trim(),
      categoriaId,
      frequencia,
      duracao,
      observacao: observacao.trim(),
    });
  };

  return (
    <Dialogo open={open} onOpenChange={onOpenChange}>
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
            <label htmlFor="novo-habito-titulo" className="text-sm font-medium">
              Título
            </label>
            <Entrada
              id="novo-habito-titulo"
              value={titulo}
              onChange={(event) => setTitulo(event.target.value)}
              placeholder="Ex: Meditar 10 min"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="novo-habito-categoria" className="text-sm font-medium">
                Categoria
              </label>
              <Seletor value={categoriaId} onValueChange={setCategoriaId}>
                <SeletorGatilho id="novo-habito-categoria">
                  <SeletorValor placeholder="Selecione" />
                </SeletorGatilho>
                <SeletorConteudo>
                  {categorias.map((categoria) => (
                    <SeletorItem key={categoria.id} value={categoria.id}>
                      {categoria.titulo}
                    </SeletorItem>
                  ))}
                </SeletorConteudo>
              </Seletor>
            </div>
            <div className="space-y-2">
              <label htmlFor="novo-habito-frequencia" className="text-sm font-medium">
                Frequência
              </label>
              <Seletor
                value={frequencia}
                onValueChange={(v) => setFrequencia(v as "diario" | "semanal")}
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
            <label htmlFor="novo-habito-duracao" className="text-sm font-medium">
              Duração (dias)
            </label>
            <Seletor value={duracao} onValueChange={setDuracao}>
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
            <label htmlFor="novo-habito-nota" className="text-sm font-medium">
              Observações
            </label>
            <AreaTexto
              id="novo-habito-nota"
              value={observacao}
              onChange={(event) => setObservacao(event.target.value)}
              placeholder="Detalhes que ajudam a manter a rotina."
              className="min-h-[90px] resize-none"
            />
          </div>
        </div>
        <DialogoRodape>
          <DialogoFechar asChild>
            <Botao variant="secondary">Cancelar</Botao>
          </DialogoFechar>
          <Botao onClick={handleSubmit} disabled={isPending}>
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Adicionar hábito
          </Botao>
        </DialogoRodape>
      </DialogoConteudo>
    </Dialogo>
  );
}
