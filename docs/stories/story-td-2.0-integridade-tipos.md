# Story: Integridade + Tipos

**Story ID:** TD-2.0
**Epic:** EPIC-TD-001
**Status:** Draft
**Estimativa:** ~19h
**Prioridade:** CRITICAL
**Sprint Sugerido:** 2

---

## Objetivo

Estabilizar o schema de dados, regenerar tipos TypeScript corretos, adicionar CHECK constraints de integridade, criar schemas Zod para todos os modulos de formularios, e adicionar ErrorBoundary consistente em todas as rotas. Ao final, o sistema tera: um unico arquivo de tipos refletindo o banco real, dados protegidos contra valores invalidos na origem, validacao frontend completa com feedback inline, e tratamento de erros por pagina.

## Debitos Incluidos

| ID | Debito | Severidade | Horas |
|----|--------|-----------|-------|
| DB-C03 | **Tipos TypeScript completamente desatualizados** -- `lib/supabase/types.ts` nao contem 12+ tabelas, 6+ enums, views e funcoes. Dois arquivos de tipos (`types/database.ts` vs `lib/supabase/types.ts`) se sobrepoem. | CRITICAL | 3-4h |
| DB-H09 | **Progresso sem CHECK de limites** -- `goals.progresso_atual` e `objectives.progresso_atual` aceitam qualquer valor. | HIGH | 1-2h (agrupado) |
| DB-M10 | **Campos XP sem CHECK >= 0** -- 5 tabelas afetadas: tasks, habits, goals, objectives, lessons. | MEDIUM | (agrupado com DB-H09) |
| DB-M02 | **`goals.status` como TEXT sem CHECK** -- Convertido de ENUM para TEXT sem constraint. | MEDIUM | (agrupado com DB-H09) |
| DB-NEW-03 | **Ausencia de CHECK constraint em `events.horario_fim > horario_inicio`** | MEDIUM | (agrupado com DB-H09) |
| DB-NEW-04 | **Ausencia de CHECK em `users.total_xp >= 0` e `users.level >= 1`** | MEDIUM | (agrupado com DB-H09) |
| DB-M03 | **Index ausente `focus_sessions(user_id, status, started_at)`** | MEDIUM | 0.25h |
| FE-H03 | **Validacao Zod incompleta** -- Apenas `lib/schemas/tarefa.ts` possui schemas Zod. Habitos, metas, eventos e cursos sem validacao frontend. | HIGH | 6-8h |
| FE-H02 | **ErrorBoundary inconsistente** -- Apenas `tarefas/page.tsx` e `inicio/page.tsx` usam ErrorBoundary. Zero arquivos `error.tsx` em `app/`. | HIGH | 3-4h |
| DB-H08 | **UNIQUE constraint pode estar quebrada apos rename** -- PostgreSQL preserva constraints via `attnum`, mas nome original confuso. | MEDIUM | 0.5h |
| TS-NEW-01 | **Respostas de API de calendario sem validacao runtime** -- `google.ts`, `outlook.ts`, `sync.ts` fazem type assertions em JSON de APIs externas sem validacao Zod. | HIGH | 2h |
| TS-NEW-02 | **JSON.parse sem validacao em auth-state.ts** -- `JSON.parse(decoded) as StatePayload` sem schema Zod. Vetor de injecao se token adulterado. | MEDIUM | 0.5h |
| TS-NEW-03 | **JSON.parse generico em armazenamento.ts** -- `lib/armazenamento.ts` retorna tipo generico de `JSON.parse` sem validacao. | MEDIUM | 0.5h |

## Tasks

### Bloco 1: Regeneracao de Tipos (DB-C03)
- [ ] Task 1: Executar `supabase gen types typescript` para gerar tipos atualizados do banco real
- [ ] Task 2: Substituir conteudo de `lib/supabase/types.ts` com os tipos gerados
- [ ] Task 3: Remover `types/database.ts` (arquivo duplicado)
- [ ] Task 4: Atualizar todos os imports que referenciam `types/database.ts` para usar `lib/supabase/types.ts`
- [ ] Task 5: Executar `npm run typecheck` e corrigir erros de tipo emergentes
- [ ] Task 6: Verificar que ZERO `as any` foram adicionados como workaround

### Bloco 2: CHECK Constraints (DB-H09, DB-M10, DB-M02, DB-NEW-03, DB-NEW-04)
- [ ] Task 7: Executar queries de verificacao para identificar dados invalidos existentes no banco
- [ ] Task 8: Criar bloco de correcao de dados previo na migration (UPDATE para ajustar valores fora dos limites)
- [ ] Task 9: Criar migration `011_add_check_constraints.sql` com:
  - `goals.progresso_atual >= 0`
  - `goals.progresso_total >= 1`
  - `objectives.progresso_atual >= 0`
  - `goals.status IN ('nao_iniciada', 'em_andamento', 'pausada', 'atrasada', 'concluida')`
  - `events.horario_fim > events.horario_inicio`
  - `users.total_xp >= 0`
  - `users.level >= 1`
  - `tasks.xp_recompensa >= 0`
  - `habits.xp_recompensa >= 0`
  - `lessons.xp_recompensa >= 0` (se coluna existir)
- [ ] Task 10: Testar migration em ambiente local com `supabase db reset`

### Bloco 3: Index Composto (DB-M03)
- [ ] Task 11: Criar migration `012_add_composite_indexes.sql` com `CREATE INDEX IF NOT EXISTS idx_focus_sessions_user_status_started ON focus_sessions(user_id, status, started_at)`
- [ ] Task 12: Validar com `EXPLAIN ANALYZE` que queries de focus_sessions usam o index

### Bloco 4: Schemas Zod (FE-H03)
- [ ] Task 13: Criar `lib/schemas/habito.ts` com schemas para criar, atualizar e check de habito (derivados dos tipos TS)
- [ ] Task 14: Criar `lib/schemas/meta.ts` com schemas para criar e atualizar meta e objetivo
- [ ] Task 15: Criar `lib/schemas/evento.ts` com schemas para criar e atualizar evento
- [ ] Task 16: Criar `lib/schemas/curso.ts` com schemas para completar aula e atualizar progresso
- [ ] Task 17: Criar `lib/schemas/perfil.ts` com schema para atualizar perfil de usuario
- [ ] Task 18: Integrar schemas Zod nos hooks correspondentes (validar antes de chamar mutation)

### Bloco 5: ErrorBoundary (FE-H02)
- [ ] Task 19: Criar `app/(protegido)/error.tsx` com mensagem amigavel e botao retry (se route group ja existir, senao criar `error.tsx` por rota)
- [ ] Task 20: Criar `error.tsx` para rotas que nao possuem: `foco/`, `habitos/`, `agenda/`, `cursos/`, `perfil/`
- [ ] Task 21: Verificar que ErrorBoundary existente em `tarefas/page.tsx` e `inicio/page.tsx` esta consistente com o padrao
- [ ] Task 22: Testar simulando erros em cada rota (error boundary deve capturar e mostrar fallback)

### Bloco 6: Validacao Runtime de JSON Externo (TS-NEW-01, TS-NEW-02, TS-NEW-03)
- [ ] Task 25: Criar schemas Zod para respostas das APIs Google Calendar e Outlook (`lib/calendario/schemas.ts`)
- [ ] Task 26: Substituir type assertions em `google.ts`, `outlook.ts` e `sync.ts` por validacao Zod (safeParse)
- [ ] Task 27: Adicionar validacao Zod em `auth-state.ts` para `StatePayload` (JSON.parse do token OAuth)
- [ ] Task 28: Adicionar validacao Zod em `lib/armazenamento.ts` para dados de localStorage

### Bloco 7: Verificacao de Constraint (DB-H08)
- [ ] Task 29: Executar query para verificar integridade da UNIQUE constraint em `habit_checks`: `SELECT conname, contype FROM pg_constraint WHERE conrelid = 'habit_checks'::regclass`
- [ ] Task 30: Se constraint tem nome confuso (`habit_checks_habit_id_check_date_key`), renomear para nome descritivo via `ALTER TABLE ... RENAME CONSTRAINT`

## Criterios de Aceite

- [ ] Um unico arquivo `lib/supabase/types.ts` gerado por `supabase gen types typescript`
- [ ] `types/database.ts` removido
- [ ] Todos os imports atualizados para `lib/supabase/types.ts`
- [ ] `npm run typecheck` passa sem erros
- [ ] Nenhum `as any` adicionado como workaround
- [ ] CHECK constraints ativas para progresso, XP, level, horarios e status
- [ ] Dados invalidos pre-existentes corrigidos antes da constraint
- [ ] Index composto `idx_focus_sessions_user_status_started` criado
- [ ] `EXPLAIN` mostra index scan para queries de focus_sessions
- [ ] Schemas Zod criados para habitos, metas, eventos, cursos e perfil
- [ ] Schemas derivados dos tipos TS do banco (nao manuais)
- [ ] Hooks validam input via Zod antes de submeter mutation
- [ ] `error.tsx` presente em todas as rotas principais
- [ ] Erro em qualquer pagina mostra fallback amigavel (nao tela branca)
- [ ] UNIQUE constraint em `habit_checks` verificada e funcional
- [ ] `npm run lint` passa sem novos erros
- [ ] `npm run typecheck` passa sem novos erros

## Testes Requeridos

- **Unitario:** Cada schema Zod com inputs validos e invalidos (pelo menos 3 cenarios por schema)
- **Integracao:** Migration de CHECK constraints em banco local
- **Integracao:** `EXPLAIN ANALYZE` para queries de focus_sessions com e sem index
- **Manual:** Verificar `error.tsx` em cada rota simulando erro
- **Manual:** Verificar typecheck completo apos regeneracao de tipos
- **SQL:** Query de verificacao de constraint UNIQUE em `habit_checks`
- **SQL:** Tentativa de INSERT com dados invalidos (XP negativo, progresso > total, etc.) -- deve falhar

## Dependencias

- **Depende de:**
  - TD-1.0 (Seguranca + Fundacao) -- schema deve estar estavel antes de regenerar tipos
  - DB-C03 (tipos) depende de schema estavel da Onda 1
  - FE-H03 (Zod) depende de DB-C03 (tipos corretos)
- **Bloqueia:**
  - TD-3.0 (Reestruturacao Frontend) -- depende de tipos e validacao estaveis
  - TD-5.0 (Performance) -- DB-M03 (index) e pre-requisito para otimizacao de queries

## Riscos

| Risco | Severidade | Mitigacao |
|-------|------------|-----------|
| **RC02:** Regeneracao de tipos TS invalida imports -- merge conflicts se feito em sprints separados | HIGH | Regenerar tipos e atualizar imports no MESMO sprint. `npm run typecheck` como gate obrigatorio. |
| **RC07:** CHECK constraints falham com dados invalidos existentes | MEDIUM | Queries de verificacao ANTES da migration. Bloco de correcao de dados previo na migration (`UPDATE ... SET progresso_atual = LEAST(progresso_atual, progresso_total)`). |
| Schemas Zod divergem dos tipos TS futuramente | MEDIUM | Derivar schemas dos tipos usando `z.infer<>` pattern. Considerar codegen futuro com `zod-prisma` ou similar. |

## Dev Notes

- **DB-C03:** Executar `supabase gen types typescript --local` para gerar tipos a partir do banco local. Garantir que todas as migrations (incluindo 009, 010 da Onda 1) ja foram aplicadas.
- **DB-H09 agrupado:** Todos os CHECK constraints estao na mesma migration para simplicidade. A migration DEVE ter bloco de correcao de dados ANTES dos ALTER TABLE com CHECK.
- **FE-H03:** O schema `lib/schemas/tarefa.ts` ja existe -- usar como referencia para o padrao de criacao dos demais schemas. Schemas devem ser em portugues seguindo a convencao do codebase.
- **FE-H02:** Se o route group `(protegido)` ainda nao existir (sera criado na Onda 3), criar `error.tsx` individualmente por rota. O `error.tsx` da raiz (Onda 0) serve como fallback global.
- **DB-H08:** A constraint provavelmente esta intacta (PostgreSQL preserva via `attnum`), mas o nome `habit_checks_habit_id_check_date_key` e confuso. O rename da constraint e cosmetic mas melhora manutenibilidade.
- **Regeneracao dupla de tipos:** Os tipos podem precisar ser regenerados novamente apos a Onda 2 (CHECK constraints alteram metadata). Planejar uma segunda passada de `supabase gen types`.

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
