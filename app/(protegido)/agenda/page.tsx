'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock,
  Link2,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { Botao } from '@/componentes/ui/botao'
import {
  Cartao,
  CartaoCabecalho,
  CartaoConteudo,
  CartaoDescricao,
  CartaoTitulo,
} from '@/componentes/ui/cartao'
import { Calendario } from '@/componentes/ui/calendario'
import {
  Dialogo,
  DialogoCabecalho,
  DialogoConteudo,
  DialogoDescricao,
  DialogoFechar,
  DialogoGatilho,
  DialogoRodape,
  DialogoTitulo,
} from '@/componentes/ui/dialogo'
import {
  DialogoAlerta,
  DialogoAlertaAcao,
  DialogoAlertaCabecalho,
  DialogoAlertaCancelar,
  DialogoAlertaConteudo,
  DialogoAlertaDescricao,
  DialogoAlertaRodape,
  DialogoAlertaTitulo,
} from '@/componentes/ui/dialogo-alerta'
import {
  Seletor,
  SeletorConteudo,
  SeletorGatilho,
  SeletorItem,
  SeletorValor,
} from '@/componentes/ui/seletor'
import { cn } from '@/lib/utilidades'
import { useAgenda } from '@/hooks/useAgenda'
import {
  EVENT_CATEGORIES,
  type AgendaEvent,
  type CalendarIntegration,
  type CreateEventDto,
  type EventStatus,
} from '@/types/agenda'

type FormularioEvento = {
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

const criarFormularioVazio = (data: string): FormularioEvento => ({
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

const estilosStatus = {
  confirmado:
    'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
  pendente:
    'border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
  foco: 'border-primary/40 bg-primary/10 text-primary',
}

const labelStatus: Record<EventStatus, string> = {
  confirmado: 'Confirmado',
  pendente: 'Pendente',
  foco: 'Foco',
}

export default function PaginaAgenda() {
  const [dataSelecionada, setDataSelecionada] = React.useState<Date>(new Date())
  const [novoEventoAberto, setNovoEventoAberto] = React.useState(false)
  const [eventoEditando, setEventoEditando] = React.useState<AgendaEvent | null>(null)
  const [eventoExcluir, setEventoExcluir] = React.useState<AgendaEvent | null>(null)
  const [formEvento, setFormEvento] = React.useState<FormularioEvento>(() =>
    criarFormularioVazio(format(new Date(), 'yyyy-MM-dd'))
  )
  const [salvando, setSalvando] = React.useState(false)

  const { events, isLoading, error, createEvent, updateEvent, deleteEvent } =
    useAgenda()

  const dataSelecionadaISO = format(dataSelecionada, 'yyyy-MM-dd')
  const eventosDoDia = events.filter((evento) => evento.data === dataSelecionadaISO)
  const proximosEventos = events
    .filter((evento) => evento.data >= dataSelecionadaISO)
    .slice(0, 5)

  React.useEffect(() => {
    if (novoEventoAberto) {
      setFormEvento(criarFormularioVazio(dataSelecionadaISO))
    }
  }, [novoEventoAberto, dataSelecionadaISO])

  React.useEffect(() => {
    if (!eventoEditando) {
      return
    }
    setFormEvento({
      titulo: eventoEditando.titulo,
      descricao: eventoEditando.descricao ?? '',
      data: eventoEditando.data,
      horarioInicio: eventoEditando.horario_inicio,
      horarioFim: eventoEditando.horario_fim,
      categoria: eventoEditando.categoria,
      local: eventoEditando.local ?? '',
      status: eventoEditando.status,
      calendario: eventoEditando.calendario,
    })
  }, [eventoEditando])

  const atualizarFormulario = (parcial: Partial<FormularioEvento>) => {
    setFormEvento((prev) => ({ ...prev, ...parcial }))
  }

  const salvarEvento = async () => {
    if (!formEvento.titulo.trim()) {
      return
    }

    setSalvando(true)

    try {
      if (eventoEditando) {
        await updateEvent(eventoEditando.id, {
          titulo: formEvento.titulo,
          descricao: formEvento.descricao || undefined,
          data: formEvento.data,
          horario_inicio: formEvento.horarioInicio,
          horario_fim: formEvento.horarioFim,
          categoria: formEvento.categoria,
          local: formEvento.local || undefined,
          status: formEvento.status,
          calendario: formEvento.calendario,
        })
        setEventoEditando(null)
      } else {
        const novoEvento: CreateEventDto = {
          titulo: formEvento.titulo,
          descricao: formEvento.descricao || undefined,
          data: formEvento.data,
          horario_inicio: formEvento.horarioInicio,
          horario_fim: formEvento.horarioFim,
          categoria: formEvento.categoria,
          local: formEvento.local || undefined,
          status: formEvento.status,
          calendario: formEvento.calendario,
        }
        await createEvent(novoEvento)
        setNovoEventoAberto(false)
      }
    } catch (err) {
      // Error handling is done via React Query
    } finally {
      setSalvando(false)
    }
  }

  const confirmarExclusao = async () => {
    if (!eventoExcluir) {
      return
    }

    setSalvando(true)

    try {
      await deleteEvent(eventoExcluir.id)
      setEventoExcluir(null)
    } catch (err) {
      // Error handling is done via React Query
    } finally {
      setSalvando(false)
    }
  }

  if (error) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-10">
        <div className="text-center">
          <p className="text-destructive">Erro ao carregar agenda</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </main>
    )
  }

  return (
    <>
      <main id="main-content" className="flex-1 px-6 py-10">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
            <section className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Link
                  href="/inicio"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition hover:text-foreground"
                  aria-label="Voltar para início"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Link>
                <div>
                  <h1 className="font-titulo text-2xl font-semibold">Agenda</h1>
                  <p className="text-sm text-muted-foreground">
                    Organize compromissos, tarefas e blocos de foco.
                  </p>
                </div>
              </div>
              <Dialogo open={novoEventoAberto} onOpenChange={setNovoEventoAberto}>
                <DialogoGatilho asChild>
                  <Botao className="gap-2">
                    <Plus className="h-4 w-4" />
                    Novo evento
                  </Botao>
                </DialogoGatilho>
                <DialogoConteudo className="rounded-2xl border-border p-6">
                  <DialogoCabecalho>
                    <DialogoTitulo>Novo evento</DialogoTitulo>
                    <DialogoDescricao>
                      Agende reuniões, tarefas ou blocos de foco.
                    </DialogoDescricao>
                  </DialogoCabecalho>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="evento-titulo">
                        Título
                      </label>
                      <input
                        id="evento-titulo"
                        value={formEvento.titulo}
                        onChange={(event) =>
                          atualizarFormulario({ titulo: event.target.value })
                        }
                        placeholder="Ex: Call com cliente"
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="evento-data">
                          Data
                        </label>
                        <input
                          id="evento-data"
                          type="date"
                          value={formEvento.data}
                          onChange={(event) =>
                            atualizarFormulario({ data: event.target.value })
                          }
                          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                      </div>
                      <div className="space-y-2">
                        <label
                          className="text-sm font-medium"
                          htmlFor="evento-categoria"
                        >
                          Categoria
                        </label>
                        <Seletor
                          value={formEvento.categoria}
                          onValueChange={(valor) =>
                            atualizarFormulario({ categoria: valor })
                          }
                        >
                          <SeletorGatilho id="evento-categoria">
                            <SeletorValor placeholder="Selecione" />
                          </SeletorGatilho>
                          <SeletorConteudo>
                            {EVENT_CATEGORIES.map((categoria) => (
                              <SeletorItem
                                key={categoria.id}
                                value={categoria.titulo}
                              >
                                {categoria.titulo}
                              </SeletorItem>
                            ))}
                          </SeletorConteudo>
                        </Seletor>
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label
                          className="text-sm font-medium"
                          htmlFor="evento-inicio"
                        >
                          Início
                        </label>
                        <input
                          id="evento-inicio"
                          type="time"
                          value={formEvento.horarioInicio}
                          onChange={(event) =>
                            atualizarFormulario({
                              horarioInicio: event.target.value,
                            })
                          }
                          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="evento-fim">
                          Fim
                        </label>
                        <input
                          id="evento-fim"
                          type="time"
                          value={formEvento.horarioFim}
                          onChange={(event) =>
                            atualizarFormulario({
                              horarioFim: event.target.value,
                            })
                          }
                          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="evento-status">
                          Status
                        </label>
                        <Seletor
                          value={formEvento.status}
                          onValueChange={(valor) =>
                            atualizarFormulario({ status: valor as EventStatus })
                          }
                        >
                          <SeletorGatilho id="evento-status">
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
                        <label
                          className="text-sm font-medium"
                          htmlFor="evento-calendario"
                        >
                          Calendário
                        </label>
                        <Seletor
                          value={formEvento.calendario}
                          onValueChange={(valor) =>
                            atualizarFormulario({
                              calendario: valor as CalendarIntegration,
                            })
                          }
                        >
                          <SeletorGatilho id="evento-calendario">
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
                      <label className="text-sm font-medium" htmlFor="evento-local">
                        Local
                      </label>
                      <input
                        id="evento-local"
                        value={formEvento.local}
                        onChange={(event) =>
                          atualizarFormulario({ local: event.target.value })
                        }
                        placeholder="Ex: Google Meet"
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        className="text-sm font-medium"
                        htmlFor="evento-descricao"
                      >
                        Descrição
                      </label>
                      <textarea
                        id="evento-descricao"
                        value={formEvento.descricao}
                        onChange={(event) =>
                          atualizarFormulario({ descricao: event.target.value })
                        }
                        placeholder="Contexto do evento."
                        className="min-h-[90px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </div>
                  </div>
                  <DialogoRodape>
                    <DialogoFechar asChild>
                      <Botao variant="secondary" disabled={salvando}>
                        Cancelar
                      </Botao>
                    </DialogoFechar>
                    <Botao onClick={salvarEvento} disabled={salvando}>
                      {salvando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Criar evento
                    </Botao>
                  </DialogoRodape>
                </DialogoConteudo>
              </Dialogo>
            </section>

            <section className="grid gap-6 md:grid-cols-[minmax(0,1fr)_280px] lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-6">
                <Cartao>
                  <CartaoCabecalho>
                    <CartaoTitulo className="text-base">Agenda do dia</CartaoTitulo>
                    <CartaoDescricao>
                      {format(dataSelecionada, "EEEE, dd 'de' MMMM", {
                        locale: ptBR,
                      })}
                    </CartaoDescricao>
                  </CartaoCabecalho>
                  <CartaoConteudo className="space-y-3">
                    {isLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : eventosDoDia.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
                        Nenhum evento marcado para este dia.
                      </div>
                    ) : null}
                    {eventosDoDia.map((evento) => (
                      <div
                        key={evento.id}
                        className="flex flex-col gap-2 rounded-2xl border border-border bg-background/60 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <p className="text-sm font-semibold">{evento.titulo}</p>
                            {evento.descricao && (
                              <p className="text-xs text-muted-foreground">
                                {evento.descricao}
                              </p>
                            )}
                          </div>
                          <span
                            className={cn(
                              'rounded-full border px-2 py-0.5 text-[10px] font-semibold',
                              estilosStatus[evento.status]
                            )}
                          >
                            {labelStatus[evento.status]}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {evento.horario_inicio} - {evento.horario_fim}
                          </span>
                          {evento.local && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {evento.local}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {evento.categoria}
                          </span>
                          <span className="flex items-center gap-1">
                            <Link2 className="h-3.5 w-3.5" />
                            {evento.calendario}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Botao
                            variant="secondary"
                            size="sm"
                            className="gap-1"
                            onClick={() => setEventoEditando(evento)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Editar
                          </Botao>
                          <Botao
                            variant="outline"
                            size="sm"
                            className="gap-1 text-destructive hover:text-destructive"
                            onClick={() => setEventoExcluir(evento)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Excluir
                          </Botao>
                        </div>
                      </div>
                    ))}
                  </CartaoConteudo>
                </Cartao>

                <Cartao>
                  <CartaoCabecalho>
                    <CartaoTitulo className="text-base">
                      Próximos compromissos
                    </CartaoTitulo>
                    <CartaoDescricao>
                      Visão rápida dos próximos eventos agendados.
                    </CartaoDescricao>
                  </CartaoCabecalho>
                  <CartaoConteudo className="space-y-3">
                    {isLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      </div>
                    ) : proximosEventos.length === 0 ? (
                      <div className="text-sm text-muted-foreground">
                        Nenhum evento próximo.
                      </div>
                    ) : (
                      proximosEventos.map((evento) => (
                        <div
                          key={evento.id}
                          className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background/60 px-3 py-2 text-sm"
                        >
                          <div>
                            <p className="font-medium">{evento.titulo}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(`${evento.data}T00:00:00`), 'dd/MM')} •{' '}
                              {evento.horario_inicio}
                            </p>
                          </div>
                          <span
                            className={cn(
                              'rounded-full border px-2 py-0.5 text-[10px] font-semibold',
                              estilosStatus[evento.status]
                            )}
                          >
                            {labelStatus[evento.status]}
                          </span>
                        </div>
                      ))
                    )}
                  </CartaoConteudo>
                </Cartao>
              </div>

              <div className="space-y-6">
                <Cartao>
                  <CartaoCabecalho>
                    <CartaoTitulo className="text-base">Calendário</CartaoTitulo>
                    <CartaoDescricao>
                      Selecione um dia para visualizar a agenda.
                    </CartaoDescricao>
                  </CartaoCabecalho>
                  <CartaoConteudo>
                    <Calendario
                      mode="single"
                      selected={dataSelecionada}
                      onSelect={(date) =>
                        setDataSelecionada(date ?? dataSelecionada)
                      }
                      className="w-full"
                    />
                  </CartaoConteudo>
                </Cartao>

                <Cartao>
                  <CartaoCabecalho>
                    <CartaoTitulo className="text-base">Integrações</CartaoTitulo>
                    <CartaoDescricao>
                      Conecte seus calendários externos.
                    </CartaoDescricao>
                  </CartaoCabecalho>
                  <CartaoConteudo className="space-y-3">
                    <div className="flex items-center justify-between rounded-xl border border-border bg-background/60 px-3 py-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        Google Calendar
                      </div>
                      <Botao size="sm" variant="secondary" className="gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Conectar
                      </Botao>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-border bg-background/60 px-3 py-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        Outlook Calendar
                      </div>
                      <Botao size="sm" variant="secondary" className="gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Conectar
                      </Botao>
                    </div>
                  </CartaoConteudo>
                </Cartao>
              </div>
            </section>
          </div>
        </main>

      <Dialogo
        open={Boolean(eventoEditando)}
        onOpenChange={() => setEventoEditando(null)}
      >
        <DialogoConteudo className="rounded-2xl border-border p-6">
          <DialogoCabecalho>
            <DialogoTitulo>Editar evento</DialogoTitulo>
            <DialogoDescricao>
              Atualize os detalhes do compromisso.
            </DialogoDescricao>
          </DialogoCabecalho>
          <div className="grid gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="editar-titulo">
                Título
              </label>
              <input
                id="editar-titulo"
                value={formEvento.titulo}
                onChange={(event) =>
                  atualizarFormulario({ titulo: event.target.value })
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="editar-data">
                  Data
                </label>
                <input
                  id="editar-data"
                  type="date"
                  value={formEvento.data}
                  onChange={(event) =>
                    atualizarFormulario({ data: event.target.value })
                  }
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="editar-categoria">
                  Categoria
                </label>
                <Seletor
                  value={formEvento.categoria}
                  onValueChange={(valor) =>
                    atualizarFormulario({ categoria: valor })
                  }
                >
                  <SeletorGatilho id="editar-categoria">
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
                <label className="text-sm font-medium" htmlFor="editar-inicio">
                  Início
                </label>
                <input
                  id="editar-inicio"
                  type="time"
                  value={formEvento.horarioInicio}
                  onChange={(event) =>
                    atualizarFormulario({ horarioInicio: event.target.value })
                  }
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="editar-fim">
                  Fim
                </label>
                <input
                  id="editar-fim"
                  type="time"
                  value={formEvento.horarioFim}
                  onChange={(event) =>
                    atualizarFormulario({ horarioFim: event.target.value })
                  }
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="editar-status">
                  Status
                </label>
                <Seletor
                  value={formEvento.status}
                  onValueChange={(valor) =>
                    atualizarFormulario({ status: valor as EventStatus })
                  }
                >
                  <SeletorGatilho id="editar-status">
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
                <label className="text-sm font-medium" htmlFor="editar-calendario">
                  Calendário
                </label>
                <Seletor
                  value={formEvento.calendario}
                  onValueChange={(valor) =>
                    atualizarFormulario({
                      calendario: valor as CalendarIntegration,
                    })
                  }
                >
                  <SeletorGatilho id="editar-calendario">
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
              <label className="text-sm font-medium" htmlFor="editar-local">
                Local
              </label>
              <input
                id="editar-local"
                value={formEvento.local}
                onChange={(event) =>
                  atualizarFormulario({ local: event.target.value })
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="editar-descricao">
                Descrição
              </label>
              <textarea
                id="editar-descricao"
                value={formEvento.descricao}
                onChange={(event) =>
                  atualizarFormulario({ descricao: event.target.value })
                }
                placeholder="Contexto do evento."
                className="min-h-[90px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>
          <DialogoRodape>
            <DialogoFechar asChild>
              <Botao variant="secondary" disabled={salvando}>
                Cancelar
              </Botao>
            </DialogoFechar>
            <Botao onClick={salvarEvento} disabled={salvando}>
              {salvando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar alterações
            </Botao>
          </DialogoRodape>
        </DialogoConteudo>
      </Dialogo>

      <DialogoAlerta
        open={Boolean(eventoExcluir)}
        onOpenChange={(aberto) => {
          if (!aberto) {
            setEventoExcluir(null)
          }
        }}
      >
        <DialogoAlertaConteudo className="rounded-2xl border-border p-6">
          <DialogoAlertaCabecalho>
            <DialogoAlertaTitulo>Excluir evento</DialogoAlertaTitulo>
            <DialogoAlertaDescricao>
              Esse compromisso será removido do calendário.
            </DialogoAlertaDescricao>
          </DialogoAlertaCabecalho>
          <DialogoAlertaRodape>
            <DialogoAlertaCancelar disabled={salvando}>
              Cancelar
            </DialogoAlertaCancelar>
            <DialogoAlertaAcao onClick={confirmarExclusao} disabled={salvando}>
              {salvando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Excluir
            </DialogoAlertaAcao>
          </DialogoAlertaRodape>
        </DialogoAlertaConteudo>
      </DialogoAlerta>
    </>
  )
}
