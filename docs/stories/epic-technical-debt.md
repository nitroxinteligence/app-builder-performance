# Epic: Resolucao de Debitos Tecnicos - Builders Performance

**Epic ID:** EPIC-TD-001
**Data:** 2026-01-29
**Autor:** @pm -- Synkra AIOS
**Status:** Planejado
**Orcamento:** R$ 27.375 (~182.5 horas a R$150/h)

---

## Objetivo

Eliminar 74 debitos tecnicos identificados na auditoria completa do Builders Performance + auditoria complementar pos-integracao de calendario, distribuidos em 7 ondas de resolucao (Onda 0 a Onda 6). O objetivo principal e tornar o produto seguro, acessivel em dispositivos moveis, testavel e sustentavel para evolucao futura.

Os debitos abrangem 4 areas: Sistema/Arquitetura (9 debitos), Database (31 debitos), Frontend/UX (18 debitos) e Cross-Cutting transversais (3 debitos). Adicionados 13 debitos pos-assessment (calendario + novos componentes). Dos 74 debitos, 8 sao CRITICAL, 24 sao HIGH, 29 sao MEDIUM e 13 sao LOW.

As tres prioridades imediatas sao:
1. Corrigir 3 vulnerabilidades de seguranca ativas (funcoes SECURITY DEFINER, handle_new_user exposto, senha em logs)
2. Desbloquear acesso mobile (navegacao inexistente em telas < 1024px)
3. Estabelecer infraestrutura de testes (0% de cobertura atual)

## Escopo

### Debitos por Area

| Area | Total | CRITICAL | HIGH | MEDIUM | LOW |
|------|-------|----------|------|--------|-----|
| Sistema/Arquitetura | 9 | 2 | 3 | 4 | 0 |
| Database | 31 | 2 | 7 | 14 | 8 |
| Frontend/UX | 18 | 2 | 8 | 5 | 3 |
| Cross-Cutting | 3 | 2 | 1 | 0 | 0 |
| Pos-Assessment (Calendario + Novos) | 13 | 0 | 5 | 6 | 2 |
| **Total** | **74** | **8** | **24** | **29** | **13** |

### Debitos por Onda

| Onda | Nome | Debitos | Horas |
|------|------|---------|-------|
| Onda 0 | Quick Wins | 7 | ~9h |
| Onda 1 | Seguranca + Fundacao | 11 | ~23h |
| Onda 2 | Integridade + Tipos | 9 | ~19h |
| Onda 3 | Reestruturacao Frontend | 4 | ~30h |
| Onda 4 | God Components | 6 | ~53h |
| Onda 5 | Performance | 6 | ~20.5h |
| Onda 6 | Backlog Estrutural | 6 | ~28h |
| **Total** | -- | **49 itens de acao** | **~182.5h** |

**Nota:** Varios itens da Onda 2 agrupam multiplos debitos em uma unica acao (ex: CHECK constraints agrupam DB-H09, DB-M10, DB-M02, DB-NEW-03, DB-NEW-04). Os 61 debitos estao todos cobertos nas 7 ondas.

## Criterios de Sucesso

### Metricas-Alvo

| Metrica | Baseline Atual | Alvo Onda 1-2 | Alvo Final (Onda 5) |
|---------|---------------|---------------|---------------------|
| Cobertura de testes | 0% | >= 30% | >= 80% |
| Erros TypeScript | A medir | 0 | 0 |
| Bundle size (total) | A medir | N/A | Reducao >= 20% |
| Lighthouse Performance | A medir | >= 60 | >= 85 |
| LCP | A medir | <= 3.0s | <= 2.0s |
| CLS | A medir | <= 0.15 | <= 0.05 |
| Linhas por arquivo (max) | 2.314 | <= 800 | <= 400 |
| Requests HTTP dashboard | ~5-8 | <= 5 | <= 2 |
| Contraste WCAG | 4.84:1 | >= 5.5:1 | >= 5.5:1 |
| Funcoes DEFINER sem auth | 7 | 0 | 0 |

### Metricas de Processo

| Metrica | Alvo |
|---------|------|
| Debitos resolvidos por sprint | >= 5 |
| Debitos CRITICAL restantes apos Onda 2 | 0 |
| Tempo de build | Nao aumentar > 10% |
| Regressoes criticas introduzidas | 0 |

## Timeline

| Onda | Semana | Horas | Custo (R$) | Entrega Principal |
|------|--------|-------|------------|-------------------|
| Onda 0 - Quick Wins | Semana 1 | ~9h | R$ 1.350 | Feedback visual, acessibilidade basica, bloqueio de funcao exposta |
| Onda 1 - Seguranca + Fundacao | Semanas 1-2 | ~23h | R$ 3.450 | Seguranca corrigida, testes configurados, client unificado, env validation |
| Onda 2 - Integridade + Tipos | Semanas 2-3 | ~19h | R$ 2.850 | Tipos TS corretos, CHECK constraints, schemas Zod, validacao JSON |
| Onda 3 - Reestruturacao Frontend | Semanas 3-4 | ~30h | R$ 4.500 | Layout compartilhado, navegacao mobile, responsividade, a11y |
| Onda 4 - God Components | Semanas 4-6 | ~53h | R$ 7.950 | Componentes < 400 linhas, formularios padronizados, acoes-rapidas split |
| Onda 5 - Performance | Semanas 6-8 | ~20.5h | R$ 3.075 | Code splitting, RSC, queries otimizadas, virtualizacao |
| Onda 6 - Backlog Estrutural | Futuro | ~28h | R$ 4.200 | Soft delete, audit trail, schema consolidado |
| **TOTAL** | **6-8 semanas** | **~182.5h** | **R$ 27.375** | **Produto sustentavel e seguro** |

## Budget

### Custo por Area

| Area | Debitos | Horas | Custo (R$150/h) |
|------|---------|-------|-----------------|
| Banco de Dados | 31 | 42h | R$ 6.300 |
| Interface e Experiencia do Usuario | 18 | 102h | R$ 15.300 |
| Arquitetura do Sistema | 9 | 17h | R$ 2.550 |
| Qualidade Transversal | 3 | 3h | R$ 450 |
| **TOTAL** | **61** | **164h** | **R$ 24.600** |

### Custo por Onda

| Onda | Horas | Custo |
|------|-------|-------|
| Onda 0 | ~9h | R$ 1.350 |
| Onda 1 | ~23h | R$ 3.450 |
| Onda 2 | ~19h | R$ 2.850 |
| Onda 3 | ~30h | R$ 4.500 |
| Onda 4 | ~53h | R$ 7.950 |
| Onda 5 | ~20.5h | R$ 3.075 |
| Onda 6 | ~28h | R$ 4.200 |
| **TOTAL** | **~182.5h** | **R$ 27.375** |

### ROI Estimado

- **Investimento total:** R$ 27.375
- **Custo potencial de nao agir:** R$ 410.000 - R$ 870.000
- **ROI estimado:** 9:1 (conservador)

## Stories

| Story ID | Nome | Arquivo | Horas | Prioridade |
|----------|------|---------|-------|------------|
| TD-0.0 | Quick Wins | [story-td-0.0-quick-wins.md](story-td-0.0-quick-wins.md) | ~9h | HIGH |
| TD-1.0 | Seguranca + Fundacao | [story-td-1.0-seguranca-fundacao.md](story-td-1.0-seguranca-fundacao.md) | ~23h | CRITICAL |
| TD-2.0 | Integridade + Tipos | [story-td-2.0-integridade-tipos.md](story-td-2.0-integridade-tipos.md) | ~19h | CRITICAL |
| TD-3.0 | Reestruturacao Frontend | [story-td-3.0-reestruturacao-frontend.md](story-td-3.0-reestruturacao-frontend.md) | ~30h | CRITICAL |
| TD-4.0 | God Components | [story-td-4.0-god-components.md](story-td-4.0-god-components.md) | ~53h | CRITICAL |
| TD-5.0 | Performance | [story-td-5.0-performance.md](story-td-5.0-performance.md) | ~20.5h | HIGH |
| TD-6.0 | Backlog Estrutural | [story-td-6.0-backlog-estrutural.md](story-td-6.0-backlog-estrutural.md) | ~28h | MEDIUM |

## Dependencias

### Cadeia de Dependencias entre Stories

```
TD-0.0 (Quick Wins) ── sem dependencias, pode iniciar imediatamente

TD-1.0 (Seguranca + Fundacao) ── sem dependencias externas
  ├── SY-C02 (client unificado) ANTES de DB-C01 (SECURITY DEFINER)
  └── CC-C01 (testes) e pre-requisito para TD-4.0

TD-2.0 (Integridade + Tipos) ── depende de TD-1.0
  ├── DB-C03 (tipos TS) depende de schema estavel da Onda 1
  └── FE-H03 (Zod) depende de DB-C03

TD-3.0 (Reestruturacao Frontend) ── depende de TD-2.0
  ├── FE-N05 (layout) ANTES de FE-C02 (mobile nav)
  └── FE-C02 ANTES de FE-N03 (responsividade)

TD-4.0 (God Components) ── depende de TD-1.0 (testes) e TD-3.0 (layout)
  ├── FE-M02 (useState foco) ANTES de FE-C01 (dividir paginas)
  └── FE-C01 ANTES de FE-H01 (formularios)

TD-5.0 (Performance) ── depende de TD-4.0
  ├── FE-C01 ANTES de FE-C03 (code splitting)
  └── SY-H01 ANTES de DB-M08 (focus stats)

TD-6.0 (Backlog Estrutural) ── depende de ondas anteriores
  ├── DB-H07 (audit) depende de DB-C01 (Onda 1)
  └── FE-N04 (Suspense) depende de FE-C04 (Onda 5)
```

### Dependencias Circulares Resolvidas

| Ciclo | Debitos | Resolucao |
|-------|---------|-----------|
| Ciclo 1 | DB-C01 depende de SY-C02, ambos urgentes | Ambos na Onda 1. SY-C02 primeiro, DB-C01 em seguida. |
| Ciclo 2 | DB-C03 depende de schema estavel, hooks precisam de tipos | Regenerar tipos 2 vezes: apos Onda 1, e apos Onda 2. |
| Ciclo 3 | CC-C01 e pre-requisito para refatoracoes, mas migrations SQL sao mais urgentes | Migrations SQL rodam ANTES de setup de testes. Testes sao pre-requisito para refatoracoes de FRONTEND, nao para SQL. |

## Riscos

### Riscos Cruzados (RC01-RC08)

| # | Risco | Areas | Severidade | Mitigacao |
|---|-------|-------|------------|-----------|
| RC01 | **Fix DB-C01 quebra chamadas RPC** -- `auth.uid()` validation pode causar `RAISE EXCEPTION 'Unauthorized'` se client fragmentado (SY-C02) causar divergencia entre `user.id` e `auth.uid()`. | DB + FE + SY | CRITICAL | Resolver SY-C02 ANTES de DB-C01 (ambos Onda 1). Testes de integracao RPC. Log temporario pos-deploy. |
| RC02 | **Regeneracao de tipos TS invalida imports** -- Tipos regenerados e hooks refatorados em sprints diferentes causam merge conflicts. | DB + FE | HIGH | Regenerar tipos e atualizar imports no MESMO sprint. `npm run typecheck` como gate. |
| RC03 | **SY-C01 afeta DB + Frontend + UX** -- Formula requer mudanca em ambos lados. Se apenas um for corrigido, nivel diverge. | DB + FE + UX | HIGH | Decidir formula ANTES. Corrigir ambos lados no MESMO deploy. Migration de recalculo. |
| RC04 | **Refatoracao de God Components sem testes** -- Dividir 5520 linhas sem testes e alto risco de regressao. | FE + CC | HIGH | CC-C01 ANTES de FE-C01. Testes snapshot/integration ANTES de refatorar. Cobertura 80% por componente. |
| RC05 | **Layout compartilhado + Mobile nav = refatoracao dupla** -- Mobile nav antes de layout compartilhado gera retrabalho. | FE | MEDIUM | FE-N05 ANTES de FE-C02. Ambos na Onda 3, nessa ordem. |
| RC06 | **Seed data + Schema consolidado desatualizado** -- `supabase db reset` pode falhar com funcoes antigas. | DB | MEDIUM | DB-NEW-01 APOS todas as migrations. Nao rodar `db reset` sem verificacao manual. |
| RC07 | **CHECK constraints falham com dados invalidos existentes** -- Migration pode falhar se dados invalidos ja existem. | DB | MEDIUM | Queries de verificacao ANTES da migration. Bloco de correcao de dados previo. |
| RC08 | **Toast + react-hook-form = mudanca dupla em mutations** -- Padronizar toast (Onda 0) e introduzir rhf (Onda 4) refatora hooks duas vezes. | FE | LOW | Toast como util independente (`lib/utilidades-toast.ts`). Callbacks continuam funcionando. |

## Condicoes Bloqueantes

| # | Condicao | Status | Responsavel | Detalhes |
|---|---------|--------|-------------|----------|
| 1 | **Ordem de ondas consolidada** -- As tres propostas independentes (DRAFT, DB review, UX review) integradas em cronograma unico. | RESOLVIDO | @architect | Incorporada no plano de resolucao final do assessment. |
| 2 | **SY-C01: Formula canonica de nivel** -- Definir se formula correta e exponencial ou raiz quadrada. | PENDENTE | @architect / @pm | Bloqueante para SY-C01 da Onda 1. Decisao de produto necessaria. |
| 3 | **RC01: DB-C01 + SY-C02** -- Risco cruzado entre SECURITY DEFINER fix e client fragmentado. | RESOLVIDO | @architect | SY-C02 movido para Onda 1 antes de DB-C01. |

### Condicoes Recomendadas

| # | Condicao | Responsavel | Prazo |
|---|---------|-------------|-------|
| 4 | Scripts de rollback para migrations 009-013 | @data-engineer | Antes de cada migration |
| 5 | Baseline de metricas (Performance, bundle, Lighthouse) | @qa + @dev | Antes da Onda 0 |
| 6 | DB-H02: Verificar se migration com senha rodou em producao | @data-engineer | Imediato |

---

### Change Log

| Data | Alteracao | Autor |
|------|-----------|-------|
| 2026-01-29 | Epic criado com 7 stories | @pm |
| 2026-01-30 | Auditoria complementar: +13 debitos pos-calendar integration (total: 74). Atualizado orcamento para R$ 27.375 (~182.5h) | @dev |

---

*Epic gerado por @pm -- Synkra AIOS v2.0*
*Baseado no Technical Debt Assessment FINAL (61 debitos, ~164h) e Executive Report (R$ 24.600)*
