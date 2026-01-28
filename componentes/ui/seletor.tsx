"use client";

import * as React from "react";
import * as SeletorPrimitivo from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

import { cn } from "@/lib/utilidades";

const Seletor = SeletorPrimitivo.Root;

const SeletorGrupo = SeletorPrimitivo.Group;

const SeletorValor = SeletorPrimitivo.Value;

const SeletorGatilho = React.forwardRef<
  React.ElementRef<typeof SeletorPrimitivo.Trigger>,
  React.ComponentPropsWithoutRef<typeof SeletorPrimitivo.Trigger>
>(({ className, children, ...props }, ref) => (
  <SeletorPrimitivo.Trigger
    ref={ref}
    className={cn(
      "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    )}
    {...props}
  >
    {children}
    <SeletorPrimitivo.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SeletorPrimitivo.Icon>
  </SeletorPrimitivo.Trigger>
));
SeletorGatilho.displayName = SeletorPrimitivo.Trigger.displayName;

const SeletorRolagemAcima = React.forwardRef<
  React.ElementRef<typeof SeletorPrimitivo.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SeletorPrimitivo.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SeletorPrimitivo.ScrollUpButton
    ref={ref}
    className={cn("flex cursor-default items-center justify-center py-1", className)}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SeletorPrimitivo.ScrollUpButton>
));
SeletorRolagemAcima.displayName = SeletorPrimitivo.ScrollUpButton.displayName;

const SeletorRolagemAbaixo = React.forwardRef<
  React.ElementRef<typeof SeletorPrimitivo.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SeletorPrimitivo.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SeletorPrimitivo.ScrollDownButton
    ref={ref}
    className={cn("flex cursor-default items-center justify-center py-1", className)}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SeletorPrimitivo.ScrollDownButton>
));
SeletorRolagemAbaixo.displayName =
  SeletorPrimitivo.ScrollDownButton.displayName;

const SeletorConteudo = React.forwardRef<
  React.ElementRef<typeof SeletorPrimitivo.Content>,
  React.ComponentPropsWithoutRef<typeof SeletorPrimitivo.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SeletorPrimitivo.Portal>
    <SeletorPrimitivo.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-[--radix-select-content-available-height] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-select-content-transform-origin]",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SeletorRolagemAcima />
      <SeletorPrimitivo.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SeletorPrimitivo.Viewport>
      <SeletorRolagemAbaixo />
    </SeletorPrimitivo.Content>
  </SeletorPrimitivo.Portal>
));
SeletorConteudo.displayName = SeletorPrimitivo.Content.displayName;

const SeletorRotulo = React.forwardRef<
  React.ElementRef<typeof SeletorPrimitivo.Label>,
  React.ComponentPropsWithoutRef<typeof SeletorPrimitivo.Label>
>(({ className, ...props }, ref) => (
  <SeletorPrimitivo.Label
    ref={ref}
    className={cn("px-2 py-1.5 text-sm font-semibold", className)}
    {...props}
  />
));
SeletorRotulo.displayName = SeletorPrimitivo.Label.displayName;

const SeletorItem = React.forwardRef<
  React.ElementRef<typeof SeletorPrimitivo.Item>,
  React.ComponentPropsWithoutRef<typeof SeletorPrimitivo.Item>
>(({ className, children, ...props }, ref) => (
  <SeletorPrimitivo.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
      <SeletorPrimitivo.ItemIndicator>
        <Check className="h-4 w-4" />
      </SeletorPrimitivo.ItemIndicator>
    </span>
    <SeletorPrimitivo.ItemText>{children}</SeletorPrimitivo.ItemText>
  </SeletorPrimitivo.Item>
));
SeletorItem.displayName = SeletorPrimitivo.Item.displayName;

const SeletorSeparador = React.forwardRef<
  React.ElementRef<typeof SeletorPrimitivo.Separator>,
  React.ComponentPropsWithoutRef<typeof SeletorPrimitivo.Separator>
>(({ className, ...props }, ref) => (
  <SeletorPrimitivo.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
));
SeletorSeparador.displayName = SeletorPrimitivo.Separator.displayName;

export {
  Seletor,
  SeletorGrupo,
  SeletorValor,
  SeletorGatilho,
  SeletorConteudo,
  SeletorRotulo,
  SeletorItem,
  SeletorSeparador,
  SeletorRolagemAcima,
  SeletorRolagemAbaixo,
};
