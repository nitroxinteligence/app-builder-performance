import { Award, Flame, Shield } from "lucide-react"

import type { DadosAtividade } from "@/componentes/inicio/grafico-atividade"
import type { EventoHoje } from "@/componentes/inicio/secao-agenda-dia"
import type { Conquista } from "@/componentes/inicio/secao-conquistas"

export { marcaSidebar, secoesMenu } from "@/lib/navegacao"
export type { ItemNavegacao as ItemMenu } from "@/lib/navegacao"

export const dadosAtividadeSemanal: DadosAtividade[] = [
  { dia: "Seg", tarefas: 5, foco: 2, habitos: 4 },
  { dia: "Ter", tarefas: 8, foco: 3, habitos: 5 },
  { dia: "Qua", tarefas: 6, foco: 4, habitos: 6 },
  { dia: "Qui", tarefas: 10, foco: 3, habitos: 5 },
  { dia: "Sex", tarefas: 7, foco: 5, habitos: 6 },
  { dia: "Sab", tarefas: 3, foco: 1, habitos: 4 },
  { dia: "Dom", tarefas: 2, foco: 1, habitos: 3 },
]

export const eventosHoje: EventoHoje[] = [
  {
    id: "evt-1",
    horario: "14:00",
    titulo: "Reuniao de alinhamento",
    local: "Google Meet",
    cor: "var(--chart-3)",
  },
  {
    id: "evt-2",
    horario: "16:30",
    titulo: "Call com cliente",
    local: "Zoom",
    cor: "var(--chart-1)",
  },
  {
    id: "evt-3",
    horario: "18:00",
    titulo: "Revisao do sprint",
    cor: "var(--chart-2)",
  },
]

export const conquistasRecentes: Conquista[] = [
  {
    id: "conq-1",
    titulo: "Semana Perfeita",
    descricao: "7 dias de streak!",
    icone: Flame,
    data: "2026-01-28",
  },
  {
    id: "conq-2",
    titulo: "Focado",
    descricao: "25 horas de timer",
    icone: Shield,
    data: "2026-01-27",
  },
  {
    id: "conq-3",
    titulo: "Centuriao",
    descricao: "100 tarefas concluidas",
    icone: Award,
    data: "2026-01-25",
  },
]

export const mensagemBriefing =
  "Ontem voce foi incrivel! 8 tarefas completas e 2h45min de foco — acima da sua media. Hoje tem 5 tarefas pendentes, 2 de alta prioridade. Bora manter o ritmo?"

export const tendencias = {
  xp: { valor: "+12%", positiva: true },
  streak: { valor: "+3 dias", positiva: true },
  energia: { valor: "+8%", positiva: true },
  tarefas: { valor: "2 urgentes", positiva: false },
} as const
