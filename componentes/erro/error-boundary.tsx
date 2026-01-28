"use client";

import * as React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

import { cn } from "@/lib/utilidades";
import { Botao } from "@/componentes/ui/botao";
import {
  Cartao,
  CartaoCabecalho,
  CartaoTitulo,
  CartaoDescricao,
  CartaoConteudo,
  CartaoRodape,
} from "@/componentes/ui/cartao";

interface EstadoErro {
  hasError: boolean;
  error: Error | null;
}

export interface PropsErrorBoundary {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  className?: string;
}

function FallbackPadrao({
  error,
  onTentarNovamente,
  className,
}: {
  error: Error | null;
  onTentarNovamente: () => void;
  className?: string;
}) {
  const isDevelopment = process.env.NODE_ENV === "development";

  return (
    <div
      className={cn(
        "flex min-h-[400px] w-full items-center justify-center p-4",
        className
      )}
    >
      <Cartao className="w-full max-w-lg text-center">
        <CartaoCabecalho className="items-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <CartaoTitulo className="text-xl">Algo deu errado</CartaoTitulo>
          <CartaoDescricao className="mt-2">
            Ocorreu um erro inesperado. Por favor, tente novamente.
          </CartaoDescricao>
        </CartaoCabecalho>

        {isDevelopment && error && (
          <CartaoConteudo>
            <div className="rounded-lg bg-muted p-4 text-left">
              <p className="mb-2 text-sm font-medium text-destructive">
                Detalhes do erro (visivel apenas em desenvolvimento):
              </p>
              <pre className="overflow-auto whitespace-pre-wrap break-words text-xs text-muted-foreground">
                {error.message}
              </pre>
              {error.stack && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                    Stack trace
                  </summary>
                  <pre className="mt-2 overflow-auto whitespace-pre-wrap break-words text-xs text-muted-foreground">
                    {error.stack}
                  </pre>
                </details>
              )}
            </div>
          </CartaoConteudo>
        )}

        <CartaoRodape className="justify-center">
          <Botao onClick={onTentarNovamente} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Tentar novamente
          </Botao>
        </CartaoRodape>
      </Cartao>
    </div>
  );
}

export class ErrorBoundary extends React.Component<
  PropsErrorBoundary,
  EstadoErro
> {
  constructor(props: PropsErrorBoundary) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): EstadoErro {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleTentarNovamente = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <FallbackPadrao
          error={this.state.error}
          onTentarNovamente={this.handleTentarNovamente}
          className={this.props.className}
        />
      );
    }

    return this.props.children;
  }
}
