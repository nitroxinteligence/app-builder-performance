import Link from "next/link";

import {
  Cartao,
  CartaoCabecalho,
  CartaoConteudo,
  CartaoDescricao,
  CartaoTitulo,
} from "@/componentes/ui/cartao";
import { Botao } from "@/componentes/ui/botao";

export default function PaginaTermos() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-6 py-10">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <Link href="/entrar" className="hover:text-foreground">
            Voltar
          </Link>
          <span>Termos de uso</span>
        </div>

        <Cartao className="mt-6">
          <CartaoCabecalho>
            <CartaoTitulo>Termos de uso</CartaoTitulo>
            <CartaoDescricao>
              Regras gerais para uso do Builders Performance.
            </CartaoDescricao>
          </CartaoCabecalho>
          <CartaoConteudo className="space-y-6 text-sm text-muted-foreground">
            <section className="space-y-2">
              <h2 className="text-sm font-semibold text-foreground">Conta</h2>
              <p>
                Você é responsável por manter suas credenciais seguras e pelas
                atividades realizadas na sua conta.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-semibold text-foreground">Uso</h2>
              <p>
                O app deve ser usado para fins pessoais e profissionais de
                produtividade. Evite conteúdo ilegal ou que viole direitos de
                terceiros.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-semibold text-foreground">
                Disponibilidade
              </h2>
              <p>
                Podemos alterar ou descontinuar recursos para melhorar o
                produto, mantendo comunicação transparente sempre que possível.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-semibold text-foreground">Suporte</h2>
              <p>
                O suporte é oferecido pelos canais oficiais do app e pode variar
                conforme o plano contratado.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-semibold text-foreground">
                Atualizações
              </h2>
              <p>
                Ao continuar usando o app, você concorda com eventuais ajustes
                futuros destes termos.
              </p>
            </section>
          </CartaoConteudo>
        </Cartao>

        <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
          <span>Última atualização: 26 de dezembro de 2025</span>
          <Botao asChild variant="outline" className="rounded-full">
            <Link href="/privacidade">Ver privacidade</Link>
          </Botao>
        </div>
      </div>
    </div>
  );
}
