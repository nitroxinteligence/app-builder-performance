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

import type {
  CategoriaHabitoUI,
  StatusHabitoUI,
  FormularioObjetivo,
  FormularioMeta,
  ObjetivoKanban,
  MetaAnoKanban,
} from "./tipos-habitos";
import { formularioObjetivoVazio, formularioMetaVazio } from "./tipos-habitos";

// ==========================================
// PROPS — Novo Hábito
// ==========================================

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
            <input
              id="novo-habito-titulo"
              value={titulo}
              onChange={(event) => setTitulo(event.target.value)}
              placeholder="Ex: Meditar 10 min"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
            <textarea
              id="novo-habito-nota"
              value={observacao}
              onChange={(event) => setObservacao(event.target.value)}
              placeholder="Detalhes que ajudam a manter a rotina."
              className="min-h-[90px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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

// ==========================================
// PROPS — Novo Plano (Objetivo)
// ==========================================

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
            <input
              id="novo-plano-titulo"
              value={titulo}
              onChange={(event) => setTitulo(event.target.value)}
              placeholder="Ex: Aprender inglês"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
              <input
                id="novo-plano-meta-total"
                type="number"
                min={1}
                value={metaTotal}
                onChange={(event) => setMetaTotal(event.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="novo-plano-habitos" className="text-sm font-medium">
                Hábitos-chave
              </label>
              <input
                id="novo-plano-habitos"
                value={habitosChave}
                onChange={(event) => setHabitosChave(event.target.value)}
                placeholder="Ex: Leitura, prática, revisão"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="novo-plano-descricao" className="text-sm font-medium">
              Descrição
            </label>
            <textarea
              id="novo-plano-descricao"
              value={descricao}
              onChange={(event) => setDescricao(event.target.value)}
              placeholder="Detalhes que orientam seu plano."
              className="min-h-[90px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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

// ==========================================
// PROPS — Nova Meta
// ==========================================

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
            <input
              id="nova-meta-titulo"
              value={titulo}
              onChange={(event) => setTitulo(event.target.value)}
              placeholder="Ex: 100 corridas"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
              <input
                id="nova-meta-prazo"
                value={prazo}
                onChange={(event) => setPrazo(event.target.value)}
                placeholder="Ex: Dezembro"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="nova-meta-total" className="text-sm font-medium">
                Meta total
              </label>
              <input
                id="nova-meta-total"
                type="number"
                min={1}
                value={progressoTotal}
                onChange={(event) => setProgressoTotal(event.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="nova-meta-atual" className="text-sm font-medium">
                Progresso atual
              </label>
              <input
                id="nova-meta-atual"
                type="number"
                min={0}
                value={progressoAtual}
                onChange={(event) => setProgressoAtual(event.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="nova-meta-descricao" className="text-sm font-medium">
              Descrição
            </label>
            <textarea
              id="nova-meta-descricao"
              value={descricao}
              onChange={(event) => setDescricao(event.target.value)}
              placeholder="Detalhes da meta anual."
              className="min-h-[90px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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

// ==========================================
// PROPS — Editar Plano (Objetivo)
// ==========================================

export type DialogoEditarPlanoProps = {
  objetivoEditando: ObjetivoKanban | null;
  onClose: () => void;
  formObjetivo: FormularioObjetivo;
  onUpdateForm: (parcial: Partial<FormularioObjetivo>) => void;
  onSalvar: () => Promise<void>;
  isPending: boolean;
};

export function DialogoEditarPlano({
  objetivoEditando,
  onClose,
  formObjetivo,
  onUpdateForm,
  onSalvar,
  isPending,
}: DialogoEditarPlanoProps) {
  return (
    <Dialogo
      open={Boolean(objetivoEditando)}
      onOpenChange={(aberto) => {
        if (!aberto) onClose();
      }}
    >
      <DialogoConteudo className="rounded-2xl border-border p-6">
        <DialogoCabecalho>
          <DialogoTitulo>Editar plano</DialogoTitulo>
          <DialogoDescricao>
            Ajuste as informações e o progresso deste plano.
          </DialogoDescricao>
        </DialogoCabecalho>
        <div className="grid gap-4">
          <div className="space-y-2">
            <label htmlFor="editar-plano-titulo" className="text-sm font-medium">
              Objetivo principal
            </label>
            <input
              id="editar-plano-titulo"
              value={formObjetivo.titulo}
              onChange={(event) => onUpdateForm({ titulo: event.target.value })}
              placeholder="Ex: Aprender inglês"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="editar-plano-categoria" className="text-sm font-medium">
                Categoria
              </label>
              <Seletor
                value={formObjetivo.categoria}
                onValueChange={(valor) => onUpdateForm({ categoria: valor })}
              >
                <SeletorGatilho id="editar-plano-categoria">
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
              <label htmlFor="editar-plano-status" className="text-sm font-medium">
                Estágio
              </label>
              <Seletor
                value={formObjetivo.status}
                onValueChange={(valor) =>
                  onUpdateForm({ status: valor as StatusHabitoUI })
                }
              >
                <SeletorGatilho id="editar-plano-status">
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
              <label htmlFor="editar-plano-total" className="text-sm font-medium">
                Meta total
              </label>
              <input
                id="editar-plano-total"
                type="number"
                min={1}
                value={formObjetivo.progressoTotal}
                onChange={(event) =>
                  onUpdateForm({ progressoTotal: event.target.value })
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="editar-plano-atual" className="text-sm font-medium">
                Progresso atual
              </label>
              <input
                id="editar-plano-atual"
                type="number"
                min={0}
                value={formObjetivo.progressoAtual}
                onChange={(event) =>
                  onUpdateForm({ progressoAtual: event.target.value })
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="editar-plano-habitos" className="text-sm font-medium">
              Hábitos-chave
            </label>
            <input
              id="editar-plano-habitos"
              value={formObjetivo.habitosChave}
              onChange={(event) =>
                onUpdateForm({ habitosChave: event.target.value })
              }
              placeholder="Ex: Leitura, prática, revisão"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="editar-plano-descricao" className="text-sm font-medium">
              Descrição
            </label>
            <textarea
              id="editar-plano-descricao"
              value={formObjetivo.descricao}
              onChange={(event) =>
                onUpdateForm({ descricao: event.target.value })
              }
              placeholder="Detalhes que orientam seu plano."
              className="min-h-[90px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>
        <DialogoRodape>
          <DialogoFechar asChild>
            <Botao variant="secondary">Cancelar</Botao>
          </DialogoFechar>
          <Botao onClick={onSalvar} disabled={isPending}>
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Salvar alterações
          </Botao>
        </DialogoRodape>
      </DialogoConteudo>
    </Dialogo>
  );
}

// ==========================================
// PROPS — Editar Meta
// ==========================================

export type DialogoEditarMetaProps = {
  metaEditando: MetaAnoKanban | null;
  onClose: () => void;
  formMeta: FormularioMeta;
  onUpdateForm: (parcial: Partial<FormularioMeta>) => void;
  onSalvar: () => Promise<void>;
  isPending: boolean;
};

export function DialogoEditarMeta({
  metaEditando,
  onClose,
  formMeta,
  onUpdateForm,
  onSalvar,
  isPending,
}: DialogoEditarMetaProps) {
  return (
    <Dialogo
      open={Boolean(metaEditando)}
      onOpenChange={(aberto) => {
        if (!aberto) onClose();
      }}
    >
      <DialogoConteudo className="rounded-2xl border-border p-6">
        <DialogoCabecalho>
          <DialogoTitulo>Editar meta</DialogoTitulo>
          <DialogoDescricao>
            Ajuste o prazo e o progresso da meta anual.
          </DialogoDescricao>
        </DialogoCabecalho>
        <div className="grid gap-4">
          <div className="space-y-2">
            <label htmlFor="editar-meta-titulo" className="text-sm font-medium">
              Título
            </label>
            <input
              id="editar-meta-titulo"
              value={formMeta.titulo}
              onChange={(event) =>
                onUpdateForm({ titulo: event.target.value })
              }
              placeholder="Ex: 100 corridas"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="editar-meta-status" className="text-sm font-medium">
                Estágio
              </label>
              <Seletor
                value={formMeta.status}
                onValueChange={(valor) =>
                  onUpdateForm({ status: valor as StatusHabitoUI })
                }
              >
                <SeletorGatilho id="editar-meta-status">
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
              <label htmlFor="editar-meta-prazo" className="text-sm font-medium">
                Prazo
              </label>
              <input
                id="editar-meta-prazo"
                value={formMeta.prazo}
                onChange={(event) =>
                  onUpdateForm({ prazo: event.target.value })
                }
                placeholder="Ex: Dezembro"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="editar-meta-total" className="text-sm font-medium">
                Meta total
              </label>
              <input
                id="editar-meta-total"
                type="number"
                min={1}
                value={formMeta.progressoTotal}
                onChange={(event) =>
                  onUpdateForm({ progressoTotal: event.target.value })
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="editar-meta-atual" className="text-sm font-medium">
                Progresso atual
              </label>
              <input
                id="editar-meta-atual"
                type="number"
                min={0}
                value={formMeta.progressoAtual}
                onChange={(event) =>
                  onUpdateForm({ progressoAtual: event.target.value })
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="editar-meta-descricao" className="text-sm font-medium">
              Descrição
            </label>
            <textarea
              id="editar-meta-descricao"
              value={formMeta.descricao}
              onChange={(event) =>
                onUpdateForm({ descricao: event.target.value })
              }
              placeholder="Detalhes da meta anual."
              className="min-h-[90px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>
        <DialogoRodape>
          <DialogoFechar asChild>
            <Botao variant="secondary">Cancelar</Botao>
          </DialogoFechar>
          <Botao onClick={onSalvar} disabled={isPending}>
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Salvar alterações
          </Botao>
        </DialogoRodape>
      </DialogoConteudo>
    </Dialogo>
  );
}
