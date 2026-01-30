# QA Review - Technical Debt Assessment

**Revisor:** @qa
**Data:** 2026-01-29
**Documentos revisados:**
- docs/prd/technical-debt-DRAFT.md
- docs/reviews/db-specialist-review.md
- docs/reviews/ux-specialist-review.md

---

## Gate Status: APPROVED WITH CONDITIONS

O assessment e suficientemente completo para prosseguir a consolidacao final, **condicionado** a incorporacao dos ajustes e gaps identificados nesta revisao. Os tres documentos cobrem as areas criticas com profundidade adequada, mas existem lacunas transversais que devem ser endereçadas antes da execucao.

---

## 1. Gaps Identificados

### 1.1 Gaps Criticos (devem ser resolvidos antes da consolidacao)

| # | Gap | Documentos que Falharam | Impacto |
|---|-----|------------------------|---------|
| G01 | **Ausencia de estrategia de testes** -- CC-C01 (zero testes) e listado como #2 na priorizacao do DRAFT (score 15), mas NENHUM dos tres documentos define quais testes devem existir para cada debito resolvido. O DB review propoe migrations sem testes de regressao. O UX review propoe refatoracoes sem testes de componente. | Todos os tres | Sem testes, a resolucao de cada debito pode introduzir novos bugs. A Onda 1 do DRAFT coloca testes como fundacional, mas nenhum especialista detalhou o escopo de testes necessario. |
| G02 | **Sem plano de rollback para migrations de seguranca** -- O DB review propoe 6 migrations (009-013) mas nao define procedimentos de rollback caso uma migration falhe em producao ou cause regressao. | db-specialist-review | Se `009_fix_security_definer_auth.sql` quebrar uma funcao chamada pelo frontend em producao, nao ha rollback documentado. |
| G03 | **Conflito de ondas entre DB e UX** -- O DB review propoe 5 ondas de migration. O UX review propoe 5 ondas de refatoracao. O DRAFT propoe 6 ondas de resolucao. Nenhum documento integra as tres linhas de trabalho em um cronograma unificado. | Todos os tres | Sem integracao, a equipe nao sabe se deve priorizar `009_fix_security_definer_auth.sql` (DB Onda 1) ou "Quick Wins UX" (UX Onda 0) ou CC-C01 (DRAFT Onda 1). |
| G04 | **SY-C01 (formula de nivel) sem definicao de qual formula e a correta** -- O DRAFT identifica que frontend usa exponencial e backend usa raiz quadrada, mas nenhum documento define qual formula deve ser a fonte de verdade. O DB review nao aborda este debito (e de sistema, nao de database). O UX review tambem nao o menciona. | DRAFT + ambas reviews | Este e o 3o item na priorizacao (score 17) e ninguem definiu a resolucao tecnica. A decisao impacta tanto o banco (funcao `calculate_level`) quanto o frontend (`dashboard.ts`). |
| G05 | **Ausencia de analise de seguranca do middleware** -- O DRAFT menciona middleware.ts para protecao de rotas, mas nenhum documento audita se o middleware esta correto, se ha bypass, se as rotas protegidas estao completas. | Todos os tres | Se o middleware tiver falhas, rotas protegidas podem ser acessiveis sem autenticacao, independentemente do RLS no banco. |

### 1.2 Gaps Moderados (podem ser resolvidos durante a execucao)

| # | Gap | Documentos que Falharam | Impacto |
|---|-----|------------------------|---------|
| G06 | **Sem analise de impacto de bundle size** -- O UX review rebaixa FE-C03 (code splitting) para HIGH porque o Next.js faz split por rota. Porem, nenhum documento mede o bundle size atual nem define um threshold aceitavel. | DRAFT + UX review | Sem baseline, nao ha como medir se as refatoracoes melhoraram ou pioraram o bundle. |
| G07 | **CC-C02 (dados mockados) sem inventario completo** -- O DRAFT menciona `app/inicio/dados-dashboard.ts` mas nao lista TODOS os arquivos com dados mockados. O UX review nao investiga se ha mock data em outras paginas. | DRAFT + UX review | Mock data em producao pode confundir usuarios e mascarar bugs. |
| G08 | **DB-H02 (admin com senha visivel) sem plano de rotacao** -- O DB review confirma o debito (HIGH) mas nao define se a senha ja foi exposta em logs e se precisa ser rotacionada imediatamente. | db-specialist-review | Se a migration ja rodou em producao, a senha pode estar em logs do Supabase. Rotacao imediata pode ser necessaria. |
| G09 | **Ausencia de analise de acessibilidade alem de contraste** -- O UX review analisa contraste WCAG (pergunta 6), prefers-reduced-motion (FE-M03) e skip navigation (FE-N02), mas nao audita: roles ARIA em componentes customizados, navegacao por teclado no Kanban/DnD, anuncios de leitor de tela para toasts, focus management em modais. | UX review | A acessibilidade e coberta superficialmente. Um audit WCAG 2.1 AA completo nao foi realizado. |
| G10 | **SY-M04 (streak shields sem implementacao) nao foi revisado por nenhum especialista** -- O DRAFT lista como MEDIUM mas nenhuma review aborda. E uma feature prometida na gamificacao que nao funciona. | Ambas reviews | Feature incompleta visivel ao usuario. |

### 1.3 Gaps Menores (backlog)

| # | Gap | Observacao |
|---|-----|-----------|
| G11 | **SY-H02 (tabelas ausentes) nao foi investigado em profundidade** -- O DRAFT lista tabelas possivelmente ausentes (`objectives`, `objective_columns`, `goal_milestones`, `habit_history`). O DB review confirma que `objective_columns` e `goal_milestones` sao criadas na migration 004, mas nao verifica se TODAS as tabelas referenciadas nos hooks existem. | Necessita investigacao em runtime. |
| G12 | **Sem analise de performance de Lighthouse/Web Vitals** -- Nenhum documento mede LCP, FID, CLS ou TTFB atuais. | Sem baseline, impossivel medir melhoria pos-refatoracao. |
| G13 | **FE-L02 (SVG inline) e menor, mas DRAFT nao menciona se ha outros SVGs inline** alem do Google icon. | Inventario incompleto. |

---

## 2. Riscos Cruzados

| # | Risco | Areas Afetadas | Severidade | Mitigacao |
|---|-------|---------------|------------|-----------|
| RC01 | **Fix DB-C01 quebra chamadas RPC no frontend** -- A adicao de `auth.uid()` validation em funcoes SECURITY DEFINER (DB review, migration 009) pode causar `RAISE EXCEPTION 'Unauthorized'` se o frontend enviar `p_user_id` diferente de `auth.uid()`. Hooks como `useDashboard.ts` e `useHabitos.ts` passam `user.id` explicitamente -- se houver inconsistencia de sessao (SY-C02, tripla instancia Supabase), o user.id pode divergir do auth.uid(). | Database + Frontend + Sistema | **CRITICAL** | 1. Resolver SY-C02 (unificar Supabase client) ANTES ou JUNTO com DB-C01. 2. Adicionar testes de integracao que validem chamadas RPC com usuario autenticado. 3. Manter log temporario de exceptions para monitorar falhas pos-deploy. |
| RC02 | **Regeneracao de tipos TS (DB-C03) invalida imports em todos os hooks** -- O DB review estima 3-4h para regenerar tipos. O UX review planeja refatoracao de hooks na Onda 3. Se tipos forem regenerados e hooks refatorados em sprints diferentes, ha risco de merge conflicts e incompatibilidade temporaria. | Database + Frontend | **HIGH** | 1. Regenerar tipos e atualizar imports no MESMO sprint. 2. Rodar `npm run typecheck` apos regeneracao como gate. 3. Coordenar com a extracao de God Components para evitar retrabalho. |
| RC03 | **SY-C01 (formula de nivel) afeta DB + Frontend + UX de gamificacao** -- A correcao da formula requer mudanca na funcao `calculate_level()` no banco E em `lib/utils/dashboard.ts` no frontend. Se apenas um lado for corrigido, o usuario vera nivel diferente no dashboard (frontend) vs nivel real (banco). Alem disso, se XP ja acumulado estiver incorreto por causa de DB-C01 (security definer sem auth), a correcao da formula pode "rebaixar" usuarios que tinham XP inflacionado. | Database + Frontend + UX | **HIGH** | 1. Decidir formula canonica ANTES de implementar. 2. Calcular impacto em usuarios existentes. 3. Corrigir frontend e backend na MESMA migration/deploy. 4. Considerar migration de dados para recalcular niveis. |
| RC04 | **Refatoracao de God Components (FE-C01) sem testes (CC-C01) e alto risco** -- O UX review propoe dividir 4 paginas (2314+1281+1062+863 = 5520 linhas) em ~20 sub-componentes. Sem testes unitarios ou de integracao, qualquer regressao visual ou funcional sera invisivel. O DRAFT coloca testes na Onda 1 e God Components na Onda 4, mas o UX review coloca God Components na Onda 3 -- ambos APOS testes, o que e correto. | Frontend + Cross-Cutting | **HIGH** | 1. CC-C01 (setup de testes) DEVE ser resolvido antes de FE-C01. 2. Escrever testes de snapshot/integration ANTES de refatorar cada God Component. 3. Definir cobertura minima por componente (80%). |
| RC05 | **FE-N05 (sidebar duplicada) + FE-C02 (mobile nav) = refatoracao de layout dupla** -- O UX review propoe mover Sidebar para layout compartilhado (Onda 2) E implementar bottom tab bar (Onda 1). Se mobile nav for implementada primeiro (Onda 1) com sidebar importada individualmente por pagina, a migração para layout compartilhado (Onda 2) requer refatorar a mobile nav tambem. | Frontend | **MEDIUM** | 1. Inverter ordem: layout compartilhado (FE-N05) ANTES de mobile nav (FE-C02). Ou implementar ambos na mesma onda. 2. O UX review ja reconhece essa dependencia parcialmente mas nao ajusta a ordem. |
| RC06 | **DB-C02 (seed data) + DB-NEW-01 (schema consolidado desatualizado) = risco de inconsistencia ao rodar `supabase db reset`** -- Se seed data for movido para `seed.sql` mas o schema consolidado (000) nao for atualizado, um `db reset` pode falhar ou criar estado inconsistente (funcoes antigas referenciando tabelas/colunas renomeadas). | Database | **MEDIUM** | 1. DB-NEW-01 (consolidar schema) deve ser executado APOS todas as migrations de correcao. 2. Ate la, nao rodar `supabase db reset` sem verificacao manual. 3. Documentar no README que `db reset` requer todas as migrations sequenciais. |
| RC07 | **CHECK constraints (DB-H09, DB-M10, DB-NEW-03, DB-NEW-04) podem falhar se dados invalidos ja existem** -- A migration `011_add_check_constraints.sql` adicionara CHECK constraints que podem ser violadas por dados existentes no banco. Se `goals.progresso_atual` ja for negativo, ou `events.horario_fim < horario_inicio`, a migration falha. | Database | **MEDIUM** | 1. Antes de rodar a migration, executar queries de verificacao: `SELECT count(*) FROM goals WHERE progresso_atual < 0`. 2. Corrigir dados invalidos ANTES de adicionar constraints. 3. A migration deve incluir bloco de correcao de dados previo. |
| RC08 | **Toast padronizado (FE-H04) + react-hook-form (FE-H01) = mudanca dupla no pattern de mutations** -- Se toast for padronizado (UX Onda 0) e depois react-hook-form for introduzido (UX Onda 2), os hooks de mutation precisarao ser refatorados duas vezes. | Frontend | **LOW** | 1. Padronizar toast como util independente (`lib/utilidades-toast.ts`), desacoplado do formulario. 2. Quando rhf for adotado, os callbacks `onSuccess`/`onError` do toast continuam funcionando. |

---

## 3. Dependencias Validadas

### 3.1 Analise da Ordem Proposta no DRAFT (Secao 6)

O DRAFT propoe 6 ondas. Vou validar cada uma e comparar com as propostas dos especialistas.

#### Onda 1 (Fundacional): CC-C01 + DB-C01 + SY-C01

| Validacao | Status | Observacao |
|-----------|--------|-----------|
| CC-C01 (Testes) como fundacional | **CORRETO** | Ambos especialistas dependem de testes para validar suas correcoes. Deve ser o PRIMEIRO item resolvido. |
| DB-C01 (Security) como fundacional | **CORRETO** | Vulnerabilidade exploravel. O DB review confirma e fornece migration pronta. |
| SY-C01 (Formula nivel) como fundacional | **PARCIALMENTE CORRETO** | E urgente (score 17), mas depende de uma DECISAO de produto (qual formula?) que nao esta tomada. Pode bloquear se a decisao demorar. Sugestao: mover para Onda 2 se a decisao nao estiver pronta, ou incluir a decisao como pre-requisito explícito. |
| **Faltam:** DB-H03, DB-H02 | **GAP** | O DB review classifica DB-H03 (handle_new_user via RPC) como P0 - Sprint atual (fix de 0.5h) e DB-H02 como P1 - Sprint atual. Ambos sao fixes de seguranca triviais que devem estar na Onda 1. |

#### Onda 2 (Integridade): DB-C03 + SY-C02 + DB-C02

| Validacao | Status | Observacao |
|-----------|--------|-----------|
| DB-C03 (Tipos TS) na Onda 2 | **CORRETO** | Depende de schema estavel (pos-Onda 1). |
| SY-C02 (Client unificado) na Onda 2 | **PARCIALMENTE CORRETO** | O risco cruzado RC01 sugere que SY-C02 deve ser resolvido ANTES ou JUNTO com DB-C01. Se o client estiver fragmentado, a validacao `auth.uid()` pode falhar. **Recomendo mover SY-C02 para Onda 1.** |
| DB-C02 (Seed data) na Onda 2 | **CORRETO** | O DB review ajustou para HIGH e confirma que `ON CONFLICT DO NOTHING` mitiga o risco imediato. |
| **Faltam:** CHECK constraints (DB-H09, DB-M10, etc.) | **GAP** | O DB review coloca CHECK constraints na Onda 2, mas o DRAFT nao os inclui. Devem ser adicionados. |

#### Onda 3 (Qualidade): SY-H01 + FE-H03 + FE-H02

| Validacao | Status | Observacao |
|-----------|--------|-----------|
| SY-H01 (Query keys com userId) | **CORRETO** | Depende de SY-C02 (client unificado). |
| FE-H03 (Zod schemas) | **CORRETO** | Depende de DB-C03 (tipos TS corretos). |
| FE-H02 (ErrorBoundary) | **CORRETO** | Independente, pode ser antecipado. O UX review propoe `error.tsx` generico como Quick Win (Onda 0). |
| **Faltam:** Quick Wins UX (FE-M03, FE-N02, FE-H04, FE-N01) | **GAP** | O UX review propoe uma "Onda 0" de quick wins que nao existe no DRAFT. Esses itens de 0.5-3h devem ser incorporados nas primeiras ondas. |

#### Onda 4 (Refatoracao): FE-C01 + FE-C02

| Validacao | Status | Observacao |
|-----------|--------|-----------|
| FE-C01 (God Components) | **PARCIALMENTE CORRETO** | O UX review argumenta que FE-N05 (layout compartilhado) deve vir ANTES de FE-C01. Extrair componentes de paginas que importam Sidebar individualmente causa retrabalho. **Adicionar FE-N05 como pre-requisito.** |
| FE-C02 (Mobile nav) | **CONTESTADO** | O UX review argumenta que mobile nav deve ser Onda 1 (P0 bloqueante), nao Onda 4. Com forte justificativa: sem mobile nav, o app e inacessivel em smartphones. **Recomendo mover FE-C02 para Onda 2 ou 3.** |

#### Onda 5 (Performance): FE-C03 + DB-H04/H05

| Validacao | Status | Observacao |
|-----------|--------|-----------|
| FE-C03 (Code splitting) | **CORRETO** | Depende de FE-C01 (God Components extraidos). |
| DB-H04/H05 (N+1 patterns) | **CORRETO** | Otimizacoes que podem esperar. |
| **Faltam:** DB-M08 (get_focus_stats 3x) | **GAP** | O DB review elevou DB-M08 para HIGH e recomenda P2 - Proximo sprint. Deveria estar na Onda 3 ou antes. |

#### Onda 6 (Robustez): DB-H06 + DB-H07

| Validacao | Status | Observacao |
|-----------|--------|-----------|
| Soft delete + Audit trail no final | **CORRETO** | Ambos especialistas concordam que sao P4-P5 para o estagio atual do app. |

### 3.2 Dependencias Circulares Identificadas

| Ciclo | Debitos | Resolucao |
|-------|---------|-----------|
| **Ciclo 1** | DB-C01 (auth validation) depende de SY-C02 (client unificado) para garantir que `auth.uid()` funcione. Mas SY-C02 esta na Onda 2 e DB-C01 na Onda 1. | Mover SY-C02 para Onda 1 ou implementar DB-C01 com testes que validem `auth.uid()` com o client atual. |
| **Ciclo 2** | DB-C03 (tipos TS) depende de schema estavel. Schema estabiliza apos Ondas 1-2 de DB. Mas hooks (frontend) precisam de tipos para funcionar. | Aceitar que tipos serao regenerados mais de uma vez. Primeira regeneracao apos Onda 1 DB, segunda apos Onda 2 DB. |
| **Ciclo 3** | CC-C01 (testes) e pre-requisito para refatoracoes seguras. Mas configurar testes (Vitest + RTL) requer 4-8h, e o DB review quer executar migrations de seguranca IMEDIATAMENTE. | Permitir que migrations de seguranca (DB-C01, DB-H03) rodem ANTES do setup de testes, pois sao alteracoes isoladas no banco. Testes sao pre-requisito para refatoracoes de FRONTEND, nao para migrations SQL. |

### 3.3 Ordem Recomendada Consolidada

Integrando as tres propostas (DRAFT + DB review + UX review):

```
Onda 0 -- Quick Wins (1-2 dias, ~10h):
  UX: FE-M03 (prefers-reduced-motion), FE-N02 (skip nav), FE-H04 (toast)
  UX: FE-N01 (loading.tsx/error.tsx generico)
  DB: DB-H03 (revoke handle_new_user, 0.5h)
  DB: DB-H11 (renumerar migration 007, 0.5h)
  SY: CC-H01 (remover console.error, 0.5h)

Onda 1 -- Seguranca + Fundacao (1 sprint, ~20h):
  DB: DB-C01 (auth validation em SECURITY DEFINER, 3-4h)
  SY: SY-C02 (unificar Supabase client, 2-4h)  [movido de Onda 2]
  SY: SY-H01 (query keys com userId, 1-2h)  [movido de Onda 3, depende de SY-C02]
  DB: DB-C02 (mover seed data, 1-2h)
  CC: CC-C01 (setup Vitest + RTL, 4-8h)
  SY: SY-C01 (alinhar formula nivel, 2-4h)  [REQUER decisao de produto]

Onda 2 -- Integridade + Tipos (1 sprint, ~12h):
  DB: DB-C03 (regenerar tipos TS, 3-4h)
  DB: 011_add_check_constraints.sql (DB-H09, DB-M10, DB-M02, DB-NEW-03, DB-NEW-04, 1-2h)
  DB: 012_add_composite_indexes.sql (DB-M03, 0.25h)
  UX: FE-H03 (schemas Zod completos, 6-8h)  [depende de DB-C03]
  UX: FE-H02 (error.tsx por rota + ErrorBoundary, 3-4h)

Onda 3 -- Reestruturacao Frontend (1 sprint, ~16h):
  UX: FE-N05 (layout compartilhado, route groups, 4h)
  UX: FE-C02 (mobile navigation, 12-16h)  [movido de Onda 4 do DRAFT]
  UX: FE-N03 (responsividade paginas internas, 8-12h)

Onda 4 -- Refatoracao God Components (2 sprints, ~36h):
  UX: FE-M02 (reducer para Foco, 6-8h)
  UX: FE-C01 (extrair sub-componentes, 24-32h)
  UX: FE-H01 (react-hook-form + CampoFormulario, 8-12h)

Onda 5 -- Performance + Robustez (1 sprint, ~18h):
  UX: FE-C03 (code splitting, 6-10h)
  UX: FE-C04 (RSC parcial, 4-6h)
  DB: DB-H04 (batch reorder, 4-6h)
  DB: DB-M08 (deduplicar get_focus_stats, 1-2h)

Onda 6 -- Backlog Estrutural (futuro):
  DB: DB-H06 (soft delete), DB-H07 (audit trail)
  DB: DB-NEW-01 (schema consolidado atualizado)
  UX: FE-N04 (Suspense boundaries), FE-L01 (React.memo)
```

---

## 4. Testes Requeridos

### 4.1 Testes por Onda

#### Onda 0 -- Quick Wins

| Debito | Tipo de Teste | Descricao |
|--------|--------------|-----------|
| FE-M03 | Manual | Verificar em browser com `prefers-reduced-motion: reduce` que animacoes sao desativadas. |
| FE-N02 | E2E (Playwright) | Tab focus vai para skip link -> Enter navega para conteudo principal. |
| FE-H04 | Integration | Cada hook mutation (`useHabitos`, `useAgenda`, `useMetas`, `useCursos`) dispara toast.success/error. |
| FE-N01 | Visual | Cada rota exibe esqueleto durante carregamento (simular latencia). |
| DB-H03 | SQL | `SELECT has_function_privilege('anon', 'handle_new_user()', 'execute')` retorna `false`. |

#### Onda 1 -- Seguranca + Fundacao

| Debito | Tipo de Teste | Descricao |
|--------|--------------|-----------|
| DB-C01 | Integration (SQL) | Para cada funcao SECURITY DEFINER: chamar com `auth.uid()` != `p_user_id` e verificar RAISE EXCEPTION. Chamar com `auth.uid()` = `p_user_id` e verificar sucesso. |
| DB-C01 | E2E | Fluxo completo: usuario completa sessao foco -> XP incrementa -> nivel recalcula. |
| SY-C02 | Unit | Verificar que `createBrowserClient()` retorna a mesma instancia (singleton). Verificar que AuthProvider usa o client unificado. |
| SY-H01 | Unit | Query keys incluem userId. Trocar de usuario invalida cache do anterior. |
| CC-C01 | Infra | `npm test` roda sem erros. Config de Vitest + RTL funcional. Cobertura inicial reportada. |
| SY-C01 | Unit + Integration | Funcao `calculate_level(xp)` no banco retorna mesmo valor que `calculateLevel(xp)` no frontend para XP de 0 a 100.000. |
| DB-C02 | Integration | `supabase db reset` roda sem erros. Seed data presente no banco apos reset. Schema consolidado nao contem seed data. |

#### Onda 2 -- Integridade + Tipos

| Debito | Tipo de Teste | Descricao |
|--------|--------------|-----------|
| DB-C03 | Build | `npm run typecheck` passa sem erros apos regeneracao de tipos. Zero arquivos `types/database.ts` remanescentes (apenas `lib/supabase/types.ts`). |
| DB-H09/M10 | SQL | Tentar inserir `goals.progresso_atual = -1` -> falha. Tentar inserir `events.horario_fim < horario_inicio` -> falha. Tentar inserir `users.level = 0` -> falha. |
| FE-H03 | Unit | Cada schema Zod rejeita inputs invalidos e aceita inputs validos. Schemas derivados dos tipos do banco. |
| FE-H02 | E2E | Simular erro em cada rota -> `error.tsx` renderiza com mensagem amigavel e botao de retry. |

#### Onda 3 -- Reestruturacao Frontend

| Debito | Tipo de Teste | Descricao |
|--------|--------------|-----------|
| FE-N05 | E2E | Navegar entre rotas protegidas -> Sidebar NAO remonta (verificar via React DevTools ou ausencia de flash). |
| FE-C02 | E2E (mobile viewport) | Em viewport 375x667: bottom tab bar visivel, todas as 5 tabs navegam corretamente, drawer "Mais" abre e lista rotas secundarias. Em viewport >= 1024: bottom tab bar oculta, sidebar visivel. |
| FE-N03 | Visual (Playwright screenshots) | Screenshots em 375px, 768px, 1024px, 1440px para cada rota. Nenhum overflow horizontal, nenhum texto cortado. |

#### Onda 4 -- Refatoracao God Components

| Debito | Tipo de Teste | Descricao |
|--------|--------------|-----------|
| FE-C01 | Snapshot + Integration | Antes de refatorar: capturar snapshots de cada pagina. Apos refatorar: snapshots identicos. Testes de integracao para cada sub-componente extraido. |
| FE-M02 | Unit | `useFocoTimer` testa: iniciar, pausar, retomar, concluir, resetar. Estado consistente apos cada acao. |
| FE-H01 | Unit | Formularios com react-hook-form: submit valido funciona, submit invalido mostra erros inline, validacao Zod rejeita inputs invalidos. |

#### Onda 5 -- Performance

| Debito | Tipo de Teste | Descricao |
|--------|--------------|-----------|
| FE-C03 | Build analysis | Bundle analyzer mostra reducao em JS por rota. Modais e DnD carregados sob demanda. |
| DB-H04 | Integration | Reordenar 10 tarefas: unica chamada RPC (nao 10 requests HTTP). Verificar ordem persistida. |
| DB-M08 | Unit | `useDashboard` chama `get_focus_stats` uma unica vez (mock + spy). |

### 4.2 Cobertura Minima Requerida

| Area | Cobertura Minima | Justificativa |
|------|-----------------|---------------|
| Funcoes SECURITY DEFINER (DB-C01) | 100% dos paths de auth | Seguranca nao admite gaps |
| Schemas Zod (FE-H03) | 100% dos schemas | Validacao e gate de dados |
| Hooks de mutation (useTarefas, useHabitos, etc.) | 80% | Pattern critico de dados |
| Sub-componentes extraidos (FE-C01) | 80% | Regressao pos-refatoracao |
| Utilitarios (dashboard.ts, utilidades.ts) | 90% | Logica pura, facil de testar |
| Paginas (page.tsx) | 60% (integration) | Complexidade de setup |

---

## 5. Criterios de Aceite

### 5.1 Debitos CRITICAL

| ID | Debito | Criterios de Aceite |
|----|--------|-------------------|
| DB-C01 | SECURITY DEFINER sem auth | 1. Todas as 7 funcoes SECURITY DEFINER validam `auth.uid()`. 2. Chamar qualquer funcao com `p_user_id != auth.uid()` retorna EXCEPTION. 3. Fluxos existentes (foco, habitos, cursos) continuam funcionando para o usuario correto. 4. Testes SQL de autorizacao passam. |
| DB-C03 | Tipos TS desatualizados | 1. Um unico arquivo `lib/supabase/types.ts` gerado por `supabase gen types typescript`. 2. Arquivo `types/database.ts` removido. 3. Todos os imports atualizados. 4. `npm run typecheck` passa sem erros. 5. Nenhum `as any` adicionado como workaround. |
| CC-C01 | Zero testes | 1. Vitest + React Testing Library configurados. 2. `npm test` executa com sucesso. 3. Pelo menos 1 teste unitario, 1 de integracao e 1 snapshot funcionando. 4. CI pipeline roda testes automaticamente (ou script preparado). 5. Configuracao de cobertura com threshold de 80%. |
| FE-C01 | God Components | 1. Nenhuma pagina excede 400 linhas. 2. Sub-componentes em `componentes/{feature}/`. 3. Cada sub-componente tem testes. 4. Nenhuma regressao visual (snapshots). 5. Performance de re-render medida (React DevTools profiler). |
| FE-C02 | Navegacao mobile | 1. Bottom tab bar visivel em viewports < 1024px. 2. Sidebar visivel em viewports >= 1024px, bottom tab oculta. 3. Todas as rotas acessiveis em mobile. 4. Tab "Mais" abre drawer com rotas secundarias. 5. Safe area respeitada em iOS. 6. Nenhum conteudo oculto sob o tab bar. |
| CC-C02 | Dados mockados | 1. Arquivo `dados-dashboard.ts` contem APENAS dados ativos (menu sidebar). 2. Constantes obsoletas removidas. 3. Nenhum dado mockado renderizado em producao. |
| SY-C01 | Formula nivel divergente | 1. UMA formula definida como canonica (decisao documentada). 2. Frontend e backend usam a mesma formula. 3. Teste unitario verifica equivalencia para XP de 0 a 100.000. 4. Usuarios existentes recalculados se necessario. |

### 5.2 Debitos HIGH

| ID | Debito | Criterios de Aceite |
|----|--------|-------------------|
| SY-C02 | Tripla instancia Supabase | 1. Um unico modulo `lib/supabase/client.ts` exporta singleton. 2. `lib/supabase.ts` removido ou re-exporta do modulo unico. 3. AuthProvider usa o client unificado. 4. Logout propaga para todas as tabs. |
| SY-H01 | Query keys sem userId | 1. Todas as query keys incluem `userId`. 2. Trocar de usuario (logout + login com outro) nao mostra dados do usuario anterior. 3. Teste unitario valida formato das query keys. |
| DB-H02 | Admin com senha visivel | 1. Migration nao exibe senha no output. 2. Senha rotacionada se migration ja rodou em producao. 3. Documentar credenciais admin em vault seguro (nao em SQL). |
| DB-H09 | Progresso sem CHECK | 1. CHECK constraints presentes para `progresso_atual >= 0`, `progresso_total >= 1`, `total_xp >= 0`, `level >= 1`, `xp_recompensa >= 0`. 2. Dados invalidos existentes corrigidos antes da constraint. |
| FE-H02 | ErrorBoundary inconsistente | 1. Arquivo `error.tsx` presente em `app/` (raiz) e em cada route group. 2. `loading.tsx` presente nas rotas principais. 3. Erro em qualquer pagina mostra UI de fallback, nao tela branca. |
| FE-H03 | Zod incompleta | 1. Schemas Zod para: habitos, metas, eventos, cursos, perfil. 2. Todos derivados dos tipos TypeScript do banco. 3. Todos os formularios validam via Zod antes de submeter. |
| FE-M02 | 26 useState no Foco | 1. Maximo 10 useState no componente principal. 2. Logica do timer encapsulada em `useFocoTimer`. 3. Timer funciona identicamente ao anterior (sem regressao). |
| DB-M08 | get_focus_stats 3x | 1. Funcao `get_focus_stats` chamada no maximo 1 vez por render do dashboard. 2. Resultado compartilhado via React Query. |

### 5.3 Debitos MEDIUM e LOW (criterios resumidos)

| Grupo | Criterios |
|-------|----------|
| CHECK constraints textuais (DB-M02, DB-L01) | Valores TEXT restritos via CHECK. Valores invalidos rejeitados. |
| Indexes (DB-M03, DB-M04) | Index composto criado. Query plan (`EXPLAIN`) mostra index scan. |
| Acessibilidade (FE-M03, FE-N02, FE-N04) | `prefers-reduced-motion` desativa animacoes. Skip nav funciona. Contraste >= 4.5:1 AA. |
| Performance DB (DB-M05, DB-M06, DB-M07) | Reducao mensuravel no numero de requests HTTP por operacao. |
| Code splitting (FE-C03) | Modais, DnD e calendarios carregados sob demanda. Bundle por rota reduzido. |

---

## 6. Metricas de Qualidade

### 6.1 Metricas a Coletar ANTES da Resolucao (Baseline)

| Metrica | Ferramenta | Como Medir | Valor Esperado Atual |
|---------|------------|-----------|---------------------|
| Cobertura de testes | Vitest + c8 | `npm test -- --coverage` | 0% (nenhum teste existe) |
| Erros TypeScript | tsc | `npm run typecheck 2>&1 \| wc -l` | Registrar contagem atual |
| Bundle size por rota | `@next/bundle-analyzer` | Build + analise | Registrar baseline por rota |
| Lighthouse Performance Score | Lighthouse CI | Paginas: inicio, foco, tarefas, habitos | Registrar scores atuais |
| Largest Contentful Paint (LCP) | Lighthouse | Cada rota principal | Registrar em ms |
| Cumulative Layout Shift (CLS) | Lighthouse | Cada rota principal | Registrar valor |
| Linhas por arquivo (God Components) | `wc -l` | 4 paginas principais | habitos: ~2314, foco: ~1281, tarefas: ~1062, agenda: ~863 |
| Requests HTTP no dashboard | Network tab | Carregar dashboard logado | Registrar contagem (estimado: 5-8) |
| Tempo de `supabase db reset` | Cronometro | Reset completo com seed | Registrar em segundos |
| Contraste minimo WCAG | axe-core ou manual | `--muted-foreground` sobre todos backgrounds | 4.84:1 (marginal AA) |
| Funcoes SECURITY DEFINER sem auth | Query SQL | `SELECT count(*) FROM pg_proc WHERE prosecdef AND ...` | 7 sem validacao |
| Queries por streak de 365 dias | `EXPLAIN ANALYZE` | `get_habit_streak()` com habito de 1 ano | ~365 queries (O(N)) |

### 6.2 Metricas-Alvo APOS Resolucao

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

### 6.3 Metricas de Processo

| Metrica | Como Medir | Alvo |
|---------|-----------|------|
| Debitos resolvidos por sprint | Checklist em story | >= 5 por sprint |
| Debitos CRITICAL restantes | Contagem manual | 0 apos Onda 2 |
| Tempo de build | `npm run build` | Nao aumentar > 10% |
| Tempo de `npm run typecheck` | Cronometro | Nao aumentar > 20% |
| Regressoes introduzidas | Bugs reportados | 0 regressoes criticas |

---

## 7. Parecer Final

### 7.1 Avaliacao Geral

O Technical Debt Assessment e **abrangente e bem-estruturado**. A cobertura de 52 debitos (31 DB, 18 Frontend/UX, 3 Cross-Cutting, 9 Sistema -- contando ajustes dos especialistas) demonstra uma auditoria minuciosa das tres camadas do sistema.

As reviews dos especialistas sao de **alta qualidade**:
- O @data-engineer respondeu todas as 8 perguntas com profundidade tecnica, forneceu migrations SQL prontas para producao, e identificou 5 novos debitos. A analise de dependencia circular na validacao `auth.uid()` entre `complete_focus_session` e `add_user_xp` e especialmente valiosa.
- O @ux-design-expert validou com dados concretos (contagens de linhas, ocorrencias de breakpoints, ratios de contraste), propoz uma "Onda 0" de quick wins ausente no DRAFT, e forneceu arquitetura de componentes detalhada.

### 7.2 Pontos Fortes

1. **Priorizacao por formula quantitativa** (Impacto * 2 + Risco * 2 - Esforco) evita subjetividade.
2. **Mapa de dependencias visual** facilita compreensao da ordem de resolucao.
3. **DB review com SQL pronto** acelera significativamente a execucao.
4. **UX review com metricas concretas** (contagens, ratios de contraste, breakpoints) torna a validacao objetiva.
5. **Ambas reviews ajustam severidades com justificativa** em vez de aceitar cegamente o DRAFT.

### 7.3 Pontos de Atencao

1. **Falta integracao cronologica** entre DB, Frontend e Sistema. Tres planos de ondas independentes criam ambiguidade na execucao. A secao 3.3 deste documento propoe uma consolidacao.
2. **CC-C01 (zero testes) e mencionado como fundacional mas nao detalhado.** Qual framework? Quais primeiros testes? O DRAFT sugere Vitest + RTL mas sem configuracao especifica.
3. **SY-C01 (formula de nivel) depende de decisao de produto** nao tomada. Nenhum documento define qual formula e a correta. Recomendo que @architect ou @pm decida ANTES de incluir na sprint.
4. **Risco cruzado RC01 (DB-C01 + SY-C02)** e o mais critico e nao foi identificado por nenhum documento. A validacao `auth.uid()` nas funcoes SECURITY DEFINER pode falhar se o client Supabase estiver fragmentado.
5. **Ausencia de plano de rollback** para migrations de seguranca. Cada migration deve ter um script de reversao documentado.

### 7.4 Condicoes para Aprovacao Final

O assessment pode prosseguir para consolidacao final **desde que**:

1. **[BLOQUEANTE]** A ordem de ondas consolidada (secao 3.3 deste documento) seja incorporada, resolvendo o conflito entre as tres propostas independentes.
2. **[BLOQUEANTE]** SY-C01 (formula de nivel) tenha a formula canonica definida antes de entrar em sprint. Responsavel: @architect ou @pm.
3. **[BLOQUEANTE]** O risco cruzado RC01 (DB-C01 + SY-C02) seja endereçado: mover SY-C02 para a mesma onda de DB-C01 ou documentar que o client atual suporta `auth.uid()` corretamente apesar da fragmentacao.
4. **[RECOMENDADO]** Scripts de rollback para migrations 009-013 sejam criados pelo @data-engineer.
5. **[RECOMENDADO]** Baseline de metricas (secao 6.1) seja coletada ANTES do inicio da execucao.
6. **[RECOMENDADO]** DB-H02 (admin com senha visivel) seja investigado: a migration ja rodou em producao? Se sim, rotacionar senha imediatamente.

### 7.5 Estimativa Consolidada

| Onda | Horas DB | Horas Frontend | Horas Sistema | Total |
|------|---------|---------------|--------------|-------|
| 0 - Quick Wins | 1h | 7h | 0.5h | ~9h |
| 1 - Seguranca + Fundacao | 4-6h | 0h | 8-14h | ~20h |
| 2 - Integridade + Tipos | 5-7h | 9-12h | 0h | ~16h |
| 3 - Reestruturacao Frontend | 0h | 24-32h | 0h | ~28h |
| 4 - God Components | 0h | 38-52h | 0h | ~45h |
| 5 - Performance | 5-8h | 10-16h | 0h | ~18h |
| 6 - Backlog | 18-28h | 4-8h | 0h | ~28h |
| **Total** | **~42h** | **~102h** | **~17h** | **~164h** |

**Nota:** A estimativa total (~164h, ~4-5 semanas de trabalho full-time) e significativa mas realista para 52+ debitos acumulados. A execucao por ondas permite entregas incrementais de valor.

---

*Revisao QA concluida por @qa*
*Data: 2026-01-29*
*Status: APPROVED WITH CONDITIONS -- Documento pode prosseguir para consolidacao final incorporando as 3 condicoes bloqueantes e 3 recomendadas listadas na secao 7.4.*
