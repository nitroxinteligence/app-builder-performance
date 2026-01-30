"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Palette,
  Component,
  LayoutGrid,
  Monitor,
  Home,
  Layers,
} from "lucide-react"

import { cn } from "@/lib/utilidades"

const SECOES = [
  { href: "/design-system", label: "Overview", icone: Home },
  { href: "/design-system/tokens", label: "Tokens", icone: Palette },
  {
    href: "/design-system/componentes",
    label: "Componentes",
    icone: Component,
  },
  { href: "/design-system/padroes", label: "Padroes", icone: LayoutGrid },
  { href: "/design-system/paginas", label: "Paginas", icone: Monitor },
  { href: "/design-system/estados", label: "Estados", icone: Layers },
] as const

export default function DesignSystemLayout({
  children,
}: {
  readonly children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-56 shrink-0 border-r border-border bg-card lg:block">
        <div className="flex h-14 items-center border-b border-border px-4">
          <Link
            href="/design-system"
            className="font-titulo text-sm font-bold tracking-tight"
          >
            Design System
          </Link>
        </div>
        <nav className="space-y-1 p-3">
          {SECOES.map(({ href, label, icone: Icone }) => {
            const ativo =
              href === "/design-system"
                ? pathname === "/design-system"
                : pathname.startsWith(href)

            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                  ativo
                    ? "bg-primary/10 font-medium text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icone className="h-4 w-4" />
                {label}
              </Link>
            )
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 border-t border-border p-3">
          <p className="text-[10px] text-muted-foreground">
            Dev-only — bloqueado em producao
          </p>
        </div>
      </aside>

      {/* Mobile nav */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card lg:hidden">
        <nav className="flex items-center justify-around px-2 py-1.5">
          {SECOES.map(({ href, label, icone: Icone }) => {
            const ativo =
              href === "/design-system"
                ? pathname === "/design-system"
                : pathname.startsWith(href)

            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-md px-2 py-1 text-[10px] transition-colors",
                  ativo
                    ? "font-medium text-primary"
                    : "text-muted-foreground"
                )}
              >
                <Icone className="h-4 w-4" />
                {label}
              </Link>
            )
          })}
        </nav>
      </div>

      <main
        id="main-content"
        className="flex-1 overflow-y-auto pb-20 lg:pb-0"
      >
        <div className="mx-auto max-w-5xl px-6 py-8">{children}</div>
      </main>
    </div>
  )
}
