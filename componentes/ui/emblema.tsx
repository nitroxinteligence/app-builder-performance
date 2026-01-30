import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utilidades"

const estilosEmblema = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-primary/10 text-primary",
        secondary:
          "bg-secondary text-secondary-foreground",
        destructive:
          "bg-destructive/10 text-destructive",
        outline:
          "border border-input text-foreground",
        sucesso:
          "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
        aviso:
          "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
        info:
          "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface PropsEmblema
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof estilosEmblema> {}

function Emblema({ className, variant, ...props }: PropsEmblema) {
  return (
    <div
      className={cn(estilosEmblema({ variant }), className)}
      {...props}
    />
  )
}

Emblema.displayName = "Emblema"

export { Emblema, estilosEmblema }
