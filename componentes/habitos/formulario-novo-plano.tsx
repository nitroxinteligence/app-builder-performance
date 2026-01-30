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

import type { StatusHabitoUI } from "./tipos-habitos";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export type FormularioNovoPlanoProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (dados: {
    titulo: string;
    descricao: string;
    categoria: string;
    metaTotal: string;
    status: StatusHabitoUI;
    habitosChave: string;
  }) => Promise<void>;
  isPending: boolean;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function FormularioNovoPlano({
  open,
  onOpenChange,
  onSubmit,
  isPending,
}: FormularioNovoPlanoProps) {
  const [titulo, setTitulo] = React.useState("");
  const [categoria, setCategoria] = React.useState("Pessoal");
  const [metaTotal, setMetaTotal] = React.useState("10");
  const [status, setStatus] = React.useState<StatusHabitoUI>("a-fazer");
  const [habitosChave, setHabitosChave] = React.useState("");
  const [descricao, setDescricao] = React.useState("");

  React.useEffect(() => {
    if (!open) return;
    setTitulo("");
    setCategoria("Pessoal");
    setMetaTotal("10");
    setStatus("a-fazer");
    setHabitosChave("");
    setDescricao("");
  }, [open]);

  const handleSubmit = async () => {
    if (!titulo.trim()) return;
    await onSubmit({
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      categoria,
      metaTotal,
      status,
      habitosChave,
    });
  };

  return (
    <Dialogo open={open} onOpenChange={onOpenChange}>
      <DialogoGatilho asChild>
        <Botao variant="secondary" className="gap-2">
          <Plus className="h-4 w-4" />
          Novo plano
        </Botao>
      </DialogoGatilho>
      <DialogoConteudo className="rounded-2xl border-border p-6">
        <DialogoCabecalho>
          <DialogoTitulo>Novo plano individual</DialogoTitulo>
          <DialogoDescricao>
            Crie um objetivo para o seu desenvolvimento.
          </DialogoDescricao>
        </DialogoCabecalho>
        <div className="grid gap-4">
          <div className="space-y-2">
            <label htmlFor="novo-plano-titulo" className="text-sm font-medium">
              Objetivo principal
            </label>
            <Entrada
              id="novo-plano-titulo"
              value={titulo}
              onChange={(event) => setTitulo(event.target.value)}
              placeholder="Ex: Aprender inglês"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="novo-plano-categoria" className="text-sm font-medium">
                Categoria
              </label>
              <Seletor value={categoria} onValueChange={setCategoria}>
                <SeletorGatilho id="novo-plano-categoria">
                  <SeletorValor placeholder="Selecione" />
                </SeletorGatilho>
                <SeletorConteudo>
                  <SeletorItem value="Pessoal">Pessoal</SeletorItem>
                  <SeletorItem value="Profissional">Profissional</SeletorItem>
                  <SeletorItem value="Estudos">Estudos</SeletorItem>
                </SeletorConteudo>
              </Seletor>
            </div>
            <div className="space-y-2">
              <label htmlFor="novo-plano-status" className="text-sm font-medium">
                Estágio inicial
              </label>
              <Seletor
                value={status}
                onValueChange={(valor) => setStatus(valor as StatusHabitoUI)}
              >
                <SeletorGatilho id="novo-plano-status">
                  <SeletorValor placeholder="Selecione" />
                </SeletorGatilho>
                <SeletorConteudo>
                  <SeletorItem value="a-fazer">A fazer</SeletorItem>
                  <SeletorItem value="em-andamento">Em andamento</SeletorItem>
                  <SeletorItem value="concluido">Concluído</SeletorItem>
                </SeletorConteudo>
              </Seletor>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="novo-plano-meta-total" className="text-sm font-medium">
                Meta total
              </label>
              <Entrada
                id="novo-plano-meta-total"
                type="number"
                min={1}
                value={metaTotal}
                onChange={(event) => setMetaTotal(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="novo-plano-habitos" className="text-sm font-medium">
                Hábitos-chave
              </label>
              <Entrada
                id="novo-plano-habitos"
                value={habitosChave}
                onChange={(event) => setHabitosChave(event.target.value)}
                placeholder="Ex: Leitura, prática, revisão"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="novo-plano-descricao" className="text-sm font-medium">
              Descrição
            </label>
            <AreaTexto
              id="novo-plano-descricao"
              value={descricao}
              onChange={(event) => setDescricao(event.target.value)}
              placeholder="Detalhes que orientam seu plano."
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
            Criar plano
          </Botao>
        </DialogoRodape>
      </DialogoConteudo>
    </Dialogo>
  );
}
