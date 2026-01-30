# Story: Seguranca + Fundacao

**Story ID:** TD-1.0
**Epic:** EPIC-TD-001
**Status:** Draft
**Estimativa:** ~23h
**Prioridade:** CRITICAL
**Sprint Sugerido:** 1

---

## Objetivo

Resolver todas as vulnerabilidades criticas de seguranca e estabelecer a infraestrutura de testes automatizados. Esta onda e pre-requisito para todas as ondas seguintes. Ao final, o sistema tera: client Supabase unificado, funcoes de banco seguras com validacao de ownership, query keys isoladas por usuario, dados de seed separados de producao, framework de testes configurado, formula de nivel alinhada, e dados mockados limpos.

## Debitos Incluidos

| ID | Debito | Severidade | Horas |
|----|--------|-----------|-------|
| SY-C02 | **Tripla instancia Supabase client** -- Tres formas de criar o client browser: singleton em `lib/supabase.ts`, factory em `lib/supabase/client.ts`, e instancia interna no `AuthProvider`. Inconsistencia de sessao, logout pode nao propagar. | CRITICAL | 2-4h |
| DB-C01 | **Funcoes SECURITY DEFINER sem validacao de ownership** -- 7 funcoes afetadas: `add_user_xp`, `add_task_time`, `complete_focus_session`, `get_focus_stats`, `cancel_active_sessions`, `complete_lesson`, `get_course_progress`. Qualquer usuario autenticado pode manipular dados de outros. | CRITICAL | 3-4h |
| SY-H01 | **Query keys sem userId** -- Hooks `useTarefas`, `useHabitos`, `useMetas`, `usePendencias` usam keys como `['tarefas']` sem userId. Cache pode vazar entre sessoes de usuarios diferentes. | HIGH | 1-2h |
| DB-C02 | **Seed data com UUID hardcoded no schema de producao** -- Usuario mock "Mateus Pereira" com UUID fixo em `000_consolidated_schema.sql`, `007_create_courses_schema.sql` e `007_create_events_table.sql`. `ON CONFLICT DO NOTHING` mitiga corrupcao. | HIGH | 1-2h |
| CC-C01 | **Zero cobertura de testes** -- Nenhum framework (Jest, Vitest, Playwright) configurado. 0% de cobertura. Impossivel validar regressoes. Pre-requisito para refatoracoes de frontend. | CRITICAL | 4-8h |
| SY-C01 | **Inconsistencia na formula de nivel** -- Frontend usa `XP_PER_LEVEL * Math.pow(1.2, level-1)` (exponencial), backend usa `FLOOR(SQRT(xp/100)) + 1` (raiz quadrada). Formulas nao equivalentes. | CRITICAL | 2-4h |
| CC-C02 | **Dados mockados obsoletos** -- `app/inicio/dados-dashboard.ts` exporta constantes estaticas que misturam dados ativos (sidebar menu) com dados obsoletos (nivelAtual, missoesDiarias). | CRITICAL | 1-2h |
| SEC-NEW-01 | **Env vars sem validacao em middleware.ts** -- `process.env.NEXT_PUBLIC_SUPABASE_URL!` e `ANON_KEY!` usam non-null assertion sem verificacao. Se env var ausente, crash silencioso. | HIGH | 0.5h |
| SEC-NEW-02 | **Env vars sem validacao no modulo de calendario** -- `google.ts`, `outlook.ts`, `auth-state.ts` usam env vars (`GOOGLE_CLIENT_ID`, `CLIENT_SECRET`, `CALENDAR_STATE_SECRET`) sem validacao. | HIGH | 1h |
| SEC-NEW-03 | **Service role key em actions.ts** -- `app/(protegido)/foco/actions.ts` importa `SUPABASE_SERVICE_ROLE_KEY` diretamente. Deve usar modulo `server-only` dedicado para isolar a chave. | HIGH | 1h |
| CC-NEW-01 | **console.log/error em producao (calendario)** -- `lib/calendario/resilience.ts` tem `console.log` e `console.error` em producao. Vazamento de info de provider/userId. | MEDIUM | 0.5h |

## Tasks

### Bloco 1: Client Unificado (SY-C02)
- [ ] Task 1: Auditar os 3 pontos de criacao do Supabase client: `lib/supabase.ts`, `lib/supabase/client.ts`, `lib/providers/auth-provider.tsx`
- [ ] Task 2: Definir `lib/supabase/client.ts` como o unico modulo exportando singleton `createBrowserClient<Database>()`
- [ ] Task 3: Atualizar `lib/supabase.ts` para re-exportar do modulo unico (ou remover se nao ha dependencias externas)
- [ ] Task 4: Atualizar `AuthProvider` para usar o client unificado em vez de instancia interna
- [ ] Task 5: Verificar que logout propaga para todas as tabs (testar multi-tab)

### Bloco 2: Seguranca de Funcoes (DB-C01)
- [ ] Task 6: Criar migration `010_fix_security_definer_auth.sql` adicionando `IF auth.uid() != p_user_id THEN RAISE EXCEPTION 'Unauthorized'; END IF;` em cada uma das 7 funcoes
- [ ] Task 7: Testar cada funcao com `p_user_id = auth.uid()` (deve funcionar) e `p_user_id != auth.uid()` (deve retornar exception)
- [ ] Task 8: Verificar que fluxos existentes (foco, habitos, cursos) continuam funcionando para o usuario correto

### Bloco 3: Query Keys (SY-H01)
- [ ] Task 9: Atualizar query keys em `useTarefas.ts` para incluir userId: `['tarefas', userId]`
- [ ] Task 10: Atualizar query keys em `useHabitos.ts` para incluir userId
- [ ] Task 11: Atualizar query keys em `useMetas.ts` para incluir userId
- [ ] Task 12: Atualizar query keys em `usePendencias.ts` para incluir userId
- [ ] Task 13: Invalidar cache ao trocar usuario (verificar comportamento de `queryClient.clear()` no logout)

### Bloco 4: Seed Data (DB-C02)
- [ ] Task 14: Criar arquivo `supabase/seed.sql` com todo o seed data extraido das migrations
- [ ] Task 15: Remover blocos de seed data de `000_consolidated_schema.sql` (linhas 629-692)
- [ ] Task 16: Remover blocos de seed data de `007_create_courses_schema.sql` (linhas 309-456)
- [ ] Task 17: Remover blocos de seed data de `007_create_events_table.sql` (linhas 116-128)
- [ ] Task 18: Verificar que `supabase db reset` funciona corretamente com `seed.sql` separado

### Bloco 5: Infraestrutura de Testes (CC-C01)
- [ ] Task 19: Instalar Vitest + React Testing Library + jsdom
- [ ] Task 20: Configurar `vitest.config.ts` com aliases de path, setup files, e coverage (c8/istanbul)
- [ ] Task 21: Criar script `npm test` e `npm run test:coverage` no `package.json`
- [ ] Task 22: Escrever 1 teste unitario (ex: funcao utilitaria de calculo de XP)
- [ ] Task 23: Escrever 1 teste de integracao (ex: hook `useTarefas` com mock de Supabase)
- [ ] Task 24: Escrever 1 teste snapshot (ex: componente de estado vazio)
- [ ] Task 25: Configurar threshold de cobertura em 80%

### Bloco 6: Formula de Nivel (SY-C01) -- BLOQUEADO por decisao de produto
- [ ] Task 26: Obter decisao de produto sobre formula canonica (exponencial ou raiz quadrada)
- [ ] Task 27: Implementar formula canonica no frontend (`lib/utils/dashboard.ts`)
- [ ] Task 28: Implementar formula canonica no backend (migration SQL para funcao de calculo de nivel)
- [ ] Task 29: Criar migration de recalculo de niveis para usuarios existentes (se necessario)
- [ ] Task 30: Escrever teste unitario que valida equivalencia da formula para XP de 0 a 100.000

### Bloco 7: Dados Mockados (CC-C02)
- [ ] Task 31: Auditar `app/inicio/dados-dashboard.ts` para identificar dados ativos vs obsoletos
- [ ] Task 32: Remover constantes obsoletas (nivelAtual, missoesDiarias, etc.)
- [ ] Task 33: Manter apenas dados ativos (menu sidebar e constantes necessarias)
- [ ] Task 34: Verificar que nenhum dado mockado e renderizado em producao

### Bloco 8: Validacao de Env Vars e Isolamento de Secrets (SEC-NEW-01, SEC-NEW-02, SEC-NEW-03, CC-NEW-01)
- [ ] Task 35: Adicionar validacao de env vars em `middleware.ts` (remover `!` assertions, validar presenca antes de uso)
- [ ] Task 36: Adicionar validacao de env vars no modulo de calendario: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, `OUTLOOK_CLIENT_ID`, `OUTLOOK_CLIENT_SECRET`, `OUTLOOK_REDIRECT_URI`, `CALENDAR_STATE_SECRET`
- [ ] Task 37: Extrair `SUPABASE_SERVICE_ROLE_KEY` de `app/(protegido)/foco/actions.ts` para modulo `lib/supabase/admin.ts` com import `server-only`
- [ ] Task 38: Substituir `console.log`/`console.error` em `lib/calendario/resilience.ts` por tratamento adequado ou remocao

## Criterios de Aceite

- [ ] Um unico modulo `lib/supabase/client.ts` exporta singleton do browser client
- [ ] `lib/supabase.ts` removido ou re-exporta do modulo unico
- [ ] AuthProvider usa o client unificado (nao instancia interna)
- [ ] Logout propaga para todas as tabs abertas
- [ ] Todas as 7 funcoes SECURITY DEFINER validam `auth.uid()`
- [ ] Chamar qualquer funcao com `p_user_id != auth.uid()` retorna EXCEPTION `Unauthorized`
- [ ] Fluxos existentes (foco, habitos, cursos) funcionam normalmente para o usuario correto
- [ ] Todas as query keys incluem userId
- [ ] Trocar usuario (logout + login como outro) nao mostra dados do usuario anterior
- [ ] `supabase/seed.sql` contem todo o seed data
- [ ] Migrations nao contem dados de seed
- [ ] `supabase db reset` funciona corretamente
- [ ] Vitest + React Testing Library configurados e funcionando
- [ ] `npm test` executa com sucesso
- [ ] Pelo menos 1 teste unitario, 1 de integracao e 1 snapshot passando
- [ ] Threshold de cobertura configurado em 80%
- [ ] UMA formula de nivel definida como canonica (decisao documentada)
- [ ] Frontend e backend usam a mesma formula
- [ ] Teste unitario valida equivalencia para XP de 0 a 100.000
- [ ] `dados-dashboard.ts` contem APENAS dados ativos (menu sidebar)
- [ ] Zero dados mockados renderizados em producao
- [ ] `npm run lint` passa sem novos erros
- [ ] `npm run typecheck` passa sem novos erros

## Testes Requeridos

- **Unitario:** Funcao de calculo de nivel (formula canonica) para XP de 0 a 100.000
- **Unitario:** Query key factory verifica formato `['recurso', userId]`
- **Integracao:** Hook com mock de Supabase client -- verifica CRUD basico
- **Integracao:** Testes SQL de autorizacao para cada funcao SECURITY DEFINER
- **Snapshot:** Componente de estado vazio
- **Manual:** Multi-tab logout propagation
- **Manual:** Login como usuario A, logout, login como usuario B -- verificar que dados de A nao aparecem
- **Manual:** `supabase db reset` com seed.sql separado

## Dependencias

- **Depende de:** Nenhuma dependencia externa (pode comecar na sprint 1)
- **Bloqueia:**
  - TD-2.0 (Integridade + Tipos) -- depende de schema estavel
  - TD-4.0 (God Components) -- depende de CC-C01 (testes configurados)
  - TD-5.0 (Performance) -- depende de SY-H01 (query keys)

## Riscos

| Risco | Severidade | Mitigacao |
|-------|------------|-----------|
| **RC01:** Fix DB-C01 quebra chamadas RPC se client fragmentado causar divergencia entre `user.id` e `auth.uid()` | CRITICAL | Resolver SY-C02 (Bloco 1) ANTES de DB-C01 (Bloco 2). Testar integracao RPC com usuario autenticado apos cada bloco. Log temporario de exceptions pos-deploy. |
| **RC03:** SY-C01 requer mudanca em DB + Frontend + UX simultaneamente. Se apenas um lado for corrigido, nivel diverge. | HIGH | Decisao de produto ANTES da implementacao. Corrigir ambos lados no MESMO deploy. Migration de recalculo de niveis. |
| SY-C01 bloqueado por decisao de produto | HIGH | SY-C01 pode ser adiado para inicio da Onda 1, condicionado a decisao. Demais blocos nao dependem de SY-C01. |
| Seed data ja utilizado por automacoes ou scripts | MEDIUM | Verificar se `supabase/seed.sql` e `config.toml` ja estao alinhados. Testar `db reset` em ambiente local. |

## Dev Notes

- **Ordem de execucao dos blocos:** Bloco 1 (SY-C02) PRIMEIRO, depois Bloco 2 (DB-C01), pois DB-C01 depende de `auth.uid()` consistente. Blocos 3-7 podem ser paralelizados.
- **SY-C02:** O singleton deve usar `createBrowserClient` do `@supabase/ssr`. Verificar se `lib/supabase.ts` usa `createClient` antigo (do `@supabase/supabase-js`) -- se sim, migrar.
- **DB-C01:** Usar abordagem hibrida recomendada no assessment: manter SECURITY DEFINER com validacao `auth.uid()` interna. A funcao `check_habit` ja valida ownership -- usar como referencia.
- **SY-H01:** Considerar criar uma factory de query keys: `const tarefaKeys = { all: (userId) => ['tarefas', userId], detail: (userId, id) => ['tarefas', userId, id] }`.
- **CC-C01:** Vitest e recomendado sobre Jest por compatibilidade nativa com ESM e Vite/Next.js. Configurar `vitest.config.ts` com `resolve.alias` para `@/` prefix.
- **SY-C01:** A decisao de formula canonica e bloqueante. Se a decisao nao vier a tempo, todos os outros blocos podem avancar sem SY-C01. Documentar a decisao em `docs/architecture/` ou `docs/prd/`.
- **DB-H02 (fora desta story):** Investigar se migration `002_create_admin_user.sql` ja rodou em producao. Se sim, rotacionar senha IMEDIATAMENTE. Acao paralela, nao bloqueante para esta story.

---

### Dev Agent Record
**Agent Model Used:** --
**Debug Log References:** --

#### Completion Notes
- (empty)

#### Change Log
| Data | Alteracao | Autor |
|------|-----------|-------|
| 2026-01-29 | Story criada | @pm |

#### File List
| Arquivo | Status | Descricao |
|---------|--------|-----------|
| (empty) | -- | -- |
