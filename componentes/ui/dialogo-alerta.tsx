"use client";

import * as React from "react";
import * as DialogoAlertaPrimitivo from "@radix-ui/react-alert-dialog";

import { cn } from "@/lib/utilidades";
import { estilosBotao } from "@/componentes/ui/botao";

const DialogoAlerta = DialogoAlertaPrimitivo.Root;

const DialogoAlertaGatilho = DialogoAlertaPrimitivo.Trigger;

const DialogoAlertaPortal = DialogoAlertaPrimitivo.Portal;

const DialogoAlertaSobreposicao = React.forwardRef<
  React.ElementRef<typeof DialogoAlertaPrimitivo.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogoAlertaPrimitivo.Overlay>
>(({ className, ...props }, ref) => (
  <DialogoAlertaPrimitivo.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
    ref={ref}
  />
));
DialogoAlertaSobreposicao.displayName =
  DialogoAlertaPrimitivo.Overlay.displayName;

const DialogoAlertaConteudo = React.forwardRef<
  React.ElementRef<typeof DialogoAlertaPrimitivo.Content>,
  React.ComponentPropsWithoutRef<typeof DialogoAlertaPrimitivo.Content>
>(({ className, ...props }, ref) => (
  <DialogoAlertaPortal>
    <DialogoAlertaSobreposicao />
    <DialogoAlertaPrimitivo.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg",
        className
      )}
      {...props}
    />
  </DialogoAlertaPortal>
));
DialogoAlertaConteudo.displayName =
  DialogoAlertaPrimitivo.Content.displayName;

const DialogoAlertaCabecalho = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col space-y-2 text-center sm:text-left", className)}
    {...props}
  />
);
DialogoAlertaCabecalho.displayName = "DialogoAlertaCabecalho";

const DialogoAlertaRodape = ({
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
DialogoAlertaRodape.displayName = "DialogoAlertaRodape";

const DialogoAlertaTitulo = React.forwardRef<
  React.ElementRef<typeof DialogoAlertaPrimitivo.Title>,
  React.ComponentPropsWithoutRef<typeof DialogoAlertaPrimitivo.Title>
>(({ className, ...props }, ref) => (
  <DialogoAlertaPrimitivo.Title
    ref={ref}
    className={cn("text-lg font-semibold", className)}
    {...props}
  />
));
DialogoAlertaTitulo.displayName = DialogoAlertaPrimitivo.Title.displayName;

const DialogoAlertaDescricao = React.forwardRef<
  React.ElementRef<typeof DialogoAlertaPrimitivo.Description>,
  React.ComponentPropsWithoutRef<typeof DialogoAlertaPrimitivo.Description>
>(({ className, ...props }, ref) => (
  <DialogoAlertaPrimitivo.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DialogoAlertaDescricao.displayName =
  DialogoAlertaPrimitivo.Description.displayName;

const DialogoAlertaAcao = React.forwardRef<
  React.ElementRef<typeof DialogoAlertaPrimitivo.Action>,
  React.ComponentPropsWithoutRef<typeof DialogoAlertaPrimitivo.Action>
>(({ className, ...props }, ref) => (
  <DialogoAlertaPrimitivo.Action
    ref={ref}
    className={cn(estilosBotao(), className)}
    {...props}
  />
));
DialogoAlertaAcao.displayName = DialogoAlertaPrimitivo.Action.displayName;

const DialogoAlertaCancelar = React.forwardRef<
  React.ElementRef<typeof DialogoAlertaPrimitivo.Cancel>,
  React.ComponentPropsWithoutRef<typeof DialogoAlertaPrimitivo.Cancel>
>(({ className, ...props }, ref) => (
  <DialogoAlertaPrimitivo.Cancel
    ref={ref}
    className={cn(
      estilosBotao({ variant: "outline" }),
      "mt-2 sm:mt-0",
      className
    )}
    {...props}
  />
));
DialogoAlertaCancelar.displayName =
  DialogoAlertaPrimitivo.Cancel.displayName;

export {
  DialogoAlerta,
  DialogoAlertaPortal,
  DialogoAlertaSobreposicao,
  DialogoAlertaGatilho,
  DialogoAlertaConteudo,
  DialogoAlertaCabecalho,
  DialogoAlertaRodape,
  DialogoAlertaTitulo,
  DialogoAlertaDescricao,
  DialogoAlertaAcao,
  DialogoAlertaCancelar,
};
