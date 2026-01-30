# Builders Performance - Auditoria de Banco de Dados

**Data da auditoria:** 2026-01-29
**Auditor:** @data-engineer
**Escopo:** Schema completo, RLS, indexes, hooks, seguranca, performance, normalizacao

---

## Indice

1. [Resumo Executivo](#resumo-executivo)
2. [Auditoria de Politicas RLS](#auditoria-de-politicas-rls)
3. [Auditoria de Indexes](#auditoria-de-indexes)
4. [Padroes N+1 nos Hooks](#padroes-n1-nos-hooks)
5. [Avaliacao de Normalizacao](#avaliacao-de-normalizacao)
6. [Constraints Ausentes](#constraints-ausentes)
7. [Auditoria de Seguranca](#auditoria-de-seguranca)
8. [Preocupacoes de Performance](#preocupacoes-de-performance)
9. [Funcionalidades Ausentes](#funcionalidades-ausentes)
10. [Divergencias TypeScript vs Schema](#divergencias-typescript-vs-schema)
11. [Itens de Debito Tecnico](#itens-de-debito-tecnico)

---

## Resumo Executivo

| Severidade | Quantidade |
|------------|------------|
| CRITICAL   | 3          |
| HIGH       | 7          |
| MEDIUM     | 9          |
| LOW        | 6          |

O banco de dados esta funcional e bem estruturado para uma aplicacao em estagio inicial. No entanto, existem divergencias criticas entre o schema real do banco e os tipos TypeScript, funcoes SECURITY DEFINER sem validacao de ownership, e falta de audit trail. As recomendacoes sao priorizadas por severidade.

---

## Auditoria de Politicas RLS

### Status Geral: BOM (com ressalvas)

Todas as 15 tabelas possuem RLS habilitado. O padrao geral (SELECT/INSERT/UPDATE/DELETE com `auth.uid() = user_id`) esta correto e consistente.

### [CRITICAL] RLS-001: Funcoes SECURITY DEFINER bypassam RLS

**Severidade:** CRITICAL
**Arquivos afetados:** `supabase/migrations/implementados/000_consolidated_schema.sql` (linhas 417-587), `007_create_courses_schema.sql` (linhas 208-279)

As seguintes funcoes usam `SECURITY DEFINER`, o que significa que executam com os privilegios do **owner** (geralmente `postgres`), bypassando completamente as politicas RLS:

- `add_user_xp()` - Permite alterar XP de **qualquer** usuario
- `add_task_time()` - Permite alterar tempo de **qualquer** tarefa
- `complete_focus_session()` - Permite completar sessao de **qualquer** usuario
- `get_focus_stats()` - Permite ver stats de **qualquer** usuario
- `cancel_active_sessions()` - Permite cancelar sessoes de **qualquer** usuario
- `check_habit()` - Valida ownership internamente (OK)
- `complete_lesson()` - Recebe `p_user_id` mas nao valida se e o usuario autenticado
- `get_course_progress()` - Recebe `p_user_id` sem validacao

**Risco:** Um usuario autenticado pode chamar `add_user_xp('outro-user-id', 99999)` via Supabase client e dar XP a qualquer usuario, ou `get_focus_stats('outro-user-id')` para ver estatisticas alheias.

**Recomendacao:** Adicionar validacao `IF auth.uid() != p_user_id THEN RAISE EXCEPTION 'Unauthorized'; END IF;` no inicio de cada funcao, ou converter para `SECURITY INVOKER` quando possivel.

---

### [HIGH] RLS-002: Cursos acessiveis por `anon` sem restricao de taxa

**Severidade:** HIGH
**Arquivo:** `supabase/migrations/implementados/007_create_courses_schema.sql` (linhas 131-166)

As politicas de `courses`, `course_modules` e `lessons` permitem SELECT para **qualquer role** (inclusive `anon`), sem especificar `TO authenticated`:

```sql
CREATE POLICY "courses_select_all" ON public.courses
  FOR SELECT
  USING (status = 'publicado');
```

**Risco:** Sem `TO authenticated`, a role `anon` tambem acessa os dados. Isso pode ser intencional (catalogo publico), mas combinado com a ausencia de rate limiting no nivel do banco, pode expor dados a scraping.

**Recomendacao:** Se intencional, documentar. Se nao, adicionar `TO authenticated`. Em ambos os casos, configurar rate limiting no API gateway.

---

### [MEDIUM] RLS-003: Politica de `courses` nao bloqueia INSERT/UPDATE/DELETE para `authenticated`

**Severidade:** MEDIUM

Nao existem politicas para INSERT, UPDATE ou DELETE na tabela `courses` para a role `authenticated`. Apenas `service_role` pode modificar cursos. Isso e correto e desejado (apenas admin via service_role cria cursos), mas se um dia a role `authenticated` tentar um INSERT, o Supabase retornara um erro generico sem explicacao clara.

**Recomendacao:** Documentar explicitamente que cursos sao gerenciados apenas via service_role.

---

### [LOW] RLS-004: `goal_milestones` usa subquery para verificar ownership

**Severidade:** LOW
**Arquivo:** `supabase/migrations/implementados/004_fix_database_naming.sql` (linhas 248-297)

A RLS de `goal_milestones` verifica ownership via subquery na tabela `goals`. Isso esta correto mas pode ter impacto de performance com muitos registros.

```sql
USING (
  EXISTS (
    SELECT 1 FROM public.goals g
    WHERE g.id = goal_milestones.meta_id
    AND g.user_id = auth.uid()
  )
);
```

**Recomendacao:** Considerar adicionar `user_id` diretamente na tabela `goal_milestones` para evitar a subquery (denormalizacao controlada para performance de RLS).

---

## Auditoria de Indexes

### Status Geral: BOM

A maioria das queries frequentes esta coberta por indexes compostos. Pontos de atencao:

### [MEDIUM] IDX-001: Index ausente para `focus_sessions(user_id, started_at)`

**Severidade:** MEDIUM
**Arquivo afetado:** `hooks/useDashboard.ts` (linhas 78-105)

O hook `useDashboard` faz queries filtrando por `user_id` e `started_at` (para estatisticas diarias/semanais), mas nao existe um index composto `(user_id, started_at)`. Existe `idx_focus_sessions_started_at` individual e `idx_focus_sessions_user_status`, mas nenhum combina `user_id + started_at`.

A funcao `get_focus_stats` tambem filtra por `user_id` e `status = 'completed'` com filtros de `started_at`.

**Recomendacao:** Criar index composto:
```sql
CREATE INDEX idx_focus_sessions_user_started ON focus_sessions(user_id, started_at DESC);
```

---

### [MEDIUM] IDX-002: Index ausente para `tasks(user_id, concluida_em)`

**Severidade:** MEDIUM
**Arquivo afetado:** `hooks/useDashboard.ts` (linhas 152-157)

O hook `fetchWeeklyStats` filtra tarefas por `user_id` e `concluida_em >= inicioSemana`. Nao existe index para essa combinacao.

**Recomendacao:** Criar index composto:
```sql
CREATE INDEX idx_tasks_user_concluida ON tasks(user_id, concluida_em DESC);
```

---

### [LOW] IDX-003: Index `idx_users_email` e redundante

**Severidade:** LOW
**Arquivo:** `supabase/migrations/implementados/000_consolidated_schema.sql` (linha 272)

A coluna `email` ja possui constraint `UNIQUE`, que o PostgreSQL implementa com um index unico automaticamente. O index `idx_users_email` e redundante.

**Recomendacao:** Remover `idx_users_email` para reduzir overhead de escrita.

---

### [LOW] IDX-004: Indexes de `dificuldade` e `prioridade` em TEXT sem CHECK

**Severidade:** LOW

Os campos `habits.dificuldade`, `objectives.prioridade`, `goals.prioridade` sao TEXT com indexes, mas sem constraints CHECK. Valores invalidos podem ser inseridos e os indexes terao cardinalidade baixa.

---

## Padroes N+1 nos Hooks

### [HIGH] N1-001: `reordenarTarefas` faz N updates individuais

**Severidade:** HIGH
**Arquivo:** `hooks/useTarefas.ts` (linhas 134-150)

```typescript
const promises = tarefas.map(({ id, ordem, coluna }) =>
  supabase.from('tasks').update({ ordem, coluna }).eq('id', id)
)
const results = await Promise.all(promises)
```

Se o usuario reordena 20 tarefas, sao 20 chamadas HTTP individuais ao Supabase. Isso causa latencia acumulada e pode atingir rate limits.

**Recomendacao:** Usar uma funcao RPC do PostgreSQL que recebe um array de `{id, ordem, coluna}` e faz o UPDATE em batch com um unico statement.

---

### [MEDIUM] N1-002: `useDashboard.fetchDailyStats` faz 5 queries em paralelo

**Severidade:** MEDIUM
**Arquivo:** `hooks/useDashboard.ts` (linhas 78-105)

O `fetchDailyStats` executa 5 queries simultaneas:
1. `tasks` filtrado por data/conclusao
2. `get_focus_stats` RPC
3. `habits` ativos
4. `habit_history` do dia
5. `users` para streak

Embora `Promise.all` seja usado (bom), cada query e uma chamada HTTP separada. Para o dashboard que e carregado toda vez que o usuario abre o app, isso gera overhead.

**Recomendacao:** Criar uma funcao RPC `get_dashboard_stats(p_user_id)` que retorna todos os dados em uma unica chamada.

---

### [MEDIUM] N1-003: `useCursos.fetchCoursesWithRelations` faz 3 queries + filtragem client-side

**Severidade:** MEDIUM
**Arquivo:** `hooks/useCursos.ts` (linhas 77-119)

```typescript
const [coursesResult, modulesResult, lessonsResult] = await Promise.all([
  supabase.from('courses').select('*'),
  supabase.from('course_modules').select('*'),
  supabase.from('lessons').select('*'),
])
```

Busca TODOS os modulos e TODAS as aulas de todos os cursos, e depois filtra no client-side com `.filter()`. Com muitos cursos, isso transfere dados desnecessarios.

**Recomendacao:** Usar query com JOIN ou `.select('*, course_modules(*, lessons(*)))')` para buscar dados aninhados em uma unica query. Ou filtrar pelo `course_id` no servidor.

---

### [MEDIUM] N1-004: `useCursoBySlug` faz 4 queries sequenciais

**Severidade:** MEDIUM
**Arquivo:** `hooks/useCursos.ts` (linhas 248-341)

O hook faz 4 queries sequenciais (nao paralelas):
1. Busca curso por slug
2. Busca modulos do curso
3. Busca aulas dos modulos
4. Busca progresso do usuario

**Recomendacao:** Usar `.select('*, course_modules(*, lessons(*)))')` para reduzir para 1-2 queries.

---

## Avaliacao de Normalizacao

### Status Geral: ADEQUADO (com observacoes)

### [MEDIUM] NORM-001: `goals.status` alterado de ENUM para TEXT

**Severidade:** MEDIUM
**Arquivo:** `supabase/migrations/implementados/005_fix_goals_schema.sql` (linhas 63-73)

O campo `status` da tabela `goals` foi alterado de `goal_status` (ENUM) para `TEXT` na migration 005. Isso remove a validacao no nivel do banco de dados. Valores invalidos como `status = 'banana'` podem ser inseridos.

**Recomendacao:** Adicionar CHECK constraint:
```sql
ALTER TABLE goals ADD CONSTRAINT chk_goals_status
CHECK (status IN ('nao_iniciada', 'em_andamento', 'pausada', 'atrasada', 'concluida'));
```

---

### [LOW] NORM-002: Campos `prioridade` e `dificuldade` como TEXT sem constraint

**Severidade:** LOW

Os campos `goals.prioridade`, `objectives.prioridade`, `habits.dificuldade` sao TEXT sem CHECK constraints. Nao ha validacao no nivel do banco.

**Recomendacao:** Adicionar CHECK constraints para cada campo.

---

### [LOW] NORM-003: Redundancia entre `tasks.status` e `tasks.coluna`

**Severidade:** LOW

Existe uma relacao implicita entre `status` e `coluna`. Quando `coluna = 'concluido'`, `status` deveria ser `'concluido'`. O hook `useMoverTarefa` (linha 113) trata isso no client-side, mas nao ha constraint no banco.

**Recomendacao:** Adicionar trigger ou CHECK constraint para garantir consistencia entre `status` e `coluna`.

---

## Constraints Ausentes

### [HIGH] CONST-001: `habit_history` UNIQUE constraint pode estar quebrada apos rename

**Severidade:** HIGH
**Arquivo:** `supabase/migrations/implementados/004_fix_database_naming.sql` (linhas 38-43)

A migration 004 renomeia `habit_checks` para `habit_history` e renomeia `habit_id` para `habito_id` e `check_date` para `data`. A UNIQUE constraint original era `UNIQUE(habit_id, check_date)`.

Quando colunas sao renomeadas no PostgreSQL, a constraint e mantida automaticamente com os novos nomes. Porem, o hook `useRegistrarHabito` (linha 231 em `hooks/useHabitos.ts`) usa `onConflict: 'habito_id,data'` que depende desse UNIQUE funcionar corretamente.

**Recomendacao:** Verificar se a constraint UNIQUE foi preservada apos os renames. Executar:
```sql
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'public.habit_history'::regclass;
```

---

### [HIGH] CONST-002: `goals.progresso_atual` sem CHECK de limites

**Severidade:** HIGH

Nao ha constraint impedindo `progresso_atual > progresso_total` ou `progresso_atual < 0`.

```sql
ALTER TABLE goals ADD CONSTRAINT chk_goals_progresso
CHECK (progresso_atual >= 0 AND progresso_atual <= progresso_total);
```

Mesmo problema em `objectives.progresso_atual/progresso_total`.

---

### [MEDIUM] CONST-003: `tasks.xp_recompensa` e `habits.xp_por_check` sem CHECK >= 0

**Severidade:** MEDIUM

Valores negativos de XP podem ser inseridos, o que corromperia a logica de gamificacao.

**Recomendacao:**
```sql
ALTER TABLE tasks ADD CONSTRAINT chk_tasks_xp CHECK (xp_recompensa >= 0);
ALTER TABLE habits ADD CONSTRAINT chk_habits_xp CHECK (xp_por_check >= 0);
ALTER TABLE goals ADD CONSTRAINT chk_goals_xp CHECK (xp_recompensa >= 0);
ALTER TABLE objectives ADD CONSTRAINT chk_objectives_xp CHECK (xp_recompensa >= 0);
ALTER TABLE lessons ADD CONSTRAINT chk_lessons_xp CHECK (xp_recompensa >= 0);
```

---

### [MEDIUM] CONST-004: `events.horario_fim` sem CHECK > `horario_inicio`

**Severidade:** MEDIUM

Nao ha validacao para garantir que o horario de fim seja posterior ao horario de inicio.

```sql
ALTER TABLE events ADD CONSTRAINT chk_events_horario
CHECK (horario_fim > horario_inicio);
```

---

### [MEDIUM] CONST-005: `users.total_xp` e `users.level` sem CHECK >= 0

**Severidade:** MEDIUM

```sql
ALTER TABLE users ADD CONSTRAINT chk_users_xp CHECK (total_xp >= 0);
ALTER TABLE users ADD CONSTRAINT chk_users_level CHECK (level >= 1);
```

---

## Auditoria de Seguranca

### [CRITICAL] SEC-001: Funcoes SECURITY DEFINER sem validacao de autenticacao

**Severidade:** CRITICAL
**Veja:** RLS-001

As funcoes `add_user_xp`, `add_task_time`, `complete_focus_session`, `cancel_active_sessions`, `complete_lesson` e `get_course_progress` recebem `p_user_id` como parametro mas **nunca validam se `p_user_id = auth.uid()`**. Qualquer usuario autenticado pode manipular dados de outro usuario via chamadas RPC.

**Impacto:** Um atacante pode:
- Dar XP infinito a qualquer usuario
- Completar aulas de outro usuario
- Cancelar sessoes de foco de outro usuario
- Adicionar tempo a tarefas de outro usuario

---

### [CRITICAL] SEC-002: Dados mock com UUID hardcoded no schema consolidado

**Severidade:** CRITICAL
**Arquivo:** `supabase/migrations/implementados/000_consolidated_schema.sql` (linhas 629-692)

O seed data inclui um usuario mock com UUID fixo `a1b2c3d4-e5f6-7890-abcd-ef1234567890` e dados hardcoded. Se essa migration rodar em producao, cria um usuario fantasma com dados reais (nome "Mateus Pereira").

**Recomendacao:** Mover o seed data para `supabase/seed.sql` (ja configurado em `config.toml`) e remover do schema consolidado. Usar flag de ambiente para controlar se o seed roda.

---

### [HIGH] SEC-003: Migration `002_create_admin_user.sql` cria usuario com senha em plain text no resultado

**Severidade:** HIGH
**Arquivo:** `supabase/migrations/implementados/002_create_admin_user.sql`

A migration gera uma senha aleatoria e a exibe como resultado da query. Se executada em um ambiente logado, a senha pode ficar em logs. Alem disso, a migration cria diretamente na tabela `auth.users`, o que e um padrao nao recomendado pelo Supabase.

**Recomendacao:** Usar `supabase auth admin create-user` via CLI ou API de admin. Nunca logar senhas.

---

### [HIGH] SEC-004: `handle_new_user()` usa SECURITY DEFINER sem restricao de caller

**Severidade:** HIGH
**Arquivo:** `supabase/migrations/implementados/001_auth_profiles_trigger.sql` (linhas 16-36)

A funcao `handle_new_user()` e SECURITY DEFINER e e chamada via trigger em `auth.users`. Isso esta correto para o caso de uso (trigger interno), mas a funcao tambem pode ser chamada diretamente via RPC por qualquer usuario, o que poderia criar/atualizar perfis arbitrarios.

**Recomendacao:** Revogar permissao de EXECUTE para roles que nao sejam o trigger:
```sql
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
```

---

### [MEDIUM] SEC-005: `useAgenda.updateEventApi` nao valida input com Zod

**Severidade:** MEDIUM
**Arquivo:** `hooks/useAgenda.ts` (linhas 68-100)

O hook `useAgenda` nao usa schemas Zod para validacao de input antes de enviar ao Supabase. Os hooks `useTarefas`, `useHabitos` e `useMetas` usam Zod corretamente, mas `useAgenda` monta o payload manualmente sem validacao.

**Recomendacao:** Criar schema Zod em `lib/schemas/agenda.ts` e validar antes de INSERT/UPDATE.

---

### [MEDIUM] SEC-006: `lib/supabase/auth.ts` usa `console.error` com objetos de erro

**Severidade:** MEDIUM
**Arquivo:** `lib/supabase/auth.ts` (linhas 38, 67, 92, 121, 146, 172)

Multiplos `console.error` podem expor stack traces ou detalhes internos no browser console do usuario.

**Recomendacao:** Remover `console.error` em producao ou usar um servico de logging que filtre informacoes sensiveis.

---

## Preocupacoes de Performance

### [HIGH] PERF-001: `get_habit_streak()` usa loop iterativo

**Severidade:** HIGH
**Arquivo:** `supabase/migrations/implementados/004_fix_database_naming.sql` (linhas 130-145)

```sql
LOOP
  SELECT EXISTS(SELECT 1 FROM habit_history WHERE habito_id = p_habit_id AND data = v_date) INTO v_has_check;
  IF NOT v_has_check THEN EXIT; END IF;
  v_streak := v_streak + 1;
  v_date := v_date - INTERVAL '1 day';
END LOOP;
```

Essa funcao faz N queries sequenciais (uma por dia de streak). Se um usuario tem streak de 365 dias, sao 365 queries dentro do PostgreSQL. Embora sejam queries internas (nao HTTP), isso e ineficiente.

**Recomendacao:** Reescrever usando window functions:
```sql
SELECT COUNT(*) FROM (
  SELECT data, data - ROW_NUMBER() OVER (ORDER BY data DESC) * INTERVAL '1 day' AS grp
  FROM habit_history
  WHERE habito_id = p_habit_id
  ORDER BY data DESC
) sub
WHERE grp = (SELECT data - ROW_NUMBER() OVER (ORDER BY data DESC) * INTERVAL '1 day'
             FROM habit_history WHERE habito_id = p_habit_id ORDER BY data DESC LIMIT 1);
```

---

### [MEDIUM] PERF-002: `useDashboard` chama `get_focus_stats` duas vezes

**Severidade:** MEDIUM
**Arquivo:** `hooks/useDashboard.ts` (linhas 86, 159, 380-390)

O hook `useDashboardData` executa `get_focus_stats` em pelo menos 3 queries separadas:
- `fetchDailyStats` -> `supabase.rpc('get_focus_stats', ...)`
- `fetchWeeklyStats` -> `supabase.rpc('get_focus_stats', ...)`
- `focusStatsQuery` -> `supabase.rpc('get_focus_stats', ...)`

Todas chamam a mesma funcao com o mesmo `p_user_id`, que faz scan completo na tabela `focus_sessions`.

**Recomendacao:** Chamar `get_focus_stats` uma unica vez e compartilhar o resultado entre as funcoes de fetch.

---

### [MEDIUM] PERF-003: `focus_sessions` pode crescer indefinidamente

**Severidade:** MEDIUM

Nao ha politica de archiving ou particionamento para `focus_sessions`. Um usuario ativo pode gerar 5+ sessoes por dia = 1825 registros/ano. A funcao `get_focus_stats` filtra por `status = 'completed'` sem limite de data, fazendo scan cada vez maior.

**Recomendacao:** Adicionar particionamento por `started_at` ou criar tabela de estatisticas agregadas (`focus_stats_daily`).

---

## Funcionalidades Ausentes

### [HIGH] FEAT-001: Ausencia de soft delete

**Severidade:** HIGH

Nenhuma tabela possui soft delete (`deleted_at`). Quando um usuario deleta uma tarefa, habito, meta, etc., o registro e removido permanentemente. Nao ha possibilidade de recuperacao, auditoria ou "lixeira".

**Recomendacao:** Adicionar `deleted_at TIMESTAMPTZ DEFAULT NULL` nas tabelas principais e filtrar com `WHERE deleted_at IS NULL` nas queries/RLS.

---

### [HIGH] FEAT-002: Ausencia de audit trail / historico de alteracoes

**Severidade:** HIGH

Nao existe log de quem alterou o que e quando. Se XP for adulterado (via SEC-001), nao ha como rastrear.

**Recomendacao:** Criar tabela `audit_log` com trigger generico que registra INSERT/UPDATE/DELETE em tabelas sensiveis (`users`, `focus_sessions`, `lesson_progress`).

---

### [MEDIUM] FEAT-003: `users.current_streak` e `longest_streak` nao sao atualizados automaticamente

**Severidade:** MEDIUM

Os campos `current_streak` e `longest_streak` na tabela `users` existem mas nao ha logica automatica para atualiza-los. A funcao `check_habit` atualiza `habits.streak_atual`, mas NAO atualiza `users.current_streak`.

**Recomendacao:** Criar logica (trigger ou funcao) que consolida o streak do usuario baseado nos streaks individuais dos habitos.

---

### [LOW] FEAT-004: Tabela `projects` referenciada mas nao criada

**Severidade:** LOW

A tabela `tasks` possui campo `projeto_id UUID` que referencia um projeto futuro, mas a tabela `projects` nunca foi criada. O campo nao tem FK constraint.

---

### [LOW] FEAT-005: Sem tabela de notificacoes

**Severidade:** LOW

O sistema de gamificacao (level up, XP, streaks) nao possui tabela de notificacoes para informar o usuario sobre conquistas.

---

## Divergencias TypeScript vs Schema

### [CRITICAL] DIV-001: `lib/supabase/types.ts` desatualizado em relacao ao schema real

**Severidade:** CRITICAL
**Arquivo:** `lib/supabase/types.ts`

O arquivo `lib/supabase/types.ts` (o "antigo" types gerado pelo Supabase) NAO reflete o schema atual do banco. Ele nao contem:

- Tabelas: `habit_history`, `habits`, `habit_categories`, `goals`, `objectives`, `objective_columns`, `goal_milestones`, `events`, `courses`, `course_modules`, `lessons`, `lesson_progress`
- Enums: `event_status`, `calendar_integration`, `course_level`, `course_status`, `goal_status`, `objective_category`
- Views: `habits_today`
- Funcoes: `check_habit`, `get_habit_streak`, `handle_new_user`, `complete_lesson`, `get_course_progress`

O projeto usa dois arquivos de tipos:
1. `lib/supabase/types.ts` - Antigo, parcial, inconsistente
2. `types/database.ts` - Novo, mais completo, usado pelos hooks

Esses dois arquivos se sobrepoem e podem causar confusao.

**Recomendacao:** Regenerar `lib/supabase/types.ts` com `supabase gen types typescript` e deprecar o arquivo manual `types/database.ts`, ou vice-versa. Manter apenas um ponto de verdade.

---

### [HIGH] DIV-002: `types/database.ts` nao reflete colunas do schema apos migrations

**Severidade:** HIGH
**Arquivo:** `types/database.ts`

Exemplos de divergencias:

1. **`Habito.xp_por_check`** - Existe no schema mas **ausente** no TypeScript `Habito` (tipos nao declaram)
2. **`Habito.horario_lembrete`** - Existe no schema mas **ausente** no TypeScript
3. **`Habito.dias_semana`** - Existe no schema mas o tipo TypeScript nao tem
4. **`Objetivo.xp_recompensa`** - Existe no schema mas **ausente** no TypeScript `Objetivo`
5. **`Objetivo.concluida_em`** - Existe no schema mas **ausente** no TypeScript
6. **`Objetivo.habitos_chave`** - Existe no schema mas **ausente** no TypeScript
7. **`Objetivo.categoria`** (objective_category enum) - Existe no schema mas **ausente** no TypeScript
8. **`Meta.unidade`** - Existe no schema mas **ausente** no TypeScript `Meta`
9. **`Meta.prazo`** - Existe no schema mas **ausente** no TypeScript
10. **`Meta.data_limite`** - Existe no schema mas **ausente** no TypeScript
11. **`Meta.xp_recompensa`** - Existe no schema mas **ausente** no TypeScript
12. **`Meta.concluida_em`** - Existe no schema mas **ausente** no TypeScript

Essas divergencias significam que dados retornados pelo Supabase podem conter campos que o TypeScript ignora, e campos esperados pelo TypeScript podem nao existir no banco.

---

### [HIGH] DIV-003: Dois arquivos de numeracao `007_` nas migrations

**Severidade:** HIGH
**Arquivos:**
- `supabase/migrations/implementados/007_create_events_table.sql`
- `supabase/migrations/implementados/007_create_courses_schema.sql`

Dois arquivos de migration compartilham o mesmo prefixo `007_`. O Supabase CLI pode executar em ordem lexicografica imprevisivel, causando falhas se houver dependencias entre as migrations.

**Recomendacao:** Renomear um dos arquivos (ex: `008_create_courses_schema.sql`).

---

## Itens de Debito Tecnico

### Resumo por Severidade

| ID       | Severidade | Categoria   | Descricao                                                   |
|----------|------------|-------------|-------------------------------------------------------------|
| RLS-001  | CRITICAL   | Seguranca   | Funcoes SECURITY DEFINER sem validacao de ownership          |
| SEC-001  | CRITICAL   | Seguranca   | Funcoes RPC permitem manipular dados de outros usuarios      |
| SEC-002  | CRITICAL   | Seguranca   | Seed data com UUIDs hardcoded no schema de producao          |
| DIV-001  | CRITICAL   | Consistencia | `lib/supabase/types.ts` completamente desatualizado         |
| RLS-002  | HIGH       | Seguranca   | Cursos acessiveis por anon sem rate limiting                 |
| SEC-003  | HIGH       | Seguranca   | Admin criado via SQL com senha visivel em resultados         |
| SEC-004  | HIGH       | Seguranca   | `handle_new_user()` chamavel via RPC                        |
| N1-001   | HIGH       | Performance | `reordenarTarefas` faz N updates individuais                |
| PERF-001 | HIGH       | Performance | `get_habit_streak` usa loop O(N)                            |
| FEAT-001 | HIGH       | Feature     | Ausencia de soft delete                                     |
| FEAT-002 | HIGH       | Feature     | Ausencia de audit trail                                     |
| CONST-001| HIGH       | Integridade | UNIQUE constraint pode estar quebrada apos rename           |
| CONST-002| HIGH       | Integridade | Progresso sem CHECK de limites                              |
| DIV-002  | HIGH       | Consistencia | types/database.ts diverge do schema real                   |
| DIV-003  | HIGH       | Consistencia | Dois arquivos 007_ nas migrations                          |
| NORM-001 | MEDIUM     | Normalizacao | goals.status como TEXT sem CHECK                           |
| IDX-001  | MEDIUM     | Performance | Index ausente focus_sessions(user_id, started_at)           |
| IDX-002  | MEDIUM     | Performance | Index ausente tasks(user_id, concluida_em)                  |
| N1-002   | MEDIUM     | Performance | Dashboard faz 5 queries em paralelo                         |
| N1-003   | MEDIUM     | Performance | Cursos busca todos os dados e filtra client-side            |
| N1-004   | MEDIUM     | Performance | Detalhe do curso faz 4 queries sequenciais                  |
| PERF-002 | MEDIUM     | Performance | get_focus_stats chamado 3 vezes no dashboard                |
| PERF-003 | MEDIUM     | Performance | focus_sessions sem archiving                                |
| CONST-003| MEDIUM     | Integridade | XP sem CHECK >= 0                                          |
| CONST-004| MEDIUM     | Integridade | events horarios sem CHECK                                   |
| CONST-005| MEDIUM     | Integridade | users total_xp e level sem CHECK                           |
| SEC-005  | MEDIUM     | Seguranca   | useAgenda sem validacao Zod                                  |
| SEC-006  | MEDIUM     | Seguranca   | console.error em auth.ts                                    |
| FEAT-003 | MEDIUM     | Feature     | users.current_streak nao atualizado automaticamente         |
| RLS-003  | MEDIUM     | Seguranca   | courses sem politica explicita para INSERT/UPDATE/DELETE auth|
| NORM-002 | LOW        | Normalizacao | Campos TEXT sem CHECK constraint                           |
| NORM-003 | LOW        | Normalizacao | Redundancia entre tasks.status e tasks.coluna              |
| IDX-003  | LOW        | Performance | idx_users_email redundante                                  |
| IDX-004  | LOW        | Performance | Indexes em campos TEXT de baixa cardinalidade               |
| RLS-004  | LOW        | Performance | goal_milestones RLS via subquery                           |
| FEAT-004 | LOW        | Feature     | Tabela projects referenciada mas nao criada                 |
| FEAT-005 | LOW        | Feature     | Sem tabela de notificacoes                                  |

---

## Plano de Acao Recomendado

### Fase 1: Correcoes Criticas (Sprint atual)
1. Adicionar validacao `auth.uid()` em todas as funcoes SECURITY DEFINER
2. Revogar EXECUTE de `handle_new_user()` para roles nao-sistema
3. Mover seed data para `supabase/seed.sql`
4. Regenerar ou consolidar tipos TypeScript

### Fase 2: Seguranca e Integridade (Proximo sprint)
5. Adicionar CHECK constraints em progresso, XP, horarios
6. Verificar UNIQUE constraint de `habit_history` apos rename
7. Renumerar migration `007_` duplicada
8. Criar schema Zod para `useAgenda`

### Fase 3: Performance (Planejamento)
9. Criar indexes compostos faltantes
10. Reescrever `get_habit_streak` com window functions
11. Criar RPC `get_dashboard_stats` consolidada
12. Criar RPC batch para reordenacao de tarefas

### Fase 4: Funcionalidades Estruturais (Backlog)
13. Implementar soft delete
14. Implementar audit trail
15. Automatizar `users.current_streak`
16. Otimizar queries de cursos com JOINs aninhados
