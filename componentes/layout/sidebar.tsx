"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Bell,
  LogOut,
  Moon,
  PanelLeft,
  Settings,
  Sun,
  UserRound,
} from "lucide-react"
import { useTheme } from "next-themes"

import { Botao } from "@/componentes/ui/botao"
import { Colapsavel, ColapsavelGatilho } from "@/componentes/ui/colapsavel"
import {
  Dica,
  DicaConteudo,
  DicaGatilho,
  ProvedorDica,
} from "@/componentes/ui/dica"
import {
  MenuSuspenso,
  MenuSuspensoConteudo,
  MenuSuspensoGatilho,
  MenuSuspensoItem,
  MenuSuspensoSeparador,
} from "@/componentes/ui/menu-suspenso"
import { cn } from "@/lib/utilidades"
import { useAuth } from "@/lib/providers/auth-provider"
import { marcaSidebar, secoesMenu, rotaAtiva } from "@/lib/navegacao"

interface SidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function Sidebar({ open, onOpenChange }: SidebarProps) {
  const pathname = usePathname()
  const { resolvedTheme, setTheme } = useTheme()
  const { user, signOut } = useAuth()
  const temaEscuro = resolvedTheme === "dark"

  const alternarTema = React.useCallback(() => {
    setTheme(temaEscuro ? "light" : "dark")
  }, [temaEscuro, setTheme])

  const nomeUsuario =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Usuário"
  const iniciaisUsuario = nomeUsuario
    .split(" ")
    .map((parte: string) => parte[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const toggleTemaClasses = cn(
    "inline-flex h-5 w-9 items-center rounded-full border border-sidebar-border p-0.5 transition-colors",
    temaEscuro ? "bg-sidebar-foreground" : "bg-sidebar-accent"
  )
  const togglePinoClasses = cn(
    "h-4 w-4 rounded-full bg-sidebar transition-transform",
    temaEscuro ? "translate-x-4" : "translate-x-0"
  )

  const perfilGatilho = (
    <MenuSuspensoGatilho asChild>
      <Botao
        variant="ghost"
        size="default"
        aria-label="Abrir menu do usuário"
        className={cn(
          "text-sm font-semibold text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          open
            ? "w-full justify-start gap-3 px-3"
            : "h-10 w-10 justify-center px-0"
        )}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-[10px] font-semibold text-sidebar-accent-foreground">
          {iniciaisUsuario}
        </div>
        <span
          aria-hidden={!open}
          className={cn(
            "block min-w-0 truncate whitespace-nowrap transition-[max-width,opacity,transform] duration-300",
            open
              ? "max-w-[140px] opacity-100 translate-x-0"
              : "max-w-0 opacity-0 -translate-x-2"
          )}
        >
          {nomeUsuario}
        </span>
        {!open ? <span className="sr-only">{nomeUsuario}</span> : null}
      </Botao>
    </MenuSuspensoGatilho>
  )

  return (
    <Colapsavel
      open={open}
      onOpenChange={onOpenChange}
      className={cn(
        "fixed left-0 top-0 z-40 hidden h-screen flex-col border-r border-sidebar-border bg-sidebar py-6 transition-all duration-300 lg:flex",
        open ? "w-56 px-4" : "w-16 px-2"
      )}
    >
      <ProvedorDica delayDuration={150} skipDelayDuration={0}>
        {/* Brand / Logo */}
        <div
          className={cn(
            "flex items-center gap-2",
            open ? "justify-between" : "flex-col justify-center"
          )}
        >
          {open ? (
            <>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <marcaSidebar.icone
                    className="h-5 w-5"
                    aria-hidden="true"
                  />
                </div>
                <div className="leading-tight transition-all">
                  <p className="text-[11px] uppercase tracking-[0.25em] text-sidebar-foreground/60">
                    Builders
                  </p>
                  <p className="font-titulo text-sm font-semibold text-sidebar-foreground">
                    Performance
                  </p>
                </div>
              </div>
              <Dica>
                <DicaGatilho asChild>
                  <ColapsavelGatilho asChild>
                    <Botao
                      variant="ghost"
                      size="icon"
                      aria-label="Fechar barra lateral"
                      className="h-10 w-10 rounded-md text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    >
                      <PanelLeft className="h-4 w-4" aria-hidden="true" />
                    </Botao>
                  </ColapsavelGatilho>
                </DicaGatilho>
                <DicaConteudo
                  side="right"
                  sideOffset={8}
                  className="rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background"
                >
                  Fechar barra lateral
                </DicaConteudo>
              </Dica>
            </>
          ) : (
            <Dica>
              <DicaGatilho asChild>
                <ColapsavelGatilho asChild>
                  <Botao
                    variant="ghost"
                    size="icon"
                    aria-label="Abrir barra lateral"
                    className="h-10 w-10 rounded-md text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  >
                    <PanelLeft className="h-4 w-4" aria-hidden="true" />
                  </Botao>
                </ColapsavelGatilho>
              </DicaGatilho>
              <DicaConteudo
                side="right"
                sideOffset={8}
                className="rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background"
              >
                Abrir barra lateral
              </DicaConteudo>
            </Dica>
          )}
        </div>

        {/* Navigation */}
        <div className="mt-8 flex flex-1 flex-col">
          <nav
            className="flex flex-1 flex-col gap-6"
            aria-label="Menu principal"
          >
            {secoesMenu.map((secao) => (
              <div key={secao.id} className="flex flex-col gap-2">
                {open ? (
                  <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-sidebar-foreground/50">
                    {secao.titulo}
                  </p>
                ) : null}
                <div className="flex flex-col gap-1" role="list">
                  {secao.itens.map((item) => {
                    const ativo = rotaAtiva(pathname, item.href)
                    const linkItem = (
                      <Link
                        key={item.id}
                        href={item.href}
                        aria-label={item.titulo}
                        aria-current={ativo ? "page" : undefined}
                        className={cn(
                          "flex min-w-0 items-center overflow-hidden rounded-md py-2 text-sm font-semibold transition-colors",
                          open
                            ? "justify-start gap-3 px-3"
                            : "justify-center gap-0 px-0",
                          ativo
                            ? "bg-sidebar-accent text-sidebar-primary"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        )}
                      >
                        <item.icone
                          className="h-4 w-4 shrink-0"
                          aria-hidden="true"
                        />
                        <span
                          aria-hidden={!open}
                          className={cn(
                            "block min-w-0 truncate whitespace-nowrap transition-[max-width,opacity,transform] duration-300",
                            open
                              ? "max-w-[140px] opacity-100 translate-x-0"
                              : "max-w-0 opacity-0 -translate-x-2"
                          )}
                        >
                          {item.titulo}
                        </span>
                        {!open ? (
                          <span className="sr-only">{item.titulo}</span>
                        ) : null}
                      </Link>
                    )

                    if (open) {
                      return (
                        <React.Fragment key={item.id}>
                          {linkItem}
                        </React.Fragment>
                      )
                    }

                    return (
                      <Dica key={item.id}>
                        <DicaGatilho asChild>{linkItem}</DicaGatilho>
                        <DicaConteudo
                          side="right"
                          sideOffset={10}
                          className="rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background"
                        >
                          {item.titulo}
                        </DicaConteudo>
                      </Dica>
                    )
                  })}
                </div>
                <div
                  className={cn(
                    "h-px bg-sidebar-border",
                    open ? "mx-3" : "mx-2"
                  )}
                />
              </div>
            ))}
          </nav>

          {/* Footer - User profile */}
          <div className={cn("mt-auto", open ? "px-3" : "px-2")}>
            <div className="h-px bg-sidebar-border" />
            <div
              className={cn(
                "mt-3 flex flex-col gap-2",
                open ? "px-0" : "items-center"
              )}
            >
              <MenuSuspenso>
                {perfilGatilho}
                <MenuSuspensoConteudo
                  side="top"
                  align="start"
                  sideOffset={8}
                  className="w-56 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
                >
                  <MenuSuspensoItem className="cursor-pointer gap-2 font-medium">
                    <Settings
                      className="h-4 w-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                    Configurações
                  </MenuSuspensoItem>
                  <MenuSuspensoItem className="cursor-pointer gap-2 font-medium">
                    <Bell
                      className="h-4 w-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                    Notificações
                  </MenuSuspensoItem>
                  <MenuSuspensoItem
                    onSelect={(event) => {
                      event.preventDefault()
                      alternarTema()
                    }}
                    className="flex cursor-pointer items-center justify-between font-medium"
                  >
                    <span className="flex items-center gap-2">
                      {temaEscuro ? (
                        <Moon
                          className="h-4 w-4 text-muted-foreground"
                          aria-hidden="true"
                        />
                      ) : (
                        <Sun
                          className="h-4 w-4 text-muted-foreground"
                          aria-hidden="true"
                        />
                      )}
                      Tema
                    </span>
                    <span aria-hidden="true" className={toggleTemaClasses}>
                      <span className={togglePinoClasses} />
                    </span>
                  </MenuSuspensoItem>
                  <MenuSuspensoItem
                    asChild
                    className="cursor-pointer gap-2 font-medium"
                  >
                    <Link
                      href="/perfil"
                      className="flex w-full items-center gap-2"
                      aria-label="Ir para perfil do usuário"
                    >
                      <UserRound
                        className="h-4 w-4 text-muted-foreground"
                        aria-hidden="true"
                      />
                      Perfil
                    </Link>
                  </MenuSuspensoItem>
                  <MenuSuspensoSeparador />
                  <MenuSuspensoItem
                    onSelect={signOut}
                    className="cursor-pointer gap-2 font-medium text-destructive focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    Sair
                  </MenuSuspensoItem>
                </MenuSuspensoConteudo>
              </MenuSuspenso>
            </div>
          </div>
        </div>
      </ProvedorDica>
    </Colapsavel>
  )
}
