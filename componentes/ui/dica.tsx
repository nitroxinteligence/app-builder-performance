"use client";

import * as React from "react";
import * as DicaPrimitivo from "@radix-ui/react-tooltip";

import { cn } from "@/lib/utilidades";

const ProvedorDica = DicaPrimitivo.Provider;

const Dica = DicaPrimitivo.Root;

const DicaGatilho = DicaPrimitivo.Trigger;

const DicaConteudo = React.forwardRef<
  React.ElementRef<typeof DicaPrimitivo.Content>,
  React.ComponentPropsWithoutRef<typeof DicaPrimitivo.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <DicaPrimitivo.Portal>
    <DicaPrimitivo.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-tooltip-content-transform-origin]",
        className
      )}
      {...props}
    />
  </DicaPrimitivo.Portal>
))
DicaConteudo.displayName = DicaPrimitivo.Content.displayName;

export { Dica, DicaGatilho, DicaConteudo, ProvedorDica };
