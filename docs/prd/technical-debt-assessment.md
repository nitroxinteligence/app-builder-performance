# Technical Debt Assessment - FINAL

**Projeto:** Builders Performance
**Data:** 2026-01-29
**Autor:** @architect (Aria) -- Synkra AIOS
**Status:** FINAL -- Aprovado com condicoes pelo @qa
**Revisores:** @data-engineer, @ux-design-expert, @qa
**Workflow:** brownfield-discovery v3.1 -- Phase 8 (Final Assessment)

---

## Indice

1. [Resumo Executivo](#resumo-executivo)
2. [Inventario Completo de Debitos](#inventario-completo-de-debitos)
   - [Sistema (validado por @architect)](#1-debitos-de-sistema-arquitetura)
   - [Database (validado por @data-engineer)](#2-debitos-de-database)
   - [Frontend/UX (validado por @ux-design-expert)](#3-debitos-de-frontendux)
   - [Cross-Cutting (transversais)](#4-debitos-cross-cutting-transversais)
3. [Matriz de Priorizacao Final](#5-matriz-de-priorizacao-final)
4. [Plano de Resolucao (Ondas)](#6-plano-de-resolucao-ondas)
5. [Riscos e Mitigacoes](#7-riscos-e-mitigacoes)
6. [Criterios de Sucesso](#8-criterios-de-sucesso)
7. [Metricas de Qualidade](#9-metricas-de-qualidade)
8. [Condicoes Bloqueantes](#10-condicoes-bloqueantes)
9. [Appendix: Dependency Map](#appendix-dependency-map)

---

## Resumo Executivo

### Contagem Total por Severidade (Final, Deduplicada, com Ajustes dos Especialistas)

| Severidade | Sistema | Database | Frontend/UX | Cross-Cutting | **Total** |
|------------|---------|----------|-------------|---------------|-----------|
| CRITICAL   | 2       | 2        | 2           | 2             | **8**     |
| HIGH       | 3       | 7        | 8           | 1             | **19**    |
| MEDIUM     | 4       | 15       | 5           | 0             | **24**    |
| LOW        | 0       | 10       | 3           | 0             | **13**    |
| **Total**  | **9**   | **34**   | **18**      | **3**         | **64**    |

**Alteracoes em relacao ao DRAFT original (52 debitos):**
- DB-H10 removido (duplicata de DB-C03) -- identificado pelo @data-engineer
- 5 novos debitos de database adicionados pelo @data-engineer (DB-NEW-01 a DB-NEW-05)
- 5 novos debitos de frontend adicionados pelo @ux-design-expert (FE-N01 a FE-N05)
- 7 debitos de database tiveram severidade reduzida (DB-C02, DB-H01, DB-H06, DB-H07, DB-H08, DB-H11, DB-M01, DB-M09)
- 1 debito de database promovido (DB-M08: MEDIUM -> HIGH)
- 5 debitos de frontend tiveram severidade ajustada (FE-C03: CRIT->HIGH, FE-C04: CRIT->HIGH, FE-H04: HIGH->MED, FE-M01: MED->LOW, FE-M02: MED->HIGH)

### Esforco Total Estimado: ~164h

| Onda | Horas DB | Horas Frontend | Horas Sistema | Total |
|------|---------|---------------|--------------|-------|
| 0 - Quick Wins | 1h | 7h | 0.5h | **~9h** |
| 1 - Seguranca + Fundacao | 4-6h | 0h | 8-14h | **~20h** |
| 2 - Integridade + Tipos | 5-7h | 9-12h | 0h | **~16h** |
| 3 - Reestruturacao Frontend | 0h | 24-32h | 0h | **~28h** |
| 4 - God Components | 0h | 38-52h | 0h | **~45h** |
| 5 - Performance | 5-8h | 10-16h | 0h | **~18h** |
| 6 - Backlog | 18-28h | 4-8h | 0h | **~28h** |
| **Total** | **~42h** | **~102h** | **~17h** | **~164h** |

*Nota: ~164h equivale a ~4-5 semanas de trabalho full-time. Execucao por ondas permite entregas incrementais de valor. 3h adicionais de overhead de QA (verificacoes de baseline, gates de qualidade) estao distribuidas nas ondas.*

### Top 5 Riscos Imediatos

1. **Funcoes SECURITY DEFINER sem auth validation** -- Qualquer usuario autenticado pode manipular XP/dados de outros usuarios via RPC (DB-C01). 7 funcoes afetadas, exploravelmente trivial.
2. **Zero cobertura de testes** -- Nenhum framework de testes configurado. 0% de cobertura. Qualquer refatoracao e cega (CC-C01).
3. **Navegacao mobile inexistente** -- Sidebar usa `hidden lg:flex`. Aplicacao completamente inacessivel em smartphones e tablets (FE-C02).
4. **Inconsistencia na formula de nivel** -- Frontend usa exponencial, backend usa raiz quadrada. Formulas nao equivalentes. Decisao de produto pendente (SY-C01).
5. **Risco cruzado RC01** -- Fix de DB-C01 pode quebrar chamadas RPC se o client Supabase fragmentado (SY-C02) causar divergencia entre `user.id` e `auth.uid()`.

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

## Inventario Completo de Debitos

---

### 1. Debitos de Sistema (Arquitetura)

**Fonte:** `docs/architecture/system-architecture.md`
**Validado por:** @architect
**Total:** 9 debitos (2 CRITICAL, 3 HIGH, 4 MEDIUM)

#### CRITICAL (2)

| ID | Debito | Localizacao | Impacto | Horas Est. |
|----|--------|-------------|---------|------------|
| SY-C01 | **Inconsistencia na formula de nivel** -- Frontend usa `XP_PER_LEVEL * Math.pow(1.2, level-1)` (exponencial), backend usa `FLOOR(SQRT(xp/100)) + 1` (raiz quadrada). Formulas **nao equivalentes**. **REQUER decisao de produto sobre formula canonica.** | `lib/utils/dashboard.ts` vs `000_consolidated_schema.sql:410` | Usuario ve nivel diferente do real. Gamificacao corrompida. | 2-4h |
| SY-C02 | **Tripla instancia Supabase client** -- Tres formas de criar o client browser: singleton em `lib/supabase.ts`, factory em `lib/supabase/client.ts`, e instancia interna no `AuthProvider`. | `lib/supabase.ts`, `lib/supabase/client.ts`, `lib/providers/auth-provider.tsx` | Inconsistencia de sessao, logout pode nao propagar, cache de auth fragmentado. Risco cruzado com DB-C01 (RC01). | 2-4h |

#### HIGH (3)

| ID | Debito | Localizacao | Impacto | Horas Est. |
|----|--------|-------------|---------|------------|
| SY-H01 | **Query keys sem userId** -- Hooks `useTarefas`, `useHabitos`, `useMetas`, `usePendencias` usam keys como `['tarefas']` sem userId. | `hooks/useTarefas.ts:11`, `hooks/useHabitos.ts:22-24`, `hooks/usePendencias.ts:11` | Cache pode vazar entre sessoes de usuarios diferentes. | 1-2h |
| SY-H02 | **Tabelas referenciadas mas possivelmente ausentes** -- Hooks referenciam `objectives`, `objective_columns`, `goal_milestones`, `habit_history` que podem nao existir no schema consolidado. | `hooks/useMetas.ts`, `hooks/useHabitos.ts` | Queries falham silenciosamente ou dados nao persistem. | 2-4h |
| SY-H03 | **Hook useMetas.ts excessivamente grande (693 linhas)** -- 4 dominios em um unico arquivo: Metas, Objetivos, Colunas, Marcos. | `hooks/useMetas.ts` | Dificil manter, testar e debugar. | 4-8h |

#### MEDIUM (4)

| ID | Debito | Localizacao | Impacto | Horas Est. |
|----|--------|-------------|---------|------------|
| SY-M01 | **Sem next.config.ts customizado** -- Configuracao vazia. Sem headers de seguranca, redirects, ou otimizacoes. | `next.config.ts` | Sem CSP, HSTS, X-Frame-Options. | 2-4h |
| SY-M02 | **Nenhuma pagina usa RSC para data fetching** -- Todas as paginas protegidas sao `"use client"`. | Todas as paginas em `app/` | Perde SSR/streaming, mais JavaScript no cliente. | 8-16h |
| SY-M03 | **Missoes semanais hardcoded** -- Texto estatico sem logica de progresso real. | `hooks/useDashboard.ts:315-338` | Feature decorativa, nao funcional. | 2-4h |
| SY-M04 | **Streak shields sem implementacao** -- Campo existe no banco mas nao ha logica de consumo. | `users.streak_shields` | Feature prometida nao funciona. | 4-8h |

---

### 2. Debitos de Database

**Fonte:** `supabase/docs/DB-AUDIT.md`, `supabase/docs/SCHEMA.md`, todas as migrations em `supabase/migrations/implementados/`
**Validado por:** @data-engineer
**Total:** 34 debitos (2 CRITICAL, 7 HIGH, 15 MEDIUM, 10 LOW)

*Nota: O DRAFT original continha um erro de contagem no resumo (listava 27, mas as tabelas detalhadas continham 30 itens). Apos remocao de 1 duplicata (DB-H10) e adicao de 5 novos debitos, o total e 34.*

#### Ajustes de Severidade Aplicados pelo @data-engineer

| ID | Severidade Original (DRAFT) | Severidade Final | Justificativa |
|----|----------------------------|-----------------|---------------|
| DB-C02 | CRITICAL | **HIGH** | `ON CONFLICT DO NOTHING` mitiga risco de corrupcao imediata |
| DB-H01 | HIGH | **MEDIUM** | Catalogo publico e padrao comum para SEO; mitigar via rate limiting |
| DB-H06 | HIGH | **MEDIUM** | App em estagio inicial; complexidade significativa em queries e RLS |
| DB-H07 | HIGH | **MEDIUM** | App em estagio inicial; sobe de prioridade apos fix de DB-C01 |
| DB-H08 | HIGH | **MEDIUM** | PostgreSQL preserva constraints em renames; verificacao em runtime necessaria |
| DB-H10 | HIGH | **REMOVIDO** | Duplicata de DB-C03 |
| DB-H11 | HIGH | **MEDIUM** | Ambas migrations sao idempotentes; fix trivial |
| DB-M01 | MEDIUM | **LOW** | Design intencional: cursos gerenciados via service_role |
| DB-M08 | MEDIUM | **HIGH** | 3x chamadas da mesma funcao com full scan; impacto real de performance |
| DB-M09 | MEDIUM | **LOW** | ~1825 registros/ano/usuario e trivial para PostgreSQL |

#### CRITICAL (2)

| ID | Debito | Localizacao | Impacto | Horas Est. | Prioridade |
|----|--------|-------------|---------|------------|------------|
| DB-C01 | **Funcoes SECURITY DEFINER sem validacao de ownership** -- 7 funcoes afetadas: `add_user_xp`, `add_task_time`, `complete_focus_session`, `get_focus_stats`, `cancel_active_sessions`, `complete_lesson`, `get_course_progress`. A funcao `check_habit` ja valida ownership. Abordagem hibrida recomendada: manter SECURITY DEFINER com validacao `auth.uid()` interna. | `000_consolidated_schema.sql:417-587`, `007_create_courses_schema.sql:208-279` | **SEGURANCA**: Qualquer usuario autenticado pode manipular XP, completar aulas, cancelar sessoes de outro usuario via RPC. | 3-4h | P0 |
| DB-C03 | **Tipos TypeScript completamente desatualizados** -- `lib/supabase/types.ts` nao contem 12+ tabelas, 6+ enums, views e funcoes do schema real. Dois arquivos de tipos (`types/database.ts` vs `lib/supabase/types.ts`) se sobrepoem. Solucao: regenerar via `supabase gen types typescript` e manter unico ponto de verdade. | `lib/supabase/types.ts`, `types/database.ts` | TypeScript ignora campos reais do banco. Bugs silenciosos em tempo de desenvolvimento. | 3-4h | P0 |

#### HIGH (7)

| ID | Debito | Localizacao | Impacto | Horas Est. | Prioridade |
|----|--------|-------------|---------|------------|------------|
| DB-C02 | **Seed data com UUID hardcoded no schema de producao** -- Usuario mock "Mateus Pereira" com UUID fixo. Presente em `000_consolidated_schema.sql:629-692`, `007_create_courses_schema.sql:309-456` e `007_create_events_table.sql:116-128`. `ON CONFLICT DO NOTHING` mitiga corrupcao, mas seed DEVE ser extraido para `seed.sql` (ja configurado no `config.toml`). **Rebaixado de CRITICAL.** | Multiplas migrations | Dados de teste em producao. Potencial violacao de privacidade. | 1-2h | P0 |
| DB-H02 | **Admin criado via SQL com senha visivel** -- Migration exibe senha no resultado da query via `SELECT n.password AS senha`. Logs que capturam output contem senha em plaintext. | `002_create_admin_user.sql:108-115` | Exposicao de credenciais em logs. | 1h | P1 |
| DB-H03 | **`handle_new_user()` chamavel via RPC** -- Funcao SECURITY DEFINER sem revogacao de EXECUTE para `public`/`authenticated`/`anon`. Fix trivial: 3 linhas de SQL. | `001_auth_profiles_trigger.sql:16-36` | Criacao/alteracao de perfis arbitrarios. | 0.5h | P0 |
| DB-H04 | **`reordenarTarefas` faz N updates individuais** -- N chamadas HTTP para reordenar N tarefas. Pattern no hook, nao no banco. Requer criar funcao RPC `batch_reorder_tasks`. | `hooks/useTarefas.ts:134-150` | Latencia acumulada, rate limits. | 4-6h | P3 |
| DB-H05 | **`get_habit_streak()` usa loop O(N)** -- Loop iterativo com N queries internas por dia de streak. Campos calculados `streak_atual` e `maior_streak` ja existem na tabela `habits` e sao atualizados por `check_habit()`. Funcao e redundante. | `004_fix_database_naming.sql:130-145` | Performance degradante (365 queries para streak de 1 ano). | 1h (deprecar) | P3 |
| DB-H09 | **Progresso sem CHECK de limites** -- `goals.progresso_atual` e `objectives.progresso_atual` aceitam qualquer valor. Constraint `progresso_atual <= progresso_total` NAO recomendada no banco (tratar na aplicacao via Zod). | Tabelas `goals`, `objectives` | Dados corrompidos, barra de progresso > 100%. | 1-2h | P1 |
| DB-M08 | **`get_focus_stats` chamado 3 vezes no dashboard** -- Mesma RPC executada em fetchDailyStats, fetchWeeklyStats e focusStatsQuery. Full scan em `focus_sessions` sem index composto. **Promovido de MEDIUM para HIGH pelo @data-engineer.** | `hooks/useDashboard.ts:86,159,380-390` | Trabalho triplicado, performance degradada. | 1-2h | P2 |

#### MEDIUM (15)

| ID | Debito | Localizacao | Impacto | Horas Est. | Prioridade |
|----|--------|-------------|---------|------------|------------|
| DB-H01 | **Cursos acessiveis por `anon` sem rate limiting** -- Exposicao intencional para SEO (confirmado por comentarios na migration). Risco real e scraping. **Rebaixado de HIGH.** | `007_create_courses_schema.sql:131-166` | Scraping de catalogo sem rate limiting. | 1h | P2 |
| DB-H06 | **Ausencia de soft delete** -- Registros removidos permanentemente. **Rebaixado de HIGH** (app em estagio inicial, complexidade significativa). | Todas as tabelas | Sem recuperacao, sem auditoria de delecoes. | 8-12h | P4 |
| DB-H07 | **Ausencia de audit trail** -- Sem log de alteracoes. **Rebaixado de HIGH.** Sobe de prioridade apos fix de DB-C01. | Todas as tabelas sensiveis | Se XP for adulterado, nao ha rastreio. | 8-12h | P4 |
| DB-H08 | **UNIQUE constraint pode estar quebrada apos rename** -- PostgreSQL preserva constraints automaticamente via `attnum`. Constraint PROVAVELMENTE intacta, mas nome original confuso (`habit_checks_habit_id_check_date_key`). **Rebaixado de HIGH.** | `004_fix_database_naming.sql:38-43` | Requer verificacao em runtime e rename da constraint. | 0.5h | P1 |
| DB-H11 | **Duas migrations com prefixo `007_`** -- Ambas idempotentes, sem dependencia mutua. **Rebaixado de HIGH.** | `supabase/migrations/implementados/` | Ordem de execucao imprevisivel. | 0.5h | P1 |
| DB-M02 | **`goals.status` como TEXT sem CHECK** -- Convertido de ENUM para TEXT sem constraint. Valores validos: `nao_iniciada`, `em_andamento`, `pausada`, `atrasada`, `concluida`. | `005_fix_goals_schema.sql:63-73` | Valores invalidos aceitos. | 0.5h | P2 |
| DB-M03 | **Index ausente `focus_sessions(user_id, status, started_at)`** -- Index composto ajustado pelo @data-engineer para cobrir filtro de status tambem. | `hooks/useDashboard.ts:78-105` | Scans lentos em tabelas grandes. | 0.25h | P2 |
| DB-M04 | **Index ausente `tasks(user_id, concluida_em)`** -- Com poucos registros por usuario, monitorar antes de criar. | `hooks/useDashboard.ts:152-157` | Scans lentos (monitorar). | 0.25h | P5 |
| DB-M05 | **Dashboard faz 5 queries HTTP paralelas** -- Otimizacao via RPC `get_dashboard_stats`. | `hooks/useDashboard.ts:78-105` | Overhead de rede. | 4-6h | P3 |
| DB-M06 | **Cursos busca todos dados e filtra client-side** -- `SELECT *` com filtragem em JS. Supabase suporta nested selects. | `hooks/useCursos.ts:77-119` | Transferencia de dados desnecessarios. | 2-3h | P3 |
| DB-M07 | **Detalhe do curso faz 4 queries sequenciais** -- Reduzivel para 1-2 queries com nested selects. | `hooks/useCursos.ts:248-341` | Latencia acumulada. | 1-2h | P3 |
| DB-M10 | **Campos XP sem CHECK >= 0** -- 5 tabelas afetadas: tasks, habits, goals, objectives, lessons. | Multiplas tabelas | Gamificacao corrompida com XP negativo. | 0.5h | P2 |
| DB-NEW-01 | **Funcao `check_habit` referencia `habit_checks` no schema consolidado** -- Migration 000 usa nomes antigos; migration 004 corrige. Schema consolidado desatualizado. | `000_consolidated_schema.sql:556-564` | Inconsistencia se alguem rodar apenas schema consolidado. | 2-4h | P4 |
| DB-NEW-03 | **Ausencia de CHECK constraint em `events.horario_fim > horario_inicio`** -- Eventos podem ter horario de fim anterior ao inicio. | `007_create_events_table.sql` | Dados temporais invalidos aceitos. | 0.25h | P2 |
| DB-NEW-04 | **Ausencia de CHECK constraint em `users.total_xp >= 0` e `users.level >= 1`** -- XP negativo ou level 0 corrompem gamificacao. | `000_consolidated_schema.sql` (tabela users) | Gamificacao corrompida. | 0.25h | P2 |

#### LOW (10)

| ID | Debito | Localizacao | Impacto | Horas Est. |
|----|--------|-------------|---------|------------|
| DB-L01 | **Campos TEXT sem CHECK constraint** -- `prioridade`, `dificuldade` como TEXT aberto. | Tabelas `goals`, `objectives`, `habits` | Valores invalidos aceitos. | 0.5h |
| DB-L02 | **Redundancia entre `tasks.status` e `tasks.coluna`** -- Sem constraint de consistencia. | Tabela `tasks` | Status e coluna podem divergir. | 1h |
| DB-L03 | **Index `idx_users_email` redundante** -- UNIQUE ja cria index. | `000_consolidated_schema.sql:272` | Overhead de escrita. | 0.1h |
| DB-L04 | **Indexes em campos TEXT de baixa cardinalidade** -- 3-4 valores distintos, seletividade muito baixa. | Multiplas tabelas | Indexes ineficientes. | 0.25h |
| DB-L05 | **Tabela `projects` referenciada mas nao criada** -- `tasks.projeto_id` sem FK. | Tabela `tasks` | Campo orfao. | 0.5h |
| DB-L06 | **Sem tabela de notificacoes** -- Gamificacao sem notificacoes push. Feature futura, nao debito tecnico propriamente. | -- | Conquistas sem feedback. | 8-16h |
| DB-M01 | **Cursos sem politica explicita para INSERT/UPDATE/DELETE auth** -- Design intencional (service_role). **Rebaixado de MEDIUM.** | Tabelas `courses`, `course_modules`, `lessons` | Apenas documentacao necessaria. | 0.5h |
| DB-M09 | **`focus_sessions` sem archiving** -- ~1825 registros/ano/usuario, trivial para PostgreSQL. **Rebaixado de MEDIUM.** Archiving faz sentido a partir de ~10M registros. | Tabela `focus_sessions` | Sem acao imediata necessaria. | 0h (futuro) |
| DB-NEW-02 | **View `habits_today` recriada 3 vezes com definicoes divergentes** -- Schema consolidado desatualizado. `CREATE OR REPLACE` garante correcao em runtime. | Migrations 000, 004, 006 | Confusao, nao bug funcional. | 0h (corrigido por DB-NEW-01) |
| DB-NEW-05 | **`objectives.coluna_id` e `objectives.meta_id` sem FK no schema consolidado** -- FKs adicionadas na migration 004, mas schema 000 nao as tem. Reforca necessidade de schema consolidado atualizado. | `004_fix_database_naming.sql:362-374` | Corrigido por DB-NEW-01. | 0h (corrigido por DB-NEW-01) |

---

### 3. Debitos de Frontend/UX

**Fonte:** `docs/frontend/frontend-spec.md`
**Validado por:** @ux-design-expert
**Total:** 18 debitos (2 CRITICAL, 8 HIGH, 5 MEDIUM, 3 LOW)

#### Ajustes de Severidade Aplicados pelo @ux-design-expert

| ID | Severidade Original (DRAFT) | Severidade Final | Justificativa |
|----|----------------------------|-----------------|---------------|
| FE-C03 | CRITICAL | **HIGH** | Next.js App Router ja faz code split por rota; impacto real e intra-rota |
| FE-C04 | CRITICAL | **HIGH** | Natureza interativa do app justifica client components; oportunidade em shells estaticos |
| FE-H04 | HIGH | **MEDIUM** | Nao bloqueia funcionalidade, apenas consistencia de feedback |
| FE-M01 | MEDIUM | **LOW** | App tem pouquissimas imagens atualmente; impacto futuro |
| FE-M02 | MEDIUM | **HIGH** | 26 useState no timer (feature core) cria risco real de bugs de UX |

#### CRITICAL (2)

| ID | Debito | Localizacao | Impacto | Horas Est. | Impacto UX |
|----|--------|-------------|---------|------------|------------|
| FE-C01 | **God Components** -- 4 paginas violam limite de 800 linhas: `habitos/page.tsx` (2314), `foco/page.tsx` (1281), `tarefas/page.tsx` (1062), `agenda/page.tsx` (863). Re-renders excessivos causam lentidao perceptivel. Qualquer interacao dispara reconciliacao de todo o componente. | `app/habitos/page.tsx`, `app/foco/page.tsx`, `app/tarefas/page.tsx`, `app/agenda/page.tsx` | Impossivel manter, testar ou debugar. Usuario sente travamento ao interagir. | 24-32h | Muito Alto |
| FE-C02 | **Navegacao mobile inexistente** -- Sidebar usa `hidden lg:flex`. Zero alternativa para telas < 1024px. Nenhum hamburger, bottom tab bar, drawer ou qualquer mecanismo de navegacao mobile. | `componentes/layout/sidebar.tsx:105` | **Aplicacao completamente inacessivel em smartphones e tablets.** Bloqueante para growth. | 12-16h | Bloqueante |

#### HIGH (8)

| ID | Debito | Localizacao | Impacto | Horas Est. | Impacto UX |
|----|--------|-------------|---------|------------|------------|
| FE-C03 | **Zero code splitting intra-rota** -- Nenhum `React.lazy()`, `next/dynamic` ou imports dinamicos. Next.js faz split por rota automaticamente (mitigacao parcial). Impacto real em componentes pesados: modais, drag-and-drop, calendarios. **Rebaixado de CRITICAL.** | Todo o projeto | Bundle JavaScript excessivo por rota. | 6-10h | Alto |
| FE-C04 | **Excesso de "use client"** -- 17 arquivos client vs 1 "use server". Natureza interativa do app justifica parcialmente. Oportunidade real: extrair shells estaticos como Server Components. **Rebaixado de CRITICAL.** | Todas as paginas em `app/` | Perde beneficios de RSC para partes estaticas. | 12-20h | Alto |
| FE-H01 | **Sem formularios estruturados** -- Existem labels (habitos: 55+, tarefas: 12+, agenda: 16+), mas sem react-hook-form. Validacao inconsistente, estado manual via useState, falta de mensagens de erro inline. | `entrar/`, `criar-conta/`, `perfil/`, `agenda/`, `foco/`, `tarefas/` | Re-renders por keystroke, validacao inconsistente. | 8-12h | Alto |
| FE-H02 | **ErrorBoundary inconsistente** -- Apenas `tarefas/page.tsx` e `inicio/page.tsx` usam ErrorBoundary. Zero arquivos `error.tsx` ou `loading.tsx` no diretorio app/. | 9 paginas sem: foco, habitos, agenda, cursos, perfil, auth | Erros nao capturados crasham toda a pagina sem recuperacao. | 3-4h | Alto |
| FE-H03 | **Validacao Zod incompleta** -- Apenas `lib/schemas/tarefa.ts` possui schemas Zod. Habitos, metas, eventos e cursos sem validacao frontend. | `hooks/useHabitos.ts`, `hooks/useAgenda.ts`, `hooks/useMetas.ts`, `hooks/useCursos.ts` | Dados invalidos chegam ao banco. Erros genericos em vez de feedback inline. | 6-8h | Alto |
| FE-M02 | **Estado local descontrolado no Foco (26 useState)** -- Risco real de bugs no timer (feature core): glitches quando multiplos states atualizam, perda de contexto em modais, `sendBeacon` com estado fragmentado. **Promovido de MEDIUM.** | `app/foco/page.tsx` | Complexidade cognitiva extrema, bugs de UX no timer. | 6-8h | Muito Alto |
| FE-N01 | **Zero `loading.tsx` / `error.tsx` (Next.js App Router)** -- Nenhuma rota possui os arquivos convencionais do App Router. Zero streaming/Suspense nativo. Zero tratamento de erro por rota. **Novo -- identificado pelo @ux-design-expert.** | `app/*/` (todos os diretorios de rota) | Tela em branco durante carregamento. Sem skeleton nativo. | 4-6h | Alto |
| FE-N03 | **Responsividade insuficiente nas paginas internas** -- `habitos/page.tsx` tem apenas 19 breakpoints responsive, `foco/page.tsx` tem 5, `tarefas/page.tsx` tem 13. Layouts rigidos para paginas de 1000-2300 linhas. **Novo -- identificado pelo @ux-design-expert.** | `app/habitos/`, `app/foco/`, `app/tarefas/` | Conteudo nao se adapta a telas menores mesmo com navegacao mobile. | 8-12h | Alto |

#### MEDIUM (5)

| ID | Debito | Localizacao | Impacto | Horas Est. | Impacto UX |
|----|--------|-------------|---------|------------|------------|
| FE-H04 | **Toast inconsistente** -- `useTarefas.ts` e `usePendencias.ts` tem toast em todas as mutations. `useHabitos.ts`, `useAgenda.ts`, `useMetas.ts` e `useCursos.ts` tem ZERO toasts. **Rebaixado de HIGH.** | 4 hooks sem toast | Feedback inconsistente: criar tarefa mostra toast, marcar habito nao. | 3-4h | Medio |
| FE-M03 | **Falta `prefers-reduced-motion`** -- Zero ocorrencias no codebase. Animacoes: `animate-pulse` em esqueletos, `animate-in fade-in-0 zoom-in-95` em estados vazios, `transition-` em 19 arquivos (41 ocorrencias). | `componentes/ui/estado-vazio.tsx`, animacoes em geral | Acessibilidade para usuarios sensiveis a movimento. Violacao WCAG 2.3.3. | 2-3h | Medio |
| FE-N02 | **Ausencia de skip navigation link** -- Zero ocorrencias de `skip-nav`, `skip-link` ou `skip-to-content`. Usuarios de teclado precisam tabular por toda a sidebar. **Novo -- identificado pelo @ux-design-expert.** | `app/layout.tsx` | Violacao WCAG 2.4.1. Acessibilidade por teclado comprometida. | 0.5h | Medio |
| FE-N04 | **Zero Suspense boundaries para streaming** -- Nenhuma ocorrencia de `<Suspense>` nas paginas. Carregamento tudo-ou-nada. **Novo -- identificado pelo @ux-design-expert.** | Todas as paginas | Usuario espera TODO o JavaScript antes de ver conteudo. | 4-6h | Medio |
| FE-N05 | **Sidebar duplicada em cada pagina** -- Cada pagina importa `<Sidebar>` individualmente. Causa flash de remontagem ao navegar. Deveria ser parte de layout compartilhado (`app/(protegido)/layout.tsx`). **Novo -- identificado pelo @ux-design-expert.** | Todas as paginas protegidas | "Piscar" da sidebar ao navegar entre paginas. | 3-4h | Medio |

#### LOW (3)

| ID | Debito | Localizacao | Impacto | Horas Est. |
|----|--------|-------------|---------|------------|
| FE-L01 | **React.memo limitado** -- Apenas 4 componentes memoizados em `inicio/page.tsx`. React 19 compiler experimental mitiga parcialmente. | `app/inicio/page.tsx` | Re-renders desnecessarios em listas. | 2-4h |
| FE-L02 | **SVG inline no login** -- Icone Google como SVG inline. | `app/entrar/page.tsx` | Dificil manutencao e reutilizacao. | 0.5h |
| FE-M01 | **Zero `next/image`** -- App tem pouquissimas imagens (apenas icones Lucide). Impacto real so quando avatares e thumbnails forem implementados. **Rebaixado de MEDIUM.** | Todo o projeto | Impacto futuro, nao presente. | 1-2h |

---

### 4. Debitos Cross-Cutting (Transversais)

Debitos que afetam multiplas areas simultaneamente.
**Total:** 3 debitos (2 CRITICAL, 1 HIGH)

#### CRITICAL (2)

| ID | Debito | Areas Afetadas | Impacto | Horas Est. |
|----|--------|---------------|---------|------------|
| CC-C01 | **Zero cobertura de testes** -- Nenhum framework (Jest, Vitest, Playwright) configurado. 0% de cobertura. | Sistema + DB + Frontend | Impossivel validar regressoes. Qualquer mudanca pode quebrar funcionalidades silenciosamente. Pre-requisito para refatoracoes de frontend. | 4-8h |
| CC-C02 | **Dados mockados obsoletos** -- `app/inicio/dados-dashboard.ts` exporta constantes estaticas que misturam dados ativos (sidebar menu) com dados obsoletos (nivelAtual, missoesDiarias). | Sistema + Frontend | Confusao entre dados reais e mock. Risco de usar mock em producao. | 1-2h |

#### HIGH (1)

| ID | Debito | Areas Afetadas | Impacto | Horas Est. |
|----|--------|---------------|---------|------------|
| CC-H01 | **`console.error` em producao** -- 6 ocorrencias em `lib/supabase/auth.ts`. | Seguranca + Frontend | Vazamento de stack traces no browser console. | 0.5h |

---

## 5. Matriz de Priorizacao Final

Priorizacao baseada em **Impacto x Esforco** com fator de risco, incorporando ajustes dos tres especialistas.

### Legenda
- **Impacto:** 1 (Baixo) a 5 (Critico)
- **Esforco:** 1 (Horas) a 5 (Semanas)
- **Risco:** Probabilidade de causar incidente em producao
- **Score:** `Impacto * 2 + Risco * 2 - Esforco` (maior = mais urgente)

### Top 25 -- Priorizacao Final

| # | ID | Debito | Sev. | Impacto | Esforco | Risco | Score | Onda |
|---|-----|--------|------|---------|---------|-------|-------|------|
| 1 | DB-C01 | SECURITY DEFINER sem auth | CRIT | 5 | 2 | 5 | **18** | Onda 1 |
| 2 | SY-C01 | Formula nivel divergente | CRIT | 5 | 1 | 4 | **17** | Onda 1 |
| 3 | CC-C01 | Zero testes | CRIT | 5 | 3 | 4 | **15** | Onda 1 |
| 4 | DB-H03 | handle_new_user via RPC | HIGH | 4 | 1 | 4 | **15** | Onda 0 |
| 5 | SY-H01 | Query keys sem userId | HIGH | 4 | 1 | 4 | **15** | Onda 1 |
| 6 | SY-C02 | Tripla instancia Supabase | CRIT | 4 | 2 | 4 | **14** | Onda 1 |
| 7 | DB-C02 | Seed data em producao | HIGH | 4 | 1 | 3 | **13** | Onda 1 |
| 8 | FE-C02 | Navegacao mobile | CRIT | 5 | 3 | 3 | **13** | Onda 3 |
| 9 | DB-C03 | Tipos TS desatualizados | CRIT | 4 | 2 | 3 | **11** | Onda 2 |
| 10 | DB-H09 | Progresso sem CHECK | HIGH | 3 | 1 | 3 | **11** | Onda 2 |
| 11 | FE-C01 | God Components | CRIT | 5 | 4 | 2 | **10** | Onda 4 |
| 12 | FE-H02 | ErrorBoundary inconsist. | HIGH | 4 | 2 | 2 | **10** | Onda 2 |
| 13 | FE-H03 | Zod incompleta | HIGH | 4 | 2 | 2 | **10** | Onda 2 |
| 14 | FE-M02 | 26 useState no Foco | HIGH | 4 | 2 | 2 | **10** | Onda 4 |
| 15 | CC-H01 | console.error producao | HIGH | 3 | 1 | 2 | **9** | Onda 0 |
| 16 | DB-H11 | Migration 007 duplicada | MED | 3 | 1 | 2 | **9** | Onda 0 |
| 17 | FE-N05 | Sidebar duplicada | MED | 3 | 1 | 2 | **9** | Onda 3 |
| 18 | DB-M08 | get_focus_stats 3x | HIGH | 3 | 1 | 2 | **9** | Onda 5 |
| 19 | FE-N01 | Zero loading.tsx/error.tsx | HIGH | 3 | 2 | 2 | **8** | Onda 0 |
| 20 | FE-C03 | Code splitting | HIGH | 4 | 3 | 1 | **8** | Onda 5 |
| 21 | DB-H04 | N updates reordenacao | HIGH | 3 | 2 | 2 | **8** | Onda 5 |
| 22 | FE-N03 | Responsividade interna | HIGH | 3 | 3 | 2 | **7** | Onda 3 |
| 23 | FE-H04 | Toast inconsistente | MED | 2 | 1 | 1 | **6** | Onda 0 |
| 24 | FE-M03 | prefers-reduced-motion | MED | 2 | 1 | 1 | **6** | Onda 0 |
| 25 | FE-N02 | Skip navigation | MED | 2 | 1 | 1 | **6** | Onda 0 |

---

## 6. Plano de Resolucao (Ondas)

Ordem consolidada integrando as tres propostas (DRAFT + DB review + UX review), conforme validacao e reordenacao do @qa (Secao 3.3 da qa-review).

### Onda 0 -- Quick Wins (1-2 dias, ~9h)

Acoes de baixo esforco e alto impacto imediato. Sem dependencias entre si.

| # | Debito | Acao | Responsavel | Horas |
|---|--------|------|-------------|-------|
| 1 | FE-M03 | Adicionar `prefers-reduced-motion` global em `globals.css`. Ajustar `--muted-foreground` de `#6b6b6b` para `#5f5f5f` (contraste ~6.0:1 AA). | @dev | 1h |
| 2 | FE-N02 | Adicionar skip navigation link em `layout.tsx` | @dev | 0.5h |
| 3 | FE-H04 | Padronizar toast em `useHabitos`, `useAgenda`, `useMetas`, `useCursos`. Criar utilitario `lib/utilidades-toast.ts`. | @dev | 3h |
| 4 | FE-N01 | Criar `error.tsx` generico na raiz de `app/` + `loading.tsx` com esqueletos nas 5 rotas principais | @dev | 2h |
| 5 | DB-H03 | Revogar EXECUTE de `handle_new_user()` para public, authenticated e anon | @data-engineer | 0.5h |
| 6 | DB-H11 | Renomear `007_create_courses_schema.sql` para `008_create_courses_schema.sql` | @data-engineer | 0.5h |
| 7 | CC-H01 | Remover `console.error` em `lib/supabase/auth.ts`. Substituir por error handling adequado. | @dev | 0.5h |

### Onda 1 -- Seguranca + Fundacao (1 sprint, ~20h)

Pre-requisito para todas as ondas seguintes. Resolve vulnerabilidades criticas e estabelece infraestrutura de testes.

| # | Debito | Acao | Responsavel | Horas | Dependencias |
|---|--------|------|-------------|-------|-------------|
| 1 | SY-C02 | Unificar Supabase client em `lib/supabase/client.ts` (singleton). Remover `lib/supabase.ts`. AuthProvider usa client unificado. | @dev | 2-4h | Nenhuma |
| 2 | DB-C01 | Auth validation em SECURITY DEFINER: migration `009_fix_security_definer_auth.sql`. 7 funcoes corrigidas com `IF auth.uid() IS DISTINCT FROM p_user_id THEN RAISE EXCEPTION`. | @data-engineer | 3-4h | SY-C02 (client unificado para garantir auth.uid() correto) |
| 3 | SY-H01 | Adicionar userId a todas as query keys. Invalidar cache ao trocar usuario. | @dev | 1-2h | SY-C02 |
| 4 | DB-C02 | Mover seed data para `supabase/seed.sql`. Remover seeds das migrations 000, 007. Verificar `supabase db reset`. | @data-engineer | 1-2h | Nenhuma |
| 5 | CC-C01 | Configurar Vitest + React Testing Library + script de cobertura. Pelo menos 1 teste unitario, 1 de integracao e 1 snapshot. Threshold 80%. | @dev | 4-8h | Nenhuma |
| 6 | SY-C01 | Alinhar formula de nivel entre frontend e backend. Recalcular niveis de usuarios existentes se necessario. | @dev + @data-engineer | 2-4h | **REQUER decisao de produto sobre formula canonica** |
| 7 | CC-C02 | Limpar dados mockados obsoletos de `dados-dashboard.ts`. Manter apenas dados ativos (sidebar menu). | @dev | 1-2h | Nenhuma |

### Onda 2 -- Integridade + Tipos (1 sprint, ~16h)

Estabiliza schema, tipos e validacao. Depende de Onda 1 (schema estavel).

| # | Debito | Acao | Responsavel | Horas | Dependencias |
|---|--------|------|-------------|-------|-------------|
| 1 | DB-C03 | Regenerar tipos TS via `supabase gen types typescript`. Remover `types/database.ts`. Atualizar todos os imports. `npm run typecheck` como gate. | @data-engineer + @dev | 3-4h | Onda 1 completa |
| 2 | DB-H09, DB-M10, DB-M02, DB-NEW-03, DB-NEW-04 | Migration `011_add_check_constraints.sql`: CHECK constraints para progresso (>= 0), XP (>= 0), level (>= 1), horarios (fim > inicio), status goals (enum values). **Corrigir dados invalidos existentes ANTES de adicionar constraints** (RC07). | @data-engineer | 1-2h | Onda 1 |
| 3 | DB-M03 | Migration `012_add_composite_indexes.sql`: `idx_focus_sessions_user_status_started(user_id, status, started_at DESC)`. | @data-engineer | 0.25h | Nenhuma |
| 4 | FE-H03 | Criar schemas Zod para habitos, metas, eventos, cursos, perfil. Derivados dos tipos TS do banco. | @dev | 6-8h | DB-C03 (tipos corretos) |
| 5 | FE-H02 | Adicionar `error.tsx` por route group + ErrorBoundary em paginas restantes. `loading.tsx` por rota. | @dev | 3-4h | Nenhuma |
| 6 | DB-H08 | Verificar UNIQUE constraint em runtime (`pg_get_constraintdef`). Renomear constraint para `uq_habit_history_habito_data` se necessario. | @data-engineer | 0.5h | Nenhuma |

### Onda 3 -- Reestruturacao Frontend (1 sprint, ~28h)

Prepara a estrutura de layout para refatoracao de God Components. Mobile nav como prioridade de growth.

| # | Debito | Acao | Responsavel | Horas | Dependencias |
|---|--------|------|-------------|-------|-------------|
| 1 | FE-N05 | Criar route groups `(auth)` e `(protegido)`. Mover Sidebar para layout compartilhado `app/(protegido)/layout.tsx`. | @dev | 4h | Onda 2 |
| 2 | FE-C02 | Implementar bottom tab bar (5 tabs: Inicio, Foco, Tarefas, Habitos, Mais) + drawer "Mais" para rotas secundarias (Agenda, Cursos, Perfil). Breakpoints: < 768px mobile, 768-1023px tablet, >= 1024px desktop. Safe area iOS. | @dev + @ux-design-expert | 12-16h | FE-N05 (layout compartilhado) |
| 3 | FE-N03 | Ajustar responsividade das paginas internas: grid Kanban (coluna unica ou scroll horizontal em mobile), formularios, calendarios. | @dev | 8-12h | FE-C02 |

### Onda 4 -- Refatoracao God Components (2 sprints, ~45h)

Maior esforco, maior retorno. Pre-requisito: testes configurados (CC-C01) e layout estavel (Onda 3).

| # | Debito | Acao | Responsavel | Horas | Dependencias |
|---|--------|------|-------------|-------|-------------|
| 1 | FE-M02 | Extrair `useFocoTimer` (estado do timer), `useFocoHistorico` (historico paginado), `useFocoSessao` (persistencia). Reduzir useState de 26 para <= 10 no componente principal. | @dev | 6-8h | Onda 3 |
| 2 | FE-C01 | **foco/page.tsx**: dividir em 5 sub-componentes. **habitos/page.tsx**: extrair `aba-individual.tsx` + `aba-metas.tsx` + sub-componentes (lista, formularios, historico, boards). **tarefas/page.tsx** e **agenda/page.tsx**: extrair sub-componentes. Testes snapshot/integration ANTES de refatorar. Nenhuma pagina > 400 linhas. | @dev | 24-32h | FE-M02, CC-C01 (testes pre-existentes) |
| 3 | FE-H01 | Instalar react-hook-form + `@hookform/resolvers/zod`. Criar componente `CampoFormulario` padronizado. Migrar formularios existentes durante extracao de God Components. | @dev | 8-12h | FE-C01 (componentes extraidos) |

### Onda 5 -- Performance + Otimizacoes (1 sprint, ~18h)

Otimizacoes que dependem das ondas anteriores.

| # | Debito | Acao | Responsavel | Horas | Dependencias |
|---|--------|------|-------------|-------|-------------|
| 1 | FE-C03 | Code splitting com `next/dynamic()` para modais, drag-and-drop (@hello-pangea/dnd), calendarios. | @dev | 6-10h | FE-C01 (componentes extraidos) |
| 2 | FE-C04 | Migrar shells estaticos (cabecalhos, layouts, metadata) para Server Components. Manter `"use client"` apenas em componentes interativos. | @dev | 4-6h | FE-C01 |
| 3 | DB-H04 | Criar funcao RPC `batch_reorder_tasks(p_updates JSONB)` com validacao de ownership. Ajustar hook `useTarefas`. | @data-engineer + @dev | 4-6h | DB-C03 (tipos TS) |
| 4 | DB-M08 | Chamar `get_focus_stats` uma unica vez no dashboard e compartilhar resultado via React Query key compartilhada. | @dev | 1-2h | SY-H01 (query keys com userId) |

### Onda 6 -- Backlog Estrutural (futuro, ~28h)

Debitos de prioridade baixa ou que dependem de maturidade da base de usuarios.

| # | Debito | Acao | Responsavel | Horas | Quando |
|---|--------|------|-------------|-------|--------|
| 1 | DB-H06 | Implementar soft delete (`deleted_at`) em tabelas criticas. Ajustar queries e RLS. | @data-engineer | 8-12h | Quando base de usuarios justificar |
| 2 | DB-H07 | Implementar audit trail para tabelas sensiveis (users, focus_sessions, habits). | @data-engineer | 8-12h | Apos DB-C01 corrigido |
| 3 | DB-NEW-01 | Gerar novo schema consolidado absorvendo todas as migrations 001-008+. Resolver DB-NEW-02 e DB-NEW-05 como parte deste trabalho. | @data-engineer | 2-4h | Apos todas as migrations de correcao |
| 4 | FE-N04 | Adicionar Suspense boundaries para streaming parcial. | @dev | 4-6h | Apos FE-C04 (RSC) |
| 5 | FE-L01 | Aplicar React.memo nos sub-componentes extraidos. Avaliar impacto do React 19 compiler. | @dev | 2-4h | Apos FE-C01 |
| 6 | DB-H05 | Deprecar `get_habit_streak()` (redundante com `habits.streak_atual`). Documentar campo calculado como fonte de verdade. Opcionalmente criar `recalculate_all_streaks()` para uso administrativo. | @data-engineer | 0.5h | Oportunisticamente |

---

## 7. Riscos e Mitigacoes

Riscos cruzados que emergem da interacao entre debitos de areas diferentes. Identificados pelo @qa.

| # | Risco | Areas | Sev. | Mitigacao |
|---|-------|-------|------|-----------|
| RC01 | **Fix DB-C01 quebra chamadas RPC** -- Adicao de `auth.uid()` validation pode causar `RAISE EXCEPTION 'Unauthorized'` se client fragmentado (SY-C02) causar divergencia entre `user.id` passado pelo hook e `auth.uid()` no banco. | DB + FE + SY | **CRITICAL** | 1. Resolver SY-C02 ANTES de DB-C01 (ambos na Onda 1, nessa ordem). 2. Testes de integracao: chamadas RPC com usuario autenticado. 3. Log temporario de exceptions pos-deploy. |
| RC02 | **Regeneracao de tipos TS invalida imports** -- Se tipos forem regenerados e hooks refatorados em sprints diferentes, merge conflicts e incompatibilidade temporaria. | DB + FE | **HIGH** | 1. Regenerar tipos e atualizar imports no MESMO sprint. 2. `npm run typecheck` como gate obrigatorio. 3. Coordenar com extracao de God Components. |
| RC03 | **SY-C01 afeta DB + Frontend + UX** -- Correcao da formula requer mudanca na funcao `calculate_level()` no banco E em `lib/utils/dashboard.ts`. Se apenas um lado for corrigido, nivel diverge. XP inflacionado por DB-C01 pode causar "rebaixamento". | DB + FE + UX | **HIGH** | 1. Decidir formula canonica ANTES de implementar. 2. Calcular impacto em usuarios existentes. 3. Corrigir ambos lados no MESMO deploy. 4. Migration de recalculo de niveis se necessario. |
| RC04 | **Refatoracao de God Components sem testes** -- Dividir ~5520 linhas (habitos 2314 + foco 1281 + tarefas 1062 + agenda 863) em ~20 sub-componentes sem testes e alto risco de regressao. | FE + CC | **HIGH** | 1. CC-C01 (setup testes) DEVE ser resolvido antes de FE-C01. 2. Testes snapshot/integration ANTES de refatorar cada God Component. 3. Cobertura minima 80% por componente. |
| RC05 | **Layout compartilhado + Mobile nav = refatoracao dupla** -- Se mobile nav for implementada antes do layout compartilhado, retrabalho na migracao para route groups. | FE | **MEDIUM** | 1. FE-N05 (layout compartilhado) ANTES de FE-C02 (mobile nav). Ambos na Onda 3, nessa ordem sequencial. |
| RC06 | **Seed data + Schema consolidado desatualizado** -- `supabase db reset` pode falhar com funcoes antigas referenciando tabelas renomeadas ate que schema consolidado seja atualizado. | DB | **MEDIUM** | 1. DB-NEW-01 (consolidar schema) APOS todas as migrations de correcao (Onda 6). 2. Nao rodar `db reset` sem verificacao manual ate la. 3. Documentar no README. |
| RC07 | **CHECK constraints falham com dados invalidos existentes** -- Migration `011_add_check_constraints.sql` pode falhar se `goals.progresso_atual < 0`, `events.horario_fim < horario_inicio`, ou `users.level = 0` ja existirem no banco. | DB | **MEDIUM** | 1. Queries de verificacao ANTES da migration: `SELECT count(*) FROM goals WHERE progresso_atual < 0`, etc. 2. Bloco de correcao de dados previo na migration. |
| RC08 | **Toast + react-hook-form = mudanca dupla em mutations** -- Padronizar toast (Onda 0) e depois introduzir rhf (Onda 4) refatora padroes de hooks duas vezes. | FE | **LOW** | 1. Toast como util independente (`lib/utilidades-toast.ts`), desacoplado do formulario. 2. Callbacks `onSuccess`/`onError` continuam funcionando com rhf. |

---

## 8. Criterios de Sucesso

### 8.1 Criterios de Aceite -- Debitos CRITICAL

| ID | Debito | Criterios de Aceite |
|----|--------|-------------------|
| DB-C01 | SECURITY DEFINER sem auth | 1. Todas as 7 funcoes SECURITY DEFINER validam `auth.uid()`. 2. Chamar qualquer funcao com `p_user_id != auth.uid()` retorna EXCEPTION. 3. Fluxos existentes (foco, habitos, cursos) continuam funcionando para o usuario correto. 4. Testes SQL de autorizacao passam para cada funcao. |
| DB-C03 | Tipos TS desatualizados | 1. Um unico arquivo `lib/supabase/types.ts` gerado por `supabase gen types typescript`. 2. Arquivo `types/database.ts` removido. 3. Todos os imports atualizados. 4. `npm run typecheck` passa sem erros. 5. Nenhum `as any` adicionado como workaround. |
| CC-C01 | Zero testes | 1. Vitest + React Testing Library configurados. 2. `npm test` executa com sucesso. 3. Pelo menos 1 teste unitario, 1 de integracao e 1 snapshot funcionando. 4. CI pipeline ou script `npm test` preparado. 5. Configuracao de cobertura com threshold de 80%. |
| CC-C02 | Dados mockados | 1. `dados-dashboard.ts` contem APENAS dados ativos (menu sidebar). 2. Constantes obsoletas removidas. 3. Nenhum dado mockado renderizado em producao. |
| FE-C01 | God Components | 1. Nenhuma pagina excede 400 linhas. 2. Sub-componentes em `componentes/{feature}/`. 3. Cada sub-componente tem testes (cobertura >= 80%). 4. Nenhuma regressao visual (snapshots). 5. Performance de re-render medida (React DevTools profiler). |
| FE-C02 | Navegacao mobile | 1. Bottom tab bar visivel em viewports < 1024px. 2. Sidebar visivel em viewports >= 1024px, bottom tab oculta. 3. Todas as rotas acessiveis em mobile. 4. Tab "Mais" abre drawer com rotas secundarias. 5. Safe area respeitada em iOS (`env(safe-area-inset-bottom)`). 6. Nenhum conteudo oculto sob o tab bar. |
| SY-C01 | Formula nivel divergente | 1. UMA formula definida como canonica (decisao documentada). 2. Frontend e backend usam a mesma formula. 3. Teste unitario verifica equivalencia para XP de 0 a 100.000. 4. Usuarios existentes recalculados se necessario. |
| SY-C02 | Tripla instancia Supabase | 1. Um unico modulo `lib/supabase/client.ts` exporta singleton. 2. `lib/supabase.ts` removido ou re-exporta do modulo unico. 3. AuthProvider usa o client unificado. 4. Logout propaga para todas as tabs/janelas. |

### 8.2 Criterios de Aceite -- Debitos HIGH

| ID | Debito | Criterios de Aceite |
|----|--------|-------------------|
| DB-C02 | Seed data em producao | 1. `supabase/seed.sql` contem todo o seed data. 2. Migrations nao contem dados de seed. 3. `supabase db reset` funciona corretamente com seed. |
| DB-H02 | Admin com senha visivel | 1. Migration nao exibe senha no output. 2. Senha rotacionada se migration ja rodou em producao. 3. Credenciais admin documentadas em vault seguro (nao em SQL). |
| DB-H03 | handle_new_user via RPC | 1. `SELECT has_function_privilege('anon', 'handle_new_user()', 'execute')` retorna `false`. 2. Idem para `authenticated` e `public`. |
| DB-H04 | N updates reordenacao | 1. Funcao RPC `batch_reorder_tasks` criada. 2. Hook refatorado para unica chamada. 3. Validacao de ownership na funcao. |
| DB-H05 | Streak O(N) | 1. Funcao `get_habit_streak()` deprecada ou reescrita. 2. `habits.streak_atual` documentado como fonte de verdade. |
| DB-H09 | Progresso sem CHECK | 1. CHECK constraints: `progresso_atual >= 0`, `progresso_total >= 1`, `total_xp >= 0`, `level >= 1`, `xp_recompensa >= 0`, `horario_fim > horario_inicio`, `goals.status IN (...)`. 2. Dados invalidos corrigidos antes da constraint. |
| DB-M08 | get_focus_stats 3x | 1. `get_focus_stats` chamada no maximo 1 vez por render do dashboard. 2. Resultado compartilhado via React Query. |
| SY-H01 | Query keys sem userId | 1. Todas as query keys incluem userId. 2. Trocar usuario (logout + login com outro) nao mostra dados do anterior. 3. Teste unitario valida formato. |
| FE-H01 | Formularios sem estrutura | 1. react-hook-form + zodResolver configurados. 2. Componente `CampoFormulario` padronizado. 3. Validacao inline por campo em formularios novos. |
| FE-H02 | ErrorBoundary inconsistente | 1. `error.tsx` presente em `app/` (raiz) e em cada route group. 2. `loading.tsx` nas rotas principais com esqueletos. 3. Erro em qualquer pagina mostra UI de fallback com botao retry, nao tela branca. |
| FE-H03 | Zod incompleta | 1. Schemas Zod para habitos, metas, eventos, cursos, perfil. 2. Derivados dos tipos TypeScript do banco. 3. Todos os formularios validam via Zod antes de submeter. |
| FE-M02 | 26 useState no Foco | 1. Maximo 10 useState no componente principal `PaginaFoco`. 2. Logica do timer encapsulada em `useFocoTimer`. 3. Timer funciona identicamente ao anterior (sem regressao). |
| FE-N01 | Zero loading.tsx/error.tsx | 1. `loading.tsx` presente nas 5 rotas principais com esqueletos. 2. `error.tsx` na raiz com mensagem amigavel e botao retry. |
| FE-N03 | Responsividade interna | 1. Nenhum overflow horizontal em 375px, 768px, 1024px, 1440px. 2. Grid Kanban adaptado para mobile. 3. Playwright screenshots sem conteudo cortado. |
| FE-C03 | Code splitting | 1. Modais, DnD e calendarios carregados sob demanda via `next/dynamic()`. 2. Bundle por rota reduzido (mensuravel via bundle analyzer). |
| FE-C04 | Excesso de "use client" | 1. Shells estaticos migrados para Server Components. 2. `"use client"` apenas em componentes interativos. |

### 8.3 Criterios Resumidos -- Debitos MEDIUM e LOW

| Grupo | Criterios |
|-------|----------|
| CHECK constraints textuais (DB-M02, DB-L01) | Valores TEXT restritos via CHECK. Valores invalidos rejeitados pelo banco. |
| Indexes (DB-M03, DB-M04) | Index composto criado. `EXPLAIN` mostra index scan em vez de seq scan. |
| Acessibilidade (FE-M03, FE-N02) | `prefers-reduced-motion` desativa animacoes. Skip nav funciona via Tab + Enter. Contraste >= 5.5:1 AA (muted-foreground). |
| Performance DB (DB-M05, DB-M06, DB-M07) | Reducao mensuravel no numero de requests HTTP por operacao. |
| Layout (FE-N05) | Sidebar persiste entre navegacoes. Zero remontagem/flash ao navegar. |
| Streaming (FE-N04) | Suspense boundaries habilitados. Partes criticas do conteudo aparecem primeiro. |
| Toast (FE-H04) | Todas as mutations CRUD tem toast de sucesso/erro. Toggle e drag-and-drop usam feedback visual inline. |

---

## 9. Metricas de Qualidade

### 9.1 Baseline -- Metricas a Coletar ANTES da Execucao

| Metrica | Ferramenta | Valor Esperado Atual |
|---------|-----------|---------------------|
| Cobertura de testes | Vitest + c8 | 0% (nenhum teste existe) |
| Erros TypeScript | `npm run typecheck` | Registrar contagem atual |
| Bundle size por rota | `@next/bundle-analyzer` | Registrar baseline por rota |
| Lighthouse Performance Score | Lighthouse CI | Registrar scores para inicio, foco, tarefas, habitos |
| LCP (Largest Contentful Paint) | Lighthouse | Registrar em ms por rota |
| CLS (Cumulative Layout Shift) | Lighthouse | Registrar valor por rota |
| Linhas por arquivo (God Components) | `wc -l` | habitos: ~2314, foco: ~1281, tarefas: ~1062, agenda: ~863 |
| Requests HTTP no dashboard | Network tab | Registrar contagem (estimado: 5-8) |
| Tempo de `supabase db reset` | Cronometro | Registrar em segundos |
| Contraste minimo WCAG | axe-core ou manual | 4.84:1 (marginal AA) |
| Funcoes SECURITY DEFINER sem auth | Query SQL | 7 sem validacao |
| Queries por streak de 365 dias | `EXPLAIN ANALYZE` | ~365 queries (O(N)) |

### 9.2 Metas -- Metricas-Alvo APOS Resolucao

| Metrica | Alvo Onda 1-2 | Alvo Final (Onda 5) | Justificativa |
|---------|---------------|---------------------|---------------|
| Cobertura de testes | >= 30% | >= 80% | Incremental: setup + hooks criticos primeiro |
| Erros TypeScript | 0 | 0 | `typecheck` limpo e gate de CI |
| Bundle size (total) | N/A (sem mudanca) | Reducao >= 20% | Code splitting + RSC |
| Lighthouse Performance | >= 60 | >= 85 | Quick wins + code splitting |
| LCP | <= 3.0s | <= 2.0s | Streaming + RSC |
| CLS | <= 0.15 | <= 0.05 | Loading states + esqueletos |
| Linhas por arquivo (max) | <= 800 | <= 400 | God Components refatorados |
| Requests HTTP dashboard | <= 5 | <= 2 | RPC consolidado |
| Contraste WCAG | >= 5.5:1 | >= 5.5:1 | Ajuste de `--muted-foreground` |
| Funcoes DEFINER sem auth | 0 | 0 | Migration 009 |
| Queries por streak | 1 (campo calculado) | 1 | Deprecar funcao, usar campo |

### 9.3 Metricas de Processo

| Metrica | Como Medir | Alvo |
|---------|-----------|------|
| Debitos resolvidos por sprint | Checklist em story | >= 5 por sprint |
| Debitos CRITICAL restantes apos Onda 2 | Contagem manual | 0 |
| Tempo de build | `npm run build` | Nao aumentar > 10% |
| Tempo de `npm run typecheck` | Cronometro | Nao aumentar > 20% |
| Regressoes criticas introduzidas | Bugs reportados | 0 |

---

## 10. Condicoes Bloqueantes

### 10.1 Condicoes Bloqueantes (devem ser resolvidas antes do inicio da execucao)

| # | Condicao | Status | Responsavel | Resolucao |
|---|---------|--------|-------------|-----------|
| 1 | **Ordem de ondas consolidada** -- As tres propostas independentes (DRAFT, DB review, UX review) devem ser integradas em cronograma unico. | **RESOLVIDO** | @architect | Incorporada na Secao 6 deste documento, conforme proposta do @qa (Secao 3.3 da qa-review). Ondas 0-6 integram DB, Frontend e Sistema. |
| 2 | **SY-C01: Formula canonica de nivel** -- A formula correta (exponencial vs raiz quadrada) deve ser definida antes de entrar em sprint. Impacta banco (`calculate_level`) e frontend (`dashboard.ts`). | **PENDENTE** | @architect ou @pm | Decisao de produto necessaria. SY-C01 pode ser executado no final da Onda 1 condicionado a esta decisao. Se a decisao demorar, mover SY-C01 para Onda 2. |
| 3 | **RC01: DB-C01 + SY-C02** -- O risco cruzado entre SECURITY DEFINER fix e client Supabase fragmentado deve ser enderecado. Se `auth.uid()` retornar valor diferente de `user.id` passado pelos hooks, todas as funcoes corrigidas rejeitarao chamadas legitimas. | **RESOLVIDO** | @architect | SY-C02 movido para Onda 1, posicao 1 (antes de DB-C01, posicao 2). Ambos na mesma sprint, nessa ordem sequencial. |

### 10.2 Condicoes Recomendadas (podem ser resolvidas durante a execucao)

| # | Condicao | Responsavel | Prazo |
|---|---------|-------------|-------|
| 4 | **Scripts de rollback para migrations 009-013** -- Cada migration de correcao deve ter script de reversao documentado para caso de falha em producao. | @data-engineer | Antes da execucao de cada migration |
| 5 | **Baseline de metricas** -- Coletar todas as metricas da Secao 9.1 ANTES do inicio da execucao para permitir medicao objetiva de progresso. | @qa + @dev | Antes da Onda 0 |
| 6 | **DB-H02: Investigacao de exposicao** -- Verificar se `002_create_admin_user.sql` ja rodou em producao. Se sim, rotacionar senha do admin imediatamente. | @data-engineer | Imediato |

---

## Appendix: Dependency Map

### Grafo de Dependencias entre Debitos

```
SY-C02 (Client unificado) ──────> DB-C01 (SECURITY DEFINER)
  "Client fragmentado pode         "auth.uid() depende de
   causar falha em auth.uid()"      sessao consistente" (RC01)

DB-C01 (SECURITY DEFINER) ──────> DB-H07 (Audit Trail)
  "Corrigir funcoes antes          "Sem audit trail, nao
   de adicionar audit trail"        detectamos abusos"

SY-C02 (Client unificado) ──────> SY-H01 (Query keys)
  "Unificar client antes           "userId depende de
   de corrigir query keys"          client unificado"

SY-C01 (Formula nivel) <────────> DB-C03 (Tipos TS)
  "Alinhar formula requer          "Tipos corretos refletem
   tipos corretos"                  formula do banco"

DB-C03 (Tipos TS) ─────────────> FE-H03 (Zod schemas)
  "Tipos corretos alimentam        "Schemas Zod derivados
   schemas de validacao"             dos tipos do banco"

CC-C01 (Zero testes) ──────────> FE-C01 (God Components)
  "Testes sao pre-requisito        "Refatoracao sem testes
   para refatoracao segura"          e cega" (RC04)

FE-N05 (Layout compartilhado) ──> FE-C02 (Mobile nav)
  "Layout antes de mobile nav"     "Evitar refatoracao dupla" (RC05)

FE-N05 (Layout compartilhado) ──> FE-C01 (God Components)
  "Layout antes de extrair         "Extrair de paginas com
   componentes"                     sidebar individual = retrabalho"

FE-C01 (God Components) ────────> FE-C03 (Code splitting)
  "Extrair componentes antes       "Nao ha o que splittar
   de implementar splitting"        em God Components"

FE-C01 (God Components) ────────> FE-C04 (RSC parcial)
  "Componentes extraidos           "Shells estaticos precisam
   viabilizam RSC seletivo"         estar separados"

FE-C01 (God Components) ────────> FE-H02 (ErrorBoundary)
  "Componentes menores facilitam   "ErrorBoundary granular
   boundaries granulares"            por componente"
```

### Dependencias Circulares e Resolucoes

| Ciclo | Debitos Envolvidos | Resolucao Adotada |
|-------|---------|-----------|
| **Ciclo 1** | DB-C01 depende de SY-C02, mas ambos sao urgentes (Onda 1) | Resolver sequencialmente na mesma onda: SY-C02 primeiro, DB-C01 em seguida. |
| **Ciclo 2** | DB-C03 depende de schema estavel (pos-Onda 1). Hooks precisam de tipos para funcionar corretamente. | Aceitar regeneracao de tipos mais de uma vez. Primeira regeneracao apos Onda 1 DB, segunda apos Onda 2 DB. |
| **Ciclo 3** | CC-C01 (testes) e pre-requisito para refatoracoes seguras. Mas migrations de seguranca (DB-C01, DB-H03) sao mais urgentes e nao podem esperar setup de testes. | Permitir que migrations SQL rodem ANTES de setup de testes. Testes sao pre-requisito para refatoracoes de FRONTEND (Onda 4+), nao para migrations SQL isoladas (Ondas 0-2). |

### Fontes do Assessment

| Fase | Documento | Autor |
|------|-----------|-------|
| 1 | `docs/architecture/system-architecture.md` | @architect |
| 2 | `supabase/docs/SCHEMA.md` | @data-engineer |
| 2 | `supabase/docs/DB-AUDIT.md` | @data-engineer |
| 3 | `docs/frontend/frontend-spec.md` | @ux-design-expert |
| 4 | `docs/prd/technical-debt-DRAFT.md` | @architect |
| 5 | `docs/reviews/db-specialist-review.md` | @data-engineer |
| 6 | `docs/reviews/ux-specialist-review.md` | @ux-design-expert |
| 7 | `docs/reviews/qa-review.md` | @qa |

### Gaps Identificados pelo @qa (para enderecamento durante execucao)

#### Gaps Criticos

| # | Gap | Impacto |
|---|-----|---------|
| G01 | **Ausencia de estrategia de testes detalhada** -- Nenhum documento define quais testes devem existir para cada debito resolvido. | Resolucao de debitos pode introduzir novos bugs. Mitigado pela Secao 4 da qa-review (testes por onda). |
| G02 | **Sem plano de rollback para migrations de seguranca** | Se migration quebrar em producao, nao ha reversao documentada. Ver Condicao Recomendada #4. |
| G04 | **SY-C01 sem definicao de formula correta** | Bloqueante: decisao de produto pendente. Ver Condicao Bloqueante #2. |
| G05 | **Ausencia de analise de seguranca do middleware** | Rotas protegidas podem ter bypass nao auditado. Requer investigacao adicional. |

#### Gaps Moderados

| # | Gap | Impacto |
|---|-----|---------|
| G06 | Sem analise de bundle size (sem baseline) | Impossivel medir melhoria pos-refatoracao. Ver Metrica Baseline. |
| G07 | CC-C02 sem inventario completo de mock data | Pode haver mock data em outras paginas alem de `dados-dashboard.ts`. |
| G08 | DB-H02 sem plano de rotacao de senha | Senha pode estar em logs de producao. Ver Condicao Recomendada #6. |
| G09 | Analise de acessibilidade superficial (apenas contraste, motion, skip nav) | Audit WCAG 2.1 AA completo nao realizado (ARIA roles, keyboard nav no Kanban, focus management). |
| G10 | SY-M04 (streak shields) nao revisado por nenhum especialista | Feature incompleta visivel ao usuario. |

#### Gaps Menores

| # | Gap |
|---|-----|
| G11 | SY-H02 (tabelas ausentes) necessita investigacao em runtime. |
| G12 | Sem analise de Lighthouse/Web Vitals (sem baseline de performance). |
| G13 | FE-L02: inventario incompleto de SVGs inline no codebase. |

---

*Documento FINAL consolidado por @architect (Aria) -- Synkra AIOS v2.0*
*Fontes: technical-debt-DRAFT.md + db-specialist-review.md + ux-specialist-review.md + qa-review.md*
*Ultima atualizacao: 2026-01-29*
*Status: FINAL -- Aprovado com condicoes pelo @qa (3 bloqueantes: 2 resolvidos, 1 pendente)*
