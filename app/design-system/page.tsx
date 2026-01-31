"use client"

import Link from "next/link"
import {
  Palette,
  Component,
  LayoutGrid,
  Monitor,
  Layers,
} from "lucide-react"

const SECOES = [
  {
    href: "/design-system/tokens",
    titulo: "Design Tokens",
    descricao: "Cores, tipografia, spacing, border-radius, shadows, motion e icones",
    icone: Palette,
    contagem: "7 categorias",
  },
  {
    href: "/design-system/componentes",
    titulo: "Componentes",
    descricao: "Todos os componentes UI com variantes, estados e composicao",
    icone: Component,
    contagem: "19+ componentes",
  },
  {
    href: "/design-system/padroes",
    titulo: "Padroes de Composicao",
    descricao: "Page shells, forms, lists, kanban, dashboard e navigation patterns",
    icone: LayoutGrid,
    contagem: "8 padroes",
  },
  {
    href: "/design-system/paginas",
    titulo: "Pages Showcase",
    descricao: "Mini-previews de cada pagina real do app",
    icone: Monitor,
    contagem: "5 paginas",
  },
  {
    href: "/design-system/estados",
    titulo: "Estados",
    descricao: "Loading, empty e error states para cada componente e pagina",
    icone: Layers,
    contagem: "3 categorias",
  },
] as const

export default function DesignSystemOverview() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="font-titulo text-3xl font-bold tracking-tight">
          Design System
        </h1>
        <p className="text-muted-foreground">
          Catalogo vivo do Builders Performance — componentes, tokens, padroes e
          estados.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SECOES.map(({ href, titulo, descricao, icone: Icone, contagem }) => (
          <Link
            key={href}
            href={href}
            className="group rounded-lg border border-border bg-card p-5 transition-all hover:border-primary/30"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
                <Icone className="h-5 w-5 text-primary" />
              </div>
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                {contagem}
              </span>
            </div>
            <h2 className="font-semibold group-hover:text-primary">
              {titulo}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{descricao}</p>
          </Link>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <h3 className="text-sm font-semibold">Informacoes</h3>
        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
          <li>
            Esta pagina e acessivel apenas em modo de desenvolvimento (localhost)
          </li>
          <li>Todos os componentes sao importados diretamente — nao sao copias</li>
          <li>Dark mode pode ser alternado com o toggle de tema do app</li>
        </ul>
      </div>
    </div>
  )
}
