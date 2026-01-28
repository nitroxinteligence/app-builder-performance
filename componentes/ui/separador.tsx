import * as React from "react";
import * as SeparadorPrimitivo from "@radix-ui/react-separator";

import { cn } from "@/lib/utilidades";

const Separador = React.forwardRef<
  React.ElementRef<typeof SeparadorPrimitivo.Root>,
  React.ComponentPropsWithoutRef<typeof SeparadorPrimitivo.Root>
>(({ className, orientation = "horizontal", decorative = true, ...props }, ref) => (
  <SeparadorPrimitivo.Root
    ref={ref}
    decorative={decorative}
    orientation={orientation}
    className={cn(
      "shrink-0 bg-border",
      orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
      className
    )}
    {...props}
  />
));

Separador.displayName = "Separador";

export { Separador };
