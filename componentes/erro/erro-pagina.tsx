"use client";

import * as React from "react";
import { AlertTriangle, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utilidades";
import { Botao } from "@/componentes/ui/botao";
import {
  Cartao,
  CartaoCabecalho,
  CartaoTitulo,
  CartaoDescricao,
  CartaoConteudo,
} from "@/componentes/ui/cartao";

export interface PropsErroPagina {
  icone?: LucideIcon;
  titulo: string;
  descricao?: string;
  textoBotao?: string;
  onAcao?: () => void;
  className?: string;
}

export function ErroPagina({
  icone: Icone = AlertTriangle,
  titulo,
  descricao,
  textoBotao,
  onAcao,
  className,
}: PropsErroPagina) {
  return (
    <div
      className={cn(
        "flex min-h-[400px] w-full items-center justify-center p-4",
        className
      )}
    >
      <Cartao className="w-full max-w-md text-center">
        <CartaoCabecalho className="items-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <Icone className="h-8 w-8 text-destructive" />
          </div>
          <CartaoTitulo className="text-xl">{titulo}</CartaoTitulo>
          {descricao && (
            <CartaoDescricao className="mt-2">{descricao}</CartaoDescricao>
          )}
        </CartaoCabecalho>
        {textoBotao && onAcao && (
          <CartaoConteudo>
            <Botao onClick={onAcao} className="w-full">
              {textoBotao}
            </Botao>
          </CartaoConteudo>
        )}
      </Cartao>
    </div>
  );
}
