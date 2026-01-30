# Documento de Arquitetura do Sistema -- Builders Performance

**Projeto:** Builders Performance
**Versao:** 1.0.0
**Data:** 2026-01-29
**Autor:** @architect (Aria) -- Synkra AIOS
**Status:** Analise de Estado Atual (Brownfield)

---

## 1. Visao Geral do Sistema

**Builders Performance** e um aplicativo de produtividade pessoal voltado para alunos da comunidade Builders. O sistema oferece timer de foco (Pomodoro/Deep Work), quadro Kanban de tarefas, rastreamento de habitos com streaks, calendario/agenda, cursos de aprendizado, metas/objetivos e um sistema de gamificacao com XP e niveis.

### 1.1 Stack Tecnologico

| Camada | Tecnologia | Versao |
|--------|-----------|--------|
| Framework Frontend | Next.js (App Router, RSC) | 16.1.1 |
| Biblioteca UI | React | 19.2.3 |
| Linguagem | TypeScript (strict) | 5.x |
| Banco de Dados | Supabase PostgreSQL | v17 |
| Autenticacao | Supabase Auth (email + OAuth) | SSR |
| Estado Servidor | TanStack React Query | v5.90 |
| Componentes UI | Radix UI + shadcn (new-york) | -- |
| Estilizacao | Tailwind CSS | v4 |
| Drag-and-Drop | @hello-pangea/dnd | v18 |
| Validacao | Zod | v4.3 |
| Datas | date-fns | v4.1 |
| Notificacoes | Sonner | v2 |
| Temas | next-themes | v0.4 |
| Icones | Lucide React | v0.562 |

### 1.2 Convencao de Nomenclatura

O codebase utiliza **portugues (brasileiro)** para nomes de dominio, rotas, componentes, colunas do banco de dados e arquivos utilitarios. Exemplos:

- Rotas: `/foco`, `/tarefas`, `/habitos`, `/agenda`, `/cursos`, `/inicio`
- Componentes: `componentes/ui/botao.tsx`, `componentes/ui/cartao.tsx`
- Hooks: `useTarefas`, `useHabitos`, `useMetas`, `useAgenda`, `useCursos`
- Schemas: `lib/schemas/tarefa.ts`, `lib/schemas/habito.ts`

---

## 2. Estrutura do Projeto

```
app-builder-performance/
|
|-- app/                          # Next.js App Router (paginas e rotas)
|   |-- layout.tsx                # Root layout com providers
|   |-- page.tsx                  # Landing page (/)
|   |-- not-found.tsx             # Pagina 404
|   |-- globals.css               # Estilos globais + Tailwind
|   |-- inicio/                   # Dashboard principal (/inicio)
|   |   |-- page.tsx              # ~615 linhas, componente principal
|   |   |-- acoes-rapidas.tsx     # FAB de acoes rapidas
|   |   |-- dados-dashboard.ts   # Dados estaticos + menu sidebar
|   |-- foco/                     # Timer de foco (/foco)
|   |   |-- page.tsx              # ~1282 linhas (ACIMA DO LIMITE)
|   |   |-- actions.ts            # Server Actions (720 linhas)
|   |   |-- types.ts              # Tipos do dominio foco
|   |-- tarefas/page.tsx          # Kanban de tarefas
|   |-- habitos/page.tsx          # Habitos + metas + objetivos
|   |-- agenda/page.tsx           # Calendario/eventos
|   |-- cursos/                   # Cursos de aprendizado
|   |   |-- page.tsx              # Lista de cursos
|   |   |-- [curso]/page.tsx      # Detalhe do curso
|   |   |-- [curso]/[aula]/page.tsx # Pagina de aula
|   |-- perfil/page.tsx           # Perfil do usuario
|   |-- assistente/page.tsx       # Assistente IA (placeholder)
|   |-- entrar/page.tsx           # Login
|   |-- criar-conta/page.tsx      # Registro
|   |-- recuperar-senha/page.tsx  # Recuperacao de senha
|   |-- redefinir-senha/page.tsx  # Redefinicao de senha
|   |-- onboarding/               # Onboarding de novos usuarios
|   |-- auth/callback/route.ts    # OAuth callback
|   |-- api/foco/save-partial/route.ts  # API Route para salvar sessao parcial
|
|-- hooks/                        # Custom hooks React Query
|   |-- useTarefas.ts             # CRUD tarefas (288 linhas)
|   |-- useHabitos.ts             # CRUD habitos/categorias/historico (401 linhas)
|   |-- useMetas.ts               # CRUD metas/objetivos/colunas/marcos (693 linhas)
|   |-- useAgenda.ts              # CRUD eventos (208 linhas)
|   |-- useCursos.ts              # Cursos + progresso (381 linhas)
|   |-- useDashboard.ts           # Stats compostos do dashboard (504 linhas)
|   |-- usePendencias.ts          # CRUD pendencias (173 linhas)
|   |-- useConfirmar.ts           # Hook de confirmacao (86 linhas)
|
|-- lib/                          # Bibliotecas e utilitarios
|   |-- supabase/
|   |   |-- client.ts             # Supabase browser client (typed)
|   |   |-- server.ts             # Supabase server client + admin + auth helpers
|   |   |-- auth.ts               # Funcoes de autenticacao
|   |   |-- types.ts              # Tipos gerados do banco (321 linhas)
|   |-- providers/
|   |   |-- auth-provider.tsx     # AuthContext + useAuth hook
|   |   |-- query-provider.tsx    # React Query provider
|   |-- schemas/
|   |   |-- tarefa.ts             # Zod schemas para tarefas/pendencias
|   |   |-- habito.ts             # Zod schemas para habitos/metas/objetivos (287 linhas)
|   |-- utils/
|   |   |-- dashboard.ts          # Utilidades de XP, nivel, formatacao
|   |-- supabase.ts               # Singleton do Supabase client (browser)
|   |-- utilidades.ts             # cn() - merge de classes Tailwind
|   |-- toast.ts                  # Wrapper para Sonner (notificacoes)
|   |-- armazenamento.ts          # Helpers de localStorage
|
|-- componentes/                  # Componentes reutilizaveis
|   |-- ui/                       # shadcn/ui em portugues
|   |   |-- botao.tsx, cartao.tsx, dialogo.tsx, seletor.tsx, ...
|   |-- layout/
|   |   |-- sidebar.tsx           # Sidebar colapsavel (324 linhas)
|   |-- tema/
|   |   |-- provedor-tema.tsx     # ThemeProvider wrapper
|   |   |-- alternador-tema.tsx   # Toggle de tema
|   |-- erro/
|   |   |-- error-boundary.tsx    # React Error Boundary generico
|   |   |-- erro-pagina.tsx       # Pagina de erro
|
|-- types/                        # Tipos TypeScript do dominio
|   |-- database.ts               # Tipos de tabelas + Database interface (276 linhas)
|   |-- dashboard.ts              # Tipos do dashboard (95 linhas)
|   |-- agenda.ts                 # Tipos de eventos (90 linhas)
|   |-- cursos.ts                 # Tipos de cursos/modulos/aulas (156 linhas)
|
|-- supabase/
|   |-- migrations/implementados/ # Migracoes SQL aplicadas
|   |   |-- 000_consolidated_schema.sql  # Schema principal (~699 linhas)
|   |   |-- 001-003: Auth/admin
|   |   |-- 005_fix_goals_schema.sql
|   |   |-- 006_fix_habits_schema.sql
|   |   |-- 007_create_events_table.sql
|   |   |-- 007_create_courses_schema.sql
```

### 2.1 Metricas de Tamanho

| Diretorio | Arquivos | Observacao |
|-----------|----------|-----------|
| `app/` | 23 .tsx, 2 .ts | Paginas e server actions |
| `hooks/` | 8 .ts | Hooks de dominio |
| `lib/` | 11 .ts/.tsx | Utilitarios e providers |
| `componentes/` | 22 .tsx | UI components |
| `types/` | 4 .ts | Type definitions |
| `supabase/migrations/` | 9 .sql | Database migrations |

---

## 3. Arquitetura de Fluxo de Dados

### 3.1 Padrao Principal

```
Pagina (app/feature/page.tsx)
  |  "use client"
  |
  +--> Custom Hook (hooks/useFeature.ts)
  |      |
  |      +--> useAuth() -- pega user do AuthContext
  |      |
  |      +--> useQuery() / useMutation() -- TanStack React Query
  |             |
  |             +--> Supabase Client (lib/supabase.ts singleton)
  |                    |
  |                    +--> PostgreSQL com RLS (auth.uid() = user_id)
```

### 3.2 Variante: Server Actions (Foco)

A pagina `/foco` utiliza um padrao diferente com Server Actions em vez de hooks React Query:

```
Pagina Foco (app/foco/page.tsx)
  |  "use client" -- estado local com useState
  |
  +--> Server Actions (app/foco/actions.ts)
  |      |  "use server"
  |      |
  |      +--> getCurrentUserId() -- auth via cookies server-side
  |      |
  |      +--> createAdminClient() -- Supabase com SERVICE_ROLE_KEY
  |             |
  |             +--> PostgreSQL (RLS bypassed pelo service_role)
  |
  +--> API Route (app/api/foco/save-partial/route.ts)
         |  Para navigator.sendBeacon() no beforeunload
```

**Arquivo de referencia:** `app/foco/actions.ts` (linhas 70-80)

### 3.3 Variante: Dashboard Composto

O hook `useDashboard.ts` faz multiplas queries paralelas para compor os dados do dashboard:

```typescript
// hooks/useDashboard.ts
// Linhas 344-396: 4 queries paralelas independentes
const userLevelQuery = useQuery({ queryKey: USER_LEVEL_KEY(userId), ... })
const dailyStatsQuery = useQuery({ queryKey: DAILY_STATS_KEY(userId), ... })
const weeklyStatsQuery = useQuery({ queryKey: WEEKLY_STATS_KEY(userId), ... })
const focusStatsQuery = useQuery({ queryKey: FOCUS_STATS_KEY(userId), ... })
```

### 3.4 Ciclo de Validacao

```
Input do Usuario
  |
  +--> Zod Schema (.parse() ou .safeParse())
  |      |  Falha? --> Erro amigavel em portugues
  |
  +--> Supabase Client (.insert() / .update())
  |      |  Falha? --> throw new Error()
  |
  +--> React Query Mutation
         |  onSuccess: invalidateQueries()
         |  onError: toast.error()
         |  onSettled: invalidateQueries()
```

**Exemplo canonico com optimistic updates:**
`hooks/useTarefas.ts` (linhas 228-276)

---

## 4. Autenticacao e Autorizacao

### 4.1 Fluxo de Autenticacao

```
                        +-----------+
                        |  Supabase |
                        |   Auth    |
                        +-----------+
                         /    |    \
                        /     |     \
              Email/Senha  OAuth   Reset
                  |        Google   Senha
                  |        Apple     |
                  v          |       v
             /entrar      /auth/   /recuperar-senha
                        callback    |
                          |         v
                          v      /redefinir-senha
                       /foco
```

**Arquivos envolvidos:**
- `lib/supabase/auth.ts` -- 6 funcoes de auth
- `app/auth/callback/route.ts` -- OAuth callback
- `lib/providers/auth-provider.tsx` -- AuthContext

### 4.2 Middleware de Protecao de Rotas

**Arquivo:** `middleware.ts`

```typescript
// Linhas 4-14: Rotas protegidas
const PROTECTED_ROUTES = [
  "/foco", "/tarefas", "/agenda", "/habitos",
  "/onboarding", "/inicio", "/perfil", "/assistente", "/cursos",
]
const AUTH_ROUTES = ["/entrar", "/criar-conta"]
```

Logica:
- Rotas protegidas sem user --> redirect para `/entrar?redirectTo=<pathname>`
- Rotas de auth com user --> redirect para `/foco`
- Middleware cria Supabase server client via cookies para verificar sessao

### 4.3 Row Level Security (RLS)

Todas as tabelas possuem RLS habilitado com politicas `auth.uid() = user_id` ou `auth.uid() = id` (para `users`). Cada tabela tem 5 policies:

| Policy | Descricao |
|--------|----------|
| `{table}_select_own` | SELECT para `authenticated` onde `user_id = auth.uid()` |
| `{table}_insert_own` | INSERT para `authenticated` com CHECK `user_id = auth.uid()` |
| `{table}_update_own` | UPDATE para `authenticated` com USING + CHECK |
| `{table}_delete_own` | DELETE para `authenticated` onde `user_id = auth.uid()` |
| `{table}_service_role_all` | ALL para `service_role` sem restricao |

**Excecao:** Tabelas `courses`, `course_modules` e `lessons` permitem SELECT publico (inclusive `anon`) para cursos com `status = 'publicado'`. Apenas `lesson_progress` requer autenticacao.

### 4.4 Dupla Instancia do Supabase Client (Browser)

Foram identificadas **duas** formas de criar o client no browser:

1. **Singleton em `lib/supabase.ts`** (linha 12-17): Usado pelos hooks (`useTarefas`, `useHabitos`, etc.)
2. **Factory em `lib/supabase/client.ts`** (linha 5-10): Cria nova instancia cada vez

O `AuthProvider` cria seu **proprio** client dentro do componente (linha 22-25 de `auth-provider.tsx`), o que resulta em uma terceira instancia separada. Isso pode causar inconsistencias de sessao entre hooks e o provider de auth.

---

## 5. Gerenciamento de Estado

### 5.1 Hierarquia de Providers

**Arquivo:** `app/layout.tsx` (linhas 45-49)

```
<QueryProvider>           # TanStack React Query (staleTime: 5min, retry: 1)
  <AuthProvider>          # Supabase Auth (user, session, isLoading)
    <ProvedorTema>        # next-themes (dark/light)
      {children}
    </ProvedorTema>
    <ProvedorToast />     # Sonner toasts
  </AuthProvider>
</QueryProvider>
```

### 5.2 React Query -- Configuracao Global

**Arquivo:** `lib/providers/query-provider.tsx`

```typescript
defaultOptions: {
  queries: {
    staleTime: 1000 * 60 * 5,    // 5 minutos
    refetchOnWindowFocus: false,   // Desabilitado
    retry: 1,                      // 1 tentativa de retry
  },
  mutations: {
    retry: 1,
  },
}
```

### 5.3 Query Keys

| Hook | Query Key | staleTime |
|------|-----------|-----------|
| `useTarefas` | `['tarefas']` | 5 min |
| `useHabitos` | `['habitos']` | 5 min |
| `useCategoriasHabitos` | `['categorias_habitos']` | 5 min |
| `useHistoricoHabitos` | `['historico_habitos']` | 5 min |
| `useMetas` | `['metas']` | 5 min |
| `useObjetivos` | `['objetivos']` | 5 min |
| `usePendencias` | `['pendencias']` | 5 min |
| `useAgenda` | `['agenda', 'events', userId]` | 2 min |
| `useCursos` | `['cursos', 'list', userId]` | 5 min |
| `useDashboard` (userLevel) | `['dashboard', 'userLevel', userId]` | 5 min |
| `useDashboard` (dailyStats) | `['dashboard', 'dailyStats', userId]` | 2 min |
| `useDashboard` (weeklyStats) | `['dashboard', 'weeklyStats', userId]` | 5 min |

**Observacao critica:** Os hooks `useTarefas`, `useHabitos`, `useMetas` e `usePendencias` usam query keys **sem** userId (ex: `['tarefas']`), enquanto `useAgenda`, `useCursos` e `useDashboard` incluem userId na key. Isso pode causar cache leak entre usuarios se o logout/login nao invalidar corretamente as queries.

### 5.4 Optimistic Updates

Apenas dois hooks implementam optimistic updates completos:

1. **`useMoverTarefa()`** em `hooks/useTarefas.ts` (linhas 232-276): `onMutate` -> cancel queries -> save previous -> update cache -> `onError` rollback -> `onSettled` invalidate

2. **`useMoverObjetivo()`** em `hooks/useMetas.ts` (linhas 543-580): Mesmo padrao

Os demais mutations apenas invalidam queries no `onSuccess`, sem optimistic updates.

---

## 6. Arquitetura de Componentes

### 6.1 Componentes UI (shadcn/ui em Portugues)

Todos os componentes shadcn foram instalados com aliases em portugues conforme `components.json`:

| Componente | Arquivo | Base Radix |
|-----------|---------|-----------|
| Botao | `componentes/ui/botao.tsx` | Slot |
| Cartao | `componentes/ui/cartao.tsx` | -- |
| Dialogo | `componentes/ui/dialogo.tsx` | Dialog |
| Seletor | `componentes/ui/seletor.tsx` | Select |
| Menu Suspenso | `componentes/ui/menu-suspenso.tsx` | DropdownMenu |
| Flutuante | `componentes/ui/flutuante.tsx` | Popover |
| Calendario | `componentes/ui/calendario.tsx` | react-day-picker |
| Caixa Selecao | `componentes/ui/caixa-selecao.tsx` | Checkbox |
| Colapsavel | `componentes/ui/colapsavel.tsx` | Collapsible |
| Dica | `componentes/ui/dica.tsx` | Tooltip |
| Progresso | `componentes/ui/progresso.tsx` | Progress |
| Separador | `componentes/ui/separador.tsx` | Separator |
| Dialogo Alerta | `componentes/ui/dialogo-alerta.tsx` | AlertDialog |
| Confirmar | `componentes/ui/confirmar.tsx` | -- |
| Estado Vazio | `componentes/ui/estado-vazio.tsx` | -- |
| Esqueleto | `componentes/ui/esqueleto.tsx` | -- |
| Toaster | `componentes/ui/toaster.tsx` | Sonner |

### 6.2 Componentes de Layout

- **Sidebar** (`componentes/layout/sidebar.tsx`): Sidebar colapsavel com navegacao, perfil do usuario, toggle de tema. Usa dados de menu de `app/inicio/dados-dashboard.ts`.

### 6.3 Componentes de Erro

- **ErrorBoundary** (`componentes/erro/error-boundary.tsx`): Class component React com fallback padrao que exibe stack trace em desenvolvimento.
- **ErroPagina** (`componentes/erro/erro-pagina.tsx`): Componente de pagina de erro.

### 6.4 Padrao de Paginas

Cada pagina segue um padrao consistente:
1. `"use client"` no topo
2. Sidebar com estado local `useState`
3. Hook de dados do dominio
4. Loading state com esqueletos
5. Error handling com toast/estado de erro
6. Layout responsivo com grid Tailwind

---

## 7. Schema do Banco de Dados

### 7.1 Diagrama de Entidade-Relacionamento

```
users (1)
  |
  |-- (N) tasks
  |-- (N) pending_items
  |-- (N) focus_sessions -----> tasks (N:1, ON DELETE SET NULL)
  |-- (N) habit_categories
  |-- (N) habits -----------> habit_categories (N:1, ON DELETE SET NULL)
  |-- (N) habit_checks -----> habits (N:1, ON DELETE CASCADE)
  |-- (N) goals
  |-- (N) development_objectives
  |-- (N) events
  |-- (N) lesson_progress ---> lessons (N:1, ON DELETE CASCADE)

courses (1)
  |-- (N) course_modules
        |-- (N) lessons
```

### 7.2 Tabelas Principais

| Tabela | Descricao | Migracoes |
|--------|-----------|-----------|
| `users` | Perfil + XP/nivel/streak | 000 |
| `tasks` | Tarefas Kanban (4 colunas) | 000 |
| `pending_items` | Pendencias rapidas | 000 |
| `focus_sessions` | Sessoes de foco com pausas (JSONB) | 000 |
| `habit_categories` | Categorias de habitos | 000, 006 |
| `habits` | Habitos diarios/semanais | 000, 006 |
| `habit_checks` | Marcacoes de habitos por dia | 000 |
| `habit_history` | Historico de habitos (referenciado no codigo, criado via 006) | 006 |
| `goals` | Metas do ano com progresso | 000, 005 |
| `development_objectives` | Objetivos de desenvolvimento | 000 |
| `events` | Eventos da agenda | 007 |
| `courses` | Cursos disponiveis | 007 |
| `course_modules` | Modulos de cada curso | 007 |
| `lessons` | Aulas de cada modulo | 007 |
| `lesson_progress` | Progresso do usuario nas aulas | 007 |
| `objectives` | Objetivos de desenvolvimento (nova versao) | -- |
| `objective_columns` | Colunas para organizar objetivos | -- |
| `goal_milestones` | Marcos de metas | -- |

### 7.3 Enums do Banco

| Enum | Valores |
|------|---------|
| `task_priority` | baixa, media, alta, urgente |
| `task_status` | pendente, em_progresso, em_revisao, concluido |
| `kanban_column` | backlog, a_fazer, em_andamento, concluido |
| `focus_mode` | pomodoro, deep_work, flowtime, custom |
| `session_status` | active, paused, completed, cancelled |
| `goal_status` | a_fazer, em_andamento, concluido |
| `objective_category` | pessoal, profissional, estudos, saude, financeiro |
| `event_status` | confirmado, pendente, foco |
| `calendar_integration` | Manual, Google, Outlook |
| `course_level` | iniciante, intermediario, avancado |
| `course_status` | rascunho, publicado, arquivado |

### 7.4 Funcoes PostgreSQL

| Funcao | Proposito | Seguranca |
|--------|-----------|-----------|
| `calculate_level(xp)` | Calcula nivel a partir de XP | IMMUTABLE |
| `add_user_xp(user_id, xp_amount)` | Adiciona XP e atualiza nivel | SECURITY DEFINER |
| `calculate_focus_xp(duration_seconds)` | 1 XP por minuto | IMMUTABLE |
| `complete_focus_session(session_id, duration_real)` | Completa sessao + concede XP | SECURITY DEFINER |
| `get_focus_stats(user_id)` | Estatisticas de foco (hoje/semana/total) | STABLE, SECURITY DEFINER |
| `cancel_active_sessions(user_id)` | Cancela sessoes ativas | SECURITY DEFINER |
| `add_task_time(task_id, minutes)` | Adiciona tempo a tarefa | SECURITY DEFINER |
| `check_habit(habit_id, user_id, date)` | Marca habito + streak + XP | SECURITY DEFINER |
| `get_habit_streak(habit_id)` | Calcula streak iterando datas | STABLE |
| `complete_lesson(user_id, lesson_id)` | Completa aula + concede XP | SECURITY DEFINER |
| `get_course_progress(user_id, course_id)` | Progresso do curso | STABLE, SECURITY DEFINER |

### 7.5 Views

| View | Proposito |
|------|-----------|
| `focus_sessions_with_task` | Sessoes com dados da tarefa (JOIN) |
| `habits_today` | Habitos ativos com status de hoje |

---

## 8. Camada de API

### 8.1 Server Actions (Foco)

A pagina `/foco` e a unica que usa Server Actions (`"use server"`) em vez de hooks React Query diretos. As actions estao em:

**Arquivo:** `app/foco/actions.ts`

| Action | Descricao |
|--------|-----------|
| `getAvailableTasks()` | Busca tarefas nao concluidas |
| `markTaskAsCompleted(taskId)` | Marca tarefa como concluida |
| `createFocusSession(input)` | Cria sessao de foco |
| `updateFocusSession(input)` | Atualiza status/pausas |
| `completeFocusSession(input)` | Completa e concede XP via RPC |
| `cancelFocusSession(sessionId)` | Cancela sessao |
| `savePartialSession(input)` | Salva progresso parcial |
| `getActiveSession()` | Busca sessao ativa |
| `getFocusHistory(filters, pagination)` | Historico paginado |
| `getFocusStats()` | Estatisticas via RPC |
| `getCurrentUser()` | Dados do usuario atual |

**Todas as actions usam `createAdminClient()` com `SUPABASE_SERVICE_ROLE_KEY`**, bypassando RLS. A autorizacao e feita verificando `getCurrentUserId()` via cookies e filtrando por `user_id` nas queries.

### 8.2 API Routes

Apenas 1 API Route existe no projeto:

**Arquivo:** `app/api/foco/save-partial/route.ts`

- **Metodo:** POST
- **Proposito:** Endpoint para `navigator.sendBeacon()` salvar sessao quando o usuario fecha a pagina
- **Seguranca:** Delega para `savePartialSession()` server action

### 8.3 OAuth Callback

**Arquivo:** `app/auth/callback/route.ts`

- **Metodo:** GET
- **Proposito:** Troca code OAuth por sessao Supabase
- **Redirect:** Sucesso para `/foco`, falha para `/entrar?error=auth_callback_error`

---

## 9. Padroes de Performance

### 9.1 RSC vs Client Components

| Pagina | Tipo | Justificativa |
|--------|------|---------------|
| `/` (landing) | Nao verificado | -- |
| `/inicio` | Client (`"use client"`) | Sidebar interativa + React Query |
| `/foco` | Client | Timer + localStorage + audio |
| `/tarefas` | Client | Drag-and-drop Kanban |
| `/habitos` | Client | Interacoes de check |
| `/agenda` | Client | Calendario interativo |
| `/cursos` | Client | Filtros + progresso |
| `/entrar` | Client | Formulario de login |

**Observacao:** Nenhuma pagina protegida utiliza React Server Components para pre-fetch de dados. Todas sao client-side com React Query fazendo fetch apos mount.

### 9.2 Caching

- **React Query:** `staleTime` de 5 minutos globalmente, 2 minutos para dados mais volateis (agenda, daily stats)
- **`refetchOnWindowFocus: false`** -- dados nao atualizam ao focar a aba
- **Nao ha CDN ou cache HTTP** configurado no `next.config.ts`
- **localStorage** usado para:
  - Estado de sessao de foco (recuperacao de crash)
  - Data do ultimo Daily Start popup
  - Preferencias de tema (via next-themes)

### 9.3 Optimistic Updates

Apenas `useMoverTarefa` e `useMoverObjetivo` implementam optimistic updates. Operacoes como criar/deletar tarefa fazem round-trip completo antes de atualizar a UI.

### 9.4 Lazy Loading

Nao ha uso de `React.lazy()`, `next/dynamic` ou code splitting alem do split automatico por rota do Next.js.

### 9.5 Fontes

```typescript
// app/layout.tsx
const fonteCorpo = Manrope({ subsets: ["latin"], variable: "--fonte-corpo", display: "swap" })
const fonteTitulo = Sora({ subsets: ["latin"], variable: "--fonte-titulo", display: "swap" })
```

Ambas com `display: "swap"` para evitar FOIT (Flash of Invisible Text).

---

## 10. Postura de Seguranca

### 10.1 Pontos Positivos

1. **RLS habilitado em TODAS as tabelas** com policies por `auth.uid()`
2. **Validacao Zod** em todas as mutations de tarefas, habitos, metas e pendencias
3. **Middleware de protecao de rotas** com redirect para login
4. **`SECURITY DEFINER`** em funcoes criticas (add_user_xp, complete_focus_session, etc.)
5. **Variaveis de ambiente** para chaves sensiveis
6. **Non-null assertions (`!`)** nas env vars -- falha rapido se nao configuradas

### 10.2 Vulnerabilidades e Riscos

| Risco | Severidade | Localizacao | Descricao |
|-------|-----------|-------------|-----------|
| Service Role Key exposta no client | **CRITICO** | `app/foco/actions.ts:71-80` | `createAdminClient()` usa SERVICE_ROLE_KEY em server actions. Embora server actions executem no server, o padrao e incomum e perigoso se copiado incorretamente. |
| `console.error()` em producao | MEDIO | `lib/supabase/auth.ts` (6 ocorrencias) | Pode vazar informacoes de erro para o console do browser |
| Sem rate limiting | MEDIO | Todas as rotas | Nenhum rate limiting configurado em API routes ou server actions |
| Sem CSRF explicito | BAIXO | Server actions | Next.js tem protecao CSRF embutida para server actions, mas nao para API routes |
| Sem Content Security Policy | BAIXO | `next.config.ts` | Configuracao vazia, sem headers de seguranca |
| Validacao ausente em useAgenda | MEDIO | `hooks/useAgenda.ts` | Nao usa Zod schemas para validar input antes de inserir no Supabase |
| Seed data em producao | MEDIO | `000_consolidated_schema.sql:629-692` | Seeds com dados mockados incluidos na migracao consolidada |

### 10.3 Autorizacao em Server Actions

As server actions usam `getCurrentUserId()` que chama `supabase.auth.getUser()` via cookies. Se o cookie nao estiver presente, retorna `null` e lanca erro. No entanto, as actions usam `createAdminClient()` com service_role, o que significa que o **filtro de user_id e feito manualmente** na query, nao pelo RLS.

---

## 11. Sistema de Gamificacao

### 11.1 Mecanica de XP

| Fonte | XP Concedido | Funcao |
|-------|-------------|--------|
| Focus Session | 1 XP por minuto focado | `calculate_focus_xp()` |
| Completar Tarefa | 10-1000 XP (configuravel) | Campo `xp_recompensa` |
| Check Habito | 10-25 XP (configuravel) + bonus streak | `check_habit()` |
| Completar Aula | 10-25 XP (por aula) | `complete_lesson()` |
| Completar Meta | 100-300 XP (configuravel) | Campo `xp_recompensa` |

### 11.2 Formula de Nivel

```sql
-- supabase/migrations/implementados/000_consolidated_schema.sql
-- Linha 410:
RETURN FLOOR(SQRT(xp::DECIMAL / 100)) + 1;
```

Mapeamento de niveis no frontend:

```typescript
// lib/utils/dashboard.ts
// Linhas 5-16:
const LEVEL_TITLES = {
  1: 'Iniciante', 2: 'Iniciante',
  3: 'Aprendiz', 4: 'Aprendiz',
  5: 'Construtor', 6: 'Construtor', 7: 'Construtor',
  8: 'Arquiteto', 9: 'Arquiteto',
  10: 'Mestre',
}
```

**Inconsistencia detectada:** O frontend usa uma formula diferente para calcular XP por nivel (`XP_PER_LEVEL * Math.pow(XP_GROWTH_FACTOR, level - 1)` com `XP_PER_LEVEL=500, XP_GROWTH_FACTOR=1.2`) enquanto o banco usa `FLOOR(SQRT(xp / 100)) + 1`. Essas formulas **nao sao equivalentes** e podem gerar divergencia entre o nivel mostrado e o nivel real.

### 11.3 Sistema de Streaks

- **Streak de habito:** Calculado pela funcao `check_habit()` verificando se o dia anterior foi marcado
- **Streak global:** Armazenado em `users.current_streak` e `users.longest_streak`
- **Streak shields:** `users.streak_shields` (max 2/semana) -- campo existe mas nao ha logica de consumo implementada
- **Bonus de streak no XP:** `v_xp + LEAST(v_xp, v_xp * (v_streak - 1) / 10)` -- ate 100% de bonus no XP do habito

### 11.4 Missoes

- **Missoes diarias:** Geradas dinamicamente em `useDashboard.ts` linhas 263-313 (login, habitos, prioridade, foco, streak bonus)
- **Missoes semanais:** Estaticas/hardcoded em `useDashboard.ts` linhas 315-338 (foco 5h, streak 7 dias, daily quests 5 dias, zero atrasadas)

**Problema:** As missoes semanais sao **100% estaticas** -- nenhuma logica de verificacao ou progresso real. A recompensa e apenas texto decorativo.

---

## 12. Inventario de Features

### 12.1 Status das Features

| Feature | Rota | Status | Dados | Observacao |
|---------|------|--------|-------|-----------|
| Dashboard/Inicio | `/inicio` | **Funcional** | Supabase | Daily Start popup + stats reais |
| Timer de Foco | `/foco` | **Funcional** | Supabase + Server Actions | Pomodoro/Deep Work/Flowtime/Custom |
| Kanban de Tarefas | `/tarefas` | **Funcional** | Supabase | Drag-and-drop, prioridades, tags |
| Pendencias | `/tarefas` (modal) | **Funcional** | Supabase | Lista rapida antes do Kanban |
| Habitos | `/habitos` | **Funcional** | Supabase | Check diario, categorias, streaks |
| Metas | `/habitos` (aba) | **Funcional** | Supabase | Progresso, marcos, prioridades |
| Objetivos | `/habitos` (aba) | **Funcional** | Supabase | Board com colunas customizaveis |
| Agenda | `/agenda` | **Funcional** | Supabase | Eventos com categorias |
| Cursos | `/cursos` | **Funcional** | Supabase | Modulos, aulas, progresso, XP |
| Perfil | `/perfil` | **Parcial** | -- | Pagina existe, funcionalidade limitada |
| Assistente IA | `/assistente` | **Placeholder** | -- | Pagina existe, sem integracao real |
| Onboarding | `/onboarding` | **Parcial** | -- | Fluxo existe |
| Autenticacao | `/entrar`, `/criar-conta` | **Funcional** | Supabase Auth | Email + OAuth (Google/Apple) |
| Recuperacao de Senha | `/recuperar-senha`, `/redefinir-senha` | **Funcional** | Supabase Auth | -- |
| Gamificacao (XP/Level) | Global | **Funcional** | Supabase | XP por foco, habitos, aulas |
| Gamificacao (Missoes) | Dashboard | **Parcial** | Hardcoded | Missoes semanais estaticas |
| Dark/Light Mode | Global | **Funcional** | next-themes | Toggle no menu da sidebar |

---

## 13. Divida Tecnica

### 13.1 Critica (Prioridade Alta)

| # | Problema | Localizacao | Impacto |
|---|---------|-------------|---------|
| TD-01 | **Nenhum framework de testes** | `package.json` | 0% de cobertura. Nao ha Jest, Vitest, Playwright ou qualquer runner configurado. |
| TD-02 | **Pagina /foco com 1282 linhas** | `app/foco/page.tsx` | God Component com 20+ estados, 15+ funcoes, audio, localStorage, timer -- viola o limite de 800 linhas. |
| TD-03 | **Inconsistencia na formula de nivel** | `lib/utils/dashboard.ts` vs `000_consolidated_schema.sql` | Frontend e backend calculam niveis com formulas diferentes, causando divergencia visual. |
| TD-04 | **Dados mockados no arquivo `dados-dashboard.ts`** | `app/inicio/dados-dashboard.ts:112-232` | Exporta dados estaticos (`nivelAtual`, `cardsResumo`, `missoesDiarias`, etc.) que aparentemente nao sao mais usados pela pagina (que usa `useDashboardData()`), mas a sidebar continua importando `marcaSidebar` e `secoesMenu` desse arquivo. O arquivo contem constantes obsoletas misturadas com dados ativos. |
| TD-05 | **Tripla instancia Supabase client** | `lib/supabase.ts`, `lib/supabase/client.ts`, `auth-provider.tsx` | Tres formas diferentes de criar o client browser. Risco de inconsistencia de sessao. |

### 13.2 Alta (Prioridade Media-Alta)

| # | Problema | Localizacao | Impacto |
|---|---------|-------------|---------|
| TD-06 | **Query keys sem userId** | `hooks/useTarefas.ts:11`, `hooks/useHabitos.ts:22-24`, `hooks/usePendencias.ts:11` | Cache pode vazar entre sessoes de usuarios diferentes. |
| TD-07 | **Tabelas referenciadas no codigo mas possivelmente ausentes no schema consolidado** | `hooks/useMetas.ts` -> `objectives`, `objective_columns`, `goal_milestones`; `hooks/useHabitos.ts` -> `habit_history` | Os hooks referenciam tabelas (`objectives`, `objective_columns`, `goal_milestones`, `habit_history`) que nao existem no schema consolidado `000_consolidated_schema.sql`. Possivelmente criadas em migracoes parciais nao documentadas ou na migracao 006. |
| TD-08 | **Duplicacao de tipos** | `types/database.ts` vs `lib/supabase/types.ts` | Dois sistemas de tipos para o mesmo banco. `types/database.ts` e manual, `lib/supabase/types.ts` e parcialmente gerado. Ambos definem `Database`, com interfaces diferentes. |
| TD-09 | **Hook useMetas.ts com 693 linhas** | `hooks/useMetas.ts` | Arquivo excessivamente grande com 4 dominios (Metas, Objetivos, Colunas, Marcos). Deveria ser separado em hooks individuais. |
| TD-10 | **Sem validacao Zod em useAgenda** | `hooks/useAgenda.ts` | Unico hook de CRUD que nao valida input com Zod antes de inserir no Supabase. |
| TD-11 | **`console.error()` em producao** | `lib/supabase/auth.ts` (6 ocorrencias) | Deveria usar um servico de logging ou remover. |

### 13.3 Media (Prioridade Media)

| # | Problema | Localizacao | Impacto |
|---|---------|-------------|---------|
| TD-12 | **Sem `next.config.ts` customizado** | `next.config.ts` | Configuracao completamente vazia. Sem headers de seguranca, redirects, ou otimizacoes. |
| TD-13 | **Nenhuma pagina usa RSC para data fetching** | Todas as paginas protegidas | Todas sao `"use client"`, perdendo oportunidade de SSR/streaming. |
| TD-14 | **Missoes semanais hardcoded** | `hooks/useDashboard.ts:315-338` | Texto estatico sem logica de progresso real. |
| TD-15 | **Streak shields sem implementacao** | `users.streak_shields` | Campo existe no banco mas nao ha logica de consumo/reset no app. |
| TD-16 | **Seed data na migracao consolidada** | `000_consolidated_schema.sql:629-692` | Dados de teste incluidos na migracao que roda em todos os ambientes. |
| TD-17 | **Ausencia de typecheck script completo** | `package.json` | O script `typecheck` esta descrito no CLAUDE.md mas nao existe no `package.json`. |
| TD-18 | **Arquivos de migracao com numeracao duplicada** | `007_create_events_table.sql` e `007_create_courses_schema.sql` | Duas migracoes com o mesmo prefixo numerico. |

---

## 14. Recomendacoes Arquiteturais

### 14.1 Curto Prazo (Sprint Atual)

1. **Unificar Supabase client browser** -- Manter apenas `lib/supabase.ts` (singleton) e atualizar `AuthProvider` para usar a mesma instancia.
2. **Adicionar userId a todas as query keys** -- Prevenir cache leak entre usuarios.
3. **Extrair componentes do /foco** -- Separar timer, controles, historico, modais em componentes menores.
4. **Remover dados obsoletos de `dados-dashboard.ts`** -- Manter apenas `marcaSidebar` e `secoesMenu`.
5. **Alinhar formula de nivel** entre frontend e backend.

### 14.2 Medio Prazo (Proximo Mes)

1. **Configurar framework de testes** -- Vitest + React Testing Library + Playwright para E2E.
2. **Separar `useMetas.ts`** em `useMetas.ts`, `useObjetivos.ts`, `useColunasObjetivo.ts`, `useMarcosMeta.ts`.
3. **Adicionar Zod schema para eventos** e implementar validacao em `useAgenda`.
4. **Implementar SSR para paginas do dashboard** com `prefetchQuery` no server component.
5. **Consolidar tipos** -- Gerar `lib/supabase/types.ts` automaticamente via `supabase gen types` e remover `types/database.ts`.
6. **Configurar headers de seguranca** em `next.config.ts` (CSP, HSTS, X-Frame-Options).

### 14.3 Longo Prazo

1. **Implementar assistente IA real** -- Integracao com Claude API para coaching de produtividade.
2. **Sistema de notificacoes push** -- Lembretes de habitos, sessoes de foco agendadas.
3. **Integracao de calendario** -- Google Calendar / Outlook via API real.
4. **Implementar logica de missoes semanais** com progresso real e recompensas funcionais.
5. **Implementar streak shields** -- Logica de consumo automatico e reset semanal.

---

## 15. Decisoes Arquiteturais (ADRs)

### ADR-001: Hooks React Query para CRUD client-side

**Contexto:** Necessidade de gerenciar dados do usuario com cache, invalidacao e feedback de UI.

**Decisao:** Cada dominio tem seu hook em `hooks/` encapsulando useQuery/useMutation com Supabase client direto.

**Consequencias:**
- (+) Simplicidade -- dados fluem diretamente do hook para o componente
- (+) Cache automatico com staleTime de 5 minutos
- (+) Optimistic updates possiveis (implementado para drag-and-drop)
- (-) Todas as paginas sao `"use client"`, sem SSR
- (-) RLS valida no browser, mas depende do token JWT do cookie

### ADR-002: Server Actions para pagina de Foco

**Contexto:** A pagina de foco precisa de timer com estado complexo, persistencia de sessao, e concessao de XP via funcao do banco.

**Decisao:** Usar Server Actions com `createAdminClient()` (service_role) em vez de hooks React Query.

**Consequencias:**
- (+) Operacoes atomicas (completar sessao + XP + level up)
- (+) `revalidatePath()` para atualizar paginas relacionadas
- (+) Suporte a `navigator.sendBeacon()` via API route
- (-) Bypassa RLS (autorizacao manual)
- (-) Padrao diferente dos demais dominios (inconsistencia)
- (-) Pagina monolitica com 1282 linhas

### ADR-003: Nomenclatura em Portugues

**Contexto:** Projeto voltado para usuarios brasileiros da comunidade Builders.

**Decisao:** Adotar portugues para rotas, componentes, tipos, colunas do banco e mensagens.

**Consequencias:**
- (+) Alinhamento direto com dominio do negocio
- (+) Componentes shadcn com nomes intuitivos para o time
- (-) Maior barreira para contribuidores internacionais
- (-) Mistura inevitavel com termos tecnicos em ingles (useQuery, onMutate, etc.)

---

*Documento gerado por @architect (Aria) -- Synkra AIOS v2.0*
*Ultima atualizacao: 2026-01-29*
