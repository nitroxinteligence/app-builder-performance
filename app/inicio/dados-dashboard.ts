import {
  Aperture,
  Bot,
  BookOpenText,
  CalendarDays,
  Columns,
  Focus,
  Hexagon,
  LayoutGrid,
  LucideIcon,
  Repeat2,
  Sparkles,
  Timer,
} from "lucide-react";

export type ItemMenu = {
  id: string;
  titulo: string;
  href: string;
  icone: LucideIcon;
};

export type CardResumo = {
  id: string;
  titulo: string;
  valor: string;
  detalhe: string;
  icone: LucideIcon;
};

export type ProgressoItem = {
  id: string;
  titulo: string;
  detalhe: string;
  percentual: number;
};

export type Missao = {
  id: string;
  texto: string;
  xp: string;
  concluida: boolean;
};

export type Desafio = {
  id: string;
  texto: string;
  recompensa: string;
};

export type AgendaItem = {
  id: string;
  horario: string;
  titulo: string;
};

export type Conquista = {
  id: string;
  texto: string;
};

export const marcaSidebar = {
  titulo: "Builders Performance",
  icone: Hexagon,
};

export const secoesMenu = [
  {
    id: "geral",
    titulo: "Geral",
    itens: [
      { id: "inicio", titulo: "Início", href: "/inicio", icone: LayoutGrid },
    ],
  },
  {
    id: "produtividade",
    titulo: "Produtividade",
    itens: [
      { id: "tarefas", titulo: "Tarefas", href: "/tarefas", icone: Columns },
      { id: "foco", titulo: "Foco", href: "/foco", icone: Timer },
      { id: "habitos", titulo: "Hábitos", href: "/habitos", icone: Repeat2 },
    ],
  },
  {
    id: "organizacao",
    titulo: "Organização",
    itens: [
      { id: "agenda", titulo: "Agenda", href: "/agenda", icone: CalendarDays },
    ],
  },
  {
    id: "ia",
    titulo: "Inteligência Artificial",
    itens: [
      {
        id: "assistente",
        titulo: "Assistente",
        href: "/assistente",
        icone: Bot,
      },
    ],
  },
  {
    id: "aprendizado",
    titulo: "Aprendizado",
    itens: [
      { id: "cursos", titulo: "Cursos", href: "/cursos", icone: BookOpenText },
    ],
  },
] as const;

export const nivelAtual = {
  nivel: 7,
  titulo: "Construtor",
  xpAtual: 2150,
  xpTotal: 3200,
  percentual: 68,
};

export const cardsResumo: CardResumo[] = [
  {
    id: "hoje",
    titulo: "Hoje",
    valor: "5 tarefas",
    detalhe: "2 urgentes",
    icone: Sparkles,
  },
  {
    id: "foco",
    titulo: "Foco",
    valor: "1h 20m",
    detalhe: "↑ 15%",
    icone: Focus,
  },
  {
    id: "habitos",
    titulo: "Hábitos",
    valor: "4/6",
    detalhe: "hoje",
    icone: Repeat2,
  },
  {
    id: "streak",
    titulo: "Streak",
    valor: "12 dias",
    detalhe: "em sequência",
    icone: Aperture,
  },
];

export const progressoSemanal: ProgressoItem[] = [
  {
    id: "tarefas",
    titulo: "Tarefas",
    detalhe: "18/25 (72%)",
    percentual: 72,
  },
  {
    id: "foco",
    titulo: "Foco",
    detalhe: "8h/12h (67%)",
    percentual: 67,
  },
  {
    id: "habitos",
    titulo: "Hábitos",
    detalhe: "85% consistência",
    percentual: 85,
  },
];

export const missoesDiarias: Missao[] = [
  { id: "login", texto: "Login diário", xp: "+10 XP", concluida: true },
  {
    id: "habitos",
    texto: "Check hábitos matinais",
    xp: "+15 XP",
    concluida: true,
  },
  {
    id: "prioridade",
    texto: "1 tarefa de alta prioridade",
    xp: "+50 XP",
    concluida: true,
  },
  {
    id: "foco",
    texto: "2 sessões de foco",
    xp: "+40 XP",
    concluida: false,
  },
  {
    id: "financeiro",
    texto: "Registrar financeiro",
    xp: "+30 XP",
    concluida: false,
  },
];

export const missoesSemanais: Desafio[] = [
  {
    id: "foco-semanal",
    texto: "Acumule 5 horas de foco",
    recompensa: "Tema exclusivo",
  },
  {
    id: "streak-habitos",
    texto: "Mantenha streak de hábitos por 7 dias",
    recompensa: "Badge semanal",
  },
  {
    id: "daily-quests",
    texto: "Complete todas as daily quests por 5 dias",
    recompensa: "500 XP",
  },
  {
    id: "tarefas-em-dia",
    texto: "Zero tarefas atrasadas por 7 dias",
    recompensa: "Título especial",
  },
];

export const agendaHoje: AgendaItem[] = [
  { id: "agenda-1", horario: "14:00", titulo: "Reunião de alinhamento" },
  { id: "agenda-2", horario: "16:30", titulo: "Call com cliente" },
];

export const conquistasRecentes: Conquista[] = [
  { id: "conquista-1", texto: "🥇 \"Semana Perfeita\" — 7 dias de streak!" },
  { id: "conquista-2", texto: "🎯 \"Focado\" — 25 horas de timer" },
];
