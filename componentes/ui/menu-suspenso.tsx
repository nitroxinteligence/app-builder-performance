import * as React from "react";
import * as MenuSuspensoPrimitivo from "@radix-ui/react-dropdown-menu";

import { cn } from "@/lib/utilidades";

const MenuSuspenso = MenuSuspensoPrimitivo.Root;

const MenuSuspensoGatilho = MenuSuspensoPrimitivo.Trigger;

const MenuSuspensoConteudo = React.forwardRef<
  React.ElementRef<typeof MenuSuspensoPrimitivo.Content>,
  React.ComponentPropsWithoutRef<typeof MenuSuspensoPrimitivo.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <MenuSuspensoPrimitivo.Portal>
    <MenuSuspensoPrimitivo.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-xl border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </MenuSuspensoPrimitivo.Portal>
));

MenuSuspensoConteudo.displayName = "MenuSuspensoConteudo";

const MenuSuspensoItem = React.forwardRef<
  React.ElementRef<typeof MenuSuspensoPrimitivo.Item>,
  React.ComponentPropsWithoutRef<typeof MenuSuspensoPrimitivo.Item>
>(({ className, ...props }, ref) => (
  <MenuSuspensoPrimitivo.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-[8px] px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  />
));

MenuSuspensoItem.displayName = "MenuSuspensoItem";

const MenuSuspensoSeparador = React.forwardRef<
  React.ElementRef<typeof MenuSuspensoPrimitivo.Separator>,
  React.ComponentPropsWithoutRef<typeof MenuSuspensoPrimitivo.Separator>
>(({ className, ...props }, ref) => (
  <MenuSuspensoPrimitivo.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-border", className)}
    {...props}
  />
));

MenuSuspensoSeparador.displayName = "MenuSuspensoSeparador";

export {
  MenuSuspenso,
  MenuSuspensoConteudo,
  MenuSuspensoItem,
  MenuSuspensoSeparador,
  MenuSuspensoGatilho,
};
