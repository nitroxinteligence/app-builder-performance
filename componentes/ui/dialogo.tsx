"use client";

import * as React from "react";
import * as DialogoPrimitivo from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utilidades";

const Dialogo = DialogoPrimitivo.Root;

const DialogoGatilho = DialogoPrimitivo.Trigger;

const DialogoPortal = DialogoPrimitivo.Portal;

const DialogoFechar = DialogoPrimitivo.Close;

const DialogoSobreposicao = React.forwardRef<
  React.ElementRef<typeof DialogoPrimitivo.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogoPrimitivo.Overlay>
>(({ className, ...props }, ref) => (
  <DialogoPrimitivo.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
DialogoSobreposicao.displayName = DialogoPrimitivo.Overlay.displayName;

const DialogoConteudo = React.forwardRef<
  React.ElementRef<typeof DialogoPrimitivo.Content>,
  React.ComponentPropsWithoutRef<typeof DialogoPrimitivo.Content>
>(({ className, children, ...props }, ref) => (
  <DialogoPortal>
    <DialogoSobreposicao />
    <DialogoPrimitivo.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
      <DialogoPrimitivo.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Fechar</span>
      </DialogoPrimitivo.Close>
    </DialogoPrimitivo.Content>
  </DialogoPortal>
));
DialogoConteudo.displayName = DialogoPrimitivo.Content.displayName;

const DialogoCabecalho = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
);
DialogoCabecalho.displayName = "DialogoCabecalho";

const DialogoRodape = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
);
DialogoRodape.displayName = "DialogoRodape";

const DialogoTitulo = React.forwardRef<
  React.ElementRef<typeof DialogoPrimitivo.Title>,
  React.ComponentPropsWithoutRef<typeof DialogoPrimitivo.Title>
>(({ className, ...props }, ref) => (
  <DialogoPrimitivo.Title
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
DialogoTitulo.displayName = DialogoPrimitivo.Title.displayName;

const DialogoDescricao = React.forwardRef<
  React.ElementRef<typeof DialogoPrimitivo.Description>,
  React.ComponentPropsWithoutRef<typeof DialogoPrimitivo.Description>
>(({ className, ...props }, ref) => (
  <DialogoPrimitivo.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DialogoDescricao.displayName = DialogoPrimitivo.Description.displayName;

export {
  Dialogo,
  DialogoPortal,
  DialogoSobreposicao,
  DialogoGatilho,
  DialogoFechar,
  DialogoConteudo,
  DialogoCabecalho,
  DialogoRodape,
  DialogoTitulo,
  DialogoDescricao,
};
