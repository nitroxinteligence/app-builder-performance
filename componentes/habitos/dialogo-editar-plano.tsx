"use client";

import { Loader2 } from "lucide-react";

import { Botao } from "@/componentes/ui/botao";
import {
  Dialogo,
  DialogoCabecalho,
  DialogoConteudo,
  DialogoDescricao,
  DialogoFechar,
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

import type {
  StatusHabitoUI,
  FormularioObjetivo,
  ObjetivoKanban,
} from "./tipos-habitos";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export type DialogoEditarPlanoProps = {
  objetivoEditando: ObjetivoKanban | null;
  onClose: () => void;
  formObjetivo: FormularioObjetivo;
  onUpdateForm: (parcial: Partial<FormularioObjetivo>) => void;
  onSalvar: () => Promise<void>;
  isPending: boolean;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

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
            <Entrada
              id="editar-plano-titulo"
              value={formObjetivo.titulo}
              onChange={(event) => onUpdateForm({ titulo: event.target.value })}
              placeholder="Ex: Aprender inglês"
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
              <Entrada
                id="editar-plano-total"
                type="number"
                min={1}
                value={formObjetivo.progressoTotal}
                onChange={(event) =>
                  onUpdateForm({ progressoTotal: event.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="editar-plano-atual" className="text-sm font-medium">
                Progresso atual
              </label>
              <Entrada
                id="editar-plano-atual"
                type="number"
                min={0}
                value={formObjetivo.progressoAtual}
                onChange={(event) =>
                  onUpdateForm({ progressoAtual: event.target.value })
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="editar-plano-habitos" className="text-sm font-medium">
              Hábitos-chave
            </label>
            <Entrada
              id="editar-plano-habitos"
              value={formObjetivo.habitosChave}
              onChange={(event) =>
                onUpdateForm({ habitosChave: event.target.value })
              }
              placeholder="Ex: Leitura, prática, revisão"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="editar-plano-descricao" className="text-sm font-medium">
              Descrição
            </label>
            <AreaTexto
              id="editar-plano-descricao"
              value={formObjetivo.descricao}
              onChange={(event) =>
                onUpdateForm({ descricao: event.target.value })
              }
              placeholder="Detalhes que orientam seu plano."
              className="min-h-[90px] resize-none"
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
