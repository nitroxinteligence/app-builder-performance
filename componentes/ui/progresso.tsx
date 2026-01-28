import * as React from "react";
import * as ProgressoPrimitivo from "@radix-ui/react-progress";

import { cn } from "@/lib/utilidades";

const Progresso = React.forwardRef<
  React.ElementRef<typeof ProgressoPrimitivo.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressoPrimitivo.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressoPrimitivo.Root
    ref={ref}
    className={cn(
      "relative h-2 w-full overflow-hidden rounded-full bg-muted",
      className
    )}
    {...props}
  >
    <ProgressoPrimitivo.Indicator
      className="h-full w-full flex-1 bg-primary transition-all"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressoPrimitivo.Root>
));

Progresso.displayName = "Progresso";

export { Progresso };
