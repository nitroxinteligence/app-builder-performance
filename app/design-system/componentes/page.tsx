"use client"

import * as React from "react"
import { AlertCircle, Check, Plus, Trash2, Pencil, Loader2 } from "lucide-react"

import { ComponentPreview } from "@/componentes/design-system/component-preview"
import { ShowcaseSection } from "@/componentes/design-system/showcase-section"
import { Abas, AbasLista, AbaGatilho, AbaConteudo } from "@/componentes/ui/abas"
import { Alternador } from "@/componentes/ui/alternador"
import { Avatar, AvatarFallback } from "@/componentes/ui/avatar"
import { Botao } from "@/componentes/ui/botao"
import { CaixaSelecao } from "@/componentes/ui/caixa-selecao"
import {
  Cartao,
  CartaoCabecalho,
  CartaoTitulo,
  CartaoDescricao,
  CartaoConteudo,
  CartaoRodape,
} from "@/componentes/ui/cartao"
import { Colapsavel, ColapsavelGatilho, ColapsavelConteudo } from "@/componentes/ui/colapsavel"
import { Confirmar, ConfirmarExclusao } from "@/componentes/ui/confirmar"
import {
  Dialogo,
  DialogoGatilho,
  DialogoConteudo,
  DialogoCabecalho,
  DialogoTitulo,
  DialogoDescricao,
  DialogoRodape,
} from "@/componentes/ui/dialogo"
import {
  DialogoAlerta,
  DialogoAlertaGatilho,
  DialogoAlertaConteudo,
  DialogoAlertaCabecalho,
  DialogoAlertaTitulo,
  DialogoAlertaDescricao,
  DialogoAlertaRodape,
  DialogoAlertaAcao,
  DialogoAlertaCancelar,
} from "@/componentes/ui/dialogo-alerta"
import { Dica, DicaGatilho, DicaConteudo, ProvedorDica } from "@/componentes/ui/dica"
import { EstadoVazio, EstadoVazioTarefas, EstadoVazioHabitos } from "@/componentes/ui/estado-vazio"
import { Flutuante, FlutuanteGatilho, FlutuanteConteudo } from "@/componentes/ui/flutuante"
import {
  MenuSuspenso,
  MenuSuspensoGatilho,
  MenuSuspensoConteudo,
  MenuSuspensoItem,
  MenuSuspensoSeparador,
} from "@/componentes/ui/menu-suspenso"
import { Progresso } from "@/componentes/ui/progresso"
import { Separador } from "@/componentes/ui/separador"
import { Emblema } from "@/componentes/ui/emblema"
import { Entrada, AreaTexto } from "@/componentes/ui/entrada"
import { Esqueleto, EsqueletoTexto, EsqueletoCartao } from "@/componentes/ui/esqueleto"
import {
  Trilha,
  TrilhaLista,
  TrilhaItem,
  TrilhaLink,
  TrilhaPagina,
  TrilhaSeparador,
} from "@/componentes/ui/trilha"

export default function ComponentesPage() {
  const [checkboxSelecionado, setCheckboxSelecionado] = React.useState(false)
  const [progressoValor, setProgressoValor] = React.useState(60)
  const [colapsavelAberto, setColapsavelAberto] = React.useState(false)
  const [alternadorAtivo, setAlternadorAtivo] = React.useState(false)
  const [abaAtiva, setAbaAtiva] = React.useState("conta")

  return (
    <ProvedorDica>
      <div className="space-y-12">
        <div className="space-y-2">
          <h1 className="font-titulo text-3xl font-bold tracking-tight">
            Componentes
          </h1>
          <p className="text-muted-foreground">
            Todos os componentes UI do app com variantes, estados e composicao.
          </p>
        </div>

        {/* Botao */}
        <ShowcaseSection
          id="botao"
          titulo="Botao (Button)"
          descricao="5 variantes, 4 tamanhos, estados interativos"
        >
          <div className="space-y-4">
            <ComponentPreview titulo="Variantes">
              <div className="flex flex-wrap gap-3">
                <Botao variant="default">Default</Botao>
                <Botao variant="secondary">Secondary</Botao>
                <Botao variant="outline">Outline</Botao>
                <Botao variant="ghost">Ghost</Botao>
                <Botao variant="destructive">Destructive</Botao>
              </div>
            </ComponentPreview>

            <ComponentPreview titulo="Tamanhos">
              <div className="flex flex-wrap items-center gap-3">
                <Botao size="sm">Small</Botao>
                <Botao size="default">Default</Botao>
                <Botao size="lg">Large</Botao>
                <Botao size="icon"><Plus className="h-4 w-4" /></Botao>
              </div>
            </ComponentPreview>

            <ComponentPreview titulo="Estados">
              <div className="flex flex-wrap gap-3">
                <Botao disabled>Disabled</Botao>
                <Botao>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading
                </Botao>
                <Botao>
                  <Check className="mr-2 h-4 w-4" />
                  Com icone
                </Botao>
              </div>
            </ComponentPreview>
          </div>
        </ShowcaseSection>

        {/* Cartao */}
        <ShowcaseSection
          id="cartao"
          titulo="Cartao (Card)"
          descricao="Card composavel com cabecalho, conteudo e rodape"
        >
          <ComponentPreview titulo="Card completo">
            <div className="max-w-sm">
              <Cartao>
                <CartaoCabecalho>
                  <CartaoTitulo>Titulo do Cartao</CartaoTitulo>
                  <CartaoDescricao>Descricao opcional do cartao</CartaoDescricao>
                </CartaoCabecalho>
                <CartaoConteudo>
                  <p className="text-sm">
                    Conteudo do cartao com informacoes relevantes.
                  </p>
                </CartaoConteudo>
                <CartaoRodape>
                  <Botao size="sm">Acao</Botao>
                </CartaoRodape>
              </Cartao>
            </div>
          </ComponentPreview>
        </ShowcaseSection>

        {/* Dialogo */}
        <ShowcaseSection
          id="dialogo"
          titulo="Dialogo (Dialog)"
          descricao="Modal dialog com overlay e conteudo"
        >
          <ComponentPreview titulo="Dialog padrao">
            <Dialogo>
              <DialogoGatilho asChild>
                <Botao variant="outline">Abrir Dialogo</Botao>
              </DialogoGatilho>
              <DialogoConteudo>
                <DialogoCabecalho>
                  <DialogoTitulo>Titulo do Dialogo</DialogoTitulo>
                  <DialogoDescricao>Descricao do dialogo com informacoes adicionais.</DialogoDescricao>
                </DialogoCabecalho>
                <div className="py-4">
                  <p className="text-sm text-muted-foreground">Conteudo do dialogo aqui.</p>
                </div>
                <DialogoRodape>
                  <Botao variant="outline">Cancelar</Botao>
                  <Botao>Confirmar</Botao>
                </DialogoRodape>
              </DialogoConteudo>
            </Dialogo>
          </ComponentPreview>
        </ShowcaseSection>

        {/* Dialogo Alerta */}
        <ShowcaseSection
          id="dialogo-alerta"
          titulo="Dialogo Alerta (Alert Dialog)"
          descricao="Dialog de confirmacao com acao destrutiva"
        >
          <ComponentPreview titulo="Alert Dialog">
            <DialogoAlerta>
              <DialogoAlertaGatilho asChild>
                <Botao variant="destructive">Excluir item</Botao>
              </DialogoAlertaGatilho>
              <DialogoAlertaConteudo>
                <DialogoAlertaCabecalho>
                  <DialogoAlertaTitulo>Tem certeza?</DialogoAlertaTitulo>
                  <DialogoAlertaDescricao>
                    Esta acao nao pode ser desfeita. Isso ira remover permanentemente o item.
                  </DialogoAlertaDescricao>
                </DialogoAlertaCabecalho>
                <DialogoAlertaRodape>
                  <DialogoAlertaCancelar>Cancelar</DialogoAlertaCancelar>
                  <DialogoAlertaAcao>Excluir</DialogoAlertaAcao>
                </DialogoAlertaRodape>
              </DialogoAlertaConteudo>
            </DialogoAlerta>
          </ComponentPreview>
        </ShowcaseSection>

        {/* Confirmar */}
        <ShowcaseSection
          id="confirmar"
          titulo="Confirmar (Confirmation)"
          descricao="Componentes prontos de confirmacao e exclusao"
        >
          <div className="space-y-4">
            <ComponentPreview titulo="Confirmar padrao">
              <ConfirmacaoDemo />
            </ComponentPreview>
            <ComponentPreview titulo="Confirmar exclusao">
              <ExclusaoDemo />
            </ComponentPreview>
          </div>
        </ShowcaseSection>

        {/* Seletor — skip rendering since it needs Select context */}

        {/* Menu Suspenso */}
        <ShowcaseSection
          id="menu-suspenso"
          titulo="Menu Suspenso (Dropdown)"
          descricao="Menu contextual com opcoes"
        >
          <ComponentPreview titulo="Dropdown basico">
            <MenuSuspenso>
              <MenuSuspensoGatilho asChild>
                <Botao variant="outline">Opcoes</Botao>
              </MenuSuspensoGatilho>
              <MenuSuspensoConteudo>
                <MenuSuspensoItem>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </MenuSuspensoItem>
                <MenuSuspensoItem>
                  <Plus className="mr-2 h-4 w-4" />
                  Duplicar
                </MenuSuspensoItem>
                <MenuSuspensoSeparador />
                <MenuSuspensoItem className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </MenuSuspensoItem>
              </MenuSuspensoConteudo>
            </MenuSuspenso>
          </ComponentPreview>
        </ShowcaseSection>

        {/* Caixa Selecao */}
        <ShowcaseSection
          id="caixa-selecao"
          titulo="Caixa de Selecao (Checkbox)"
          descricao="Checkbox com estados"
        >
          <ComponentPreview titulo="Checkbox interativo">
            <div className="flex items-center gap-3">
              <CaixaSelecao
                id="demo-checkbox"
                checked={checkboxSelecionado}
                onCheckedChange={(checked) => setCheckboxSelecionado(checked === true)}
              />
              <label htmlFor="demo-checkbox" className="text-sm">
                {checkboxSelecionado ? "Selecionado" : "Nao selecionado"}
              </label>
            </div>
          </ComponentPreview>
        </ShowcaseSection>

        {/* Flutuante */}
        <ShowcaseSection
          id="flutuante"
          titulo="Flutuante (Popover)"
          descricao="Popover com conteudo flutuante"
        >
          <ComponentPreview titulo="Popover basico">
            <Flutuante>
              <FlutuanteGatilho asChild>
                <Botao variant="outline">Abrir Popover</Botao>
              </FlutuanteGatilho>
              <FlutuanteConteudo>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Conteudo do Popover</p>
                  <p className="text-xs text-muted-foreground">
                    Informacoes adicionais exibidas em um popover flutuante.
                  </p>
                </div>
              </FlutuanteConteudo>
            </Flutuante>
          </ComponentPreview>
        </ShowcaseSection>

        {/* Dica */}
        <ShowcaseSection
          id="dica"
          titulo="Dica (Tooltip)"
          descricao="Tooltip com texto de ajuda"
        >
          <ComponentPreview titulo="Tooltip basico">
            <div className="flex gap-4">
              <Dica>
                <DicaGatilho asChild>
                  <Botao variant="outline" size="icon">
                    <AlertCircle className="h-4 w-4" />
                  </Botao>
                </DicaGatilho>
                <DicaConteudo>
                  <p>Informacao de ajuda</p>
                </DicaConteudo>
              </Dica>
              <Dica>
                <DicaGatilho asChild>
                  <Botao variant="ghost" size="sm">Hover aqui</Botao>
                </DicaGatilho>
                <DicaConteudo>
                  <p>Dica com mais detalhes sobre o elemento</p>
                </DicaConteudo>
              </Dica>
            </div>
          </ComponentPreview>
        </ShowcaseSection>

        {/* Colapsavel */}
        <ShowcaseSection
          id="colapsavel"
          titulo="Colapsavel (Collapsible)"
          descricao="Conteudo expansivel/colapsavel"
        >
          <ComponentPreview titulo="Collapsible basico">
            <Colapsavel open={colapsavelAberto} onOpenChange={setColapsavelAberto}>
              <ColapsavelGatilho asChild>
                <Botao variant="outline" size="sm">
                  {colapsavelAberto ? "Recolher" : "Expandir"} conteudo
                </Botao>
              </ColapsavelGatilho>
              <ColapsavelConteudo>
                <div className="mt-3 rounded-md border border-border p-3">
                  <p className="text-sm text-muted-foreground">
                    Conteudo expansivel que fica oculto ate o usuario clicar.
                  </p>
                </div>
              </ColapsavelConteudo>
            </Colapsavel>
          </ComponentPreview>
        </ShowcaseSection>

        {/* Progresso */}
        <ShowcaseSection
          id="progresso"
          titulo="Progresso (Progress)"
          descricao="Barra de progresso com valor"
        >
          <ComponentPreview titulo="Progress interativo">
            <div className="space-y-4">
              <Progresso value={progressoValor} />
              <div className="flex gap-2">
                <Botao
                  size="sm"
                  variant="outline"
                  onClick={() => setProgressoValor(Math.max(0, progressoValor - 10))}
                >
                  -10
                </Botao>
                <span className="flex items-center text-sm font-mono">{progressoValor}%</span>
                <Botao
                  size="sm"
                  variant="outline"
                  onClick={() => setProgressoValor(Math.min(100, progressoValor + 10))}
                >
                  +10
                </Botao>
              </div>
              <div className="flex gap-3">
                <Progresso value={0} className="flex-1" />
                <Progresso value={25} className="flex-1" />
                <Progresso value={50} className="flex-1" />
                <Progresso value={75} className="flex-1" />
                <Progresso value={100} className="flex-1" />
              </div>
            </div>
          </ComponentPreview>
        </ShowcaseSection>

        {/* Separador */}
        <ShowcaseSection
          id="separador"
          titulo="Separador (Separator)"
          descricao="Linha divisoria horizontal e vertical"
        >
          <ComponentPreview titulo="Orientacoes">
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm">Horizontal</p>
                <Separador />
              </div>
              <div className="flex h-8 items-center gap-4">
                <span className="text-sm">Item 1</span>
                <Separador orientation="vertical" />
                <span className="text-sm">Item 2</span>
                <Separador orientation="vertical" />
                <span className="text-sm">Item 3</span>
              </div>
            </div>
          </ComponentPreview>
        </ShowcaseSection>

        {/* Esqueleto */}
        <ShowcaseSection
          id="esqueleto"
          titulo="Esqueleto (Skeleton)"
          descricao="Loading placeholders com animacao pulse"
        >
          <div className="space-y-4">
            <ComponentPreview titulo="Skeleton basico">
              <div className="space-y-3">
                <Esqueleto className="h-4 w-3/4" />
                <Esqueleto className="h-4 w-1/2" />
                <Esqueleto className="h-4 w-5/6" />
              </div>
            </ComponentPreview>
            <ComponentPreview titulo="Skeleton de texto">
              <EsqueletoTexto linhas={3} larguraUltimaLinha="tres-quartos" />
            </ComponentPreview>
            <ComponentPreview titulo="Skeleton de cartao">
              <div className="max-w-sm">
                <EsqueletoCartao comCabecalho comDescricao comRodape />
              </div>
            </ComponentPreview>
          </div>
        </ShowcaseSection>

        {/* Estado Vazio */}
        <ShowcaseSection
          id="estado-vazio"
          titulo="Estado Vazio (Empty State)"
          descricao="Componentes para quando nao ha dados"
        >
          <div className="space-y-4">
            <ComponentPreview titulo="Estado vazio generico">
              <EstadoVazio
                titulo="Nenhum resultado encontrado"
                descricao="Tente ajustar os filtros ou adicionar novos itens."
                icone={<AlertCircle className="h-10 w-10 text-muted-foreground" />}
              />
            </ComponentPreview>
            <ComponentPreview titulo="Tarefas vazio">
              <EstadoVazioTarefas />
            </ComponentPreview>
            <ComponentPreview titulo="Habitos vazio">
              <EstadoVazioHabitos />
            </ComponentPreview>
          </div>
        </ShowcaseSection>

        {/* Toast */}
        <ShowcaseSection
          id="toast"
          titulo="Toaster (Toast/Sonner)"
          descricao="Notificacoes toast via Sonner — position: bottom-right, rich colors"
        >
          <ComponentPreview titulo="Sonner config">
            <div className="rounded-md bg-muted/50 p-3">
              <p className="text-sm text-muted-foreground">
                O Toaster usa Sonner com posicao bottom-right, cores ricas e botao
                de fechar. Para acionar: <code className="font-mono text-xs">toast(&quot;mensagem&quot;)</code>
              </p>
            </div>
          </ComponentPreview>
        </ShowcaseSection>

        {/* --- COMPONENTES NOVOS (Gap Fill - FASE 4) --- */}

        <div className="border-t border-border pt-8">
          <h2 className="font-titulo text-xl font-bold text-primary">
            Componentes Novos (Gap Fill)
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Componentes adicionados para preencher gaps identificados no design system.
          </p>
        </div>

        {/* Entrada (Input / Textarea) */}
        <ShowcaseSection
          id="entrada"
          titulo="Entrada (Input / Textarea)"
          descricao="Campos de texto para formularios"
        >
          <div className="space-y-4">
            <ComponentPreview titulo="Input variantes">
              <div className="max-w-sm space-y-3">
                <Entrada placeholder="Input padrao" />
                <Entrada type="email" placeholder="Email" />
                <Entrada type="password" placeholder="Senha" />
                <Entrada disabled placeholder="Desabilitado" />
              </div>
            </ComponentPreview>
            <ComponentPreview titulo="Textarea">
              <div className="max-w-sm">
                <AreaTexto placeholder="Escreva uma descricao..." />
              </div>
            </ComponentPreview>
          </div>
        </ShowcaseSection>

        {/* Emblema (Badge) */}
        <ShowcaseSection
          id="emblema"
          titulo="Emblema (Badge)"
          descricao="Badges de status e categorias"
        >
          <ComponentPreview titulo="Variantes">
            <div className="flex flex-wrap gap-2">
              <Emblema>Default</Emblema>
              <Emblema variant="secondary">Secondary</Emblema>
              <Emblema variant="destructive">Destructive</Emblema>
              <Emblema variant="outline">Outline</Emblema>
            </div>
          </ComponentPreview>
        </ShowcaseSection>

        {/* Avatar */}
        <ShowcaseSection
          id="avatar"
          titulo="Avatar"
          descricao="Avatar de usuario com imagem e fallback"
        >
          <ComponentPreview titulo="Variantes">
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarFallback>JP</AvatarFallback>
              </Avatar>
              <Avatar className="h-12 w-12">
                <AvatarFallback className="text-lg">AB</AvatarFallback>
              </Avatar>
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">M</AvatarFallback>
              </Avatar>
            </div>
          </ComponentPreview>
        </ShowcaseSection>

        {/* Abas (Tabs) */}
        <ShowcaseSection
          id="abas"
          titulo="Abas (Tabs)"
          descricao="Navegacao por abas"
        >
          <ComponentPreview titulo="Tabs interativo">
            <Abas>
              <AbasLista>
                <AbaGatilho
                  ativo={abaAtiva === "conta"}
                  onClick={() => setAbaAtiva("conta")}
                >
                  Conta
                </AbaGatilho>
                <AbaGatilho
                  ativo={abaAtiva === "seguranca"}
                  onClick={() => setAbaAtiva("seguranca")}
                >
                  Seguranca
                </AbaGatilho>
                <AbaGatilho
                  ativo={abaAtiva === "notificacoes"}
                  onClick={() => setAbaAtiva("notificacoes")}
                >
                  Notificacoes
                </AbaGatilho>
              </AbasLista>
              {abaAtiva === "conta" && (
                <AbaConteudo>
                  <p className="text-sm text-muted-foreground">
                    Configuracoes da conta do usuario.
                  </p>
                </AbaConteudo>
              )}
              {abaAtiva === "seguranca" && (
                <AbaConteudo>
                  <p className="text-sm text-muted-foreground">
                    Opcoes de seguranca e autenticacao.
                  </p>
                </AbaConteudo>
              )}
              {abaAtiva === "notificacoes" && (
                <AbaConteudo>
                  <p className="text-sm text-muted-foreground">
                    Preferencias de notificacoes.
                  </p>
                </AbaConteudo>
              )}
            </Abas>
          </ComponentPreview>
        </ShowcaseSection>

        {/* Alternador (Toggle / Switch) */}
        <ShowcaseSection
          id="alternador"
          titulo="Alternador (Toggle / Switch)"
          descricao="Switch on/off para configuracoes"
        >
          <ComponentPreview titulo="Switch interativo">
            <div className="flex items-center gap-3">
              <Alternador
                id="demo-switch"
                ativado={alternadorAtivo}
                aoAlternar={setAlternadorAtivo}
              />
              <label htmlFor="demo-switch" className="text-sm">
                {alternadorAtivo ? "Ativado" : "Desativado"}
              </label>
            </div>
          </ComponentPreview>
          <ComponentPreview titulo="Switch desabilitado">
            <div className="flex items-center gap-3">
              <Alternador disabled ativado={false} aoAlternar={() => {}} />
              <span className="text-sm text-muted-foreground">Desabilitado</span>
            </div>
          </ComponentPreview>
        </ShowcaseSection>

        {/* Trilha (Breadcrumb) */}
        <ShowcaseSection
          id="trilha"
          titulo="Trilha (Breadcrumb)"
          descricao="Navegacao estrutural hierarquica"
        >
          <ComponentPreview titulo="Breadcrumb padrao">
            <Trilha>
              <TrilhaLista>
                <TrilhaItem>
                  <TrilhaLink href="#">Inicio</TrilhaLink>
                </TrilhaItem>
                <TrilhaSeparador />
                <TrilhaItem>
                  <TrilhaLink href="#">Configuracoes</TrilhaLink>
                </TrilhaItem>
                <TrilhaSeparador />
                <TrilhaItem>
                  <TrilhaPagina>Perfil</TrilhaPagina>
                </TrilhaItem>
              </TrilhaLista>
            </Trilha>
          </ComponentPreview>
        </ShowcaseSection>
      </div>
    </ProvedorDica>
  )
}

function ConfirmacaoDemo() {
  const [aberto, setAberto] = React.useState(false)

  return (
    <>
      <Botao variant="outline" size="sm" onClick={() => setAberto(true)}>
        Demonstrar confirmacao
      </Botao>
      <Confirmar
        aberto={aberto}
        onAbertoMudar={setAberto}
        titulo="Confirmar acao"
        descricao="Voce tem certeza que deseja continuar?"
        textoConfirmar="Confirmar"
        textoCancelar="Cancelar"
        onConfirmar={() => setAberto(false)}
        onCancelar={() => setAberto(false)}
      />
    </>
  )
}

function ExclusaoDemo() {
  const [aberto, setAberto] = React.useState(false)

  return (
    <>
      <Botao variant="destructive" size="sm" onClick={() => setAberto(true)}>
        Demonstrar exclusao
      </Botao>
      <ConfirmarExclusao
        aberto={aberto}
        onAbertoMudar={setAberto}
        nomeItem="Tarefa de exemplo"
        onConfirmar={() => setAberto(false)}
        onCancelar={() => setAberto(false)}
      />
    </>
  )
}
