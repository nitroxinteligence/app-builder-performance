"use client"

import { AlertCircle, Loader2, WifiOff } from "lucide-react"

import { ComponentPreview } from "@/componentes/design-system/component-preview"
import { ShowcaseSection } from "@/componentes/design-system/showcase-section"
import { Botao } from "@/componentes/ui/botao"
import {
  Cartao,
  CartaoConteudo,
} from "@/componentes/ui/cartao"
import {
  Esqueleto,
  EsqueletoTexto,
  EsqueletoCartao,
  EsqueletoKanban,
  EsqueletoLista,
  EsqueletoGradeEstatisticas,
  EsqueletoFormulario,
  EsqueletoTabela,
} from "@/componentes/ui/esqueleto"
import {
  EstadoVazio,
  EstadoVazioTarefas,
  EstadoVazioHabitos,
} from "@/componentes/ui/estado-vazio"

export default function EstadosPage() {
  return (
    <div className="space-y-12">
      <div className="space-y-2">
        <h1 className="font-titulo text-3xl font-bold tracking-tight">
          Estados
        </h1>
        <p className="text-muted-foreground">
          Loading, empty e error states para cada componente e pagina.
        </p>
      </div>

      {/* Loading States */}
      <ShowcaseSection
        id="loading"
        titulo="Loading States"
        descricao="Skeleton placeholders para cada tipo de conteudo"
      >
        <div className="space-y-4">
          <ComponentPreview titulo="Texto">
            <EsqueletoTexto linhas={4} larguraUltimaLinha="tres-quartos" />
          </ComponentPreview>

          <ComponentPreview titulo="Cartao">
            <div className="max-w-sm">
              <EsqueletoCartao comCabecalho comDescricao linhasConteudo={3} comRodape />
            </div>
          </ComponentPreview>

          <ComponentPreview titulo="Kanban board">
            <EsqueletoKanban cartoesPorColuna={[2, 1, 3]} />
          </ComponentPreview>

          <ComponentPreview titulo="Lista">
            <EsqueletoLista />
          </ComponentPreview>

          <ComponentPreview titulo="Estatisticas">
            <EsqueletoGradeEstatisticas quantidade={4} />
          </ComponentPreview>

          <ComponentPreview titulo="Formulario">
            <div className="max-w-md">
              <EsqueletoFormulario quantidadeCampos={3} comBotaoEnviar />
            </div>
          </ComponentPreview>

          <ComponentPreview titulo="Tabela">
            <EsqueletoTabela colunas={4} linhas={5} comCabecalho />
          </ComponentPreview>

          <ComponentPreview titulo="Spinner">
            <div className="flex items-center gap-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Carregando...</span>
              </div>
            </div>
          </ComponentPreview>
        </div>
      </ShowcaseSection>

      {/* Empty States */}
      <ShowcaseSection
        id="empty"
        titulo="Empty States"
        descricao="Estados quando nao ha dados para exibir"
      >
        <div className="space-y-4">
          <ComponentPreview titulo="Tarefas vazio">
            <EstadoVazioTarefas />
          </ComponentPreview>

          <ComponentPreview titulo="Habitos vazio">
            <EstadoVazioHabitos />
          </ComponentPreview>

          <ComponentPreview titulo="Generico (busca sem resultados)">
            <EstadoVazio
              titulo="Nenhum resultado"
              descricao="Nenhum item corresponde aos filtros aplicados."
              icone={<AlertCircle className="h-10 w-10 text-muted-foreground" />}
              acao={<Botao variant="outline" size="sm">Limpar filtros</Botao>}
            />
          </ComponentPreview>

          <ComponentPreview titulo="Generico (primeiro uso)">
            <EstadoVazio
              titulo="Comece aqui"
              descricao="Adicione seu primeiro item para comecar a acompanhar seu progresso."
              acao={<Botao size="sm">Criar primeiro item</Botao>}
            />
          </ComponentPreview>
        </div>
      </ShowcaseSection>

      {/* Error States */}
      <ShowcaseSection
        id="error"
        titulo="Error States"
        descricao="Estados de erro para diferentes cenarios"
      >
        <div className="space-y-4">
          <ComponentPreview titulo="Erro de rede">
            <Cartao className="border-destructive/20">
              <CartaoConteudo className="flex flex-col items-center p-8 text-center">
                <WifiOff className="mb-3 h-10 w-10 text-destructive/60" />
                <p className="font-semibold">Sem conexao</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Verifique sua conexao com a internet e tente novamente.
                </p>
                <Botao variant="outline" size="sm" className="mt-4">
                  Tentar novamente
                </Botao>
              </CartaoConteudo>
            </Cartao>
          </ComponentPreview>

          <ComponentPreview titulo="Erro de servidor (500)">
            <Cartao className="border-destructive/20">
              <CartaoConteudo className="flex flex-col items-center p-8 text-center">
                <AlertCircle className="mb-3 h-10 w-10 text-destructive/60" />
                <p className="font-semibold">Erro interno</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Algo deu errado no servidor. Nossa equipe foi notificada.
                </p>
                <div className="mt-4 flex gap-2">
                  <Botao variant="outline" size="sm">
                    Voltar ao inicio
                  </Botao>
                  <Botao size="sm">Tentar novamente</Botao>
                </div>
              </CartaoConteudo>
            </Cartao>
          </ComponentPreview>

          <ComponentPreview titulo="Pagina nao encontrada (404)">
            <Cartao>
              <CartaoConteudo className="flex flex-col items-center p-8 text-center">
                <p className="font-titulo text-6xl font-bold text-muted-foreground/30">404</p>
                <p className="mt-2 font-semibold">Pagina nao encontrada</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  O conteudo que voce procura nao existe ou foi removido.
                </p>
                <Botao size="sm" className="mt-4">
                  Voltar ao inicio
                </Botao>
              </CartaoConteudo>
            </Cartao>
          </ComponentPreview>
        </div>
      </ShowcaseSection>
    </div>
  )
}
