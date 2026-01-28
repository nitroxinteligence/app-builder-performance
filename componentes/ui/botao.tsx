import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utilidades";

const estilosBotao = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-secondary hover:text-secondary-foreground",
        ghost: "hover:bg-secondary hover:text-secondary-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface PropsBotao
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof estilosBotao> {
  asChild?: boolean;
}

const Botao = React.forwardRef<HTMLButtonElement, PropsBotao>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Componente = asChild ? Slot : "button";
    return (
      <Componente
        ref={ref}
        className={cn(estilosBotao({ variant, size, className }))}
        {...props}
      />
    );
  }
);

Botao.displayName = "Botao";

export { Botao, estilosBotao };
