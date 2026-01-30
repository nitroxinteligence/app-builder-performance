# Especificacao Frontend & UX - Builders Performance

**Versao:** 1.0.0
**Data:** 2026-01-29
**Autor:** Equipe de Arquitetura Frontend
**Projeto:** Builders Performance

---

## Sumario

1. [Arquitetura de Componentes](#1-arquitetura-de-componentes)
2. [Design System](#2-design-system)
3. [Fluxos de Experiencia do Usuario](#3-fluxos-de-experiencia-do-usuario)
4. [Acessibilidade](#4-acessibilidade)
5. [Performance Frontend](#5-performance-frontend)
6. [Gerenciamento de Estado](#6-gerenciamento-de-estado)
7. [Divida Tecnica Frontend](#7-divida-tecnica-frontend)

---

## 1. Arquitetura de Componentes

### 1.1 Estrutura Geral

O projeto segue a convencao do Next.js 16.1.1 App Router com nomenclatura em portugues. A organizacao de diretorios e:

```
app/                        # Rotas (App Router)
componentes/                # Componentes reutilizaveis
  ui/                       # Primitivos UI (shadcn/Radix)
  layout/                   # Componentes de layout (Sidebar)
  erro/                     # Error Boundary
  tema/                     # Provedores de tema
hooks/                      # Custom hooks (dados + logica)
lib/                        # Utilidades, schemas, providers
  schemas/                  # Validacao Zod
  providers/                # Context providers (Auth, Query)
  supabase/                 # Clientes Supabase (browser/server)
types/                      # Tipos TypeScript
```

**Configuracao shadcn** (`/Users/mateusmpz/Documents/Projetos Clientes - Code/app-builder-performance/components.json`):
- Estilo: `new-york`
- Aliases: `@/componentes` (componentes), `@/componentes/ui` (UI), `@/lib/utilidades` (utils), `@/hooks` (hooks)
- Tailwind CSS 4 com variaveis CSS customizadas

### 1.2 Componentes UI (17 componentes)

Todos os componentes UI estao em `/Users/mateusmpz/Documents/Projetos Clientes - Code/app-builder-performance/componentes/ui/` e seguem o padrao shadcn com nomes em portugues:

| Componente | Arquivo | Base Radix | Descricao |
|---|---|---|---|
| Botao | `botao.tsx` | `@radix-ui/react-slot` | Botao com variantes CVA (default, destructive, outline, ghost, secondary) e tamanhos (default, sm, lg, icon) |
| Cartao | `cartao.tsx` | -- | Familia de cartoes: Cartao, CartaoCabecalho, CartaoTitulo, CartaoDescricao, CartaoConteudo, CartaoRodape |
| Dialogo | `dialogo.tsx` | `@radix-ui/react-dialog` | Modais e dialogos |
| DialogoAlerta | `dialogo-alerta.tsx` | `@radix-ui/react-alert-dialog` | Dialogos de confirmacao destrutiva |
| Seletor | `seletor.tsx` | `@radix-ui/react-select` | Select/dropdown |
| MenuSuspenso | `menu-suspenso.tsx` | `@radix-ui/react-dropdown-menu` | Menu dropdown contextual |
| Colapsavel | `colapsavel.tsx` | `@radix-ui/react-collapsible` | Secoes colapsaveis |
| Dica | `dica.tsx` | `@radix-ui/react-tooltip` | Tooltips |
| Flutuante | `flutuante.tsx` | `@radix-ui/react-popover` | Popovers flutuantes |
| CaixaSelecao | `caixa-selecao.tsx` | `@radix-ui/react-checkbox` | Checkbox |
| Progresso | `progresso.tsx` | `@radix-ui/react-progress` | Barras de progresso |
| Separador | `separador.tsx` | `@radix-ui/react-separator` | Separadores visuais |
| Calendario | `calendario.tsx` | `react-day-picker` | Widget de calendario |
| Esqueleto | `esqueleto.tsx` | -- | **16 variantes** de esqueletos de carregamento (584 linhas) |
| EstadoVazio | `estado-vazio.tsx` | -- | Estados vazios com animacoes de entrada |
| Confirmar | `confirmar.tsx` | -- | Dialogo de confirmacao via hook |
| Toaster | `toaster.tsx` | `sonner` | Notificacoes toast |

**Destaque positivo**: A biblioteca de esqueletos (`esqueleto.tsx`, 584 linhas) e extremamente completa com 16 componentes exportados: `Esqueleto`, `EsqueletoTexto`, `EsqueletoCartao`, `EsqueletoCartaoKanban`, `EsqueletoColunaKanban`, `EsqueletoKanban`, `EsqueletoItemLista`, `EsqueletoLista`, `EsqueletoAvatar`, `EsqueletoBotao`, `EsqueletoInput`, `EsqueletoFormulario`, `EsqueletoTabela`, `EsqueletoEstatistica`, `EsqueletoGradeEstatisticas`, `EsqueletoNavegacaoLateral`, `EsqueletoCabecalhoPagina`.

### 1.3 Componentes de Rota (Pages)

**PROBLEMA CRITICO: Quase todas as paginas usam `"use client"`.**

De 17 arquivos com `"use client"` encontrados no diretorio `app/`, apenas 2 paginas sao Server Components puros:
- `/Users/mateusmpz/Documents/Projetos Clientes - Code/app-builder-performance/app/page.tsx` (5 linhas, redirecionamento)
- `/Users/mateusmpz/Documents/Projetos Clientes - Code/app-builder-performance/app/not-found.tsx` (46 linhas, pagina 404)

Unico arquivo com `"use server"`: `/Users/mateusmpz/Documents/Projetos Clientes - Code/app-builder-performance/app/foco/actions.ts`

| Pagina | Arquivo | Linhas | Tipo | Status |
|---|---|---|---|---|
| Foco (Pomodoro) | `app/foco/page.tsx` | **1.282** | Client | **CRITICO - God Component** |
| Habitos | `app/habitos/page.tsx` | **2.161** | Client | **CRITICO - Maior arquivo** |
| Tarefas (Kanban) | `app/tarefas/page.tsx` | **1.063** | Client | **CRITICO - Excede 800 linhas** |
| Agenda | `app/agenda/page.tsx` | 864 | Client | **ATENCAO - Excede 800 linhas** |
| Dashboard | `app/inicio/page.tsx` | 616 | Client | OK |
| Criar Conta | `app/criar-conta/page.tsx` | 506 | Client | OK |
| Perfil | `app/perfil/page.tsx` | 331 | Client | OK |
| Cursos | `app/cursos/page.tsx` | 325 | Client | OK |
| Login | `app/entrar/page.tsx` | 257 | Client | OK |
| Redefinir Senha | `app/redefinir-senha/page.tsx` | 208 | Client | OK |
| Recuperar Senha | `app/recuperar-senha/page.tsx` | 154 | Client | OK |

### 1.4 Componentes de Layout

**Sidebar** (`/Users/mateusmpz/Documents/Projetos Clientes - Code/app-builder-performance/componentes/layout/sidebar.tsx`, 324 linhas):
- Colapsavel: 56px (fechada) / 224px (aberta)
- Tooltips quando fechada para manter acessibilidade
- Toggle de tema integrado (escuro/claro)
- Menu de perfil com dropdown (Configuracoes, Notificacoes, Tema, Perfil, Sair)
- Dados do menu vindos de `app/inicio/dados-dashboard.ts`

**PROBLEMA CRITICO**: `hidden lg:flex` na linha 105 - a sidebar e completamente oculta em telas menores que `lg` (1024px). **Nao existe navegacao mobile** (hamburger menu, bottom tab bar, drawer, etc.). Usuarios em dispositivos moveis nao conseguem navegar entre paginas.

### 1.5 Error Boundary

**Arquivo**: `/Users/mateusmpz/Documents/Projetos Clientes - Code/app-builder-performance/componentes/erro/error-boundary.tsx` (133 linhas)

Apenas 2 das 11 paginas principais usam ErrorBoundary:
- `app/tarefas/page.tsx` (linhas 371 e 1060)
- `app/inicio/page.tsx` (linhas 611 e 613)

**Paginas sem ErrorBoundary**: foco, habitos, agenda, cursos, perfil, entrar, criar-conta, recuperar-senha, redefinir-senha.

---

## 2. Design System

### 2.1 Paleta de Cores

Definida via variaveis CSS em `/Users/mateusmpz/Documents/Projetos Clientes - Code/app-builder-performance/app/globals.css`.

**Modo Claro (`:root`, linhas 49-83):**

| Token | Valor | Uso |
|---|---|---|
| `--primary` | `#f97316` (Laranja 500) | Cor principal, CTA, ring de foco |
| `--primary-foreground` | `#ffffff` | Texto sobre primary |
| `--background` | `#f6f6f6` | Fundo da aplicacao |
| `--foreground` | `#1f1f1f` | Texto principal |
| `--card` | `#ffffff` | Fundo de cartoes |
| `--secondary` | `#fff1e6` | Fundo de botoes secundarios, badges |
| `--secondary-foreground` | `#9a3412` (Laranja 800) | Texto sobre secondary |
| `--muted` | `#f5f2ef` | Fundos sutis |
| `--muted-foreground` | `#6b6b6b` | Texto secundario |
| `--accent` | `#fff7ed` | Fundos de destaque |
| `--destructive` | `#ef4444` (Vermelho 500) | Acoes destrutivas |
| `--border` | `#eeeeee` | Bordas |
| `--borda-cartao` | `#eeeeee` | Bordas de cartoes (customizado) |

**Modo Escuro (`.dark`, linhas 85-118):**

| Token | Valor Escuro | Diferenca |
|---|---|---|
| `--primary` | `#fb923c` (Laranja 400) | Mais claro para contraste |
| `--primary-foreground` | `#151515` | Texto escuro sobre primary |
| `--background` | `#151515` | Fundo escuro |
| `--foreground` | `#f5f5f5` | Texto claro |
| `--card` | `#1f1f1f` | Cartoes escuros |
| `--secondary` | `#2a1d16` | Tom marrom escuro |
| `--secondary-foreground` | `#fdba74` (Laranja 300) | Texto laranja claro |
| `--muted` | `#201d1b` | Fundo sutil escuro |
| `--border` | `#2a2a2a` | Bordas escuras |

**Cores de graficos**: `chart-1` a `chart-5` seguem a paleta laranja/ambar.

### 2.2 Tipografia

Definida em `/Users/mateusmpz/Documents/Projetos Clientes - Code/app-builder-performance/app/layout.tsx` (linhas 12-22):

| Fonte | Familia | Variavel CSS | Uso |
|---|---|---|---|
| **Manrope** | Sans-serif | `--fonte-corpo` | Corpo de texto, interface geral |
| **Sora** | Sans-serif | `--fonte-titulo` | Titulos, headings |

Ambas com `display: "swap"` para otimizacao de carregamento e `subsets: ["latin"]`.

Classe utilitaria: `font-titulo` (Sora) e `font-sans` (Manrope via `--font-sans`).

### 2.3 Espacamento e Arredondamento

Definido em `globals.css` (linhas 40-46):

```
--radius: 1rem (16px)
--radius-sm: calc(var(--radius) - 4px) = 12px
--radius-md: calc(var(--radius) - 2px) = 14px
--radius-lg: var(--radius) = 16px
--radius-xl: calc(var(--radius) + 4px) = 20px
--radius-2xl: calc(var(--radius) + 8px) = 24px
--radius-3xl: calc(var(--radius) + 12px) = 28px
--radius-4xl: calc(var(--radius) + 16px) = 32px
```

### 2.4 Dark Mode

Implementacao via `next-themes` com classe CSS:
- `@custom-variant dark (&:is(.dark *));` em `globals.css` (linha 4)
- `suppressHydrationWarning` no `<html>` e `<body>` em `layout.tsx` (linhas 36, 44)
- Toggle via `ProvedorTema` em `componentes/tema/provedor-tema.tsx`
- Toggle visual na sidebar (menu do usuario)

**Status**: Totalmente implementado com paleta completa de cores para ambos os modos.

### 2.5 Estilos Customizados

**Scrollbar Kanban** (`globals.css`, linhas 129-168):
- `scrollbar-width: thin` (Firefox)
- Personalizado com `::-webkit-scrollbar` para Chrome/Safari
- Largura: 6px
- Suporte a tema escuro com cores distintas

---

## 3. Fluxos de Experiencia do Usuario

### 3.1 Fluxo de Autenticacao

**Middleware** (`/Users/mateusmpz/Documents/Projetos Clientes - Code/app-builder-performance/middleware.ts`):

```
Rotas protegidas: /foco, /tarefas, /agenda, /habitos, /onboarding,
                  /inicio, /perfil, /assistente, /cursos

Rotas de auth: /entrar, /criar-conta

Logica:
  Usuario NAO autenticado + rota protegida → redireciona para /entrar?redirectTo={rota}
  Usuario autenticado + rota de auth → redireciona para /foco
  Rota raiz (/) → redireciona para /onboarding (via app/page.tsx)
```

**Login** (`app/entrar/page.tsx`, 257 linhas):
1. Formulario com email e senha (inputs raw HTML)
2. OAuth: Google e Apple (botoes com SVG inline)
3. Link para "Esqueceu a senha?"
4. Link para criar conta
5. Feedback de erro via alerta vermelho (classe `bg-rose-50`)

**Cadastro** (`app/criar-conta/page.tsx`, 506 linhas):
1. Etapa "perfil": nome completo, telefone (com formatacao manual), email
2. Etapa "papel": selecao de papel (Atleta, Estudante, Profissional, Empreendedor) via CaixaSelecao
3. Etapa "email-enviado": senha + confirmacao, envio do formulario
4. Etapa "email-confirmando": verificacao de email pendente
5. Etapa "email-confirmado": sucesso, redirecionamento

Barra de progresso animada entre etapas com `transition-[width]`.

**Recuperacao de Senha** (`app/recuperar-senha/page.tsx`, 154 linhas):
1. Input de email
2. Envio de email de recuperacao
3. Tela de confirmacao com instrucoes

**Redefinicao de Senha** (`app/redefinir-senha/page.tsx`, 208 linhas):
1. Nova senha + confirmacao
2. Validacao de match entre senhas
3. Redirecionamento apos sucesso

**Auth Provider** (`/Users/mateusmpz/Documents/Projetos Clientes - Code/app-builder-performance/lib/providers/auth-provider.tsx`, 65 linhas):
- Context com `user`, `session`, `isLoading`, `signOut`
- Escuta `onAuthStateChange` do Supabase
- Exposicao via `useAuth()` hook

### 3.2 Navegacao

**Hierarquia de rotas**:
```
/onboarding          → Fluxo inicial
/inicio              → Dashboard (home)
/foco                → Timer Pomodoro/Deep Work
/tarefas             → Quadro Kanban
/habitos             → Rastreamento de habitos
/agenda              → Calendario
/cursos              → Catalogo de cursos
/cursos/[curso]      → Detalhe do curso
/cursos/[curso]/[aula] → Player de aula
/perfil              → Configuracoes do perfil
/assistente          → Assistente IA
```

**Sidebar** (desktop-only): navegacao fixa lateral com secoes agrupadas, tooltips ao colapsar, toggle de tema, menu de usuario.

### 3.3 Fluxos Principais

**Foco (Pomodoro)**: Selecao de modo (Pomodoro 25min, Deep Work 50min, Sprint 15min, Custom) → Selecao de tarefa opcional → Iniciar timer → Pausar/Retomar → Completar sessao → Modal XP/Level-up → Historico paginado.

**Tarefas (Kanban)**: Criar tarefa (modal com titulo, descricao, prioridade, data) → Arrastar entre colunas (backlog, a_fazer, em_andamento, concluido) → Editar tarefa (modal) → Deletar tarefa (confirmacao) → Busca por titulo.

**Habitos**: Criar habito com categoria → Check diario → Streaks → Historico → Metas e objetivos de desenvolvimento (drag-and-drop para reordenar).

**Cursos**: Catalogo com filtro por categoria → Busca → Secoes: "Continue assistindo", "Em destaque", "Novos conteudos" (bloqueados), "Catalogo completo" → Detalhe do curso com modulos e aulas → Player de aula.

**Dashboard**: Modal de "Inicio Diario" (a cada 24h via localStorage) → Cards de resumo (tarefas, foco, habitos, streaks) → Progresso semanal → Missoes diarias/semanais → Gamificacao (nivel, XP).

### 3.4 Provedores (Provider Tree)

Definido em `/Users/mateusmpz/Documents/Projetos Clientes - Code/app-builder-performance/app/layout.tsx` (linhas 45-50):

```
<QueryProvider>           ← TanStack React Query
  <AuthProvider>          ← Supabase Auth Context
    <ProvedorTema>        ← next-themes (dark/light)
      {children}
    </ProvedorTema>
    <ProvedorToast />     ← Sonner toasts (irmao, nao filho)
  </AuthProvider>
</QueryProvider>
```

---

## 4. Acessibilidade

### 4.1 Estado Atual

**Pontos positivos encontrados:**

1. **ARIA na Sidebar** (`componentes/layout/sidebar.tsx`):
   - `aria-label="Menu principal"` na `<nav>` (linha 179)
   - `aria-label` em cada link de navegacao (linha 194)
   - `aria-current="page"` no link ativo (linha 195)
   - `aria-hidden="true"` nos icones decorativos (linhas 140, 163, 208, etc.)
   - `sr-only` para texto acessivel quando sidebar esta colapsada (linhas 95, 222)
   - `aria-label="Abrir menu do usuario"` no botao de perfil (linha 73)
   - `aria-label="Fechar barra lateral"` e `"Abrir barra lateral"` (linhas 137, 160)

2. **91 ocorrencias de `aria-` ou `role=`** em 15 arquivos dentro de `app/`

3. **Idioma**: `lang="pt-BR"` no `<html>` (layout.tsx, linha 36)

4. **Fontes**: `display: "swap"` para evitar FOIT (Flash of Invisible Text)

**Problemas identificados:**

1. **Sem navegacao mobile** - Usuarios de dispositivos moveis/tablets nao tem como navegar. Sidebar usa `hidden lg:flex` (linha 105 de sidebar.tsx). Nao existe hamburger menu, bottom tab bar, ou drawer mobile.

2. **Formularios sem labels semanticos** - As paginas de login e cadastro usam `<input>` raw sem `<label>` associado. Os placeholders servem como unica indicacao visual, o que e insuficiente para leitores de tela.

3. **Foco e teclado** - Nao ha evidencia de gerenciamento de foco apos navegacao ou abertura de modais (focus trap e gerenciado pelo Radix Dialog internamente, mas a implementacao customizada na pagina de foco nao utiliza Radix).

4. **Contraste de cores** - A cor `--muted-foreground: #6b6b6b` sobre `--background: #f6f6f6` pode nao atingir o ratio minimo de 4.5:1 exigido pela WCAG AA para texto normal.

5. **Animacoes** - Nao ha `prefers-reduced-motion` para desabilitar animacoes para usuarios sensiveis.

### 4.2 Recomendacoes

1. Implementar navegacao mobile (bottom tab bar ou drawer)
2. Adicionar `<label>` semanticos aos formularios
3. Implementar `prefers-reduced-motion` para todas as animacoes
4. Verificar ratios de contraste WCAG AA para todas as combinacoes de cores
5. Adicionar skip navigation link
6. Testar com leitores de tela (VoiceOver, NVDA)

---

## 5. Performance Frontend

### 5.1 Analise Atual

**Problemas identificados:**

1. **Zero code splitting / dynamic imports**:
   Nenhuma ocorrencia de `React.lazy()`, `dynamic()` ou imports dinamicos encontrada em todo o projeto. Todas as paginas client-side carregam todo o JavaScript necessario de uma vez.

2. **Zero uso de `next/image`**:
   A unica referencia a `next/image` e a declaracao de tipos em `next-env.d.ts`. Nenhuma pagina utiliza o componente `Image` do Next.js para otimizacao automatica (lazy loading, responsive sizes, WebP/AVIF).

3. **Excesso de "use client"**:
   17 arquivos com `"use client"` contra apenas 1 com `"use server"` (`app/foco/actions.ts`). Isso elimina os beneficios de Server Components (streaming, reducao de JavaScript no cliente, acesso direto ao servidor).

4. **Arquivos gigantes** (JavaScript bundle):
   - `app/habitos/page.tsx`: **2.161 linhas** (quase 3x o limite de 800)
   - `app/foco/page.tsx`: **1.282 linhas** com 26 chamadas `useState`
   - `app/tarefas/page.tsx`: **1.063 linhas**
   - `app/agenda/page.tsx`: **864 linhas**

5. **`console.error` em producao**:
   6 ocorrencias em `/Users/mateusmpz/Documents/Projetos Clientes - Code/app-builder-performance/lib/supabase/auth.ts` (linhas 38, 71, 94, 119, 144, 174). Devem ser substituidos por logging estruturado ou removidos.

**Pontos positivos:**

1. **React.memo** usado em `app/inicio/page.tsx` para 4 sub-componentes (linhas 57, 86, 119, 137): `CartaoResumo`, `ItemMissaoDiaria`, `ItemMissaoSemanal`, `ItemProgressoSemanal`.

2. **useCallback/useMemo**: 29 ocorrencias em 8 arquivos dentro de `app/`. Presente nas paginas mais complexas (tarefas: 6, foco: 6, habitos: 7).

3. **Stale time no React Query**: `staleTime: 1000 * 60 * 5` (5 minutos) configurado nos hooks principais, reduzindo refetches desnecessarios.

4. **Font display swap**: Fontes Manrope e Sora com `display: "swap"` para evitar bloqueio de renderizacao.

### 5.2 Metricas Estimadas de Impacto

| Problema | Impacto em LCP | Impacto em FID/INP | Impacto em CLS |
|---|---|---|---|
| Zero code splitting | Alto | Alto | Nenhum |
| Zero next/image | Alto (se houver imagens) | Baixo | Alto |
| Excesso de "use client" | Medio | Alto | Baixo |
| Arquivos gigantes | Alto | Alto | Nenhum |

### 5.3 Recomendacoes

1. **Implementar code splitting**: `dynamic()` do Next.js para modais, graficos e componentes pesados
2. **Migrar para Server Components**: Pelo menos as partes estaticas das paginas (headers, layout, metadata)
3. **Usar `next/image`**: Para qualquer imagem futura (avatares, thumbnails de cursos, etc.)
4. **Extrair sub-componentes**: Dividir foco, habitos, tarefas e agenda em componentes menores
5. **Remover console.error**: Substituir por error reporting service (Sentry, LogRocket)

---

## 6. Gerenciamento de Estado

### 6.1 Arquitetura de Estado

O projeto utiliza uma arquitetura de estado dividida em tres camadas:

```
Estado do Servidor (React Query)
  ↕ Sincronizacao via hooks customizados
Estado Local (useState/useReducer)
  ↕ Props e contexto
Estado de UI (React Context)
```

### 6.2 React Query (Estado do Servidor)

Cada dominio de dados possui seu proprio hook em `/Users/mateusmpz/Documents/Projetos Clientes - Code/app-builder-performance/hooks/`:

| Hook | Arquivo | Linhas | Queries | Mutations | Optimistic Updates |
|---|---|---|---|---|---|
| useTarefas | `useTarefas.ts` | 288 | 2 | 5 | Sim (`useMoverTarefa`) |
| useHabitos | `useHabitos.ts` | 401 | 3+ | 4+ | Nao |
| useDashboard | `useDashboard.ts` | 504 | 4 | 0 | N/A |
| useAgenda | `useAgenda.ts` | 208 | 3 | 3 | Nao |
| useCursos | `useCursos.ts` | 381 | 2 | 1 | Nao |
| usePendencias | `usePendencias.ts` | 173 | 1 | 3 | Nao |
| useMetas | `useMetas.ts` | 693 | 4+ | 6+ | Sim (`useMoverObjetivo`) |
| useConfirmar | `useConfirmar.ts` | 86 | 0 | 0 | N/A |

**Padrao canonico** (implementado em `useTarefas.ts`):
```
Query Keys → Fetch Functions → useQuery → useMutation com:
  onMutate: (optimistic update + salvar estado anterior)
  onError: (rollback com estado anterior)
  onSuccess: (toast de sucesso)
  onSettled: (invalidateQueries)
```

**Inconsistencia**: `useTarefas` e `usePendencias` usam `toast` para feedback, mas `useHabitos` e `useAgenda` nao possuem toasts em suas mutations.

### 6.3 Validacao com Zod

Schemas em `/Users/mateusmpz/Documents/Projetos Clientes - Code/app-builder-performance/lib/schemas/tarefa.ts` (65 linhas):

Enums validados: `prioridadeSchema`, `colunaKanbanSchema`, `statusTarefaSchema`
Schemas de criacao: `tarefaCreateSchema`, `pendenciaCreateSchema`
Schemas de atualizacao: `tarefaUpdateSchema`, `pendenciaUpdateSchema`

**Problema**: Apenas tarefas e pendencias possuem schemas Zod. Habitos, eventos, metas e cursos nao possuem validacao Zod antes de enviar ao Supabase.

### 6.4 Estado Local

**Pagina de Foco** (`app/foco/page.tsx`) - **26 chamadas `useState`**:

Este e o exemplo mais grave de estado local descontrolado. Um unico componente gerencia: timer state, session state, UI state (modais), history state, pagination state, stats state, audio state, form state. Deveria ser dividido em:
1. `useFocoTimer()` - logica do timer
2. `useFocoSession()` - gerenciamento de sessao
3. `useFocoHistory()` - historico paginado
4. `useFocoStats()` - estatisticas

### 6.5 React Context

Apenas dois contextos globais:
1. **AuthContext** (`lib/providers/auth-provider.tsx`): `user`, `session`, `isLoading`, `signOut`
2. **ThemeContext** (via `next-themes`): tema claro/escuro

Nao ha uso excessivo de contexto. Estado global e mantido no React Query.

### 6.6 Estado Persistido

- **localStorage**: Usado na pagina de foco para persistir sessao ativa e na pagina de dashboard para controlar exibicao do modal "Inicio Diario" (24h cooldown)
- **sendBeacon**: Usado na pagina de foco (`beforeunload`) para salvar sessao ao fechar o navegador

---

## 7. Divida Tecnica Frontend

### 7.1 Classificacao por Severidade

#### CRITICA (Bloqueia crescimento e qualidade)

| # | Problema | Arquivos Afetados | Impacto |
|---|---|---|---|
| DT-01 | **God Components**: Paginas com mais de 800 linhas violam principio de responsabilidade unica | `habitos/page.tsx` (2161), `foco/page.tsx` (1282), `tarefas/page.tsx` (1063), `agenda/page.tsx` (864) | Manutencao impossivel, bugs dificeis de rastrear, re-renders excessivos |
| DT-02 | **Navegacao mobile inexistente**: Sidebar usa `hidden lg:flex`, sem alternativa mobile | `componentes/layout/sidebar.tsx` (linha 105) | Aplicacao inacessivel em dispositivos moveis e tablets |
| DT-03 | **Zero code splitting**: Nenhum `dynamic()` ou `React.lazy()` em todo o projeto | Todos os arquivos em `app/` | Bundle JavaScript inicial excessivamente grande |
| DT-04 | **Excesso de "use client"**: 17 arquivos client-side vs 1 "use server" | Todas as paginas em `app/` | Perde beneficios de RSC, mais JavaScript no cliente |

#### ALTA (Afeta qualidade e consistencia)

| # | Problema | Arquivos Afetados | Impacto |
|---|---|---|---|
| DT-05 | **Sem formularios estruturados**: Inputs raw HTML sem react-hook-form, sem labels semanticos | `entrar/page.tsx`, `criar-conta/page.tsx`, `perfil/page.tsx`, `agenda/page.tsx`, `foco/page.tsx`, `tarefas/page.tsx` | Acessibilidade comprometida, validacao inconsistente, UX de formularios pobre |
| DT-06 | **ErrorBoundary inconsistente**: Apenas 2 de 11 paginas usam ErrorBoundary | Paginas sem: foco, habitos, agenda, cursos, perfil, auth pages | Erros nao capturados crasham toda a aplicacao |
| DT-07 | **Validacao Zod incompleta**: Apenas tarefas e pendencias possuem schemas | `hooks/useHabitos.ts`, `hooks/useAgenda.ts`, `hooks/useMetas.ts` | Dados invalidos podem chegar ao banco |
| DT-08 | **Toast inconsistente**: Algumas mutations usam toast, outras nao | `useHabitos.ts` (sem toast), `useAgenda.ts` (sem toast) vs `useTarefas.ts` (com toast) | Feedback inconsistente para o usuario |

#### MEDIA (Melhoria de qualidade)

| # | Problema | Arquivos Afetados | Impacto |
|---|---|---|---|
| DT-09 | **console.error em producao**: 6 ocorrencias em auth.ts | `lib/supabase/auth.ts` (linhas 38, 71, 94, 119, 144, 174) | Vazamento de informacoes em producao |
| DT-10 | **Zero next/image**: Nenhum uso do componente Image otimizado | Todo o projeto | Imagens futuras sem otimizacao automatica |
| DT-11 | **Estado local descontrolado no Foco**: 26 useState em um unico componente | `app/foco/page.tsx` | Complexidade cognitiva extrema, dificil testar |
| DT-12 | **Falta prefers-reduced-motion**: Animacoes sem respeitar preferencia do usuario | `componentes/ui/estado-vazio.tsx`, animacoes em geral | Acessibilidade para usuarios sensiveis a movimento |

#### BAIXA (Melhorias futuras)

| # | Problema | Arquivos Afetados | Impacto |
|---|---|---|---|
| DT-13 | **React.memo limitado**: Apenas 4 componentes memoizados no dashboard | `app/inicio/page.tsx` | Re-renders desnecessarios em listas longas |
| DT-14 | **SVG inline no login**: Icone do Google como SVG inline | `app/entrar/page.tsx` | Dificil manutencao e reutilizacao |

### 7.2 Plano de Refatoracao Sugerido

**Fase 1 - Navegacao Mobile (DT-02)**: Prioridade maxima. Implementar bottom tab bar ou drawer navigation para `< lg`.

**Fase 2 - Quebrar God Components (DT-01)**:
- `app/habitos/page.tsx` → Extrair: `HabitosList`, `HabitosForm`, `MetasTab`, `ObjetivosBoard`, `HabitosHistorico`
- `app/foco/page.tsx` → Extrair: `FocoTimer`, `FocoControls`, `FocoHistory`, `FocoStats`, `FocoModals` + hooks `useFocoTimer`, `useFocoSession`
- `app/tarefas/page.tsx` → Extrair: `KanbanColumn`, `TaskCard`, `TaskModals`, `PendenciasModal`
- `app/agenda/page.tsx` → Extrair: `DayView`, `CalendarWidget`, `EventModals`, `UpcomingEvents`

**Fase 3 - ErrorBoundary e Formularios (DT-05, DT-06)**:
- Adicionar ErrorBoundary em todas as paginas
- Considerar adotar `react-hook-form` + Zod para formularios
- Adicionar `<label>` semanticos

**Fase 4 - Performance (DT-03, DT-04)**:
- Implementar `dynamic()` para modais e componentes pesados
- Migrar partes estaticas para Server Components
- Implementar code splitting por rota

**Fase 5 - Consistencia (DT-07, DT-08, DT-09)**:
- Criar schemas Zod para todos os dominios
- Padronizar toast feedback em todas as mutations
- Remover console.error e implementar error reporting

---

## Apendice A: Inventario de Arquivos Frontend

### Paginas (app/)

| Arquivo | Linhas | Tipo |
|---|---|---|
| `app/page.tsx` | 5 | Server |
| `app/not-found.tsx` | 46 | Server |
| `app/layout.tsx` | 55 | Server |
| `app/entrar/page.tsx` | 257 | Client |
| `app/criar-conta/page.tsx` | 506 | Client |
| `app/recuperar-senha/page.tsx` | 154 | Client |
| `app/redefinir-senha/page.tsx` | 208 | Client |
| `app/onboarding/page.tsx` | 13 | Client |
| `app/inicio/page.tsx` | 616 | Client |
| `app/foco/page.tsx` | 1282 | Client |
| `app/tarefas/page.tsx` | 1063 | Client |
| `app/habitos/page.tsx` | 2161 | Client |
| `app/agenda/page.tsx` | 864 | Client |
| `app/cursos/page.tsx` | 325 | Client |
| `app/perfil/page.tsx` | 331 | Client |

### Hooks (hooks/)

| Arquivo | Linhas |
|---|---|
| `hooks/useTarefas.ts` | 288 |
| `hooks/useHabitos.ts` | 401 |
| `hooks/useDashboard.ts` | 504 |
| `hooks/useAgenda.ts` | 208 |
| `hooks/useCursos.ts` | 381 |
| `hooks/usePendencias.ts` | 173 |
| `hooks/useMetas.ts` | 693 |
| `hooks/useConfirmar.ts` | 86 |

### Componentes UI (componentes/ui/)

17 componentes: `botao.tsx`, `cartao.tsx`, `dialogo.tsx`, `dialogo-alerta.tsx`, `seletor.tsx`, `menu-suspenso.tsx`, `colapsavel.tsx`, `dica.tsx`, `flutuante.tsx`, `caixa-selecao.tsx`, `progresso.tsx`, `separador.tsx`, `calendario.tsx`, `esqueleto.tsx`, `estado-vazio.tsx`, `confirmar.tsx`, `toaster.tsx`

---

## Apendice B: Dependencias Frontend

Extraido de `/Users/mateusmpz/Documents/Projetos Clientes - Code/app-builder-performance/package.json`:

**Framework**: Next.js 16.1.1, React 19.2.3, TypeScript 5
**Estado**: TanStack React Query 5.90.20
**Validacao**: Zod 4.3.6
**UI**: Radix UI (12 pacotes), Tailwind CSS 4, class-variance-authority 0.7.1, tailwind-merge 3.4.0, clsx 2.1.1
**DnD**: @hello-pangea/dnd 18.0.1
**Datas**: date-fns 4.1.0, react-day-picker 9.13.0
**Tema**: next-themes 0.4.6
**Toast**: sonner 2.0.7
**Auth**: @supabase/ssr 0.8.0, @supabase/supabase-js 2.93.2
**Icones**: lucide-react 0.562.0

**DevDependencies**: @tailwindcss/postcss 4, shadcn 3.6.2, tw-animate-css 1.4.0, tsx 4.21.0, eslint 9, eslint-config-next 16.1.1

---

*Documento gerado em 2026-01-29 por analise estatica do codebase.*
