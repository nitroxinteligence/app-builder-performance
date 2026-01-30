import {
  Bot,
  BookOpenText,
  CalendarDays,
  Columns,
  Hexagon,
  LayoutGrid,
  Repeat2,
  Timer,
  type LucideIcon,
} from "lucide-react"

export interface ItemNavegacao {
  id: string
  titulo: string
  href: string
  icone: LucideIcon
}

export interface SecaoMenu {
  id: string
  titulo: string
  itens: readonly ItemNavegacao[]
}

export const marcaSidebar = {
  titulo: "Builders Performance",
  icone: Hexagon,
} as const

export const secoesMenu: readonly SecaoMenu[] = [
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
] as const

export const todosItensNavegacao: readonly ItemNavegacao[] =
  secoesMenu.flatMap((secao) => [...secao.itens])

export const tabsPrincipaisMobile: readonly ItemNavegacao[] = [
  { id: "inicio", titulo: "Início", href: "/inicio", icone: LayoutGrid },
  { id: "tarefas", titulo: "Tarefas", href: "/tarefas", icone: Columns },
  { id: "foco", titulo: "Foco", href: "/foco", icone: Timer },
  { id: "habitos", titulo: "Hábitos", href: "/habitos", icone: Repeat2 },
  { id: "agenda", titulo: "Agenda", href: "/agenda", icone: CalendarDays },
]

export const rotasSecundariasMobile: readonly ItemNavegacao[] = [
  { id: "cursos", titulo: "Cursos", href: "/cursos", icone: BookOpenText },
  { id: "assistente", titulo: "Assistente", href: "/assistente", icone: Bot },
]

export function rotaAtiva(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function obterTituloPagina(pathname: string): string {
  const item = todosItensNavegacao.find((i) => rotaAtiva(pathname, i.href))
  return item?.titulo ?? ""
}

export function obterBreadcrumbs(
  pathname: string
): readonly { titulo: string; href: string }[] {
  const segmentos = pathname.split("/").filter(Boolean)
  const resultado: { titulo: string; href: string }[] = []

  let caminhoAcumulado = ""
  for (const segmento of segmentos) {
    caminhoAcumulado = `${caminhoAcumulado}/${segmento}`
    const item = todosItensNavegacao.find((i) => i.href === caminhoAcumulado)
    if (item) {
      resultado.push({ titulo: item.titulo, href: item.href })
    }
  }

  return resultado
}
