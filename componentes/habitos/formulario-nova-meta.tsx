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

export type FormularioNovaMetaProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (dados: {
    titulo: string;
    descricao: string;
    prazo: string;
    progressoTotal: string;
    progressoAtual: string;
    status: StatusHabitoUI;
  }) => Promise<void>;
  isPending: boolean;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function FormularioNovaMeta({
  open,
  onOpenChange,
  onSubmit,
  isPending,
}: FormularioNovaMetaProps) {
  const [titulo, setTitulo] = React.useState("");
  const [descricao, setDescricao] = React.useState("");
  const [prazo, setPrazo] = React.useState("");
  const [progressoTotal, setProgressoTotal] = React.useState("100");
  const [progressoAtual, setProgressoAtual] = React.useState("0");
  const [status, setStatus] = React.useState<StatusHabitoUI>("a-fazer");

  React.useEffect(() => {
    if (!open) return;
    setTitulo("");
    setDescricao("");
    setPrazo("");
    setProgressoTotal("100");
    setProgressoAtual("0");
    setStatus("a-fazer");
  }, [open]);

  const handleSubmit = async () => {
    if (!titulo.trim()) return;
    await onSubmit({
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      prazo,
      progressoTotal,
      progressoAtual,
      status,
    });
  };

  return (
    <Dialogo open={open} onOpenChange={onOpenChange}>
      <DialogoGatilho asChild>
        <Botao className="gap-2">
          <Plus className="h-4 w-4" />
          Nova meta
        </Botao>
      </DialogoGatilho>
      <DialogoConteudo className="rounded-2xl border-border p-6">
        <DialogoCabecalho>
          <DialogoTitulo>Nova meta anual</DialogoTitulo>
          <DialogoDescricao>
            Defina uma meta prioritária para o ano.
          </DialogoDescricao>
        </DialogoCabecalho>
        <div className="grid gap-4">
          <div className="space-y-2">
            <label htmlFor="nova-meta-titulo" className="text-sm font-medium">
              Título
            </label>
            <Entrada
              id="nova-meta-titulo"
              value={titulo}
              onChange={(event) => setTitulo(event.target.value)}
              placeholder="Ex: 100 corridas"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="nova-meta-status" className="text-sm font-medium">
                Estágio inicial
              </label>
              <Seletor
                value={status}
                onValueChange={(valor) => setStatus(valor as StatusHabitoUI)}
              >
                <SeletorGatilho id="nova-meta-status">
                  <SeletorValor placeholder="Selecione" />
                </SeletorGatilho>
                <SeletorConteudo>
                  <SeletorItem value="a-fazer">A fazer</SeletorItem>
                  <SeletorItem value="em-andamento">Em andamento</SeletorItem>
                  <SeletorItem value="concluido">Concluído</SeletorItem>
                </SeletorConteudo>
              </Seletor>
            </div>
            <div className="space-y-2">
              <label htmlFor="nova-meta-prazo" className="text-sm font-medium">
                Prazo
              </label>
              <Entrada
                id="nova-meta-prazo"
                value={prazo}
                onChange={(event) => setPrazo(event.target.value)}
                placeholder="Ex: Dezembro"
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="nova-meta-total" className="text-sm font-medium">
                Meta total
              </label>
              <Entrada
                id="nova-meta-total"
                type="number"
                min={1}
                value={progressoTotal}
                onChange={(event) => setProgressoTotal(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="nova-meta-atual" className="text-sm font-medium">
                Progresso atual
              </label>
              <Entrada
                id="nova-meta-atual"
                type="number"
                min={0}
                value={progressoAtual}
                onChange={(event) => setProgressoAtual(event.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="nova-meta-descricao" className="text-sm font-medium">
              Descrição
            </label>
            <AreaTexto
              id="nova-meta-descricao"
              value={descricao}
              onChange={(event) => setDescricao(event.target.value)}
              placeholder="Detalhes da meta anual."
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
            Criar meta
          </Botao>
        </DialogoRodape>
      </DialogoConteudo>
    </Dialogo>
  );
}
