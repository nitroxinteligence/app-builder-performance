# UX Specialist Review

**Revisor:** @ux-design-expert
**Data:** 2026-01-29
**Documento revisado:** docs/prd/technical-debt-DRAFT.md

---

## Debitos Validados

| ID | Debito | Severidade Original | Severidade Ajustada | Horas Estimadas | Prioridade | Impacto UX |
|----|--------|---------------------|---------------------|-----------------|------------|------------|
| FE-C01 | God Components (habitos 2314, foco 1281, tarefas 1062, agenda 863) | CRITICAL | CRITICAL | 24-32h | P1 | **Muito Alto** -- Re-renders excessivos causam lentidao perceptivel, especialmente em habitos (2314 linhas confirmadas). Qualquer interacao dispara reconciliacao de todo o componente. O usuario sente travamento ao marcar um habito ou arrastar um card. |
| FE-C02 | Navegacao mobile inexistente (`hidden lg:flex`) | CRITICAL | CRITICAL | 12-16h | P0 | **Bloqueante** -- Confirmado: sidebar.tsx linha 105 usa `hidden lg:flex`. Zero alternativa para telas < 1024px. Nenhum hamburger, bottom tab, drawer ou qualquer mecanismo de navegacao mobile. O app e completamente inacessivel em smartphones e tablets. |
| FE-C03 | Zero code splitting | CRITICAL | HIGH | 6-10h | P2 | **Alto** -- Confirmado: zero ocorrencias de `React.lazy()`, `next/dynamic()` ou imports dinamicos. Porem, o Next.js App Router ja faz split por rota automaticamente. O impacto real e nos componentes pesados dentro de cada rota (modais, drag-and-drop, calendarios). Rebaixo para HIGH porque o split por rota ja mitiga o pior cenario. |
| FE-C04 | Excesso de "use client" (17 client vs 1 server) | CRITICAL | HIGH | 12-20h | P3 | **Alto** -- Confirmado. Porem, a natureza do app (timer interativo, drag-and-drop, formularios) justifica client components nas paginas principais. A oportunidade real esta em extrair shells estaticos (cabecalhos, layouts, metadata) como Server Components e manter a logica interativa como Client Components filhos. Rebaixo para HIGH pois o impacto UX direto e mais de performance do que de funcionalidade. |
| FE-H01 | Formularios sem estrutura (sem react-hook-form) | HIGH | HIGH | 8-12h | P2 | **Alto** -- Parcialmente validado com nuance: a busca por `<label>` revelou que EXISTEM labels em varias paginas (habitos tem 55+ labels com htmlFor, tarefas tem 12+, agenda tem 16+, entrar tem 2, criar-conta tem 9). O problema NAO e ausencia total de labels, mas sim: (a) ausencia de react-hook-form causando validacao inconsistente, (b) formularios complexos com estado gerenciado manualmente via useState, (c) falta de mensagens de erro inline por campo. |
| FE-H02 | ErrorBoundary inconsistente (2 de 11) | HIGH | HIGH | 3-4h | P1 | **Alto** -- Confirmado: apenas `tarefas/page.tsx` e `inicio/page.tsx` usam ErrorBoundary. Zero arquivos `error.tsx` no diretorio app/ (mecanismo nativo do Next.js). Nenhum `loading.tsx` tambem. Um erro em qualquer mutation de habitos, foco, agenda ou cursos crasha toda a pagina sem recuperacao. |
| FE-H03 | Validacao Zod incompleta | HIGH | HIGH | 6-8h | P2 | **Alto** -- Confirmado: apenas `lib/schemas/tarefa.ts` possui schemas Zod. Habitos, metas, eventos e cursos enviam dados sem validacao frontend. Impacto UX: erros do banco chegam como mensagens genericas em vez de feedback inline por campo. |
| FE-H04 | Toast inconsistente | HIGH | MEDIUM | 3-4h | P3 | **Medio** -- Confirmado com dados concretos: `useTarefas.ts` e `usePendencias.ts` implementam toast em todas as mutations (sucesso e erro). `useHabitos.ts`, `useAgenda.ts`, `useMetas.ts` e `useCursos.ts` tem ZERO toasts. O usuario marca um habito e nao recebe nenhum feedback visual, mas cria uma tarefa e ve toast de sucesso. Rebaixo para MEDIUM pois nao bloqueia funcionalidade, mas a inconsistencia prejudica a confianca do usuario. |
| FE-M01 | Zero `next/image` | MEDIUM | LOW | 1-2h | P4 | **Baixo** -- Confirmado. Porem o app atualmente tem pouquissimas imagens (apenas icones via Lucide). O impacto real so se materializa quando avatares de usuario e thumbnails de cursos forem implementados. Recomendo postergar e adotar quando novas features com imagens forem criadas. |
| FE-M02 | Estado local descontrolado no Foco (26 useState) | MEDIUM | HIGH | 6-8h | P1 | **Muito Alto** -- Confirmado: 26 chamadas `useState` no componente `PaginaFoco`. Isso vai alem de complexidade de codigo -- o usuario experimenta: (a) possiveis glitches no timer quando multiplos states atualizam simultaneamente, (b) perda de contexto ao interagir com modais, (c) o `sendBeacon` no `beforeunload` depende de estado fragmentado. Elevo para HIGH pelo risco real de bugs de UX no timer (feature core do app). |
| FE-M03 | Falta `prefers-reduced-motion` | MEDIUM | MEDIUM | 2-3h | P3 | **Medio** -- Confirmado: zero ocorrencias de `prefers-reduced-motion` em todo o codebase (apenas mencionado nos docs). Animacoes identificadas: `animate-pulse` em esqueletos, `animate-in fade-in-0 zoom-in-95` em estados vazios, `transition-` em 19 arquivos (41 ocorrencias), animacoes da sidebar. Afeta usuarios com sensibilidade a movimento (vestibular). |
| FE-L01 | React.memo limitado | LOW | LOW | 2-4h | P5 | **Baixo** -- Confirmado: apenas 4 componentes memoizados em `inicio/page.tsx`. Porem, o React 19 com o compiler experimental ja mitiga parte desse problema. Priorizar apos a extracao de God Components (FE-C01), quando sub-componentes menores se beneficiarao mais de memoizacao. |
| FE-L02 | SVG inline no login | LOW | LOW | 0.5h | P5 | **Muito Baixo** -- Confirmado. Icone do Google como SVG inline. Nao afeta UX diretamente. Corrigir oportunisticamente. |

### Resumo das Alteracoes de Severidade

| ID | Original | Ajustada | Justificativa |
|----|----------|----------|---------------|
| FE-C03 | CRITICAL | HIGH | Next.js App Router ja faz code split por rota. Impacto real e intra-rota. |
| FE-C04 | CRITICAL | HIGH | Natureza interativa do app justifica client components. Oportunidade esta em shells estaticos. |
| FE-H04 | HIGH | MEDIUM | Nao bloqueia funcionalidade, apenas consistencia de feedback. |
| FE-M01 | MEDIUM | LOW | App tem pouquissimas imagens atualmente. Impacto futuro, nao presente. |
| FE-M02 | MEDIUM | HIGH | 26 useState no timer (feature core) cria risco real de bugs de UX. |

---

## Debitos Adicionados

| ID | Debito | Severidade | Localizacao | Horas Est. | Impacto UX |
|----|--------|------------|-------------|------------|------------|
| FE-N01 | **Zero `loading.tsx` / `error.tsx` (Next.js App Router)** -- Nenhuma rota possui os arquivos convencionais `loading.tsx` ou `error.tsx` do App Router. Isso significa zero streaming/Suspense nativo e zero tratamento de erro por rota. | HIGH | `app/*/` (todos os diretorios de rota) | 4-6h | O usuario ve tela em branco durante carregamento inicial de cada rota. Sem skeleton nativo do Next.js. Sem fallback de erro por rota. |
| FE-N02 | **Ausencia de skip navigation link** -- Nenhuma ocorrencia de `skip-nav`, `skip-link` ou `skip-to-content` no codebase. Usuarios de teclado/leitor de tela precisam tabular por todos os itens da sidebar antes de chegar ao conteudo. | MEDIUM | `app/layout.tsx` | 0.5h | Acessibilidade: usuarios de teclado nao conseguem pular direto para o conteudo principal. Violacao WCAG 2.4.1. |
| FE-N03 | **Responsividade insuficiente nas paginas internas** -- Alem da sidebar (FE-C02), as proprias paginas tem baixa responsividade. `habitos/page.tsx` tem apenas 19 ocorrencias de breakpoints responsive, `foco/page.tsx` tem 5, `tarefas/page.tsx` tem 13. Para paginas de 1000-2300 linhas, isso indica layouts rigidos. | HIGH | `app/habitos/`, `app/foco/`, `app/tarefas/` | 8-12h | Mesmo implementando navegacao mobile (FE-C02), o conteudo das paginas pode nao se adaptar bem a telas menores. Grid de 3 colunas do Kanban, por exemplo, precisa de scroll horizontal ou coluna unica em mobile. |
| FE-N04 | **Zero Suspense boundaries para streaming** -- Nenhuma ocorrencia de `<Suspense>` nas paginas. Combinado com `"use client"` em todas as paginas, o app nao usa streaming SSR. | MEDIUM | Todas as paginas | 4-6h | Carregamento e tudo-ou-nada: o usuario espera TODO o JavaScript carregar antes de ver qualquer conteudo. Com Suspense, partes criticas poderiam aparecer primeiro. |
| FE-N05 | **Sidebar duplica dados em cada pagina** -- Cada pagina importa `<Sidebar>` diretamente em vez de usar o layout do App Router. Isso causa flash de remontagem ao navegar. | MEDIUM | Todas as paginas protegidas | 3-4h | O usuario percebe um "piscar" da sidebar ao navegar entre paginas, pois o componente e remontado. Deveria ser parte de um layout compartilhado (`app/(protegido)/layout.tsx`). |

---

## Respostas ao Architect

### 1. FE-C02 (Mobile nav): Qual padrao e mais adequado -- bottom tab bar, hamburger menu com drawer, ou ambos?

**Recomendacao: Bottom Tab Bar + Drawer hibrido.**

Justificativa detalhada:

O Builders Performance tem **7 rotas principais** (Inicio, Foco, Tarefas, Habitos, Agenda, Cursos, Perfil) mais subrotas de cursos. Para um app de produtividade com uso frequente e diario, a bottom tab bar e o padrao mais adequado pelo seguinte:

- **Frequencia de uso**: O usuario acessa Foco, Tarefas e Habitos diariamente. Bottom tabs permitem acesso com um unico toque, sem abrir menus.
- **Modelo mental**: Apps de produtividade como Todoist, Notion Mobile, e Forest usam bottom tabs. O usuario ja espera esse padrao.
- **Lei de Fitts**: Bottom tabs ficam na zona de polegar (thumb zone), a area mais acessivel em smartphones.

**Implementacao recomendada:**

```
Bottom Tab Bar (5 tabs fixas):
  [Inicio] [Foco] [Tarefas] [Habitos] [Mais...]

"Mais..." abre um Drawer/Sheet com:
  - Agenda
  - Cursos
  - Perfil
  - Configuracoes
  - Tema (toggle)
  - Sair
```

**Regras de breakpoint:**
- `< 768px` (mobile): Bottom tab bar visivel, sidebar oculta
- `768px - 1023px` (tablet): Bottom tab bar visivel, sidebar oculta (ou drawer lateral)
- `>= 1024px` (desktop): Sidebar visivel, bottom tab bar oculta

**Componente sugerido**: Radix UI nao tem bottom tab bar nativo, entao recomendo implementar com `<nav role="tablist">` semantico + CSS `fixed bottom-0`. O sheet "Mais..." pode usar o componente `Dialogo` ou um novo `Sheet` do shadcn.

**Estimativa ajustada**: 12-16h (incluindo responsividade basica, animacoes, e adaptacao de todas as paginas para o padding inferior do tab bar).

### 2. FE-C01 (God Components): A divisao proposta de habitos faz sentido do ponto de vista UX?

**A proposta do DRAFT esta parcialmente correta mas precisa de ajustes.**

Proposta original: `HabitosList`, `HabitosForm`, `MetasTab`, `ObjetivosBoard`.

**Proposta ajustada baseada na analise do codigo:**

O componente `PaginaHabitos` (2314 linhas) gerencia duas abas (`"individual"` e `"metas"`) com dominios distintos. A extracao ideal e:

```
app/habitos/page.tsx (orquestrador ~150 linhas)
  |
  +-- componentes/habitos/
  |     +-- aba-individual.tsx (~300 linhas)
  |     |     +-- lista-habitos.tsx (lista diaria com check)
  |     |     +-- formulario-habito.tsx (modal criar/editar)
  |     |     +-- historico-habitos.tsx (grid de historico)
  |     |
  |     +-- aba-metas.tsx (~400 linhas)
  |     |     +-- board-objetivos.tsx (kanban DnD de objetivos)
  |     |     +-- board-metas.tsx (kanban DnD de metas anuais)
  |     |     +-- formulario-objetivo.tsx (modal criar/editar)
  |     |     +-- formulario-meta.tsx (modal criar/editar)
  |     |
  |     +-- utilidades-habitos.ts (funcoes puras: mapStatusObjetivoToUI, etc.)
  |     +-- tipos-habitos.ts (tipos locais: AbaHabitos, StatusHabitoUI, etc.)
```

**Fluxos que precisam coexistir**: Nenhum. As abas "individual" e "metas" sao independentes. Nao compartilham estado visual. O unico estado compartilhado e o `user` do `useAuth()` e o estado da sidebar, ambos vindos de contextos superiores.

**Risco de UX na refatoracao**: A troca de aba deve permanecer instantanea (estado local, sem re-fetch). Ao extrair, garantir que cada aba mantenha seu proprio estado React Query e que a troca de aba nao dispare invalidation de queries.

### 3. FE-H01 (Formularios): react-hook-form ou manter useState com labels + Zod inline?

**Recomendacao: Adotar react-hook-form + Zod resolver, mas de forma incremental.**

Analise de tradeoff:

| Criterio | useState + Zod manual | react-hook-form + zodResolver |
|----------|----------------------|------------------------------|
| Bundle size | 0kb adicional | ~9kb (rhf) + ~2kb (resolver) |
| Complexidade de setup | Nenhuma | Moderada (1-2h por formulario) |
| Validacao inline por campo | Manual (muito codigo) | Automatica (field errors) |
| Re-renders por keystroke | Todo o componente | Apenas o campo alterado |
| Acessibilidade | Manual (aria-invalid, etc.) | Automatica (rhf integra com ARIA) |
| Formularios multi-step | Complexo | Nativo (useFormContext) |

**Veredicto**: Com 26 useState apenas no Foco e formularios complexos em Habitos (55+ labels), o custo de manter `useState` manual ja ultrapassou o custo de adotar react-hook-form. O ganho de re-renders reduzidos e especialmente importante nos God Components atuais.

**Plano incremental:**
1. Sprint atual: Instalar `react-hook-form` + `@hookform/resolvers/zod`
2. Novos formularios: Obrigatoriamente com rhf
3. Formularios existentes: Migrar na mesma sprint que a extracao de God Components (FE-C01)
4. Formularios de auth (login, cadastro): Migrar por ultimo (ja funcionam, menor prioridade)

### 4. FE-M03 (prefers-reduced-motion): Quais animacoes devem respeitar?

**Todas as animacoes devem respeitar `prefers-reduced-motion`.** Analise completa:

| Tipo | Localizacao | Quantidade | Acao |
|------|-------------|-----------|------|
| `animate-pulse` | `esqueleto.tsx` (16 variantes) | 16 | Substituir por estatico |
| `animate-in fade-in zoom-in` | `estado-vazio.tsx` | 4 instancias | Remover animacao |
| `transition-colors`, `transition-all` | `sidebar.tsx` | 7 | Reduzir duracao para 0 |
| `transition-[width]` | `criar-conta/page.tsx` (barra progresso) | 1 | Manter (progresso funcional) |
| `data-[state=open]:animate-in` | `sidebar.tsx` (dropdown menu) | 1 | Reduzir duracao para 0 |
| `transition-transform` | sidebar toggle pino tema | 2 | Reduzir duracao para 0 |
| Animacoes Radix UI | Dialogo, MenuSuspenso, Flutuante, Dica | Todas | Reduzir via CSS global |
| Animacoes `tw-animate-css` | Importado em globals.css | Global | Adicionar media query |

**Implementacao recomendada (CSS global em `globals.css`):**

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Esta abordagem cobre TODAS as animacoes de uma vez (CSS e tw-animate-css). Excecao: animacoes funcionais (ex: barra de progresso) devem manter a funcionalidade mas sem transicao suave.

**Estimativa**: 1h para a regra global + 1h para testes manuais = 2h total.

### 5. FE-H04 (Toast): Padronizar em TODAS as mutations ou apenas destrutivas?

**Recomendacao: Toast em TODAS as mutations, com regras diferenciadas.**

Padrao proposto:

| Tipo de Acao | Toast Sucesso | Toast Erro | Exemplo |
|-------------|---------------|------------|---------|
| Criar | Sim (discreto) | Sim (com descricao) | "Habito criado" |
| Atualizar | Sim (discreto) | Sim (com descricao) | "Habito atualizado" |
| Deletar | Sim (com undo) | Sim (com descricao) | "Habito removido" [Desfazer] |
| Toggle (check habito) | Nao (feedback visual inline) | Sim (com descricao) | Checkbox animado |
| Mover (drag-and-drop) | Nao (feedback visual inline) | Sim (com descricao) | Card se move visualmente |
| Acao em lote | Sim (com contagem) | Sim (com descricao) | "3 tarefas movidas" |

**Justificativa**: Acoes de toggle e drag-and-drop ja possuem feedback visual inerente (o checkbox muda, o card se move). Adicionar toast nessas acoes criaria ruido visual. Acoes de CRUD (criar, editar, deletar) nao possuem feedback visual obvio, entao precisam de toast.

**Toasts de erro**: SEMPRE presentes, pois o usuario precisa saber quando algo falhou. O padrao `useTarefas.ts` com `toast.error('Mensagem', { description: ... })` e o correto e deve ser adotado em todos os hooks.

### 6. Contraste WCAG: Validacao de `--muted-foreground` (#6b6b6b)

**Analise completa de contraste:**

| Combinacao | Foreground | Background | Ratio | WCAG AA (4.5:1) | WCAG AAA (7:1) |
|-----------|------------|------------|-------|-----------------|----------------|
| Modo claro: muted-fg sobre background | `#6b6b6b` | `#f6f6f6` | **5.00:1** | PASSA | FALHA |
| Modo claro: muted-fg sobre card | `#6b6b6b` | `#ffffff` | **5.40:1** | PASSA | FALHA |
| Modo claro: muted-fg sobre muted | `#6b6b6b` | `#f5f2ef` | **4.84:1** | PASSA (marginal) | FALHA |
| Modo claro: muted-fg sobre secondary | `#6b6b6b` | `#fff1e6` | **4.88:1** | PASSA (marginal) | FALHA |
| Modo claro: muted-fg sobre accent | `#6b6b6b` | `#fff7ed` | **4.92:1** | PASSA (marginal) | FALHA |
| Modo escuro: muted-fg sobre background | `#a0a0a0` | `#151515` | **7.28:1** | PASSA | PASSA |
| Modo escuro: muted-fg sobre card | `#a0a0a0` | `#1f1f1f` | **6.15:1** | PASSA | FALHA |

**Veredicto**:
- **Modo claro**: Passa WCAG AA em todas as combinacoes, mas com margem muito apertada (4.84-5.40:1). Para texto de 14px (tamanho padrao do app), o minimo e 4.5:1. **ESTA em conformidade AA, mas recomendo ajustar `#6b6b6b` para `#636363` (~5.5:1) para maior margem de seguranca.**
- **Modo escuro**: Excelente contraste. Nenhuma acao necessaria.
- **Combinacao critica nao verificada pelo DRAFT**: `--secondary-foreground: #9a3412` sobre `--secondary: #fff1e6`. Ratio: ~4.8:1. Passa AA, mas tambem com margem apertada.

**Acao recomendada**: Escurecer `--muted-foreground` de `#6b6b6b` para `#5f5f5f` no modo claro. Isso eleva o ratio para ~6.0:1 em todos os backgrounds, garantindo conformidade AA robusta e aproximando-se de AAA.

### 7. Esqueletos (esqueleto.tsx, 584 linhas, 16 variantes): Dividir ou centralizar?

**Recomendacao: Manter centralizado, com pequeno ajuste de organizacao.**

Justificativa:

| Argumento | A favor de dividir | A favor de centralizar |
|-----------|-------------------|----------------------|
| Coesao | Cada esqueleto proximo do componente real | Todos os esqueletos num unico lugar |
| Discoverability | Precisa conhecer o componente | Um unico import `from esqueleto` |
| Consistencia | Risco de divergir em estilo | Garantia de consistencia |
| Tree-shaking | Automatico com named exports | Automatico com named exports |
| Manutencao | 16 arquivos para manter | 1 arquivo para manter |

**O arquivo `esqueleto.tsx` e um caso POSITIVO de centralizacao.** Todos os 16 componentes compartilham:
1. O componente base `Esqueleto` (com `animate-pulse`)
2. O padrao visual de `bg-muted`
3. Espacamento e tamanhos consistentes

Dividir em 16 arquivos criaria overhead de imports sem ganho real. O tree-shaking do Next.js ja elimina variantes nao usadas.

**Unico ajuste recomendado**: Separar em 2 arquivos para melhor organizacao:
- `esqueleto-base.tsx` (~100 linhas): `Esqueleto`, `EsqueletoTexto`, `EsqueletoAvatar`, `EsqueletoBotao`, `EsqueletoInput` -- primitivos reutilizaveis
- `esqueleto-compostos.tsx` (~480 linhas): `EsqueletoCartao`, `EsqueletoKanban`, `EsqueletoLista`, `EsqueletoFormulario`, etc. -- composicoes de dominio
- `index.ts`: Re-exporta tudo para manter a interface de import atual

Isso e LOW priority. Nao adicionar ao sprint atual.

---

## Recomendacoes de Design

### 1. Arquitetura de Componentes: Layout Compartilhado

O problema mais estrutural (FE-N05) e que cada pagina importa `<Sidebar>` individualmente. A solucao correta no Next.js App Router:

```
app/
  (auth)/                    # Grupo sem layout (entrar, criar-conta)
    entrar/page.tsx
    criar-conta/page.tsx
  (protegido)/               # Grupo com sidebar layout
    layout.tsx               # <Sidebar> + <main> aqui, renderizado UMA VEZ
    inicio/page.tsx          # Apenas conteudo, sem sidebar
    foco/page.tsx
    tarefas/page.tsx
    habitos/page.tsx
    agenda/page.tsx
    cursos/page.tsx
    perfil/page.tsx
```

**Beneficios:**
- Sidebar persiste entre navegacoes (zero remontagem)
- Animacoes de sidebar nao "piscam"
- Possibilidade de usar `loading.tsx` por rota
- Reducao de ~20 linhas por pagina (import + render da Sidebar)

### 2. Arquitetura de Estado: Reducer para Foco

O componente `PaginaFoco` com 26 `useState` deve ser refatorado para `useReducer` ou hooks compostos:

```typescript
// hooks/useFocoTimer.ts -- Encapsula toda a logica do timer
function useFocoTimer() {
  // modoSelecionado, duracaoPersonalizada, segundosRestantes,
  // rodando, sessaoIniciada, pausas, pausaAtualInicio, sessaoStartedAt
  // ...
  return { estado, iniciar, pausar, retomar, concluir, resetar }
}

// hooks/useFocoHistorico.ts -- Encapsula historico paginado
function useFocoHistorico(userId: string) {
  // historico, historicoTotal, historicoPagina, carregandoHistorico
  return { historico, total, pagina, carregando, irParaPagina }
}

// hooks/useFocoSessao.ts -- Encapsula persistencia de sessao
function useFocoSessao() {
  // sessionId, sessaoConcluida, xpGanho, levelUp
  return { sessao, completar, cancelar }
}
```

### 3. Componentes de Formulario Padronizados

Criar um componente `<CampoFormulario>` padronizado:

```typescript
// componentes/ui/campo-formulario.tsx
interface PropsCampoFormulario {
  id: string
  label: string
  erro?: string
  obrigatorio?: boolean
  children: React.ReactNode
}

function CampoFormulario({ id, label, erro, obrigatorio, children }: PropsCampoFormulario) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
        {obrigatorio && <span className="text-destructive ml-1" aria-hidden="true">*</span>}
      </label>
      {children}
      {erro && (
        <p className="text-xs text-destructive" role="alert">
          {erro}
        </p>
      )}
    </div>
  )
}
```

### 4. Bottom Tab Bar para Mobile

```typescript
// componentes/layout/navegacao-mobile.tsx
interface PropsNavegacaoMobile {
  className?: string
}

// 5 tabs: Inicio, Foco, Tarefas, Habitos, Mais
// "Mais" abre um Sheet com as rotas secundarias
// Visivel apenas em < 1024px (lg:hidden)
// Safe area padding para iOS (env(safe-area-inset-bottom))
```

### 5. Toast Hook Centralizado

Criar um utilitario padronizado para feedback de mutations:

```typescript
// lib/utilidades-toast.ts
function toastMutation(tipo: 'criar' | 'atualizar' | 'deletar', entidade: string) {
  return {
    onSuccess: () => toast.success(`${entidade} ${verboSucesso[tipo]}`),
    onError: (error: Error) => toast.error(`Erro ao ${verboErro[tipo]} ${entidade}`, {
      description: error.message
    })
  }
}
```

---

## Plano de Refatoracao UX

### Onda 0 -- Quick Wins (1 sprint, ~8h)
Acoes de baixo esforco e alto impacto imediato:

| # | Acao | Horas | Debito |
|---|------|-------|--------|
| 1 | Adicionar `prefers-reduced-motion` global em `globals.css` | 1h | FE-M03 |
| 2 | Ajustar `--muted-foreground` para `#5f5f5f` | 0.5h | Pergunta 6 |
| 3 | Adicionar skip navigation link em `layout.tsx` | 0.5h | FE-N02 |
| 4 | Criar `error.tsx` generico na raiz de `app/` | 1h | FE-H02 (parcial) |
| 5 | Padronizar toast em `useHabitos`, `useAgenda`, `useMetas`, `useCursos` | 3h | FE-H04 |
| 6 | Adicionar `loading.tsx` com esqueletos nas 5 rotas principais | 2h | FE-N01 |

### Onda 1 -- Fundacao Mobile (1 sprint, ~16h)
Pre-requisito para qualquer crescimento de usuarios mobile:

| # | Acao | Horas | Debito |
|---|------|-------|--------|
| 1 | Implementar bottom tab bar + drawer "Mais" | 10h | FE-C02 |
| 2 | Adaptar padding de `<main>` para bottom tab bar | 2h | FE-C02 |
| 3 | Ajustar responsividade basica das paginas internas | 4h | FE-N03 |

### Onda 2 -- Reestruturacao de Layout (1 sprint, ~12h)
Prerequisito para refatoracao de God Components:

| # | Acao | Horas | Debito |
|---|------|-------|--------|
| 1 | Criar route groups `(auth)` e `(protegido)` | 4h | FE-N05 |
| 2 | Mover Sidebar para layout compartilhado | 2h | FE-N05 |
| 3 | Adicionar `error.tsx` + `loading.tsx` por rota | 3h | FE-H02, FE-N01 |
| 4 | Instalar e configurar react-hook-form + zodResolver | 1h | FE-H01 |
| 5 | Criar componente `CampoFormulario` padronizado | 2h | FE-H01 |

### Onda 3 -- Extracao de God Components (2 sprints, ~32h)
Maior esforco, maior retorno:

| # | Acao | Horas | Debito |
|---|------|-------|--------|
| 1 | Extrair `useFocoTimer`, `useFocoHistorico`, `useFocoSessao` | 6h | FE-M02 |
| 2 | Dividir `foco/page.tsx` em 5 componentes | 4h | FE-C01 |
| 3 | Extrair aba-individual e aba-metas de `habitos/page.tsx` | 8h | FE-C01 |
| 4 | Extrair sub-componentes de `tarefas/page.tsx` | 4h | FE-C01 |
| 5 | Extrair sub-componentes de `agenda/page.tsx` | 4h | FE-C01 |
| 6 | Criar schemas Zod para habitos, metas, eventos | 6h | FE-H03 |

### Onda 4 -- Performance e Polish (1 sprint, ~14h)
Otimizacoes que dependem das ondas anteriores:

| # | Acao | Horas | Debito |
|---|------|-------|--------|
| 1 | Code splitting com `dynamic()` para modais e DnD | 6h | FE-C03 |
| 2 | Migrar shells estaticos para Server Components | 4h | FE-C04 |
| 3 | Adicionar Suspense boundaries para streaming | 2h | FE-N04 |
| 4 | Aplicar React.memo nos sub-componentes extraidos | 2h | FE-L01 |

### Totais por Onda

| Onda | Sprints | Horas | Debitos Resolvidos |
|------|---------|-------|-------------------|
| 0 - Quick Wins | 0.5 | 8h | FE-M03, FE-N02, FE-H02 (parcial), FE-H04, FE-N01 |
| 1 - Mobile | 1 | 16h | FE-C02, FE-N03 |
| 2 - Layout | 1 | 12h | FE-N05, FE-H02, FE-N01, FE-H01 (parcial) |
| 3 - God Components | 2 | 32h | FE-C01, FE-M02, FE-H03 |
| 4 - Performance | 1 | 14h | FE-C03, FE-C04, FE-N04, FE-L01 |
| **Total** | **~5.5** | **~82h** | **17 debitos** |

### Ordem de Prioridade vs DRAFT

O DRAFT coloca FE-C01 (God Components) na Onda 4 e FE-C02 (Mobile) tambem na Onda 4. Discordo parcialmente:

- **FE-C02 (Mobile)** deve ser Onda 1 (nao Onda 4). Se o app tem ambicao de ser usado no dia a dia (produtividade), mobile e pre-requisito. Sem navegacao mobile, nenhum usuario de smartphone consegue usar o app. Isso e bloqueante para growth.

- **FE-C01 (God Components)** pode ir na Onda 3 como proposto no DRAFT, mas DEVE vir DEPOIS do layout compartilhado (Onda 2). Extrair componentes de paginas que ainda importam Sidebar individualmente cria retrabalho.

- **Quick Wins (Onda 0)** nao existem no DRAFT e sao fundamentais. Acoes de 0.5-3h que melhoram acessibilidade e consistencia imediatamente.

---

*Revisao concluida por @ux-design-expert -- 2026-01-29*
*Status: APROVADO COM AJUSTES -- Documento DRAFT pode prosseguir para consolidacao final incorporando as alteracoes de severidade e debitos adicionados.*
