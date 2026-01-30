# Story: Performance + Otimizacoes

**Story ID:** TD-5.0
**Epic:** EPIC-TD-001
**Status:** Draft
**Estimativa:** ~20.5h
**Prioridade:** HIGH
**Sprint Sugerido:** 6

---

## Objetivo

Otimizar performance da aplicacao apos a base de componentes estar refatorada. Implementar code splitting para reduzir bundle por rota, migrar partes estaticas para Server Components, criar batch RPC para reordenacao de tarefas, e eliminar chamadas redundantes de `get_focus_stats`. Ao final, paginas carregam mais rapido, menos JavaScript e enviado ao cliente, e operacoes de banco sao mais eficientes.

## Debitos Incluidos

| ID | Debito | Severidade | Horas |
|----|--------|-----------|-------|
| FE-C03 | **Zero code splitting intra-rota** -- Nenhum `React.lazy()`, `next/dynamic` ou imports dinamicos. Next.js faz split por rota automaticamente (mitigacao parcial). Impacto real em componentes pesados: modais, drag-and-drop, calendarios. | HIGH | 6-10h |
| FE-C04 | **Excesso de "use client"** -- 17 arquivos client vs 1 "use server". Natureza interativa do app justifica parcialmente. Oportunidade real: extrair shells estaticos como Server Components. | HIGH | 4-6h |
| DB-H04 | **`reordenarTarefas` faz N updates individuais** -- N chamadas HTTP para reordenar N tarefas. Pattern no hook, nao no banco. Requer criar funcao RPC `batch_reorder_tasks`. | HIGH | 4-6h |
| DB-M08 | **`get_focus_stats` chamado 3 vezes no dashboard** -- Mesma RPC executada em fetchDailyStats, fetchWeeklyStats e focusStatsQuery. Full scan em `focus_sessions` sem index composto. | HIGH | 1-2h |
| PERF-NEW-01 | **Ausencia de virtualizacao em listas longas** -- Kanban board, lista de habitos e lista de eventos renderizam todos os itens sem virtualizacao. Performance degrada com N > 50 itens. | MEDIUM | 2h |
| STYLE-NEW-01 | **Inline style={{}} em 3 componentes** -- `timer-display.tsx`, `tarefa-card.tsx`, `progresso.tsx` usam `style={}` em vez de Tailwind. Inconsistencia com design system. | LOW | 0.5h |

## Tasks

### Bloco 1: Code Splitting (FE-C03)
- [ ] Task 1: Identificar componentes pesados carregados em cada rota: modais, drag-and-drop (`@hello-pangea/dnd`), calendario, graficos
- [ ] Task 2: Implementar `next/dynamic()` para modais em todas as paginas (carregados sob demanda ao abrir)
- [ ] Task 3: Implementar `next/dynamic()` para `@hello-pangea/dnd` em `tarefas/` (carregado apenas quando board renderiza)
- [ ] Task 4: Implementar `next/dynamic()` para componente de calendario em `agenda/` (carregado sob demanda)
- [ ] Task 5: Medir bundle size por rota ANTES e DEPOIS com `@next/bundle-analyzer`
- [ ] Task 6: Verificar que funcionalidade nao e afetada -- modais abrem corretamente, DnD funciona, calendario renderiza

### Bloco 2: Server Components (FE-C04)
- [ ] Task 7: Identificar partes estaticas em cada pagina protegida: cabecalhos, descricoes, metadata, sidebars de informacao
- [ ] Task 8: Extrair shells estaticos como Server Components (sem `"use client"`)
- [ ] Task 9: Manter `"use client"` apenas em componentes interativos (formularios, botoes, timers)
- [ ] Task 10: Verificar que Server Components renderizam corretamente no servidor (SSR) e nao causam hydration mismatch
- [ ] Task 11: Medir quantidade de JavaScript enviado ao cliente ANTES e DEPOIS

### Bloco 3: Batch Reorder (DB-H04)
- [ ] Task 12: Criar funcao RPC `batch_reorder_tasks(p_user_id UUID, p_tasks JSONB)` que aceita array de `{id, ordem, coluna}` e executa em uma unica transacao
- [ ] Task 13: Adicionar validacao `auth.uid() = p_user_id` na funcao RPC
- [ ] Task 14: Criar migration `013_batch_reorder_tasks.sql`
- [ ] Task 15: Atualizar `hooks/useTarefas.ts` para usar a funcao RPC em vez de N updates individuais
- [ ] Task 16: Regenerar tipos TS (`supabase gen types typescript`) para incluir nova funcao
- [ ] Task 17: Testar reordenacao de 10+ tarefas -- verificar que todas atualizam atomicamente

### Bloco 4: Focus Stats (DB-M08)
- [ ] Task 18: Identificar os 3 pontos de chamada de `get_focus_stats` em `hooks/useDashboard.ts` (linhas ~86, ~159, ~380-390)
- [ ] Task 19: Unificar para uma unica chamada de `get_focus_stats` com query key compartilhada via React Query
- [ ] Task 20: Distribuir resultado para `fetchDailyStats`, `fetchWeeklyStats` e `focusStatsQuery` via dados ja em cache
- [ ] Task 21: Verificar que dashboard renderiza corretamente com uma unica chamada

### Bloco 5: Virtualizacao de Listas (PERF-NEW-01)
- [ ] Task 22: Instalar `@tanstack/react-virtual` para virtualizacao de listas
- [ ] Task 23: Implementar virtualizacao no Kanban board (`componentes/tarefas/kanban-coluna.tsx`)
- [ ] Task 24: Implementar virtualizacao na lista de habitos (`componentes/habitos/lista-habitos.tsx`)
- [ ] Task 25: Implementar virtualizacao na lista de eventos (`componentes/agenda/lista-eventos-dia.tsx`)

### Bloco 6: Inline Styles (STYLE-NEW-01)
- [ ] Task 26: Substituir `style={}` por classes Tailwind em `timer-display.tsx`, `tarefa-card.tsx`, `progresso.tsx`

## Criterios de Aceite

- [ ] Modais, DnD e calendarios carregados sob demanda via `next/dynamic()`
- [ ] Bundle por rota reduzido (mensuravel com `@next/bundle-analyzer`)
- [ ] Funcionalidade intacta: modais abrem, DnD funciona, calendario renderiza
- [ ] Shells estaticos migrados para Server Components
- [ ] `"use client"` apenas em componentes interativos
- [ ] Zero hydration mismatch
- [ ] Funcao RPC `batch_reorder_tasks` criada com validacao de auth
- [ ] Hook `useTarefas` usa batch RPC em vez de N updates individuais
- [ ] Reordenacao de tarefas funciona atomicamente (todas ou nenhuma)
- [ ] `get_focus_stats` chamada no maximo 1 vez por render do dashboard
- [ ] Resultado compartilhado via React Query cache
- [ ] Dashboard renderiza corretamente com chamada unica
- [ ] `npm run lint` passa sem novos erros
- [ ] `npm run typecheck` passa sem novos erros

## Testes Requeridos

- **Unitario:** `batch_reorder_tasks` com array de tarefas valido (deve atualizar todas)
- **Unitario:** `batch_reorder_tasks` com `p_user_id != auth.uid()` (deve rejeitar)
- **Integracao:** Reordenacao de 10+ tarefas via hook -- verificar atomicidade
- **Integracao:** Dashboard carrega com 1 chamada de `get_focus_stats` (verificar via Network tab)
- **Manual:** Bundle analysis com `@next/bundle-analyzer` antes e depois
- **Manual:** Lighthouse Performance score antes e depois
- **Manual:** Verificar que `next/dynamic` nao causa flash de conteudo (loading state adequado)
- **Manual:** Verificar hydration em Server Components (console nao mostra hydration warnings)

## Dependencias

- **Depende de:**
  - TD-4.0 (God Components) -- FE-C01 (componentes extraidos) necessario para code splitting e RSC
  - TD-1.0 -- SY-H01 (query keys com userId) necessario para DB-M08 (compartilhar cache corretamente)
  - TD-2.0 -- DB-C03 (tipos TS) necessario para DB-H04 (tipos da nova funcao RPC)
- **Bloqueia:**
  - TD-6.0 -- FE-N04 (Suspense) depende de FE-C04 (RSC)

## Riscos

| Risco | Severidade | Mitigacao |
|-------|------------|-----------|
| `next/dynamic()` pode causar flash de conteudo ao carregar componente | LOW | Usar `loading` prop do `dynamic()` com skeleton/spinner adequado. |
| Server Components podem ter hydration mismatch | MEDIUM | Testar em modo producao (`npm run build && npm start`). Verificar console para warnings. Nao usar `Date.now()` ou `Math.random()` em RSC. |
| `batch_reorder_tasks` pode ter race condition se 2 usuarios reordenam simultaneamente | LOW | Cada usuario so reordena suas proprias tarefas (RLS + auth.uid()). Race condition improvavel em app pessoal. |
| Unificar `get_focus_stats` pode quebrar invalidacao de cache | LOW | Manter query key especifica (`['focus-stats', userId]`). Invalidar apos completar/cancelar sessao. |

## Dev Notes

- **FE-C03:** O `next/dynamic()` com `ssr: false` e necessario para componentes que usam APIs de browser (drag-and-drop, por exemplo). Para modais, `ssr: false` tambem e adequado ja que so renderizam apos interacao.
- **FE-C04:** A migracao para RSC deve ser incremental. Comecar pelos cabecalhos de pagina e descricoes estaticas. NAO tentar migrar paginas inteiras -- a natureza interativa do app justifica `"use client"` na maioria dos componentes.
- **DB-H04:** A funcao RPC deve usar `FOR` loop com `UPDATE` em uma unica transacao. O parametro `p_tasks` deve ser JSONB array: `[{"id": "uuid", "ordem": 1, "coluna": "em_andamento"}, ...]`.
- **DB-M08:** O index composto `idx_focus_sessions_user_status_started` (criado na Onda 2) ja otimiza a query. A otimizacao aqui e no lado do cliente (React Query), nao no banco.
- **Bundle analysis:** Instalar `@next/bundle-analyzer` como devDependency. Configurar em `next.config.ts` com `process.env.ANALYZE === 'true'`. Rodar `ANALYZE=true npm run build` para gerar relatorio.

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
