# Story: Backlog Estrutural

**Story ID:** TD-6.0
**Epic:** EPIC-TD-001
**Status:** Draft
**Estimativa:** ~28h
**Prioridade:** MEDIUM
**Sprint Sugerido:** Futuro (apos Onda 5)

---

## Objetivo

Resolver debitos de prioridade baixa ou que dependem de maturidade da base de usuarios. Implementar soft delete para recuperacao de dados, audit trail para rastreamento de alteracoes em tabelas sensiveis, regenerar schema consolidado absorvendo todas as migrations, adicionar Suspense boundaries para streaming parcial, aplicar React.memo nos sub-componentes extraidos, e deprecar funcao de streak redundante. Estes itens melhoram resiliencia, observabilidade e performance marginal.

## Debitos Incluidos

| ID | Debito | Severidade | Horas |
|----|--------|-----------|-------|
| DB-H06 | **Ausencia de soft delete** -- Registros removidos permanentemente. Sem recuperacao, sem auditoria de delecoes. | MEDIUM | 8-12h |
| DB-H07 | **Ausencia de audit trail** -- Sem log de alteracoes. Se XP for adulterado, nao ha rastreio. | MEDIUM | 8-12h |
| DB-NEW-01 | **Schema consolidado desatualizado** -- `000_consolidated_schema.sql` usa nomes antigos. Funcao `check_habit` referencia `habit_checks` no schema antigo; migration 004 corrige. | MEDIUM | 2-4h |
| FE-N04 | **Zero Suspense boundaries para streaming** -- Nenhuma ocorrencia de `<Suspense>` nas paginas. Carregamento tudo-ou-nada. | MEDIUM | 4-6h |
| FE-L01 | **React.memo limitado** -- Apenas 4 componentes memoizados em `inicio/page.tsx`. React 19 compiler experimental mitiga parcialmente. | LOW | 2-4h |
| DB-H05 | **`get_habit_streak()` usa loop O(N)** -- Loop iterativo com N queries internas por dia de streak. Campos calculados `streak_atual` e `maior_streak` ja existem em `habits` e sao atualizados por `check_habit()`. Funcao e redundante. | HIGH | 0.5h |

## Tasks

### Bloco 1: Soft Delete (DB-H06)
- [ ] Task 1: Adicionar coluna `deleted_at TIMESTAMPTZ DEFAULT NULL` nas tabelas criticas: `tasks`, `habits`, `goals`, `objectives`, `focus_sessions`
- [ ] Task 2: Criar migration `014_add_soft_delete.sql` com ALTER TABLE para cada tabela
- [ ] Task 3: Atualizar RLS policies para filtrar `WHERE deleted_at IS NULL` em SELECT queries
- [ ] Task 4: Criar funcao RPC `soft_delete(table_name, record_id)` ou implementar via UPDATE no hook
- [ ] Task 5: Atualizar hooks (`useTarefas`, `useHabitos`, `useMetas`) para usar UPDATE `deleted_at = NOW()` em vez de DELETE
- [ ] Task 6: Adicionar index parcial `WHERE deleted_at IS NULL` nas tabelas com soft delete
- [ ] Task 7: Testar que registros "deletados" nao aparecem em queries normais mas podem ser recuperados

### Bloco 2: Audit Trail (DB-H07)
- [ ] Task 8: Criar tabela `audit_log` com colunas: `id`, `table_name`, `record_id`, `action` (INSERT/UPDATE/DELETE), `old_data` (JSONB), `new_data` (JSONB), `user_id`, `created_at`
- [ ] Task 9: Criar funcao trigger `log_audit_change()` que insere registro de auditoria automaticamente
- [ ] Task 10: Criar migration `015_add_audit_trail.sql`
- [ ] Task 11: Aplicar trigger nas tabelas sensiveis: `users` (XP, level), `focus_sessions`, `habits` (streaks)
- [ ] Task 12: Adicionar RLS policy na `audit_log`: usuario so ve seus proprios registros
- [ ] Task 13: Testar que alteracoes em XP, nivel, streaks e sessoes geram registros de auditoria

### Bloco 3: Schema Consolidado (DB-NEW-01)
- [ ] Task 14: Gerar novo schema consolidado executando todas as migrations sequencialmente (001-015+) e capturando o resultado
- [ ] Task 15: Substituir `000_consolidated_schema.sql` com o schema atualizado
- [ ] Task 16: Verificar que `supabase db reset` funciona corretamente com o novo schema
- [ ] Task 17: Atualizar documentacao em `supabase/docs/SCHEMA.md` se necessario

### Bloco 4: Suspense Boundaries (FE-N04)
- [ ] Task 18: Identificar secoes de cada pagina que podem renderizar independentemente (ex: sidebar stats, listas, graficos)
- [ ] Task 19: Envolver secoes pesadas em `<Suspense fallback={<Skeleton />}>`
- [ ] Task 20: Garantir que Server Components (da Onda 5) se beneficiam do streaming
- [ ] Task 21: Testar que partes criticas da pagina aparecem primeiro (above the fold)
- [ ] Task 22: Verificar que Suspense nao causa layout shift (CLS)

### Bloco 5: React.memo (FE-L01)
- [ ] Task 23: Identificar sub-componentes extraidos na Onda 4 que recebem props estaveis e renderizam listas
- [ ] Task 24: Aplicar `React.memo()` nos componentes de lista: `lista-habitos`, `kanban-coluna`, `lista-eventos-dia`
- [ ] Task 25: Aplicar `React.memo()` nos cards: `habito-card`, `tarefa-card`, `evento-card`
- [ ] Task 26: Medir re-renders com React DevTools Profiler antes e depois
- [ ] Task 27: Verificar que memoizacao nao causa bugs (props de referencia estavel com `useMemo`/`useCallback` se necessario)

### Bloco 6: Deprecar Funcao de Streak (DB-H05)
- [ ] Task 28: Adicionar comentario `-- DEPRECATED: Use habits.streak_atual instead` na funcao `get_habit_streak()`
- [ ] Task 29: Verificar se algum hook ou query no frontend chama `get_habit_streak()` diretamente
- [ ] Task 30: Se sim, substituir chamada pelo campo calculado `habits.streak_atual`
- [ ] Task 31: Documentar em `supabase/docs/SCHEMA.md` que `streak_atual` e `maior_streak` em `habits` sao a fonte de verdade para streaks

## Criterios de Aceite

- [ ] Coluna `deleted_at` presente nas tabelas criticas
- [ ] Registros soft-deleted nao aparecem em queries normais
- [ ] Registros soft-deleted podem ser recuperados (UPDATE `deleted_at = NULL`)
- [ ] Index parcial `WHERE deleted_at IS NULL` ativo
- [ ] Tabela `audit_log` criada com trigger em tabelas sensiveis
- [ ] Alteracoes em XP, nivel, streaks geram registros de auditoria
- [ ] Usuario so ve seus proprios registros de auditoria (RLS)
- [ ] Schema consolidado (`000_consolidated_schema.sql`) atualizado com todas as migrations
- [ ] `supabase db reset` funciona corretamente
- [ ] Suspense boundaries habilitados em paginas com Server Components
- [ ] Partes criticas da pagina aparecem primeiro (streaming)
- [ ] CLS <= 0.05 (Suspense nao causa layout shift)
- [ ] `React.memo()` aplicado em componentes de lista e cards
- [ ] Re-renders reduzidos (medido com React DevTools Profiler)
- [ ] `get_habit_streak()` marcada como deprecated
- [ ] Nenhum codigo no frontend chama `get_habit_streak()` diretamente
- [ ] `npm run lint` passa sem novos erros
- [ ] `npm run typecheck` passa sem novos erros

## Testes Requeridos

- **Unitario:** Soft delete: deletar registro e verificar que nao aparece em SELECT normal
- **Unitario:** Soft delete: recuperar registro deletado e verificar que aparece novamente
- **Integracao:** Audit trail: alterar XP de usuario e verificar registro em `audit_log`
- **Integracao:** `supabase db reset` com schema consolidado atualizado
- **Manual:** Streaming: verificar no Network tab que chunks HTML chegam incrementalmente
- **Manual:** CLS: verificar com Lighthouse que CLS <= 0.05
- **Manual:** React DevTools Profiler: comparar re-renders antes e depois de `React.memo`
- **SQL:** `SELECT * FROM get_habit_streak(user_id)` vs `SELECT streak_atual FROM habits` -- verificar equivalencia

## Dependencias

- **Depende de:**
  - TD-1.0 -- DB-C01 (seguranca corrigida) necessario antes de DB-H07 (audit trail)
  - TD-4.0 -- FE-C01 (componentes extraidos) necessario para FE-L01 (React.memo)
  - TD-5.0 -- FE-C04 (RSC) necessario para FE-N04 (Suspense streaming)
  - Todas as migrations anteriores devem estar aplicadas antes de DB-NEW-01 (schema consolidado)
- **Bloqueia:** Nenhuma (onda final)

## Riscos

| Risco | Severidade | Mitigacao |
|-------|------------|-----------|
| **RC06:** Seed data + Schema consolidado desatualizado -- `supabase db reset` pode falhar | MEDIUM | Gerar schema consolidado APOS todas as migrations (014, 015+). Testar `db reset` em ambiente local antes de substituir. |
| Soft delete pode quebrar queries existentes que nao filtram `deleted_at IS NULL` | HIGH | Atualizar RLS policies para filtrar automaticamente. Revisar TODOS os hooks que fazem SELECT. |
| Audit trail pode impactar performance de writes | LOW | Trigger e leve (INSERT em tabela de log). Monitorar tempo de write apos deploy. Considerar async logging se necessario. |
| Suspense pode causar layout shift | LOW | Usar skeletons com dimensoes fixas como fallback. Medir CLS com Lighthouse. |
| React.memo com props de referencia instavel nao memoiza | LOW | Verificar que props de objetos/arrays usam `useMemo`. Props de funcoes usam `useCallback`. React 19 compiler pode tornar isso desnecessario. |

## Dev Notes

- **DB-H06:** Soft delete e uma mudanca significativa que afeta queries em todos os hooks. Considerar implementar via RLS (filtro automatico em SELECT) para minimizar mudancas no codigo frontend.
- **DB-H07:** O audit trail deve ser leve. Nao logar campos de baixo valor (ex: `updated_at`). Focar em: XP, level, streak, sessoes completadas. Considerar particionar `audit_log` por mes se volume crescer.
- **DB-NEW-01:** O schema consolidado e para referencia e para `supabase db reset` em dev. Nao afeta producao diretamente. Gerar com `pg_dump --schema-only` ou executando migrations sequencialmente.
- **FE-N04:** Suspense boundaries so funcionam efetivamente com Server Components que fazem data fetching. Em client components, o efeito e limitado. Focar nas paginas que foram migradas para RSC na Onda 5.
- **FE-L01:** React 19 inclui um compiler experimental que pode tornar `React.memo` desnecessario. Verificar se o React Compiler esta habilitado no Next.js 16. Se sim, este item pode ser deprioritizado.
- **DB-H05:** A deprecacao e trivial (0.5h) -- so adicionar comentario e redirecionar chamadas. Nao remover a funcao imediatamente para manter backward compatibility.
- **Prioridade:** Esta onda e "futuro" -- nao tem sprint fixo. Itens podem ser puxados oportunisticamente quando houver capacidade disponivel. DB-H05 (0.5h) e FE-L01 (2-4h) podem ser feitos antes se houver janela.

### Debitos NAO incluidos nesta onda (LOW, deferred, ou zero acao)

Os seguintes debitos do assessment nao possuem acoes nesta onda por serem de impacto muito baixo, terem correcao automatica, ou serem features futuras:

| ID | Debito | Razao |
|----|--------|-------|
| DB-L01 | Campos TEXT sem CHECK constraint (prioridade, dificuldade) | LOW, correcao trivial, pode ser incluido ad hoc |
| DB-L02 | Redundancia entre tasks.status e tasks.coluna | LOW, requer decisao de design |
| DB-L03 | Index `idx_users_email` redundante | LOW, overhead minimo |
| DB-L04 | Indexes em campos TEXT de baixa cardinalidade | LOW, remocao trivial |
| DB-L05 | Tabela `projects` referenciada mas nao criada | LOW, campo orfao |
| DB-L06 | Sem tabela de notificacoes | Feature futura, nao debito |
| DB-M01 | Cursos sem politica explicita para INSERT/UPDATE/DELETE auth | Design intencional (service_role) |
| DB-M04 | Index ausente tasks(user_id, concluida_em) | Monitorar antes de criar (P5) |
| DB-M05 | Dashboard faz 5 queries HTTP paralelas | Otimizacao futura (P3), RPC consolidada |
| DB-M06 | Cursos busca todos dados e filtra client-side | Otimizacao futura (P3) |
| DB-M07 | Detalhe do curso faz 4 queries sequenciais | Otimizacao futura (P3) |
| DB-M09 | focus_sessions sem archiving | Trivial para PostgreSQL, futuro |
| DB-NEW-02 | View habits_today recriada 3 vezes | Corrigido por DB-NEW-01 |
| DB-NEW-05 | objectives FKs ausentes no schema consolidado | Corrigido por DB-NEW-01 |
| DB-H01 | Cursos acessiveis por anon sem rate limiting | Mitigar via rate limiting externo |
| DB-H02 | Admin criado via SQL com senha visivel | Acao imediata independente (rotacionar senha) |
| FE-L02 | SVG inline no login | LOW, cosmetico |
| FE-M01 | Zero next/image | Impacto futuro (app tem poucas imagens) |
| SY-M01 | Sem next.config.ts customizado | MEDIUM, incluir em sprint oportuno |
| SY-M02 | Nenhuma pagina usa RSC para data fetching | Parcialmente resolvido por FE-C04 (Onda 5) |
| SY-M03 | Missoes semanais hardcoded | MEDIUM, feature futura |
| SY-M04 | Streak shields sem implementacao | MEDIUM, feature futura |
| SY-H02 | Tabelas referenciadas mas possivelmente ausentes | HIGH, investigar em runtime |
| SY-H03 | Hook useMetas.ts excessivamente grande | Parcialmente resolvido pela refatoracao da Onda 4 |

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
