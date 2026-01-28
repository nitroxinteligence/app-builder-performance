import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import {
  Cartao,
  CartaoCabecalho,
  CartaoConteudo,
  CartaoDescricao,
  CartaoTitulo,
} from "@/componentes/ui/cartao";
import { Botao } from "@/componentes/ui/botao";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-6 py-12">
        <Cartao className="w-full text-center">
          <CartaoCabecalho>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <CartaoTitulo className="mt-2 text-3xl">Página não encontrada</CartaoTitulo>
            <CartaoDescricao>
              Não conseguimos encontrar esta rota. Verifique o endereço ou volte
              para o início.
            </CartaoDescricao>
          </CartaoCabecalho>
          <CartaoConteudo>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Botao asChild className="rounded-full">
                <Link href="/inicio">Voltar ao início</Link>
              </Botao>
              <Botao asChild variant="outline" className="rounded-full">
                <Link href="/entrar">Ir para login</Link>
              </Botao>
            </div>
            <p className="mt-6 text-xs text-muted-foreground">
              Erro 404 • Builders Performance
            </p>
          </CartaoConteudo>
        </Cartao>
      </div>
    </div>
  );
}
