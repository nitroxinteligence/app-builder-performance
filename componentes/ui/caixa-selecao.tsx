"use client";

import * as React from "react";
import * as CaixaSelecaoPrimitivo from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

import { cn } from "@/lib/utilidades";

const CaixaSelecao = React.forwardRef<
  React.ElementRef<typeof CaixaSelecaoPrimitivo.Root>,
  React.ComponentPropsWithoutRef<typeof CaixaSelecaoPrimitivo.Root>
>(({ className, ...props }, ref) => (
  <CaixaSelecaoPrimitivo.Root
    ref={ref}
    className={cn(
      "peer h-4.5 w-4.5 shrink-0 rounded-[6px] border border-input bg-background transition-all data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  >
    <CaixaSelecaoPrimitivo.Indicator className="flex items-center justify-center text-current">
      <Check className="h-3 w-3" />
    </CaixaSelecaoPrimitivo.Indicator>
  </CaixaSelecaoPrimitivo.Root>
));

CaixaSelecao.displayName = "CaixaSelecao";

export { CaixaSelecao };
