'use client'

import { Loader2 } from 'lucide-react'

import { Botao } from '@/componentes/ui/botao'
import {
  Dialogo,
  DialogoCabecalho,
  DialogoConteudo,
  DialogoDescricao,
  DialogoFechar,
  DialogoRodape,
  DialogoTitulo,
} from '@/componentes/ui/dialogo'
import { Entrada, AreaTexto } from '@/componentes/ui/entrada'
import {
  Seletor,
  SeletorConteudo,
  SeletorGatilho,
  SeletorItem,
  SeletorValor,
} from '@/componentes/ui/seletor'
import {
  EVENT_CATEGORIES,
  type CalendarIntegration,
  type EventStatus,
} from '@/types/agenda'

export type FormularioEvento = {
  titulo: string
  descricao: string
  data: string
  horarioInicio: string
  horarioFim: string
  categoria: string
  local: string
  status: EventStatus
  calendario: CalendarIntegration
}

export const criarFormularioVazio = (data: string): FormularioEvento => ({
  titulo: '',
  descricao: '',
  data,
  horarioInicio: '09:00',
  horarioFim: '09:30',
  categoria: 'Reunião',
  local: '',
  status: 'confirmado',
  calendario: 'Manual',
})

interface FormularioEventoDialogoProps {
  aberto: boolean
  onOpenChange: (aberto: boolean) => void
  formulario: FormularioEvento
  onAtualizar: (parcial: Partial<FormularioEvento>) => void
  onSalvar: () => void
  salvando: boolean
  modo: 'criar' | 'editar'
}

export function FormularioEventoDialogo({
  aberto,
  onOpenChange,
  formulario,
  onAtualizar,
  onSalvar,
  salvando,
  modo,
}: FormularioEventoDialogoProps) {
  const prefixoId = modo === 'criar' ? 'evento' : 'editar'
  const titulo = modo === 'criar' ? 'Novo evento' : 'Editar evento'
  const descricao =
    modo === 'criar'
      ? 'Agende reuniões, tarefas ou blocos de foco.'
      : 'Atualize os detalhes do compromisso.'
  const textoBotao = modo === 'criar' ? 'Criar evento' : 'Salvar alterações'

  return (
    <Dialogo open={aberto} onOpenChange={onOpenChange}>
      <DialogoConteudo className="rounded-2xl border-border p-6">
        <DialogoCabecalho>
          <DialogoTitulo>{titulo}</DialogoTitulo>
          <DialogoDescricao>{descricao}</DialogoDescricao>
        </DialogoCabecalho>
        <div className="grid gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor={`${prefixoId}-titulo`}>
              Título
            </label>
            <Entrada
              id={`${prefixoId}-titulo`}
              value={formulario.titulo}
              onChange={(event) => onAtualizar({ titulo: event.target.value })}
              placeholder="Ex: Call com cliente"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor={`${prefixoId}-data`}>
                Data
              </label>
              <Entrada
                id={`${prefixoId}-data`}
                type="date"
                value={formulario.data}
                onChange={(event) => onAtualizar({ data: event.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor={`${prefixoId}-categoria`}>
                Categoria
              </label>
              <Seletor
                value={formulario.categoria}
                onValueChange={(valor) => onAtualizar({ categoria: valor })}
              >
                <SeletorGatilho id={`${prefixoId}-categoria`}>
                  <SeletorValor placeholder="Selecione" />
                </SeletorGatilho>
                <SeletorConteudo>
                  {EVENT_CATEGORIES.map((categoria) => (
                    <SeletorItem key={categoria.id} value={categoria.titulo}>
                      {categoria.titulo}
                    </SeletorItem>
                  ))}
                </SeletorConteudo>
              </Seletor>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor={`${prefixoId}-inicio`}>
                Início
              </label>
              <Entrada
                id={`${prefixoId}-inicio`}
                type="time"
                value={formulario.horarioInicio}
                onChange={(event) =>
                  onAtualizar({ horarioInicio: event.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor={`${prefixoId}-fim`}>
                Fim
              </label>
              <Entrada
                id={`${prefixoId}-fim`}
                type="time"
                value={formulario.horarioFim}
                onChange={(event) =>
                  onAtualizar({ horarioFim: event.target.value })
                }
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor={`${prefixoId}-status`}>
                Status
              </label>
              <Seletor
                value={formulario.status}
                onValueChange={(valor) =>
                  onAtualizar({ status: valor as EventStatus })
                }
              >
                <SeletorGatilho id={`${prefixoId}-status`}>
                  <SeletorValor placeholder="Selecione" />
                </SeletorGatilho>
                <SeletorConteudo>
                  <SeletorItem value="confirmado">Confirmado</SeletorItem>
                  <SeletorItem value="pendente">Pendente</SeletorItem>
                  <SeletorItem value="foco">Foco</SeletorItem>
                </SeletorConteudo>
              </Seletor>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor={`${prefixoId}-calendario`}>
                Calendário
              </label>
              <Seletor
                value={formulario.calendario}
                onValueChange={(valor) =>
                  onAtualizar({ calendario: valor as CalendarIntegration })
                }
              >
                <SeletorGatilho id={`${prefixoId}-calendario`}>
                  <SeletorValor placeholder="Selecione" />
                </SeletorGatilho>
                <SeletorConteudo>
                  <SeletorItem value="Manual">Manual</SeletorItem>
                  <SeletorItem value="Google">Google</SeletorItem>
                  <SeletorItem value="Outlook">Outlook</SeletorItem>
                </SeletorConteudo>
              </Seletor>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor={`${prefixoId}-local`}>
              Local
            </label>
            <Entrada
              id={`${prefixoId}-local`}
              value={formulario.local}
              onChange={(event) => onAtualizar({ local: event.target.value })}
              placeholder="Ex: Google Meet"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor={`${prefixoId}-descricao`}>
              Descrição
            </label>
            <AreaTexto
              id={`${prefixoId}-descricao`}
              value={formulario.descricao}
              onChange={(event) =>
                onAtualizar({ descricao: event.target.value })
              }
              placeholder="Contexto do evento."
              className="min-h-[90px] resize-none"
            />
          </div>
        </div>
        <DialogoRodape>
          <DialogoFechar asChild>
            <Botao variant="secondary" disabled={salvando}>
              Cancelar
            </Botao>
          </DialogoFechar>
          <Botao onClick={onSalvar} disabled={salvando}>
            {salvando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {textoBotao}
          </Botao>
        </DialogoRodape>
      </DialogoConteudo>
    </Dialogo>
  )
}
