# Technical Debt Assessment - DRAFT

**Projeto:** Builders Performance
**Data:** 2026-01-29
**Autor:** @architect (Aria) -- Synkra AIOS
**Status:** DRAFT -- Pendente revisao dos especialistas
**Workflow:** brownfield-discovery v3.1

---

> **NOTA:** Este documento consolida TODOS os debitos tecnicos identificados nas Fases 1-3 do workflow brownfield-discovery. As secoes marcadas com :warning: requerem revisao e validacao dos especialistas indicados.

---

## Indice

1. [Resumo Executivo](#resumo-executivo)
2. [Debitos de Sistema (Arquitetura)](#1-debitos-de-sistema-arquitetura)
3. [Debitos de Database](#2-debitos-de-database)
4. [Debitos de Frontend/UX](#3-debitos-de-frontendux)
5. [Debitos Cross-Cutting (Transversais)](#4-debitos-cross-cutting-transversais)
6. [Matriz Preliminar de Priorizacao](#5-matriz-preliminar-de-priorizacao)
7. [Mapa de Dependencias](#6-mapa-de-dependencias)
8. [Perguntas para Especialistas](#7-perguntas-para-especialistas)
9. [Plano de Acao Preliminar](#8-plano-de-acao-preliminar)

---

## Resumo Executivo

### Contagem por Severidade (Unificada, sem duplicatas)

| Severidade | Sistema | Database | Frontend | Cross-Cutting | **Total** |
|------------|---------|----------|----------|---------------|-----------|
| CRITICAL   | 2       | 3        | 4        | 2             | **11**    |
| HIGH       | 3       | 8        | 4        | 1             | **16**    |
| MEDIUM     | 4       | 10       | 3        | 0             | **17**    |
| LOW        | 0       | 6        | 2        | 0             | **8**     |
| **Total**  | **9**   | **27**   | **13**   | **3**         | **52**    |

### Top 5 Riscos Imediatos

1. **Funcoes SECURITY DEFINER sem auth validation** -- Qualquer usuario pode manipular XP/dados de outros (DB-C01)
2. **Zero cobertura de testes** -- Nenhum framework de testes configurado (CC-C01)
3. **Navegacao mobile inexistente** -- Aplicacao inacessivel em dispositivos moveis (FE-C02)
4. **God Components** -- 4 paginas com >800 linhas, sendo habitos com 2161 (FE-C01)
5. **Inconsistencia na formula de nivel** -- Frontend e backend divergem no calculo (SY-C01)

### Tech Stack Auditada

| Camada | Tecnologia | Versao |
|--------|-----------|--------|
| Framework | Next.js (App Router) | 16.1.1 |
| UI | React | 19.2.3 |
| Linguagem | TypeScript (strict) | 5.x |
| Banco | Supabase PostgreSQL | v17 |
| Estado | TanStack React Query | v5.90 |
| Validacao | Zod | v4.3 |
| Componentes | Radix UI + shadcn (new-york) | -- |
| Estilizacao | Tailwind CSS | v4 |

---

## 1. Debitos de Sistema (Arquitetura)

**Fonte:** `docs/architecture/system-architecture.md`

### CRITICAL

| ID | Debito | Localizacao | Impacto |
|----|--------|-------------|---------|
| SY-C01 | **Inconsistencia na formula de nivel** -- Frontend usa `XP_PER_LEVEL * Math.pow(1.2, level-1)` (exponencial), backend usa `FLOOR(SQRT(xp/100)) + 1` (raiz quadrada). Formulas **nao equivalentes**. | `lib/utils/dashboard.ts` vs `000_consolidated_schema.sql:410` | Usuario ve nivel diferente do real. Gamificacao corrompida. |
| SY-C02 | **Tripla instancia Supabase client** -- Tres formas de criar o client browser: singleton em `lib/supabase.ts`, factory em `lib/supabase/client.ts`, e instancia interna no `AuthProvider`. | `lib/supabase.ts`, `lib/supabase/client.ts`, `lib/providers/auth-provider.tsx` | Inconsistencia de sessao, logout pode nao propagar, cache de auth fragmentado. |

### HIGH

| ID | Debito | Localizacao | Impacto |
|----|--------|-------------|---------|
| SY-H01 | **Query keys sem userId** -- Hooks `useTarefas`, `useHabitos`, `useMetas`, `usePendencias` usam keys como `['tarefas']` sem userId. | `hooks/useTarefas.ts:11`, `hooks/useHabitos.ts:22-24`, `hooks/usePendencias.ts:11` | Cache pode vazar entre sessoes de usuarios diferentes. |
| SY-H02 | **Tabelas referenciadas mas possivelmente ausentes** -- Hooks referenciam `objectives`, `objective_columns`, `goal_milestones`, `habit_history` que podem nao existir no schema consolidado. | `hooks/useMetas.ts`, `hooks/useHabitos.ts` | Queries falham silenciosamente ou dados nao persistem. |
| SY-H03 | **Hook useMetas.ts excessivamente grande (693 linhas)** -- 4 dominios em um unico arquivo: Metas, Objetivos, Colunas, Marcos. | `hooks/useMetas.ts` | Dificil manter, testar e debugar. |

### MEDIUM

| ID | Debito | Localizacao | Impacto |
|----|--------|-------------|---------|
| SY-M01 | **Sem next.config.ts customizado** -- Configuracao vazia. Sem headers de seguranca, redirects, ou otimizacoes. | `next.config.ts` | Sem CSP, HSTS, X-Frame-Options. |
| SY-M02 | **Nenhuma pagina usa RSC para data fetching** -- Todas as paginas protegidas sao `"use client"`. | Todas as paginas em `app/` | Perde SSR/streaming, mais JavaScript no cliente. |
| SY-M03 | **Missoes semanais hardcoded** -- Texto estatico sem logica de progresso real. | `hooks/useDashboard.ts:315-338` | Feature decorativa, nao funcional. |
| SY-M04 | **Streak shields sem implementacao** -- Campo existe no banco mas nao ha logica de consumo. | `users.streak_shields` | Feature prometida nao funciona. |

---

## 2. Debitos de Database

**Fonte:** `supabase/docs/DB-AUDIT.md`
:warning: **PENDENTE: Revisao do @data-engineer**

### CRITICAL

| ID | Debito | Localizacao | Impacto |
|----|--------|-------------|---------|
| DB-C01 | **Funcoes SECURITY DEFINER sem validacao de ownership** -- `add_user_xp()`, `add_task_time()`, `complete_focus_session()`, `cancel_active_sessions()`, `complete_lesson()`, `get_course_progress()` recebem `p_user_id` mas nunca validam se e o usuario autenticado. | `000_consolidated_schema.sql:417-587`, `007_create_courses_schema.sql:208-279` | **SEGURANCA**: Qualquer usuario pode manipular XP, completar aulas, cancelar sessoes de outro usuario via RPC. |
| DB-C02 | **Seed data com UUID hardcoded no schema de producao** -- Usuario mock "Mateus Pereira" com UUID fixo na migracao que roda em todos os ambientes. | `000_consolidated_schema.sql:629-692` | Dados de teste em producao. Potencial violacao de privacidade. |
| DB-C03 | **Tipos TypeScript completamente desatualizados** -- `lib/supabase/types.ts` nao contem 12+ tabelas, 6+ enums, views e funcoes do schema real. Dois arquivos de tipos (`types/database.ts` vs `lib/supabase/types.ts`) se sobrepoem. | `lib/supabase/types.ts`, `types/database.ts` | TypeScript ignora campos reais do banco. Bugs silenciosos em tempo de desenvolvimento. |

### HIGH

| ID | Debito | Localizacao | Impacto |
|----|--------|-------------|---------|
| DB-H01 | **Cursos acessiveis por `anon` sem rate limiting** -- Politicas permitem SELECT para qualquer role (inclusive `anon`) sem `TO authenticated`. | `007_create_courses_schema.sql:131-166` | Scraping de catalogo, dados expostos publicamente. |
| DB-H02 | **Admin criado via SQL com senha visivel** -- Migration gera senha e exibe no resultado da query. | `002_create_admin_user.sql` | Senha pode ficar em logs. |
| DB-H03 | **`handle_new_user()` chamavel via RPC** -- Funcao SECURITY DEFINER pode ser invocada diretamente. | `001_auth_profiles_trigger.sql:16-36` | Criacao/alteracao de perfis arbitrarios. |
| DB-H04 | **`reordenarTarefas` faz N updates individuais** -- N chamadas HTTP para reordenar N tarefas. | `hooks/useTarefas.ts:134-150` | Latencia acumulada, rate limits. |
| DB-H05 | **`get_habit_streak()` usa loop O(N)** -- Loop iterativo com N queries internas por dia de streak. | `004_fix_database_naming.sql:130-145` | Performance degradante (365 queries para streak de 1 ano). |
| DB-H06 | **Ausencia de soft delete** -- Registros removidos permanentemente sem lixeira. | Todas as tabelas | Sem recuperacao, sem auditoria de delecoes. |
| DB-H07 | **Ausencia de audit trail** -- Sem log de alteracoes. | Todas as tabelas sensiveis | Se XP for adulterado (DB-C01), nao ha rastreio. |
| DB-H08 | **UNIQUE constraint pode estar quebrada** -- Rename de colunas na migration 004 pode ter invalidado a constraint de `habit_history`. | `004_fix_database_naming.sql:38-43` | Duplicatas de checks de habitos. |
| DB-H09 | **Progresso sem CHECK de limites** -- `goals.progresso_atual` pode ser > `progresso_total` ou < 0. Mesmo para `objectives`. | Tabelas `goals`, `objectives` | Dados corrompidos, barra de progresso > 100%. |
| DB-H10 | **`types/database.ts` diverge do schema real** -- 12+ campos existem no banco mas nao no TypeScript. | `types/database.ts` | TypeScript nao "ve" campos reais. |
| DB-H11 | **Duas migrations com prefixo `007_`** -- `007_create_events_table.sql` e `007_create_courses_schema.sql`. | `supabase/migrations/implementados/` | Ordem de execucao imprevisivel. |

### MEDIUM

| ID | Debito | Localizacao | Impacto |
|----|--------|-------------|---------|
| DB-M01 | **Cursos sem politica explicita para INSERT/UPDATE/DELETE** -- Apenas service_role pode modificar, mas falta documentacao. | Tabelas `courses`, `course_modules`, `lessons` | Erros genericos se auth tentar modificar. |
| DB-M02 | **`goals.status` como TEXT sem CHECK** -- Alterado de ENUM para TEXT sem constraint de valores validos. | `005_fix_goals_schema.sql:63-73` | Valores invalidos como `'banana'` aceitos. |
| DB-M03 | **Index ausente `focus_sessions(user_id, started_at)`** -- Queries de stats filtram por ambos mas sem index composto. | `hooks/useDashboard.ts:78-105` | Scans lentos em tabelas grandes. |
| DB-M04 | **Index ausente `tasks(user_id, concluida_em)`** -- Dashboard filtra tarefas por conclusao sem index. | `hooks/useDashboard.ts:152-157` | Scans lentos. |
| DB-M05 | **Dashboard faz 5 queries HTTP paralelas** -- `fetchDailyStats` executa 5 chamadas Supabase separadas. | `hooks/useDashboard.ts:78-105` | Overhead de rede. |
| DB-M06 | **Cursos busca todos dados e filtra client-side** -- `SELECT *` em courses, modules e lessons, filtragem em JS. | `hooks/useCursos.ts:77-119` | Transferencia de dados desnecessarios. |
| DB-M07 | **Detalhe do curso faz 4 queries sequenciais** -- Curso, modulos, aulas, progresso em serie. | `hooks/useCursos.ts:248-341` | Latencia acumulada. |
| DB-M08 | **`get_focus_stats` chamado 3 vezes no dashboard** -- Mesma RPC executada em fetchDailyStats, fetchWeeklyStats e focusStatsQuery. | `hooks/useDashboard.ts:86,159,380-390` | Trabalho triplicado. |
| DB-M09 | **`focus_sessions` sem archiving** -- Tabela cresce indefinidamente (~1825 registros/ano/usuario). | Tabela `focus_sessions` | Performance degradante ao longo do tempo. |
| DB-M10 | **Campos XP sem CHECK >= 0** -- `tasks.xp_recompensa`, `habits.xp_por_check`, etc. aceitam negativos. | Tabelas `tasks`, `habits`, `goals`, `objectives`, `lessons` | Gamificacao corrompida com XP negativo. |

### LOW

| ID | Debito | Localizacao | Impacto |
|----|--------|-------------|---------|
| DB-L01 | **Campos TEXT sem CHECK constraint** -- `prioridade`, `dificuldade` como TEXT aberto. | Tabelas `goals`, `objectives`, `habits` | Valores invalidos aceitos. |
| DB-L02 | **Redundancia entre `tasks.status` e `tasks.coluna`** -- Sem constraint de consistencia. | Tabela `tasks` | Status e coluna podem divergir. |
| DB-L03 | **Index `idx_users_email` redundante** -- UNIQUE ja cria index. | `000_consolidated_schema.sql:272` | Overhead de escrita. |
| DB-L04 | **Indexes em campos TEXT de baixa cardinalidade** -- `dificuldade`, `prioridade`. | Multiplas tabelas | Indexes ineficientes. |
| DB-L05 | **Tabela `projects` referenciada mas nao criada** -- `tasks.projeto_id` sem FK. | Tabela `tasks` | Campo orfao. |
| DB-L06 | **Sem tabela de notificacoes** -- Gamificacao sem notificacoes push. | -- | Conquistas sem feedback. |

---

## 3. Debitos de Frontend/UX

**Fonte:** `docs/frontend/frontend-spec.md`
:warning: **PENDENTE: Revisao do @ux-design-expert**

### CRITICAL

| ID | Debito | Localizacao | Impacto |
|----|--------|-------------|---------|
| FE-C01 | **God Components** -- 4 paginas violam limite de 800 linhas: `habitos/page.tsx` (2161), `foco/page.tsx` (1282), `tarefas/page.tsx` (1063), `agenda/page.tsx` (864). | `app/habitos/page.tsx`, `app/foco/page.tsx`, `app/tarefas/page.tsx`, `app/agenda/page.tsx` | Impossivel manter, testar ou debugar. Re-renders excessivos. |
| FE-C02 | **Navegacao mobile inexistente** -- Sidebar usa `hidden lg:flex`. Sem hamburger menu, bottom tab bar ou drawer. | `componentes/layout/sidebar.tsx:105` | **Aplicacao inacessivel em dispositivos moveis e tablets.** |
| FE-C03 | **Zero code splitting** -- Nenhum `React.lazy()`, `next/dynamic` ou imports dinamicos. | Todo o projeto | Bundle JavaScript excessivamente grande. |
| FE-C04 | **Excesso de "use client"** -- 17 arquivos client vs 1 "use server". | Todas as paginas em `app/` | Perde beneficios de React Server Components. |

### HIGH

| ID | Debito | Localizacao | Impacto |
|----|--------|-------------|---------|
| FE-H01 | **Sem formularios estruturados** -- Inputs raw HTML sem react-hook-form, sem `<label>` semanticos. | `entrar/`, `criar-conta/`, `perfil/`, `agenda/`, `foco/`, `tarefas/` | Acessibilidade comprometida, validacao inconsistente. |
| FE-H02 | **ErrorBoundary inconsistente** -- Apenas 2 de 11 paginas usam ErrorBoundary. | 9 paginas sem: foco, habitos, agenda, cursos, perfil, auth | Erros nao capturados crasham toda a app. |
| FE-H03 | **Validacao Zod incompleta** -- Apenas tarefas e pendencias possuem schemas Zod. Habitos, eventos, metas e cursos nao. | `hooks/useHabitos.ts`, `hooks/useAgenda.ts`, `hooks/useMetas.ts`, `hooks/useCursos.ts` | Dados invalidos chegam ao banco. |
| FE-H04 | **Toast inconsistente** -- Algumas mutations tem toast, outras nao. | `useHabitos.ts` (sem), `useAgenda.ts` (sem) vs `useTarefas.ts` (com) | Feedback inconsistente para o usuario. |

### MEDIUM

| ID | Debito | Localizacao | Impacto |
|----|--------|-------------|---------|
| FE-M01 | **Zero `next/image`** -- Nenhum uso do componente Image otimizado. | Todo o projeto | Imagens futuras sem lazy loading, responsive, WebP/AVIF. |
| FE-M02 | **Estado local descontrolado no Foco** -- 26 `useState` em um unico componente. | `app/foco/page.tsx` | Complexidade cognitiva extrema. |
| FE-M03 | **Falta `prefers-reduced-motion`** -- Animacoes sem respeitar preferencia do usuario. | `componentes/ui/estado-vazio.tsx`, animacoes em geral | Acessibilidade para usuarios sensiveis a movimento. |

### LOW

| ID | Debito | Localizacao | Impacto |
|----|--------|-------------|---------|
| FE-L01 | **React.memo limitado** -- Apenas 4 componentes memoizados no dashboard. | `app/inicio/page.tsx` | Re-renders desnecessarios em listas. |
| FE-L02 | **SVG inline no login** -- Icone Google como SVG inline. | `app/entrar/page.tsx` | Dificil manutencao e reutilizacao. |

---

## 4. Debitos Cross-Cutting (Transversais)

Debitos que afetam multiplas areas simultaneamente.

### CRITICAL

| ID | Debito | Areas Afetadas | Impacto |
|----|--------|---------------|---------|
| CC-C01 | **Zero cobertura de testes** -- Nenhum framework (Jest, Vitest, Playwright) configurado. 0% de cobertura. | Sistema + DB + Frontend | Impossivel validar regressoes. Qualquer mudanca pode quebrar funcionalidades silenciosamente. |
| CC-C02 | **Dados mockados obsoletos** -- `app/inicio/dados-dashboard.ts` exporta constantes estaticas que misturam dados ativos (sidebar menu) com dados obsoletos (nivelAtual, missoesDiarias). | Sistema + Frontend | Confusao entre dados reais e mock. Risco de usar mock em producao. |

### HIGH

| ID | Debito | Areas Afetadas | Impacto |
|----|--------|---------------|---------|
| CC-H01 | **`console.error` em producao** -- 6 ocorrencias em `lib/supabase/auth.ts`. | Seguranca + Frontend | Vazamento de stack traces no browser console. |

---

## 5. Matriz Preliminar de Priorizacao

Priorizacao baseada em **Impacto x Esforco** com fator de risco.

### Legenda
- **Impacto:** 1 (Baixo) a 5 (Critico)
- **Esforco:** 1 (Horas) a 5 (Semanas)
- **Risco:** Probabilidade de causar incidente em producao
- **Score:** `Impacto * 2 + Risco * 2 - Esforco` (maior = mais urgente)

### Top 20 -- Priorizacao Preliminar

| # | ID | Debito | Impacto | Esforco | Risco | Score | Acao |
|---|-----|--------|---------|---------|-------|-------|------|
| 1 | DB-C01 | SECURITY DEFINER sem auth | 5 | 1 | 5 | **19** | Sprint atual |
| 2 | CC-C01 | Zero testes | 5 | 3 | 4 | **15** | Sprint atual |
| 3 | SY-C01 | Formula nivel divergente | 5 | 1 | 4 | **17** | Sprint atual |
| 4 | DB-C02 | Seed data em producao | 4 | 1 | 4 | **15** | Sprint atual |
| 5 | SY-H01 | Query keys sem userId | 4 | 1 | 4 | **15** | Sprint atual |
| 6 | DB-H03 | handle_new_user via RPC | 4 | 1 | 4 | **15** | Sprint atual |
| 7 | DB-C03 | Tipos TS desatualizados | 4 | 2 | 3 | **11** | Sprint atual |
| 8 | FE-C02 | Navegacao mobile | 5 | 3 | 3 | **13** | Proximo sprint |
| 9 | SY-C02 | Tripla instancia Supabase | 4 | 2 | 3 | **11** | Proximo sprint |
| 10 | DB-H09 | Progresso sem CHECK | 3 | 1 | 3 | **11** | Proximo sprint |
| 11 | FE-C01 | God Components | 5 | 4 | 2 | **10** | Proximo sprint |
| 12 | DB-H11 | Migrations 007 duplicada | 3 | 1 | 3 | **11** | Proximo sprint |
| 13 | CC-H01 | console.error producao | 3 | 1 | 2 | **9** | Proximo sprint |
| 14 | FE-H02 | ErrorBoundary inconsist. | 4 | 2 | 2 | **10** | Proximo sprint |
| 15 | FE-H03 | Zod incompleta | 4 | 2 | 2 | **10** | Proximo sprint |
| 16 | DB-H04 | N updates reordenacao | 3 | 2 | 2 | **8** | Backlog |
| 17 | DB-H05 | Streak loop O(N) | 3 | 2 | 2 | **8** | Backlog |
| 18 | FE-C03 | Zero code splitting | 4 | 3 | 1 | **8** | Backlog |
| 19 | DB-H06 | Soft delete ausente | 4 | 3 | 2 | **9** | Backlog |
| 20 | DB-H07 | Audit trail ausente | 4 | 3 | 2 | **9** | Backlog |

:warning: **Nota:** Estimativas de esforco sao preliminares. Especialistas devem ajustar.

---

## 6. Mapa de Dependencias

### Grafo de Dependencias entre Debitos

```
DB-C01 (SECURITY DEFINER) ──────> DB-H07 (Audit Trail)
  "Corrigir funcoes antes          "Sem audit trail, nao
   de adicionar audit trail"        detectamos abusos"

SY-C01 (Formula nivel) <────────> DB-C03 (Tipos TS)
  "Alinhar formula requer          "Tipos corretos refletem
   tipos corretos"                  formula do banco"

SY-C02 (Tripla instancia) ──────> SY-H01 (Query keys)
  "Unificar client antes           "userId depende de
   de corrigir query keys"          client unificado"

FE-C01 (God Components) ────────> FE-C03 (Code splitting)
  "Extrair componentes antes       "Nao ha o que splittar
   de implementar splitting"        em God Components"

FE-C01 (God Components) ────────> FE-H02 (ErrorBoundary)
  "Componentes menores facilitam   "ErrorBoundary por
   boundaries granulares"            componente, nao pagina"

CC-C01 (Zero testes) ──────────> TODOS
  "Testes sao pre-requisito        "Qualquer refatoracao sem
   para refatoracao segura"          testes e arriscada"

DB-C03 (Tipos TS) ─────────────> FE-H03 (Zod schemas)
  "Tipos corretos alimentam        "Schemas Zod derivados
   schemas de validacao"             dos tipos do banco"
```

### Ordem Recomendada de Resolucao

```
Onda 1 (Fundacional):
  CC-C01 (Testes) + DB-C01 (Security) + SY-C01 (Formula nivel)

Onda 2 (Integridade):
  DB-C03 (Tipos TS) + SY-C02 (Client unificado) + DB-C02 (Seed data)

Onda 3 (Qualidade):
  SY-H01 (Query keys) + FE-H03 (Zod) + FE-H02 (ErrorBoundary)

Onda 4 (Refatoracao):
  FE-C01 (God Components) + FE-C02 (Mobile nav)

Onda 5 (Performance):
  FE-C03 (Code splitting) + DB-H04/H05 (N+1 patterns)

Onda 6 (Robustez):
  DB-H06 (Soft delete) + DB-H07 (Audit trail)
```

---

## 7. Perguntas para Especialistas

### Para @data-engineer (Fase 5)

1. **DB-C01 (SECURITY DEFINER):** Qual a melhor abordagem -- adicionar `IF auth.uid() != p_user_id THEN RAISE EXCEPTION` em cada funcao, ou converter todas para `SECURITY INVOKER` e ajustar as queries? Ha funcoes que *precisam* de DEFINER por razoes legitimas (ex: `add_user_xp` precisa atualizar `users` que tem RLS)?

2. **DB-H08 (UNIQUE constraint habit_history):** Voce consegue verificar se a constraint UNIQUE sobreviveu ao rename da migration 004? Execute: `SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint WHERE conrelid = 'public.habit_history'::regclass;`

3. **DB-H05 (Streak O(N)):** A sugestao de usar window functions e viavel? Ha alternativa mais simples como manter `current_streak` e `longest_streak` como campos calculados com trigger de UPDATE em `habit_history`?

4. **DB-C02 (Seed data):** O `supabase/seed.sql` ja esta configurado em `config.toml`? Basta mover o conteudo ou precisamos de configuracao adicional?

5. **DB-M03/M04 (Indexes ausentes):** Voce validou quais queries sao as mais custosas? Ha pgstat data disponivel para confirmar a necessidade dos indexes sugeridos?

6. **DB-H01 (Cursos anon):** A exposicao do catalogo para `anon` e intencional (catalogo publico para SEO)? Se sim, devemos apenas documentar e adicionar rate limiting?

7. **DB-H09 (Progresso sem CHECK):** A constraint `progresso_atual <= progresso_total` pode causar problemas se o `progresso_total` for reduzido apos o usuario ja ter progresso? Devemos tratar no banco ou no aplicacao?

8. **DB-M09 (Archiving):** Qual estrategia de archiving e mais adequada para `focus_sessions`? Particionamento por data, materialized view para stats, ou tabela separada `focus_sessions_archive`?

### Para @ux-design-expert (Fase 6)

1. **FE-C02 (Mobile nav):** Qual padrao e mais adequado para o Builders Performance -- bottom tab bar (estilo app mobile), hamburger menu com drawer, ou ambos? O app tem 7 rotas principais + subrotas de cursos.

2. **FE-C01 (God Components):** Na refatoracao de `habitos/page.tsx` (2161 linhas), a sugestao e extrair `HabitosList`, `HabitosForm`, `MetasTab`, `ObjetivosBoard`. Essa divisao faz sentido do ponto de vista de UX? Ha fluxos que precisam coexistir no mesmo componente?

3. **FE-H01 (Formularios):** Vale adotar `react-hook-form` neste estagio, ou manter inputs controlados com `useState` e apenas adicionar `<label>` semanticos e validacao Zod inline? Qual o tradeoff de complexidade?

4. **FE-M03 (prefers-reduced-motion):** Quais animacoes especificas devem respeitar esta preferencia? Apenas as de `estado-vazio.tsx` ou ha outras animacoes no sistema (transicoes de sidebar, modais, etc.)?

5. **FE-H04 (Toast inconsistente):** Devemos padronizar toast de sucesso em TODAS as mutations (criar, editar, deletar), ou apenas nas destrutivas (deletar)?

6. **Contraste WCAG:** A cor `--muted-foreground: #6b6b6b` sobre `--background: #f6f6f6` precisa ser verificada. Voce pode validar os ratios de contraste para todas as combinacoes criticas?

7. **Esqueletos:** O arquivo `esqueleto.tsx` (584 linhas, 16 variantes) e muito extenso. Deve ser dividido ou a centralizacao e desejada?

---

## 8. Plano de Acao Preliminar

### Sprint Atual -- Correcoes Criticas de Seguranca

| # | Debito | Responsavel | Estimativa |
|---|--------|-------------|------------|
| 1 | DB-C01: Auth validation em SECURITY DEFINER | @data-engineer | 2-4h |
| 2 | DB-H03: Revogar EXECUTE de handle_new_user | @data-engineer | 30min |
| 3 | SY-C01: Alinhar formula de nivel | @dev | 2-4h |
| 4 | DB-C02: Mover seed data para seed.sql | @data-engineer | 1-2h |
| 5 | SY-H01: Adicionar userId a query keys | @dev | 1-2h |
| 6 | CC-H01: Remover console.error em auth.ts | @dev | 30min |
| 7 | DB-H11: Renumerar migration 007 duplicada | @data-engineer | 30min |

### Proximo Sprint -- Infraestrutura de Qualidade

| # | Debito | Responsavel | Estimativa |
|---|--------|-------------|------------|
| 8 | CC-C01: Configurar Vitest + React Testing Library | @dev | 4-8h |
| 9 | DB-C03: Regenerar tipos TS (supabase gen types) | @data-engineer + @dev | 2-4h |
| 10 | SY-C02: Unificar Supabase client | @dev | 2-4h |
| 11 | FE-H03: Criar schemas Zod para todos dominios | @dev | 4-8h |
| 12 | FE-H02: Adicionar ErrorBoundary em todas paginas | @dev | 2-4h |

### Sprint +2 -- Refatoracao Frontend

| # | Debito | Responsavel | Estimativa |
|---|--------|-------------|------------|
| 13 | FE-C02: Implementar navegacao mobile | @dev + @ux-design-expert | 8-16h |
| 14 | FE-C01: Quebrar God Components (habitos, foco, tarefas, agenda) | @dev | 16-24h |
| 15 | FE-C04: Migrar partes estaticas para RSC | @dev | 8-16h |

### Sprint +3 -- Performance e Robustez

| # | Debito | Responsavel | Estimativa |
|---|--------|-------------|------------|
| 16 | DB-H04: RPC batch para reordenacao | @data-engineer | 4-8h |
| 17 | DB-H05: Reescrever streak com window functions | @data-engineer | 2-4h |
| 18 | FE-C03: Implementar code splitting | @dev | 4-8h |
| 19 | DB-H06: Implementar soft delete | @data-engineer | 8-16h |
| 20 | DB-H07: Implementar audit trail | @data-engineer | 8-16h |

:warning: **Todas as estimativas sao preliminares e devem ser revisadas pelos especialistas nas Fases 5-6.**

---

## Apendice: Fontes

| Fase | Documento | Linhas | Autor |
|------|-----------|--------|-------|
| 1 | `docs/architecture/system-architecture.md` | 804 | @architect |
| 2 | `supabase/docs/SCHEMA.md` | 821 | @data-engineer |
| 2 | `supabase/docs/DB-AUDIT.md` | 672 | @data-engineer |
| 3 | `docs/frontend/frontend-spec.md` | 603 | @ux-design-expert |

---

*DRAFT gerado por @architect (Aria) -- Synkra AIOS v2.0*
*Ultima atualizacao: 2026-01-29*
*Status: Aguardando revisao de @data-engineer (Fase 5) e @ux-design-expert (Fase 6)*
