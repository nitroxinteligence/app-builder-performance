# Database Specialist Review

**Revisor:** @data-engineer
**Data:** 2026-01-29
**Documento revisado:** docs/prd/technical-debt-DRAFT.md
**Fontes verificadas:** `supabase/docs/DB-AUDIT.md`, `supabase/docs/SCHEMA.md`, todas as migrations em `supabase/migrations/implementados/`

---

## Debitos Validados

Revisao completa de todos os 27 debitos de database (DB-C01 a DB-L06) identificados no DRAFT.

### CRITICAL

| ID | Debito | Severidade Original | Severidade Ajustada | Horas Estimadas | Prioridade | Notas |
|----|--------|---------------------|---------------------|-----------------|------------|-------|
| DB-C01 | Funcoes SECURITY DEFINER sem validacao de ownership | CRITICAL | **CRITICAL** (confirmada) | 3-4h | P0 - Sprint atual | Validado. 7 funcoes afetadas: `add_user_xp`, `add_task_time`, `complete_focus_session`, `get_focus_stats`, `cancel_active_sessions`, `complete_lesson`, `get_course_progress`. A funcao `check_habit` ja valida ownership (linha 553 do schema consolidado). Abordagem hibrida recomendada: manter SECURITY DEFINER com validacao `auth.uid()` interna. Ver secao Recomendacoes Tecnicas. |
| DB-C02 | Seed data com UUID hardcoded no schema de producao | CRITICAL | **HIGH** (ajustada para baixo) | 1-2h | P0 - Sprint atual | Validado. O seed data esta no `000_consolidated_schema.sql` (linhas 629-692) e tambem no `007_create_courses_schema.sql` (linhas 309-456) e `007_create_events_table.sql` (linhas 116-128). Porem, o uso de `ON CONFLICT DO NOTHING` mitiga o risco de corrupcao. O `config.toml` ja tem `seed.sql` configurado (linha 65: `sql_paths = ["./seed.sql"]`). Ajusto para HIGH porque o ON CONFLICT reduz o impacto imediato, mas o seed DEVE ser extraido para `seed.sql`. |
| DB-C03 | Tipos TypeScript completamente desatualizados | CRITICAL | **CRITICAL** (confirmada) | 3-4h | P0 - Sprint atual | Validado. Dois arquivos de tipos divergentes existem. A solucao e regenerar via `supabase gen types typescript` e manter um unico ponto de verdade. A estimativa de 2-4h do DRAFT esta correta; ajusto para 3-4h considerando que sera necessario atualizar imports em todos os hooks. |

### HIGH

| ID | Debito | Severidade Original | Severidade Ajustada | Horas Estimadas | Prioridade | Notas |
|----|--------|---------------------|---------------------|-----------------|------------|-------|
| DB-H01 | Cursos acessiveis por `anon` sem rate limiting | HIGH | **MEDIUM** (ajustada para baixo) | 1h | P2 - Proximo sprint | Validado que as politicas em `007_create_courses_schema.sql` (linhas 131-166) nao especificam `TO authenticated`. Porem, ajusto para MEDIUM: exposicao de catalogo de cursos publicos e um padrao comum para SEO e marketing. O verdadeiro risco e scraping, que deve ser mitigado no API gateway (Supabase rate limiting), nao no RLS. |
| DB-H02 | Admin criado via SQL com senha visivel | HIGH | **HIGH** (confirmada) | 1h | P1 - Sprint atual | Validado. `002_create_admin_user.sql` linhas 108-115 exibem senha no resultado da query via `SELECT n.password AS senha`. Qualquer log que capture output de migrations tera a senha em plaintext. |
| DB-H03 | `handle_new_user()` chamavel via RPC | HIGH | **HIGH** (confirmada) | 0.5h | P0 - Sprint atual | Validado. `001_auth_profiles_trigger.sql` cria a funcao como SECURITY DEFINER sem revogar EXECUTE de `public`/`authenticated`/`anon`. Fix trivial com 3 linhas de SQL. |
| DB-H04 | `reordenarTarefas` faz N updates individuais | HIGH | **HIGH** (confirmada) | 4-6h | P3 - Backlog | Validado. O pattern esta no hook, nao no banco. Requer criar funcao RPC + ajustar hook. Estimativa do DRAFT (4-8h) esta adequada; refino para 4-6h. |
| DB-H05 | `get_habit_streak()` usa loop O(N) | HIGH | **HIGH** (confirmada) | 2-3h | P3 - Backlog | Validado. Confirmado no schema consolidado linhas 572-587 e reescrito identicamente na migration 004 linhas 130-145. O loop faz uma query por dia de streak. Recomendo manter campos calculados `streak_atual` e `maior_streak` (ja existem na tabela `habits`) e deprecar a funcao `get_habit_streak` em favor do campo direto. |
| DB-H06 | Ausencia de soft delete | HIGH | **MEDIUM** (ajustada para baixo) | 8-12h | P4 - Backlog futuro | Validado que nenhuma tabela tem `deleted_at`. Ajusto para MEDIUM porque: (1) app em estagio inicial com base de usuarios pequena, (2) soft delete adiciona complexidade significativa em todas as queries e RLS, (3) deve ser implementado junto com audit trail (DB-H07) para ter valor real. |
| DB-H07 | Ausencia de audit trail | HIGH | **MEDIUM** (ajustada para baixo) | 8-12h | P4 - Backlog futuro | Validado. Ajusto para MEDIUM pelo mesmo motivo de DB-H06: app em estagio inicial. Porem, apos corrigir DB-C01 (security definer), audit trail sobe de prioridade para detectar tentativas de abuso. |
| DB-H08 | UNIQUE constraint pode estar quebrada apos rename | HIGH | **MEDIUM** (ajustada para baixo) | 0.5h (investigacao) | P1 - Sprint atual | Analisei o codigo da migration 004. O PostgreSQL preserva constraints automaticamente quando colunas sao renomeadas via `ALTER TABLE ... RENAME COLUMN`. A constraint UNIQUE original era `UNIQUE(habit_id, check_date)` (linha 219 do schema consolidado). Apos `RENAME COLUMN habit_id TO habito_id` e `RENAME COLUMN check_date TO data`, a constraint interna se ajusta. A funcao `check_habit` reescrita na migration 004 (linha 122) usa `INSERT INTO habit_history (habito_id, ..., data, ...)` o que esta correto. **A constraint PROVAVELMENTE esta intacta**, mas precisa de verificacao em runtime. Ajusto para MEDIUM. |
| DB-H09 | Progresso sem CHECK de limites | HIGH | **HIGH** (confirmada) | 1-2h | P1 - Sprint atual | Validado. `goals.progresso_atual` e `objectives.progresso_atual` aceitam qualquer valor. Fix simples via ALTER TABLE. Nota: constraint `progresso_atual <= progresso_total` requer cuidado -- ver Resposta #7 abaixo. |
| DB-H10 | `types/database.ts` diverge do schema real | HIGH | N/A (duplicata) | -- | -- | **DUPLICATA de DB-C03.** Ambos referem-se a divergencia entre TypeScript e schema. Recomendo consolidar em DB-C03 e remover DB-H10. |
| DB-H11 | Duas migrations com prefixo `007_` | HIGH | **MEDIUM** (ajustada para baixo) | 0.5h | P1 - Sprint atual | Validado. Confirmei no filesystem: `007_create_events_table.sql` e `007_create_courses_schema.sql` coexistem. Ambas sao idempotentes (usam `IF NOT EXISTS`, `ON CONFLICT`), o que mitiga o risco. Porem, a ordenacao lexicografica faz `007_create_courses_schema.sql` rodar antes de `007_create_events_table.sql`, e nenhuma depende da outra. Ajusto para MEDIUM mas fix e trivial (renomear para 008). |

### MEDIUM

| ID | Debito | Severidade Original | Severidade Ajustada | Horas Estimadas | Prioridade | Notas |
|----|--------|---------------------|---------------------|-----------------|------------|-------|
| DB-M01 | Cursos sem politica explicita para INSERT/UPDATE/DELETE auth | MEDIUM | **LOW** (ajustada para baixo) | 0.5h | P4 - Backlog | Validado. O design e intencional: cursos sao gerenciados via `service_role`. Nao ha risco de seguranca, apenas de UX (erro generico se auth tentar INSERT). Basta documentar. |
| DB-M02 | `goals.status` como TEXT sem CHECK | MEDIUM | **MEDIUM** (confirmada) | 0.5h | P2 - Proximo sprint | Validado. `005_fix_goals_schema.sql` linhas 65-73 converte de ENUM para TEXT sem adicionar CHECK. Valores validos: `nao_iniciada`, `em_andamento`, `pausada`, `atrasada`, `concluida`. |
| DB-M03 | Index ausente `focus_sessions(user_id, started_at)` | MEDIUM | **MEDIUM** (confirmada) | 0.25h | P2 - Proximo sprint | Validado. Existe `idx_focus_sessions_user_status` (user_id, status) mas nao `(user_id, started_at)`. A funcao `get_focus_stats` filtra por ambos. Fix trivial: um CREATE INDEX. |
| DB-M04 | Index ausente `tasks(user_id, concluida_em)` | MEDIUM | **MEDIUM** (confirmada) | 0.25h | P2 - Proximo sprint | Validado. Existe `idx_tasks_user_coluna` mas nao `(user_id, concluida_em)`. |
| DB-M05 | Dashboard faz 5 queries HTTP paralelas | MEDIUM | **MEDIUM** (confirmada) | 4-6h | P3 - Backlog | Validado. Otimizacao significativa mas nao urgente. Requer criar funcao RPC `get_dashboard_stats`. |
| DB-M06 | Cursos busca todos dados e filtra client-side | MEDIUM | **MEDIUM** (confirmada) | 2-3h | P3 - Backlog | Validado. `SELECT *` em courses, modules e lessons com filtragem JS. Supabase suporta nested selects: `.select('*, course_modules(*, lessons(*))')`. |
| DB-M07 | Detalhe do curso faz 4 queries sequenciais | MEDIUM | **MEDIUM** (confirmada) | 1-2h | P3 - Backlog | Validado. Pode ser reduzido para 1-2 queries com nested selects. |
| DB-M08 | `get_focus_stats` chamado 3 vezes no dashboard | MEDIUM | **HIGH** (ajustada para cima) | 1-2h | P2 - Proximo sprint | Ajusto para HIGH. Tres chamadas da mesma funcao que faz full scan em `focus_sessions` com filtro `status = 'completed'` e sem index composto `(user_id, status, started_at)`. Em combinacao com DB-M03, isso causa 3x o trabalho desnecessario. Fix: chamar uma vez e compartilhar resultado via React Query. |
| DB-M09 | `focus_sessions` sem archiving | MEDIUM | **LOW** (ajustada para baixo) | 4-8h | P5 - Futuro | Ajusto para LOW. ~1825 registros/ano/usuario e trivial para PostgreSQL. Mesmo com 1000 usuarios ativos, 1.8M registros sao gerenciaveis com indexes corretos. Archiving faz sentido quando a base atingir ~10M registros. |
| DB-M10 | Campos XP sem CHECK >= 0 | MEDIUM | **MEDIUM** (confirmada) | 0.5h | P2 - Proximo sprint | Validado. 5 tabelas afetadas: tasks, habits, goals, objectives, lessons. Fix trivial: ALTER TABLE com CHECK constraints. |

### LOW

| ID | Debito | Severidade Original | Severidade Ajustada | Horas Estimadas | Prioridade | Notas |
|----|--------|---------------------|---------------------|-----------------|------------|-------|
| DB-L01 | Campos TEXT sem CHECK constraint | LOW | **LOW** (confirmada) | 0.5h | P5 - Futuro | Validado. `goals.prioridade`, `objectives.prioridade`, `habits.dificuldade`. |
| DB-L02 | Redundancia entre `tasks.status` e `tasks.coluna` | LOW | **LOW** (confirmada) | 1h | P5 - Futuro | Validado. Sem constraint de consistencia entre status e coluna. |
| DB-L03 | Index `idx_users_email` redundante | LOW | **LOW** (confirmada) | 0.1h | P5 - Futuro | Validado. UNIQUE em email ja cria index. Remocao trivial. |
| DB-L04 | Indexes em campos TEXT de baixa cardinalidade | LOW | **LOW** (confirmada) | 0.25h | P5 - Futuro | Validado. `idx_habits_dificuldade`, `idx_objectives_prioridade`. Com 3-4 valores distintos, esses indexes tem seletividade muito baixa. |
| DB-L05 | Tabela `projects` referenciada mas nao criada | LOW | **LOW** (confirmada) | 0.5h | P5 - Futuro | Validado. `tasks.projeto_id UUID` sem FK constraint. Campo orfao. |
| DB-L06 | Sem tabela de notificacoes | LOW | **LOW** (confirmada) | 8-16h | P5 - Futuro | Validado. Feature futura, nao e debito tecnico propriamente. |

---

## Debitos Adicionados

Novos debitos de database identificados durante a revisao das migrations que nao constam no DRAFT.

### DB-NEW-01: Funcao `check_habit` referencia `habit_checks` no schema consolidado

**Severidade:** MEDIUM
**Localizacao:** `000_consolidated_schema.sql` linhas 556-564

A funcao `check_habit` no schema consolidado (migration 000) ainda referencia `habit_checks` e `habit_id`:
```sql
IF EXISTS (SELECT 1 FROM public.habit_checks WHERE habit_id = p_habit_id AND check_date = p_date) THEN
```

A migration 004 corrige isso (reescrevendo a funcao com `habit_history` e `habito_id`), mas se alguem rodar apenas o schema consolidado sem as migrations subsequentes, a funcao estara inconsistente com os nomes das tabelas/colunas.

**Recomendacao:** Atualizar o schema consolidado (000) para refletir o estado final apos todas as migrations. Ideal: gerar um novo schema consolidado que absorva todas as migrations 001-007.

### DB-NEW-02: View `habits_today` recriada 3 vezes com definicoes divergentes

**Severidade:** LOW
**Localizacao:** `000_consolidated_schema.sql:613-622`, `004_fix_database_naming.sql:77-86`, `006_fix_habits_schema.sql:99-108`

A view `habits_today` e criada/recriada em 3 migrations diferentes:
1. **000**: Usa `category_id`, `hc.titulo as category_titulo`
2. **004**: Usa `category_id`, `hc.titulo as category_titulo` (mesma que 000)
3. **006**: Usa `categoria_id`, `hc.nome as category_nome`, inclui `icone`, `cor`, `dificuldade`

Apenas a versao da 006 e a correta (final). Nao e um problema de runtime (CREATE OR REPLACE sobrescreve), mas demonstra que o schema consolidado esta desatualizado.

### DB-NEW-03: Ausencia de CHECK constraint em `events.horario_fim > horario_inicio`

**Severidade:** MEDIUM
**Localizacao:** `007_create_events_table.sql`

Eventos podem ter `horario_fim` anterior a `horario_inicio`. Isso foi mencionado no DB-AUDIT (CONST-004) mas nao foi incluido como debito no DRAFT.

```sql
ALTER TABLE events ADD CONSTRAINT chk_events_horario
CHECK (horario_fim > horario_inicio);
```

### DB-NEW-04: Ausencia de CHECK constraint em `users.total_xp >= 0` e `users.level >= 1`

**Severidade:** MEDIUM
**Localizacao:** `000_consolidated_schema.sql` (tabela users)

Mencionado no DB-AUDIT (CONST-005) mas nao incluido no DRAFT. XP negativo ou level 0 corromperiam a gamificacao.

### DB-NEW-05: `objectives.coluna_id` e `objectives.meta_id` sem FK no schema consolidado

**Severidade:** LOW
**Localizacao:** `004_fix_database_naming.sql` linhas 362-374

As FKs sao adicionadas na migration 004, mas o schema consolidado (000) nao tem as tabelas `objective_columns` e `goal_milestones` (criadas tambem na 004). Isso reforca a necessidade de um schema consolidado atualizado (DB-NEW-01).

---

## Respostas ao Architect

### Pergunta 1: DB-C01 (SECURITY DEFINER) -- Abordagem recomendada

**Recomendacao: Abordagem hibrida -- manter SECURITY DEFINER com validacao `auth.uid()` interna.**

Justificativa tecnica:
- **Converter para SECURITY INVOKER nao e viavel** para a maioria das funcoes. `add_user_xp()` precisa fazer `UPDATE public.users SET total_xp = ...` que e protegida por RLS (`auth.uid() = id`). Quando chamada por `complete_focus_session()` ou `check_habit()`, o `auth.uid()` e do usuario corrente, entao o RLS funcionaria -- MAS se a funcao fosse INVOKER e o usuario tentasse via RPC direta, o RLS ja protegeria.
- **O problema real** e que funcoes SECURITY DEFINER bypassam RLS completamente, permitindo que `add_user_xp('outro-user-id', 99999)` funcione porque opera como `postgres`.
- **Funcoes que PRECISAM ser DEFINER**: `handle_new_user()` (trigger do sistema, nao tem auth context), `complete_focus_session()` (precisa atualizar `focus_sessions` e `users` e `tasks` em uma transacao que cruza ownership -- a sessao pertence ao usuario, mas a funcao precisa ler a sessao para obter o `task_id`).

**Abordagem recomendada:**
1. Adicionar `IF auth.uid() IS NULL OR auth.uid() != p_user_id THEN RAISE EXCEPTION 'Unauthorized'; END IF;` no inicio de CADA funcao que recebe `p_user_id`.
2. Para `complete_focus_session` que recebe `p_session_id` (nao user_id), adicionar verificacao interna: buscar o `user_id` da sessao e validar contra `auth.uid()`.
3. Para `add_task_time` que recebe `p_task_id` (nao user_id), buscar o `user_id` da task e validar.
4. Manter `handle_new_user()` como DEFINER sem validacao auth (trigger do sistema), mas revogar EXECUTE publico.

Ver SQL detalhado na secao Recomendacoes Tecnicas.

### Pergunta 2: DB-H08 (UNIQUE constraint habit_history)

**Analise tecnica: A constraint PROVAVELMENTE esta intacta.**

Quando o PostgreSQL executa `ALTER TABLE ... RENAME COLUMN`, a constraint interna e preservada com os novos nomes de coluna. O PostgreSQL armazena constraints referenciando `attnum` (numero interno da coluna), nao o nome. O rename altera apenas o nome visivel, nao o `attnum`.

A UNIQUE original era: `UNIQUE(habit_id, check_date)` (migration 000, linha 219).
Apos renames na migration 004: `habit_id -> habito_id`, `check_date -> data`.

O PostgreSQL automaticamente ajusta a definicao da constraint para usar `(habito_id, data)`.

**Porem, para confirmar com 100% de certeza, e necessario executar em runtime:**
```sql
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'public.habit_history'::regclass
AND contype = 'u';
```

**Resultado esperado:** `habit_checks_habit_id_check_date_key | UNIQUE (habito_id, data)`

Note que o **nome da constraint** manteria o nome antigo (`habit_checks_habit_id_check_date_key`), o que e confuso mas funcional. Recomendo renomear a constraint em uma migration futura para claridade:

```sql
ALTER TABLE public.habit_history
RENAME CONSTRAINT habit_checks_habit_id_check_date_key TO uq_habit_history_habito_data;
```

Estimativa: 0.5h para investigar + corrigir nome.

### Pergunta 3: DB-H05 (Streak O(N)) -- Window functions vs campos calculados

**Recomendacao: Manter campos calculados (ja existem) e deprecar `get_habit_streak`.**

A tabela `habits` ja possui `streak_atual` e `maior_streak` que sao atualizados pela funcao `check_habit()` (migration 004, linha 123):

```sql
UPDATE public.habits SET streak_atual = v_streak, maior_streak = GREATEST(maior_streak, v_streak) WHERE id = p_habit_id;
```

A funcao `get_habit_streak()` e redundante e so deveria ser usada para recalcular streaks em caso de inconsistencia. Em vez de reescrevê-la com window functions (complexidade desnecessaria para uso raro), recomendo:

1. **Manter `habits.streak_atual` como fonte de verdade** (ja funciona).
2. **Criar funcao `recalculate_all_streaks()`** para uso administrativo que use window functions (rodar manualmente se necessario).
3. **Deprecar `get_habit_streak()`** ou manter apenas para casos de auditoria.

Se ainda quiser reescrever com window functions, aqui esta a versao correta:

```sql
CREATE OR REPLACE FUNCTION public.get_habit_streak(p_habit_id UUID)
RETURNS INTEGER AS $$
  SELECT COALESCE(
    (
      SELECT COUNT(*)::INTEGER
      FROM (
        SELECT data,
               data - (ROW_NUMBER() OVER (ORDER BY data DESC))::INTEGER * INTERVAL '1 day' AS grp
        FROM public.habit_history
        WHERE habito_id = p_habit_id
          AND concluido = true
      ) sub
      WHERE grp = (
        SELECT data - INTERVAL '1 day' * 1
        FROM public.habit_history
        WHERE habito_id = p_habit_id AND concluido = true
        ORDER BY data DESC LIMIT 1
      )
    ),
    0
  );
$$ LANGUAGE sql STABLE;
```

**Nota:** A versao com window functions executa em O(1) queries (single scan + sort), contra O(N) do loop atual. Porem, a diferenca so e significativa para streaks > 100 dias.

Estimativa: 1h se deprecar, 2-3h se reescrever.

### Pergunta 4: DB-C02 (Seed data) -- Configuracao de seed.sql

**Sim, `supabase/seed.sql` ja esta configurado no `config.toml`.**

Linha 65 do `config.toml`:
```toml
[db.seed]
enabled = true
sql_paths = ["./seed.sql"]
```

**Procedimento:**
1. Criar arquivo `supabase/seed.sql` com todo o conteudo de seed (linhas 629-692 do schema consolidado + seed data das migrations 007).
2. Remover o PART 10 do `000_consolidated_schema.sql` (linhas 625-692).
3. Remover o PART 8 de `007_create_courses_schema.sql` (linhas 306-456).
4. Remover o PART 7 de `007_create_events_table.sql` (linhas 113-128).
5. O seed.sql roda automaticamente durante `supabase db reset` quando `enabled = true`.

**Nao e necessaria configuracao adicional.** O Supabase CLI ja esta preparado.

Estimativa: 1-2h (incluindo testes de `supabase db reset`).

### Pergunta 5: DB-M03/M04 (Indexes ausentes) -- Validacao de necessidade

**Nao tenho acesso a `pg_stat_user_tables` ou `pg_stat_user_indexes` do ambiente de producao** para confirmar empiricamente quais queries sao mais custosas. Porem, a necessidade dos indexes pode ser inferida pela analise estatica do codigo:

1. **`focus_sessions(user_id, started_at DESC)`**: A funcao `get_focus_stats` (linhas 490-515 do schema consolidado) filtra `WHERE fs.user_id = p_user_id AND fs.status = 'completed'` e usa `FILTER (WHERE fs.started_at >= CURRENT_DATE)`. O index composto `(user_id, status, started_at DESC)` seria **mais util** que apenas `(user_id, started_at)` porque cobre o filtro de status tambem.

2. **`tasks(user_id, concluida_em DESC)`**: O dashboard filtra tarefas concluidas na semana, que exige varredura em `concluida_em`. Com poucos registros por usuario (~100-500 tarefas), o index `idx_tasks_user_id` sozinho pode ser suficiente. **Recomendo monitorar antes de criar.**

**Recomendacao ajustada:**
```sql
-- Este index cobre get_focus_stats de forma otima
CREATE INDEX idx_focus_sessions_user_status_started
ON focus_sessions(user_id, status, started_at DESC);

-- Este index pode esperar ate termos dados de pg_stat
-- CREATE INDEX idx_tasks_user_concluida ON tasks(user_id, concluida_em DESC);
```

Estimativa: 0.25h para o index de focus_sessions. O de tasks pode esperar.

### Pergunta 6: DB-H01 (Cursos anon) -- Intencionalidade

**A exposicao para `anon` parece intencional** com base em dois indicadores:

1. O comentario na migration `007_create_courses_schema.sql` (linhas 131, 142, 153) diz explicitamente: "todos podem ver cursos publicados (incluindo anon)".
2. Cursos publicos sao um padrao comum para landing pages e SEO.

**Recomendacao:**
1. **Manter `anon` com acesso SELECT** para catalogo publico.
2. **Documentar explicitamente** no SCHEMA.md que isso e intencional.
3. **Configurar rate limiting** no nivel da API (Supabase API Gateway ou middleware Next.js) para prevenir scraping. O Supabase tem configuracao `max_rows = 1000` no config.toml (linha 18), que ja limita parcialmente.
4. **Nao expor dados sensiveis** nas tabelas de cursos (nao ha campos sensiveis no schema atual).

Estimativa: 0.5h para documentacao + 1h se quiser adicionar rate limiting customizado.

### Pergunta 7: DB-H09 (Progresso sem CHECK) -- Reducao de progresso_total

**A constraint `progresso_atual <= progresso_total` pode causar problemas se `progresso_total` for reduzido.**

Cenario problematico:
- Usuario tem `progresso_atual = 80`, `progresso_total = 100`.
- Admin/usuario reduz `progresso_total` para 50.
- A constraint bloqueia o UPDATE porque `80 > 50`.

**Recomendacao: Tratar com constraint condicional + logica na aplicacao.**

```sql
-- Constraint segura: apenas garante que progresso_atual >= 0
-- E que progresso_total >= 1 (meta nao pode ter total 0)
ALTER TABLE goals ADD CONSTRAINT chk_goals_progresso_atual
  CHECK (progresso_atual >= 0);
ALTER TABLE goals ADD CONSTRAINT chk_goals_progresso_total
  CHECK (progresso_total >= 1);

-- Para objectives:
ALTER TABLE objectives ADD CONSTRAINT chk_objectives_progresso_atual
  CHECK (progresso_atual >= 0);
ALTER TABLE objectives ADD CONSTRAINT chk_objectives_progresso_total
  CHECK (progresso_total >= 1);
```

**Nao incluir** `progresso_atual <= progresso_total` como constraint de banco. Essa validacao deve ficar na aplicacao (Zod schema) porque:
1. Permite reducao de `progresso_total` sem bloquear UPDATE.
2. A UI pode tratar `progresso_atual > progresso_total` exibindo 100% (cap).
3. Evita locks em cenarios de atualizacao concorrente.

Estimativa: 0.5h para constraints de banco + 0.5h para Zod schemas.

### Pergunta 8: DB-M09 (Archiving) -- Estrategia para `focus_sessions`

**Recomendacao: Materialized view para stats + particionamento no futuro.**

Para o estagio atual da aplicacao (~1825 registros/usuario/ano), nenhuma estrategia de archiving e urgente. A tabela e gerenciavel com indexes corretos.

**Abordagem em 3 fases:**

**Fase 1 (Agora -- 0h): Nenhuma acao.** Com os indexes recomendados em DB-M03 (ajustado: `user_id, status, started_at`), as queries do dashboard serao rapidas o suficiente.

**Fase 2 (Quando > 1M registros -- 2-4h): Materialized view para estatisticas.**
```sql
CREATE MATERIALIZED VIEW focus_stats_daily AS
SELECT
  user_id,
  date_trunc('day', started_at) AS dia,
  COUNT(*) AS sessoes,
  SUM(duracao_real) AS segundos_totais,
  SUM(xp_ganho) AS xp_total,
  AVG(duracao_real) AS media_segundos
FROM focus_sessions
WHERE status = 'completed'
GROUP BY user_id, date_trunc('day', started_at);

-- Refresh diario via cron
-- SELECT cron.schedule('refresh-focus-stats', '0 3 * * *', 'REFRESH MATERIALIZED VIEW CONCURRENTLY focus_stats_daily');
```

**Fase 3 (Quando > 10M registros -- 8-16h): Particionamento por range.**
```sql
-- Requer recriar a tabela com particionamento
CREATE TABLE focus_sessions_partitioned (
  LIKE focus_sessions INCLUDING ALL
) PARTITION BY RANGE (started_at);

CREATE TABLE focus_sessions_2026 PARTITION OF focus_sessions_partitioned
  FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');
```

**Nao recomendo tabela `focus_sessions_archive` separada** porque:
1. Complica queries que precisam de historico completo.
2. Requer logica de merge para estatisticas.
3. Particionamento por range e nativo do PostgreSQL e transparente para a aplicacao.

Estimativa atual: 0h. Fase 2: 2-4h quando necessario. Fase 3: 8-16h quando necessario.

---

## Recomendacoes Tecnicas

### 1. Fix DB-C01: Validacao auth.uid() em funcoes SECURITY DEFINER

**Migration: `009_fix_security_definer_auth.sql`**

```sql
-- ============================================================================
-- MIGRATION: Fix SECURITY DEFINER functions - add auth.uid() validation
-- ============================================================================

-- 1. add_user_xp: adicionar validacao de ownership
CREATE OR REPLACE FUNCTION public.add_user_xp(
  p_user_id UUID,
  p_xp_amount INTEGER
)
RETURNS TABLE(new_total_xp INTEGER, new_level INTEGER, level_up BOOLEAN) AS $$
DECLARE
  v_old_level INTEGER;
  v_new_level INTEGER;
  v_new_xp INTEGER;
BEGIN
  -- SECURITY: Validar que o caller e o dono do perfil
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: cannot modify XP of another user';
  END IF;

  SELECT level INTO v_old_level FROM public.users WHERE id = p_user_id;
  UPDATE public.users SET total_xp = total_xp + p_xp_amount WHERE id = p_user_id RETURNING total_xp INTO v_new_xp;
  v_new_level := public.calculate_level(v_new_xp);
  IF v_new_level != v_old_level THEN
    UPDATE public.users SET level = v_new_level WHERE id = p_user_id;
  END IF;
  RETURN QUERY SELECT v_new_xp, v_new_level, (v_new_level > v_old_level);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. add_task_time: validar ownership via task
CREATE OR REPLACE FUNCTION public.add_task_time(
  p_task_id UUID,
  p_minutes INTEGER
)
RETURNS INTEGER AS $$
DECLARE
  v_new_time INTEGER;
  v_task_user_id UUID;
BEGIN
  -- SECURITY: Validar que a task pertence ao caller
  SELECT user_id INTO v_task_user_id FROM public.tasks WHERE id = p_task_id;
  IF v_task_user_id IS NULL THEN
    RAISE EXCEPTION 'Task not found';
  END IF;
  IF auth.uid() IS DISTINCT FROM v_task_user_id THEN
    RAISE EXCEPTION 'Unauthorized: cannot modify task of another user';
  END IF;

  UPDATE public.tasks SET tempo_gasto = tempo_gasto + p_minutes WHERE id = p_task_id RETURNING tempo_gasto INTO v_new_time;
  RETURN v_new_time;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. complete_focus_session: validar ownership via session
CREATE OR REPLACE FUNCTION public.complete_focus_session(
  p_session_id UUID,
  p_duration_real INTEGER,
  p_ended_at TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE(
  session_id UUID,
  xp_earned INTEGER,
  new_total_xp INTEGER,
  new_level INTEGER,
  level_up BOOLEAN
) AS $$
DECLARE
  v_user_id UUID;
  v_task_id UUID;
  v_xp INTEGER;
  v_result RECORD;
BEGIN
  -- SECURITY: Buscar user_id da sessao e validar ownership
  SELECT fs.user_id, fs.task_id INTO v_user_id, v_task_id
  FROM public.focus_sessions fs WHERE fs.id = p_session_id;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Session not found';
  END IF;
  IF auth.uid() IS DISTINCT FROM v_user_id THEN
    RAISE EXCEPTION 'Unauthorized: cannot complete session of another user';
  END IF;

  v_xp := public.calculate_focus_xp(p_duration_real);
  UPDATE public.focus_sessions SET status = 'completed', duracao_real = p_duration_real, xp_ganho = v_xp, ended_at = p_ended_at
  WHERE id = p_session_id;

  -- Chamada interna: add_user_xp precisa funcionar SEM re-validar auth
  -- Como estamos dentro de SECURITY DEFINER, a chamada interna funciona
  UPDATE public.users SET total_xp = total_xp + v_xp WHERE id = v_user_id RETURNING total_xp INTO v_result.new_total_xp;
  v_result.new_level := public.calculate_level(v_result.new_total_xp);
  UPDATE public.users SET level = v_result.new_level WHERE id = v_user_id;

  IF v_task_id IS NOT NULL THEN
    UPDATE public.tasks SET tempo_gasto = tempo_gasto + FLOOR(p_duration_real::DECIMAL / 60)::INTEGER WHERE id = v_task_id;
  END IF;
  RETURN QUERY SELECT p_session_id, v_xp, v_result.new_total_xp::INTEGER, v_result.new_level::INTEGER, (v_result.new_level > (SELECT level FROM public.users WHERE id = v_user_id));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. get_focus_stats: validar que user_id e o caller
CREATE OR REPLACE FUNCTION public.get_focus_stats(p_user_id UUID)
RETURNS TABLE(
  total_sessions BIGINT,
  total_seconds BIGINT,
  total_xp BIGINT,
  average_session_seconds NUMERIC,
  sessions_today BIGINT,
  seconds_today BIGINT,
  sessions_this_week BIGINT,
  seconds_this_week BIGINT
) AS $$
BEGIN
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: cannot view stats of another user';
  END IF;

  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT,
    COALESCE(SUM(fs.duracao_real), 0)::BIGINT,
    COALESCE(SUM(fs.xp_ganho), 0)::BIGINT,
    COALESCE(AVG(fs.duracao_real), 0)::NUMERIC,
    COUNT(*) FILTER (WHERE fs.started_at >= CURRENT_DATE)::BIGINT,
    COALESCE(SUM(fs.duracao_real) FILTER (WHERE fs.started_at >= CURRENT_DATE), 0)::BIGINT,
    COUNT(*) FILTER (WHERE fs.started_at >= DATE_TRUNC('week', CURRENT_DATE))::BIGINT,
    COALESCE(SUM(fs.duracao_real) FILTER (WHERE fs.started_at >= DATE_TRUNC('week', CURRENT_DATE)), 0)::BIGINT
  FROM public.focus_sessions fs
  WHERE fs.user_id = p_user_id AND fs.status = 'completed';
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 5. cancel_active_sessions: validar ownership
CREATE OR REPLACE FUNCTION public.cancel_active_sessions(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: cannot cancel sessions of another user';
  END IF;

  UPDATE public.focus_sessions SET status = 'cancelled', ended_at = NOW()
  WHERE user_id = p_user_id AND status IN ('active', 'paused');
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. complete_lesson: validar ownership
CREATE OR REPLACE FUNCTION public.complete_lesson(
  p_user_id UUID,
  p_lesson_id UUID
)
RETURNS TABLE(
  xp_ganho INTEGER,
  new_total_xp INTEGER,
  new_level INTEGER,
  level_up BOOLEAN
) AS $$
DECLARE
  v_lesson_xp INTEGER;
  v_xp_result RECORD;
  v_already_completed BOOLEAN;
  v_old_level INTEGER;
  v_new_xp INTEGER;
  v_new_level INTEGER;
BEGIN
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: cannot complete lesson for another user';
  END IF;

  SELECT EXISTS(
    SELECT 1 FROM public.lesson_progress
    WHERE user_id = p_user_id AND lesson_id = p_lesson_id AND concluida = true
  ) INTO v_already_completed;

  IF v_already_completed THEN
    RETURN QUERY SELECT 0, 0, 0, false;
    RETURN;
  END IF;

  SELECT xp_recompensa INTO v_lesson_xp
  FROM public.lessons WHERE id = p_lesson_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lesson not found';
  END IF;

  INSERT INTO public.lesson_progress (user_id, lesson_id, concluida, xp_ganho, concluida_em)
  VALUES (p_user_id, p_lesson_id, true, v_lesson_xp, NOW())
  ON CONFLICT (user_id, lesson_id)
  DO UPDATE SET concluida = true, xp_ganho = v_lesson_xp, concluida_em = NOW();

  SELECT level INTO v_old_level FROM public.users WHERE id = p_user_id;
  UPDATE public.users SET total_xp = total_xp + v_lesson_xp WHERE id = p_user_id RETURNING total_xp INTO v_new_xp;
  v_new_level := public.calculate_level(v_new_xp);
  IF v_new_level != v_old_level THEN
    UPDATE public.users SET level = v_new_level WHERE id = p_user_id;
  END IF;

  RETURN QUERY SELECT v_lesson_xp, v_new_xp, v_new_level, (v_new_level > v_old_level);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. get_course_progress: validar ownership
CREATE OR REPLACE FUNCTION public.get_course_progress(
  p_user_id UUID,
  p_course_id UUID
)
RETURNS TABLE(
  total_aulas BIGINT,
  aulas_concluidas BIGINT,
  progresso_percentual INTEGER
) AS $$
BEGIN
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: cannot view progress of another user';
  END IF;

  RETURN QUERY
  SELECT
    COUNT(l.id)::BIGINT AS total_aulas,
    COUNT(lp.id) FILTER (WHERE lp.concluida = true)::BIGINT AS aulas_concluidas,
    CASE
      WHEN COUNT(l.id) = 0 THEN 0
      ELSE ROUND((COUNT(lp.id) FILTER (WHERE lp.concluida = true)::DECIMAL / COUNT(l.id)) * 100)::INTEGER
    END AS progresso_percentual
  FROM public.lessons l
  JOIN public.course_modules m ON m.id = l.module_id
  LEFT JOIN public.lesson_progress lp ON lp.lesson_id = l.id AND lp.user_id = p_user_id
  WHERE m.course_id = p_course_id;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
```

**IMPORTANTE:** A validacao em `add_user_xp` cria um problema circular: `complete_focus_session` chama `add_user_xp` internamente. Como ambas sao SECURITY DEFINER, a chamada interna funcionaria... MAS a validacao `auth.uid()` dentro de `add_user_xp` ainda seria chamada.

**Solucao:** Na versao acima de `complete_focus_session`, faco o UPDATE de XP/level diretamente em vez de chamar `add_user_xp`, eliminando a dependencia. O mesmo se aplica a `complete_lesson`.

### 2. Fix DB-H03: Revogar EXECUTE de handle_new_user

```sql
-- Migration: 010_revoke_handle_new_user.sql
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
```

### 3. Fix DB-H09 + DB-M10 + DB-NEW-03 + DB-NEW-04: CHECK constraints

```sql
-- Migration: 011_add_check_constraints.sql

-- Progresso
ALTER TABLE goals ADD CONSTRAINT chk_goals_progresso_atual CHECK (progresso_atual >= 0);
ALTER TABLE goals ADD CONSTRAINT chk_goals_progresso_total CHECK (progresso_total >= 1);
ALTER TABLE objectives ADD CONSTRAINT chk_objectives_progresso_atual CHECK (progresso_atual >= 0);
ALTER TABLE objectives ADD CONSTRAINT chk_objectives_progresso_total CHECK (progresso_total >= 1);

-- XP >= 0
ALTER TABLE tasks ADD CONSTRAINT chk_tasks_xp CHECK (xp_recompensa >= 0);
ALTER TABLE habits ADD CONSTRAINT chk_habits_xp CHECK (xp_por_check >= 0);
ALTER TABLE goals ADD CONSTRAINT chk_goals_xp CHECK (xp_recompensa >= 0);
ALTER TABLE objectives ADD CONSTRAINT chk_objectives_xp CHECK (xp_recompensa >= 0);
ALTER TABLE lessons ADD CONSTRAINT chk_lessons_xp CHECK (xp_recompensa >= 0);

-- Users
ALTER TABLE users ADD CONSTRAINT chk_users_xp CHECK (total_xp >= 0);
ALTER TABLE users ADD CONSTRAINT chk_users_level CHECK (level >= 1);

-- Events horarios
ALTER TABLE events ADD CONSTRAINT chk_events_horario CHECK (horario_fim > horario_inicio);

-- Goals status (TEXT com valores validos)
ALTER TABLE goals ADD CONSTRAINT chk_goals_status
  CHECK (status IN ('nao_iniciada', 'em_andamento', 'pausada', 'atrasada', 'concluida'));
```

### 4. Fix DB-H11: Renumerar migration duplicada

```bash
# Renomear no filesystem
mv supabase/migrations/implementados/007_create_courses_schema.sql \
   supabase/migrations/implementados/008_create_courses_schema.sql
```

### 5. Fix DB-M03 (ajustado): Index composto para focus_sessions

```sql
-- Migration: 012_add_composite_indexes.sql
CREATE INDEX IF NOT EXISTS idx_focus_sessions_user_status_started
ON focus_sessions(user_id, status, started_at DESC);
```

### 6. Fix DB-H04: RPC batch para reordenacao de tarefas

```sql
-- Migration: 013_batch_reorder_tasks.sql
CREATE OR REPLACE FUNCTION public.batch_reorder_tasks(
  p_updates JSONB  -- Array de {id, ordem, coluna}
)
RETURNS VOID AS $$
DECLARE
  v_item JSONB;
  v_user_id UUID;
BEGIN
  -- Validar que todas as tasks pertencem ao caller
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_updates)
  LOOP
    SELECT user_id INTO v_user_id
    FROM public.tasks WHERE id = (v_item->>'id')::UUID;

    IF v_user_id IS NULL OR auth.uid() IS DISTINCT FROM v_user_id THEN
      RAISE EXCEPTION 'Unauthorized: task % does not belong to user', v_item->>'id';
    END IF;
  END LOOP;

  -- Executar batch update
  UPDATE public.tasks t SET
    ordem = (u->>'ordem')::INTEGER,
    coluna = (u->>'coluna')::kanban_column
  FROM jsonb_array_elements(p_updates) AS u
  WHERE t.id = (u->>'id')::UUID;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Plano de Migracao

Ordem recomendada das migrations de correcao, considerando dependencias entre os debitos.

### Onda 1: Seguranca Critica (Sprint atual -- ~6h)

**Sem dependencias. Pode ser executado imediatamente.**

| # | Migration | Debitos | Horas | Dependencias |
|---|-----------|---------|-------|-------------|
| 1 | `009_fix_security_definer_auth.sql` | DB-C01 | 3-4h | Nenhuma |
| 2 | `010_revoke_handle_new_user.sql` | DB-H03 | 0.5h | Nenhuma |
| 3 | Renomear `007_create_courses_schema.sql` para `008_` | DB-H11 | 0.5h | Nenhuma (operacao filesystem) |
| 4 | Mover seed data para `supabase/seed.sql` | DB-C02 | 1-2h | Nenhuma |

### Onda 2: Integridade de Dados (Sprint atual -- ~3h)

**Depende de:** Onda 1 completa (para garantir que funcoes corrigidas nao gerem dados invalidos).

| # | Migration | Debitos | Horas | Dependencias |
|---|-----------|---------|-------|-------------|
| 5 | `011_add_check_constraints.sql` | DB-H09, DB-M02, DB-M10, DB-NEW-03, DB-NEW-04 | 1-2h | Onda 1 |
| 6 | Verificar UNIQUE constraint `habit_history` | DB-H08 | 0.5h | Nenhuma (read-only) |
| 7 | Renomear constraint se necessario | DB-H08 | 0.25h | Item 6 |

### Onda 3: Performance (Proximo sprint -- ~2h)

**Depende de:** Onda 2 completa (para que indexes cubram as queries corretas).

| # | Migration | Debitos | Horas | Dependencias |
|---|-----------|---------|-------|-------------|
| 8 | `012_add_composite_indexes.sql` | DB-M03 | 0.25h | Nenhuma |
| 9 | Remover `idx_users_email` redundante | DB-L03 | 0.1h | Nenhuma |
| 10 | Regenerar tipos TypeScript | DB-C03 | 3-4h | Ondas 1-2 (schema estavel) |

### Onda 4: Otimizacoes de Query (Sprint +2 -- ~8h)

**Depende de:** Onda 3 (tipos TS corretos para validar hooks).

| # | Migration | Debitos | Horas | Dependencias |
|---|-----------|---------|-------|-------------|
| 11 | `013_batch_reorder_tasks.sql` | DB-H04 | 4-6h | Onda 3 (tipos TS) |
| 12 | Refatorar `get_focus_stats` chamadas (hook, nao migration) | DB-M08 | 1-2h | Onda 3 |
| 13 | Deprecar `get_habit_streak` (documentar apenas) | DB-H05 | 0.5h | Nenhuma |

### Onda 5: Funcionalidades Estruturais (Backlog -- ~20h)

**Depende de:** Ondas 1-4 completas.

| # | Migration | Debitos | Horas | Dependencias |
|---|-----------|---------|-------|-------------|
| 14 | Implementar soft delete | DB-H06 | 8-12h | Onda 4 |
| 15 | Implementar audit trail | DB-H07 | 8-12h | Onda 1 (DB-C01 corrigido) |
| 16 | Schema consolidado atualizado | DB-NEW-01 | 2-4h | Todas as ondas anteriores |

### Estimativa Total

| Onda | Horas | Sprint |
|------|-------|--------|
| 1. Seguranca Critica | ~6h | Atual |
| 2. Integridade | ~3h | Atual |
| 3. Performance + Tipos | ~7h | Proximo |
| 4. Otimizacoes | ~8h | Sprint +2 |
| 5. Estruturais | ~24h | Backlog |
| **Total** | **~48h** | **4-5 sprints** |

---

## Notas Finais

### Ajustes na Contagem do DRAFT

O DRAFT lista 27 debitos de database. Apos revisao:

- **DB-H10 e duplicata de DB-C03** -- remover DB-H10, reduzindo para 26 debitos.
- **5 novos debitos adicionados** (DB-NEW-01 a DB-NEW-05), totalizando 31 debitos de database.
- **Severidades ajustadas:** 6 debitos tiveram severidade reduzida, 1 aumentado (DB-M08 MEDIUM -> HIGH).

### Contagem Ajustada por Severidade

| Severidade | DRAFT Original | Ajustada |
|------------|---------------|----------|
| CRITICAL   | 3             | 2 (-1: DB-C02 para HIGH) |
| HIGH       | 8 (com DB-H10) | 7 (-1 duplicata DB-H10, -3 reduzidos, +1 DB-M08 promovido, +1 DB-C02) |
| MEDIUM     | 10            | 14 (+3 elevados de HIGH, +3 novos, -1 DB-M08 promovido, -1 DB-M09 reduzido) |
| LOW        | 6             | 8 (+1 DB-M01, +1 DB-M09, +1 DB-NEW-05, -1 DB-H10 removido) |
| **Total**  | **27**        | **31** |

### Recomendacao ao @architect

1. **Priorizar Onda 1** imediatamente -- a vulnerabilidade DB-C01 e exploravel por qualquer usuario autenticado.
2. **Nao bloquear desenvolvimento** por causa de debitos de LOW/MEDIUM -- podem ser corrigidos incrementalmente.
3. **Consolidar o schema** (DB-NEW-01) deve ser a ultima etapa, quando todas as outras migrations estiverem estabilizadas.
4. **A estimativa de esforco total do DRAFT esta subestimada** para o bloco de seguranca (o DRAFT estimava 2-4h para DB-C01, eu estimo 3-4h porque `complete_focus_session` e `complete_lesson` precisam de refatoracao interna para evitar dependencia circular de auth validation).

---

*Revisao concluida por @data-engineer*
*Data: 2026-01-29*
*Status: APROVADO COM AJUSTES*
