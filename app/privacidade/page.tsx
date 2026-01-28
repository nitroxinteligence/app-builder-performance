import Link from "next/link";

import {
  Cartao,
  CartaoCabecalho,
  CartaoConteudo,
  CartaoDescricao,
  CartaoTitulo,
} from "@/componentes/ui/cartao";
import { Botao } from "@/componentes/ui/botao";

export default function PaginaPrivacidade() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-6 py-10">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <Link href="/entrar" className="hover:text-foreground">
            Voltar
          </Link>
          <span>Política de privacidade</span>
        </div>

        <Cartao className="mt-6">
          <CartaoCabecalho>
            <CartaoTitulo>Privacidade</CartaoTitulo>
            <CartaoDescricao>
              Transparência sobre os dados usados para oferecer a melhor
              experiência no Builders Performance.
            </CartaoDescricao>
          </CartaoCabecalho>
          <CartaoConteudo className="space-y-6 text-sm text-muted-foreground">
            <section className="space-y-2">
              <h2 className="text-sm font-semibold text-foreground">
                Dados coletados
              </h2>
              <p>
                Coletamos informações de conta (nome e email), preferências do
                usuário, registros de uso e conteúdos criados no app (tarefas,
                hábitos, agenda e cursos).
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-semibold text-foreground">Uso</h2>
              <p>
                Utilizamos os dados para personalizar o onboarding, sugerir
                melhorias de produtividade e manter seu histórico sincronizado.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-semibold text-foreground">
                Compartilhamento
              </h2>
              <p>
                Não vendemos dados. Compartilhamos somente com serviços de
                infraestrutura necessários para operar o aplicativo.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-semibold text-foreground">
                Segurança
              </h2>
              <p>
                Usamos práticas padrão de segurança para proteger suas
                informações, incluindo criptografia em trânsito.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-semibold text-foreground">Contato</h2>
              <p>
                Em caso de dúvidas, fale com nosso time pelo canal de suporte do
                app.
              </p>
            </section>
          </CartaoConteudo>
        </Cartao>

        <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
          <span>Última atualização: 26 de dezembro de 2025</span>
          <Botao asChild variant="outline" className="rounded-full">
            <Link href="/termos">Ver termos</Link>
          </Botao>
        </div>
      </div>
    </div>
  );
}
