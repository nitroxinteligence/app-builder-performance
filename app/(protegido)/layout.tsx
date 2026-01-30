"use client"

import * as React from "react"

import { BottomTabBar } from "@/componentes/layout/bottom-tab-bar"
import { Sidebar } from "@/componentes/layout/sidebar"
import { cn } from "@/lib/utilidades"

export default function LayoutProtegido({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarAberta, setSidebarAberta] = React.useState(false)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar open={sidebarAberta} onOpenChange={setSidebarAberta} />
      <div
        className={cn(
          "flex min-h-screen flex-col pb-16 transition-[padding] duration-300 lg:pb-0",
          sidebarAberta ? "lg:pl-56" : "lg:pl-16"
        )}
      >
        {children}
      </div>
      <BottomTabBar />
    </div>
  )
}
