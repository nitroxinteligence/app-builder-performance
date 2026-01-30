import * as React from "react"

import { cn } from "@/lib/utilidades"

function Esqueleto({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-muted before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent",
        className
      )}
      {...props}
    />
  )
}

Esqueleto.displayName = "Esqueleto";

/**
 * Text line skeleton for paragraphs and titles
 */
interface PropsEsqueletoTexto extends React.HTMLAttributes<HTMLDivElement> {
  linhas?: number;
  larguraUltimaLinha?: "completa" | "tres-quartos" | "metade" | "um-quarto";
}

function EsqueletoTexto({
  className,
  linhas = 1,
  larguraUltimaLinha = "tres-quartos",
  ...props
}: PropsEsqueletoTexto) {
  const larguras: Record<string, string> = {
    completa: "w-full",
    "tres-quartos": "w-3/4",
    metade: "w-1/2",
    "um-quarto": "w-1/4",
  };

  return (
    <div className={cn("space-y-2", className)} {...props}>
      {Array.from({ length: linhas }).map((_, index) => {
        const ehUltimaLinha = index === linhas - 1;
        const largura = ehUltimaLinha ? larguras[larguraUltimaLinha] : "w-full";

        return (
          <Esqueleto
            key={index}
            className={cn("h-4", largura)}
          />
        );
      })}
    </div>
  );
}

EsqueletoTexto.displayName = "EsqueletoTexto";

/**
 * Card skeleton mimicking the Cartao component structure
 */
interface PropsEsqueletoCartao extends React.HTMLAttributes<HTMLDivElement> {
  comCabecalho?: boolean;
  comDescricao?: boolean;
  comRodape?: boolean;
  linhasConteudo?: number;
}

function EsqueletoCartao({
  className,
  comCabecalho = true,
  comDescricao = true,
  comRodape = false,
  linhasConteudo = 3,
  ...props
}: PropsEsqueletoCartao) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[color:var(--borda-cartao)] bg-card p-6",
        className
      )}
      {...props}
    >
      {comCabecalho && (
        <div className="flex flex-col gap-1.5 pb-4">
          <Esqueleto className="h-6 w-2/3" />
          {comDescricao && <Esqueleto className="h-4 w-1/2" />}
        </div>
      )}

      <div className="space-y-3">
        <EsqueletoTexto linhas={linhasConteudo} larguraUltimaLinha="tres-quartos" />
      </div>

      {comRodape && (
        <div className="mt-4 flex items-center gap-2 pt-4">
          <Esqueleto className="h-9 w-24" />
          <Esqueleto className="h-9 w-24" />
        </div>
      )}
    </div>
  );
}

EsqueletoCartao.displayName = "EsqueletoCartao";

/**
 * Single Kanban card skeleton
 */
function EsqueletoCartaoKanban({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-4",
        className
      )}
      {...props}
    >
      {/* Header with priority badge */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <Esqueleto className="h-5 w-3/4" />
        <Esqueleto className="h-5 w-12 rounded-full" />
      </div>

      {/* Description preview */}
      <EsqueletoTexto linhas={2} larguraUltimaLinha="metade" />

      {/* Footer with date and category */}
      <div className="mt-3 flex items-center justify-between">
        <Esqueleto className="h-4 w-20" />
        <Esqueleto className="h-4 w-16 rounded-full" />
      </div>
    </div>
  );
}

EsqueletoCartaoKanban.displayName = "EsqueletoCartaoKanban";

/**
 * Single Kanban column skeleton
 */
interface PropsEsqueletoColunaKanban extends React.HTMLAttributes<HTMLDivElement> {
  quantidadeCartoes?: number;
}

function EsqueletoColunaKanban({
  className,
  quantidadeCartoes = 3,
  ...props
}: PropsEsqueletoColunaKanban) {
  return (
    <div
      className={cn(
        "flex w-[280px] flex-shrink-0 flex-col rounded-xl bg-muted/50 p-3",
        className
      )}
      {...props}
    >
      {/* Column header */}
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Esqueleto className="h-5 w-24" />
          <Esqueleto className="h-5 w-6 rounded-full" />
        </div>
        <Esqueleto className="h-6 w-6 rounded" />
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2">
        {Array.from({ length: quantidadeCartoes }).map((_, index) => (
          <EsqueletoCartaoKanban key={index} />
        ))}
      </div>
    </div>
  );
}

EsqueletoColunaKanban.displayName = "EsqueletoColunaKanban";

/**
 * Full Kanban board skeleton with 4 columns (Backlog, A fazer, Em andamento, Concluido)
 */
interface PropsEsqueletoKanban extends React.HTMLAttributes<HTMLDivElement> {
  cartoesPorColuna?: number[];
}

function EsqueletoKanban({
  className,
  cartoesPorColuna = [3, 2, 2, 1],
  ...props
}: PropsEsqueletoKanban) {
  return (
    <div
      className={cn(
        "flex gap-4 overflow-x-auto pb-4",
        className
      )}
      {...props}
    >
      {cartoesPorColuna.map((quantidade, index) => (
        <EsqueletoColunaKanban
          key={index}
          quantidadeCartoes={quantidade}
        />
      ))}
    </div>
  );
}

EsqueletoKanban.displayName = "EsqueletoKanban";

/**
 * Single list item skeleton
 */
function EsqueletoItemLista({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-lg border bg-card p-4",
        className
      )}
      {...props}
    >
      {/* Checkbox/icon placeholder */}
      <Esqueleto className="h-5 w-5 rounded" />

      {/* Content */}
      <div className="flex-1 space-y-2">
        <Esqueleto className="h-5 w-3/4" />
        <Esqueleto className="h-4 w-1/2" />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Esqueleto className="h-8 w-8 rounded" />
        <Esqueleto className="h-8 w-8 rounded" />
      </div>
    </div>
  );
}

EsqueletoItemLista.displayName = "EsqueletoItemLista";

/**
 * List skeleton for vertical lists of items
 */
interface PropsEsqueletoLista extends React.HTMLAttributes<HTMLDivElement> {
  quantidadeItens?: number;
  comCabecalho?: boolean;
}

function EsqueletoLista({
  className,
  quantidadeItens = 5,
  comCabecalho = false,
  ...props
}: PropsEsqueletoLista) {
  return (
    <div className={cn("space-y-3", className)} {...props}>
      {comCabecalho && (
        <div className="flex items-center justify-between pb-2">
          <Esqueleto className="h-6 w-32" />
          <Esqueleto className="h-9 w-28" />
        </div>
      )}

      {Array.from({ length: quantidadeItens }).map((_, index) => (
        <EsqueletoItemLista key={index} />
      ))}
    </div>
  );
}

EsqueletoLista.displayName = "EsqueletoLista";

/**
 * Avatar skeleton for user profiles
 */
interface PropsEsqueletoAvatar extends React.HTMLAttributes<HTMLDivElement> {
  tamanho?: "sm" | "md" | "lg" | "xl";
}

function EsqueletoAvatar({
  className,
  tamanho = "md",
  ...props
}: PropsEsqueletoAvatar) {
  const tamanhos: Record<string, string> = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  return (
    <Esqueleto
      className={cn("rounded-full", tamanhos[tamanho], className)}
      {...props}
    />
  );
}

EsqueletoAvatar.displayName = "EsqueletoAvatar";

/**
 * Button skeleton
 */
interface PropsEsqueletoBotao extends React.HTMLAttributes<HTMLDivElement> {
  tamanho?: "sm" | "md" | "lg" | "icon";
}

function EsqueletoBotao({
  className,
  tamanho = "md",
  ...props
}: PropsEsqueletoBotao) {
  const tamanhos: Record<string, string> = {
    sm: "h-9 w-20",
    md: "h-10 w-24",
    lg: "h-11 w-28",
    icon: "h-10 w-10",
  };

  return (
    <Esqueleto
      className={cn("rounded-md", tamanhos[tamanho], className)}
      {...props}
    />
  );
}

EsqueletoBotao.displayName = "EsqueletoBotao";

/**
 * Input field skeleton
 */
function EsqueletoInput({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      <Esqueleto className="h-4 w-20" />
      <Esqueleto className="h-10 w-full rounded-md" />
    </div>
  );
}

EsqueletoInput.displayName = "EsqueletoInput";

/**
 * Form skeleton with multiple fields
 */
interface PropsEsqueletoFormulario extends React.HTMLAttributes<HTMLDivElement> {
  quantidadeCampos?: number;
  comBotaoEnviar?: boolean;
}

function EsqueletoFormulario({
  className,
  quantidadeCampos = 4,
  comBotaoEnviar = true,
  ...props
}: PropsEsqueletoFormulario) {
  return (
    <div className={cn("space-y-4", className)} {...props}>
      {Array.from({ length: quantidadeCampos }).map((_, index) => (
        <EsqueletoInput key={index} />
      ))}

      {comBotaoEnviar && (
        <div className="flex justify-end pt-2">
          <EsqueletoBotao tamanho="lg" />
        </div>
      )}
    </div>
  );
}

EsqueletoFormulario.displayName = "EsqueletoFormulario";

/**
 * Table skeleton
 */
interface PropsEsqueletoTabela extends React.HTMLAttributes<HTMLDivElement> {
  colunas?: number;
  linhas?: number;
  comCabecalho?: boolean;
}

function EsqueletoTabela({
  className,
  colunas = 4,
  linhas = 5,
  comCabecalho = true,
  ...props
}: PropsEsqueletoTabela) {
  return (
    <div className={cn("w-full space-y-3", className)} {...props}>
      {/* Table header */}
      {comCabecalho && (
        <div className="flex gap-4 border-b pb-3">
          {Array.from({ length: colunas }).map((_, index) => (
            <Esqueleto
              key={index}
              className="h-4 flex-1"
            />
          ))}
        </div>
      )}

      {/* Table rows */}
      {Array.from({ length: linhas }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 py-2">
          {Array.from({ length: colunas }).map((_, colIndex) => (
            <Esqueleto
              key={colIndex}
              className="h-5 flex-1"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

EsqueletoTabela.displayName = "EsqueletoTabela";

/**
 * Stats/Metrics card skeleton for dashboards
 */
function EsqueletoEstatistica({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[color:var(--borda-cartao)] bg-card p-6",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between">
        <Esqueleto className="h-4 w-24" />
        <Esqueleto className="h-8 w-8 rounded" />
      </div>
      <Esqueleto className="mt-3 h-8 w-20" />
      <Esqueleto className="mt-2 h-3 w-32" />
    </div>
  );
}

EsqueletoEstatistica.displayName = "EsqueletoEstatistica";

/**
 * Grid of stats cards skeleton
 */
interface PropsEsqueletoGradeEstatisticas extends React.HTMLAttributes<HTMLDivElement> {
  quantidade?: number;
}

function EsqueletoGradeEstatisticas({
  className,
  quantidade = 4,
  ...props
}: PropsEsqueletoGradeEstatisticas) {
  return (
    <div
      className={cn(
        "grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
        className
      )}
      {...props}
    >
      {Array.from({ length: quantidade }).map((_, index) => (
        <EsqueletoEstatistica key={index} />
      ))}
    </div>
  );
}

EsqueletoGradeEstatisticas.displayName = "EsqueletoGradeEstatisticas";

/**
 * Sidebar navigation skeleton
 */
function EsqueletoNavegacaoLateral({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("space-y-4 p-4", className)} {...props}>
      {/* Logo */}
      <div className="flex items-center gap-2 pb-4">
        <Esqueleto className="h-8 w-8 rounded" />
        <Esqueleto className="h-6 w-24" />
      </div>

      {/* Navigation items */}
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex items-center gap-3 rounded-md p-2">
            <Esqueleto className="h-5 w-5 rounded" />
            <Esqueleto className="h-4 w-20" />
          </div>
        ))}
      </div>

      {/* Bottom section */}
      <div className="mt-auto pt-4 border-t">
        <div className="flex items-center gap-3 p-2">
          <EsqueletoAvatar tamanho="sm" />
          <div className="flex-1">
            <Esqueleto className="h-4 w-24" />
            <Esqueleto className="mt-1 h-3 w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}

EsqueletoNavegacaoLateral.displayName = "EsqueletoNavegacaoLateral";

/**
 * Page header skeleton
 */
function EsqueletoCabecalhoPagina({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center justify-between pb-6",
        className
      )}
      {...props}
    >
      <div className="space-y-2">
        <Esqueleto className="h-8 w-48" />
        <Esqueleto className="h-4 w-64" />
      </div>
      <div className="flex items-center gap-2">
        <EsqueletoBotao tamanho="icon" />
        <EsqueletoBotao />
      </div>
    </div>
  );
}

EsqueletoCabecalhoPagina.displayName = "EsqueletoCabecalhoPagina";

export {
  Esqueleto,
  EsqueletoTexto,
  EsqueletoCartao,
  EsqueletoCartaoKanban,
  EsqueletoColunaKanban,
  EsqueletoKanban,
  EsqueletoItemLista,
  EsqueletoLista,
  EsqueletoAvatar,
  EsqueletoBotao,
  EsqueletoInput,
  EsqueletoFormulario,
  EsqueletoTabela,
  EsqueletoEstatistica,
  EsqueletoGradeEstatisticas,
  EsqueletoNavegacaoLateral,
  EsqueletoCabecalhoPagina,
};
