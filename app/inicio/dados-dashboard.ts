import {
  Bot,
  BookOpenText,
  CalendarDays,
  Columns,
  Hexagon,
  LayoutGrid,
  LucideIcon,
  Repeat2,
  Timer,
} from "lucide-react";

export type ItemMenu = {
  id: string;
  titulo: string;
  href: string;
  icone: LucideIcon;
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

