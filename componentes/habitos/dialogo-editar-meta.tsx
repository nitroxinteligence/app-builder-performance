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
  FormularioMeta,
  MetaAnoKanban,
} from "./tipos-habitos";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export type DialogoEditarMetaProps = {
  metaEditando: MetaAnoKanban | null;
  onClose: () => void;
  formMeta: FormularioMeta;
  onUpdateForm: (parcial: Partial<FormularioMeta>) => void;
  onSalvar: () => Promise<void>;
  isPending: boolean;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

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
            <Entrada
              id="editar-meta-titulo"
              value={formMeta.titulo}
              onChange={(event) =>
                onUpdateForm({ titulo: event.target.value })
              }
              placeholder="Ex: 100 corridas"
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
              <Entrada
                id="editar-meta-prazo"
                value={formMeta.prazo}
                onChange={(event) =>
                  onUpdateForm({ prazo: event.target.value })
                }
                placeholder="Ex: Dezembro"
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="editar-meta-total" className="text-sm font-medium">
                Meta total
              </label>
              <Entrada
                id="editar-meta-total"
                type="number"
                min={1}
                value={formMeta.progressoTotal}
                onChange={(event) =>
                  onUpdateForm({ progressoTotal: event.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="editar-meta-atual" className="text-sm font-medium">
                Progresso atual
              </label>
              <Entrada
                id="editar-meta-atual"
                type="number"
                min={0}
                value={formMeta.progressoAtual}
                onChange={(event) =>
                  onUpdateForm({ progressoAtual: event.target.value })
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="editar-meta-descricao" className="text-sm font-medium">
              Descrição
            </label>
            <AreaTexto
              id="editar-meta-descricao"
              value={formMeta.descricao}
              onChange={(event) =>
                onUpdateForm({ descricao: event.target.value })
              }
              placeholder="Detalhes da meta anual."
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
