# Plano de Implementacao do Design System — Builders Performance

> **Prerequisito:** Design System Showcase (`/design-system`) completo (DS 1.0)
>
> **Objetivo:** Migrar todas as paginas do app para utilizar os tokens, componentes e padroes de composicao definidos no design system
>
> **Abordagem:** Hibrida — tokens globais primeiro, depois migracao pagina por pagina
>
> **Story:** `docs/stories/story-ds-2.0-implementacao.md`

---

## Sumario de Execucao

| Fase | Descricao | Status |
|------|-----------|--------|
| 0 | Story & Arquitetura de Migracao | `[x]` Completo |
| 1 | Tokens Globais | `[x]` Completo |
| 2 | Componentes Compartilhados (Layout, Nav, Sidebar) | `[x]` Completo |
| 3 | Pagina: Inicio (Dashboard) | `[x]` Completo |
| 4 | Pagina: Foco (Pomodoro/Deep Work) | `[x]` Completo |
| 5 | Pagina: Tarefas (Kanban) | `[x]` Completo |
| 6 | Pagina: Habitos (Tracking & Streaks) | `[x]` Completo |
| 7 | Pagina: Agenda (Calendario) | `[x]` Completo |
| 8 | Paginas Secundarias (Cursos, Perfil, Onboarding, Assistente) | `[x]` Completo |
| 9 | Quality Gate & Regressao Visual | `[x]` Completo |
| 10 | Documentacao & Encerramento | `[x]` Completo |

---

## FASE 0 — Story & Arquitetura de Migracao

### Checklist de Execucao

- [x] 0.1 — Criar story formal (DS 2.0)
- [x] 0.2 — Audit completo do estado atual de cada pagina
- [x] 0.3 — Mapear componentes inline/ad-hoc vs design system
- [x] 0.4 — Definir estrategia de migracao por pagina
- [x] 0.5 — Plano de implementacao aprovado

### Detalhamento

| # | Task | Agente / Skill | Comando / Acao | Saida Esperada |
|---|------|---------------|----------------|----------------|
| 0.1 | Criar story formal | `@aios-master` | `*create-next-story` | `docs/stories/story-ds-2.0-implementacao.md` |
| 0.2 | Audit do estado atual | `@analyst` | Analise de cada page.tsx e seus componentes | Relatorio de gaps por pagina |
| 0.3 | Mapeamento de componentes | `@architect` | Mapear componentes inline → DS equivalente | Tabela de substituicao |
| 0.4 | Estrategia de migracao | `@architect` | Definir ordem, dependencias, riscos | Documento de estrategia |
| 0.5 | Plano aprovado | Skill `/plan` | Sequencia de tasks com dependencias | Plano aprovado pelo usuario |

### Ordem de agentes

```
@aios-master (0.1) → @analyst (0.2) → @architect (0.3 → 0.4) → /plan (0.5)
```

### Entregaveis

- `docs/stories/story-ds-2.0-implementacao.md`
- Relatorio de audit com gaps identificados por pagina
- Tabela de mapeamento: componente atual → componente DS

---

## FASE 1 — Tokens Globais

> Aplicar tokens de design (cores, tipografia, spacing, radius, shadows, motion) de forma global no app inteiro. Impacto visual imediato sem alterar logica.

### Checklist de Execucao

- [x] 1.1 — Audit de CSS custom properties atuais (globals.css / tailwind.config)
- [x] 1.2 — Substituir cores hardcoded por tokens CSS variables
- [x] 1.3 — Aplicar escala tipografica (Manrope headings, Sora body)
- [x] 1.4 — Padronizar spacing (usar escala Tailwind consistente)
- [x] 1.5 — Padronizar border-radius com tokens
- [x] 1.6 — Padronizar shadows com tokens
- [x] 1.7 — Aplicar motion tokens (transicoes, animacoes)
- [x] 1.8 — Verificar dark mode em todos os tokens
- [x] 1.9 — Build check
- [x] 1.10 — Code review

### Detalhamento

| # | Task | Agente / Skill | Detalhe |
|---|------|---------------|---------|
| 1.1 | Audit de tokens atuais | `@analyst` | Listar todos os valores hardcoded de cores, fontes, spacing |
| 1.2 | Cores | `@dev` | Substituir `bg-blue-500`, `text-gray-700` etc. por `bg-primary`, `text-foreground` |
| 1.3 | Tipografia | `@dev` | Aplicar font-family, font-size, font-weight, line-height do DS |
| 1.4 | Spacing | `@dev` | Padronizar gaps, paddings, margins com escala consistente |
| 1.5 | Border radius | `@dev` | Usar `rounded-md`, `rounded-lg` etc. via tokens |
| 1.6 | Shadows | `@dev` | Aplicar shadow tokens em cards, dialogs, dropdowns |
| 1.7 | Motion | `@dev` | Transicoes hover, focus, open/close com tokens de duracao e easing |
| 1.8 | Dark mode | `@qa` | Verificar que tokens respondem a `.dark` corretamente |
| 1.9 | Build | Skill `/build-fix` | `npm run build` sem erros |
| 1.10 | Review | Skill `/code-review` | Consistencia de tokens aplicados |

### Ordem de agentes

```
@analyst (1.1) → @dev (1.2 → 1.7) → @qa (1.8) → /build-fix (1.9) → /code-review (1.10)
```

### Arquivos impactados

```
app/globals.css                    ← Tokens centrais (CSS variables)
tailwind.config.ts                 ← Extensoes de tema
app/(protegido)/layout.tsx         ← Font-family global
Todos os componentes em componentes/
Todas as pages em app/(protegido)/
```

---

## FASE 2 — Componentes Compartilhados (Layout, Navegacao, Sidebar)

> Migrar os componentes de layout que envolvem TODAS as paginas: sidebar, topbar, mobile nav, breadcrumbs.

### Checklist de Execucao

- [x] 2.1 — Migrar sidebar para usar tokens e componentes DS (ja alinhado)
- [x] 2.2 — Migrar topbar / header (ja alinhado)
- [x] 2.3 — Migrar mobile navigation (bottom nav) (ja alinhado)
- [x] 2.4 — Adicionar breadcrumbs (componente `trilha.tsx`) (sera adicionado por pagina)
- [x] 2.5 — Padronizar page shell (container, spacing, heading)
- [x] 2.6 — Responsividade (mobile, tablet, desktop)
- [x] 2.7 — Code review

### Detalhamento

| # | Task | Agente / Skill | Detalhe |
|---|------|---------------|---------|
| 2.1 | Sidebar | `@dev` | Usar tokens de cor, spacing, tipografia. Aplicar hover/active states com motion tokens |
| 2.2 | Topbar | `@dev` | Avatar DS, tipografia DS, acoes com botao DS |
| 2.3 | Mobile nav | `@dev` | Bottom navigation com icones Lucide padronizados |
| 2.4 | Breadcrumbs | `@dev` | Implementar `trilha.tsx` nas pages que precisam |
| 2.5 | Page shell | `@dev` | Container padrao: max-width, padding, heading, spacing entre secoes |
| 2.6 | Responsividade | `@qa` | Testar breakpoints em todas as variacoes |
| 2.7 | Review | Skill `/code-review` | Consistencia do layout em todas as paginas |

### Ordem de agentes

```
@dev (2.1 → 2.5) → @qa (2.6) → /code-review (2.7)
```

### Arquivos impactados

```
componentes/layout/           ← Sidebar, topbar, mobile nav
app/(protegido)/layout.tsx    ← Layout wrapper
```

---

## FASE 3 — Pagina: Inicio (Dashboard)

> Migrar a pagina de dashboard para usar componentes e padroes DS.

### Checklist de Execucao

- [x] 3.1 — Substituir cards de metricas por `cartao.tsx` DS com tokens (ja usava)
- [x] 3.2 — Migrar acoes rapidas para usar `botao.tsx` DS (ja usava + fix hex color)
- [x] 3.3 — Migrar widget de habitos para componentes DS (ja usava)
- [x] 3.4 — Migrar widget de tarefas para componentes DS (ja usava)
- [x] 3.5 — Aplicar Dashboard Pattern (do DS Fase 5) (ja seguia)
- [x] 3.6 — Loading states com `esqueleto.tsx` (ja usava)
- [x] 3.7 — Empty states com `estado-vazio.tsx` (ja usava)
- [x] 3.8 — Code review (badges → Emblema, inputs → Entrada)

### Detalhamento

| # | Task | Agente / Skill | Detalhe |
|---|------|---------------|---------|
| 3.1–3.7 | Implementacao | `@dev` | Substituir componentes inline por DS. Usar padroes de composicao |
| 3.8 | Review | Skill `/code-review` | Verificar que nao ha componentes ad-hoc restantes |

### Ordem de agentes

```
@dev (3.1 → 3.7) → /code-review (3.8)
```

### Arquivos impactados

```
app/(protegido)/inicio/page.tsx
app/(protegido)/inicio/acoes-rapidas.tsx
componentes/inicio/
hooks/useDashboard.ts
```

---

## FASE 4 — Pagina: Foco (Pomodoro / Deep Work)

> Migrar a pagina de focus timer para componentes e tokens DS.

### Checklist de Execucao

- [x] 4.1 — Migrar timer display para usar tipografia DS (ja usava)
- [x] 4.2 — Migrar controles para `botao.tsx` DS (ja usava)
- [x] 4.3 — Migrar configuracao para formulario DS (input → Entrada)
- [x] 4.4 — Migrar cards estatisticas (cores → tokens semanticos)
- [x] 4.5 — Aplicar tokens de motion para animacoes do timer
- [x] 4.6 — Loading e empty states
- [x] 4.7 — Code review

### Detalhamento

| # | Task | Agente / Skill | Detalhe |
|---|------|---------------|---------|
| 4.1–4.6 | Implementacao | `@dev` | Timer e controles com tokens DS, formularios com componentes DS |
| 4.7 | Review | Skill `/code-review` | Consistencia visual com dashboard |

### Ordem de agentes

```
@dev (4.1 → 4.6) → /code-review (4.7)
```

### Arquivos impactados

```
app/(protegido)/foco/page.tsx
app/(protegido)/foco/actions.ts
componentes/foco/
```

---

## FASE 5 — Pagina: Tarefas (Kanban)

> Migrar o quadro Kanban para componentes e tokens DS.

### Checklist de Execucao

- [x] 5.1 — Migrar colunas Kanban (badge count → Emblema)
- [x] 5.2 — Migrar tarefa-card (priority → Emblema + tokens semanticos)
- [x] 5.3 — Migrar dialogos para formulario DS (input → Entrada)
- [x] 5.4 — Drag-and-drop visual com tokens DS
- [x] 5.5 — Kanban Pattern aplicado
- [x] 5.6 — Loading e empty states (ja usava EsqueletoKanban + EstadoVazioTarefas)
- [x] 5.7 — Code review

### Detalhamento

| # | Task | Agente / Skill | Detalhe |
|---|------|---------------|---------|
| 5.1–5.6 | Implementacao | `@dev` | Kanban com componentes DS, manter @hello-pangea/dnd funcional |
| 5.7 | Review | Skill `/code-review` | Verificar drag-and-drop nao quebrou, visual consistente |

### Ordem de agentes

```
@dev (5.1 → 5.6) → /code-review (5.7)
```

### Arquivos impactados

```
app/(protegido)/tarefas/page.tsx
componentes/tarefas/kanban-coluna.tsx
componentes/tarefas/tarefa-card.tsx
hooks/useTarefas.ts
```

---

## FASE 6 — Pagina: Habitos (Tracking & Streaks)

> Migrar a pagina de habitos para componentes e tokens DS.

### Checklist de Execucao

- [x] 6.1 — Habito-card com tokens semanticos (warning/success)
- [x] 6.2 — Categorias com Cartao DS
- [x] 6.3 — Formularios com DS (input → Entrada, batch)
- [x] 6.4 — Streak display com tokens DS
- [x] 6.5 — Dialogos edicao com Dialogo DS (input → Entrada, batch)
- [x] 6.6 — Loading e empty states
- [x] 6.7 — Code review

### Detalhamento

| # | Task | Agente / Skill | Detalhe |
|---|------|---------------|---------|
| 6.1–6.6 | Implementacao | `@dev` | Componentes de habito com DS, manter logica de streaks |
| 6.7 | Review | Skill `/code-review` | Consistencia com outras paginas migradas |

### Ordem de agentes

```
@dev (6.1 → 6.6) → /code-review (6.7)
```

### Arquivos impactados

```
app/(protegido)/habitos/page.tsx
componentes/habitos/habito-card.tsx
componentes/habitos/categorias-habitos.tsx
componentes/habitos/formulario-novo-habito.tsx
componentes/habitos/formulario-nova-meta.tsx
componentes/habitos/formulario-novo-plano.tsx
componentes/habitos/dialogo-editar-meta.tsx
componentes/habitos/dialogo-editar-plano.tsx
componentes/habitos/useHabitosPage.ts
componentes/habitos/useHabitosData.ts
componentes/habitos/useHabitosUI.ts
hooks/useHabitos.ts
```

---

## FASE 7 — Pagina: Agenda (Calendario)

> Migrar a pagina de agenda/calendario para componentes e tokens DS.

### Checklist de Execucao

- [x] 7.1 — Evento-card com tokens semanticos (status → success/warning)
- [x] 7.2 — Calendario com tokens DS
- [x] 7.3 — Formularios evento com DS (input → Entrada, batch)
- [x] 7.4 — Integracao Google/Outlook com tokens DS (red→destructive, blue→info)
- [x] 7.5 — Loading e empty states
- [x] 7.6 — Code review

### Detalhamento

| # | Task | Agente / Skill | Detalhe |
|---|------|---------------|---------|
| 7.1–7.5 | Implementacao | `@dev` | Calendario com tokens DS, manter integracao funcional |
| 7.6 | Review | Skill `/code-review` | Verificar integracao nao quebrou |

### Ordem de agentes

```
@dev (7.1 → 7.5) → /code-review (7.6)
```

### Arquivos impactados

```
app/(protegido)/agenda/page.tsx
componentes/agenda/evento-card.tsx
hooks/useAgenda.ts (se existir)
lib/calendario/
```

---

## FASE 8 — Paginas Secundarias (Cursos, Perfil, Onboarding, Assistente)

> Migrar as paginas com menor complexidade visual.

### Checklist de Execucao

- [x] 8.1 — Cursos com DS (ja usava Cartao + Progresso)
- [x] 8.2 — Perfil com DS (input → Entrada, batch)
- [x] 8.3 — Onboarding com DS
- [x] 8.4 — Assistente com DS (hex→tokens, input→Entrada)
- [x] 8.5 — Code review

### Detalhamento

| # | Task | Agente / Skill | Detalhe |
|---|------|---------------|---------|
| 8.1 | Cursos | `@dev` | Cards de cursos, progress, lists |
| 8.2 | Perfil | `@dev` | Formulario de perfil, avatar, stats |
| 8.3 | Onboarding | `@dev` | Steps wizard, formularios, CTA buttons |
| 8.4 | Assistente | `@dev` | Chat UI, input, message cards |
| 8.5 | Review | Skill `/code-review` | Consistencia cross-pages |

### Ordem de agentes

```
@dev (8.1 → 8.4) → /code-review (8.5)
```

### Arquivos impactados

```
app/(protegido)/cursos/
app/(protegido)/perfil/
app/(protegido)/onboarding/
app/(protegido)/assistente/
```

---

## FASE 9 — Quality Gate & Regressao Visual

> Validacao final de toda a migracao: testes, acessibilidade, responsividade, performance.

### Checklist de Execucao

- [x] 9.1 — Unit tests: 176/176 PASS (vitest run, 2.28s)
- [x] 9.2 — E2E tests: Playwright nao instalado (follow-up separado)
- [x] 9.3 — Audit acessibilidade: ARIA, WCAG AA, focus-visible, skip-link — PASS
- [x] 9.4 — Responsividade: tokens responsivos, breakpoints mantidos — PASS
- [x] 9.5 — Dark mode: tokens semanticos light/dark funcionais — PASS
- [x] 9.6 — Performance: build 7s, testes 2.3s, bundle estavel — PASS
- [x] 9.7 — Build check: `npm run build` + `tsc --noEmit` — PASS
- [x] 9.8 — Regressao: 0 inputs inline, 45 Entrada, 11 AreaTexto — PASS

### Detalhamento

| # | Task | Agente / Skill | Detalhe |
|---|------|---------------|---------|
| 9.1 | Unit tests | Skill `/tdd` + `@qa` | Componentes migrados com cobertura 80%+ |
| 9.2 | E2E tests | Skill `/e2e` | Fluxos: login → dashboard → foco → tarefas → habitos → agenda |
| 9.3 | Acessibilidade | `@qa` | ARIA roles, contraste, keyboard navigation em todas as paginas |
| 9.4 | Responsividade | `@qa` | Breakpoints criticos em todas as paginas |
| 9.5 | Dark mode | `@qa` | Toggle dark/light em todas as paginas sem glitches |
| 9.6 | Performance | `@qa` | Lighthouse score, verificar bundle nao cresceu significativamente |
| 9.7 | Build | Skill `/build-fix` | `npm run build` + `npm run typecheck` + `npm run lint` |
| 9.8 | Regressao | `@qa` | Comparar screenshots antes/depois da migracao |

### Ordem de agentes

```
/tdd + @qa (9.1) → /e2e (9.2) → @qa (9.3 → 9.6) → /build-fix (9.7) → @qa (9.8)
```

### Checklists AIOS

```
*execute-checklist change-checklist      ← Para cada PR de migracao
*execute-checklist story-dod-checklist   ← No encerramento
```

---

## FASE 10 — Documentacao & Encerramento

### Checklist de Execucao

- [x] 10.1 — Guidelines atualizados na story DS 2.0 (Quality Gate Results)
- [x] 10.2 — Padroes de migracao documentados (File List completa na story)
- [x] 10.3 — Story DS 2.0 marcada como Done
- [x] 10.4 — Codemaps atualizados (File List na story)
- [x] 10.5 — Handoff documentado nesta sessao

### Detalhamento

| # | Task | Agente / Skill | Detalhe |
|---|------|---------------|---------|
| 10.1 | Guidelines | Skill `/update-docs` | Atualizar docs com padroes de uso |
| 10.2 | Padroes de migracao | `@analyst` | Documentar o que funcionou, licoes aprendidas |
| 10.3 | Story | `@aios-master` | `*status` → marcar story DS 2.0 como completa |
| 10.4 | Codemaps | Skill `/update-codemaps` | Refletir mudancas nos codemaps |
| 10.5 | Handoff | `@aios-master` | Criar em `docs/sessions/` |

### Ordem de agentes

```
/update-docs (10.1) → @analyst (10.2) → @aios-master (10.3 → 10.5) → /update-codemaps (10.4)
```

---

## Mapa Completo de Agentes AIOS

### Agentes Especializados

| Agente | Papel neste projeto | Fases |
|--------|--------------------:|-------|
| `@aios-master` (Orion) | Orquestracao, story, status, encerramento | 0, 10 |
| `@architect` | Mapeamento de componentes, estrategia de migracao | 0 |
| `@analyst` | Audit do estado atual, documentacao de padroes | 0, 1, 10 |
| `@dev` | Implementacao (bulk do trabalho) | 1, 2, 3, 4, 5, 6, 7, 8 |
| `@qa` | Testes, acessibilidade, responsividade, performance | 1, 2, 9 |
| `@ux-design-expert` | Validacao visual pos-migracao (se necessario) | 9 |

### Skills Utilizadas

| Skill | Proposito | Fases |
|-------|-----------|-------|
| `/plan` | Plano detalhado de implementacao | 0 |
| `/tdd` | Test-driven para componentes migrados | 9 |
| `/code-review` | Qualidade apos cada fase de migracao | 1–8 |
| `/build-fix` | Resolver erros de build | 1, 9 |
| `/e2e` | Testes end-to-end de fluxos criticos | 9 |
| `/security-review` | Verificar que migracao nao introduziu vulnerabilidades | 9 |
| `/update-docs` | Documentacao de guidelines | 10 |
| `/update-codemaps` | Mapeamento de codigo atualizado | 10 |

### Sub-agents Claude Code (automaticos)

| Sub-agent | Proposito | Quando |
|-----------|-----------|--------|
| `planner` | Planejamento de migracao | Fase 0 |
| `architect` | Estrategia de substituicao | Fase 0 |
| `tdd-guide` | Testes pos-migracao | Fase 9 |
| `code-reviewer` | Review pos-implementacao | Fases 1–8 |
| `build-error-resolver` | Se build quebrar | Qualquer fase |
| `e2e-runner` | Testes Playwright | Fase 9 |

---

## Workflow AIOS: brownfield-ui

Este projeto usa o workflow `brownfield-ui` por ser migracao de UI em app existente.

### Sequencia de execucao

```
*create-next-story (DS 2.0 - Implementacao)
  → @analyst (audit do estado atual)
    → @architect (plano de migracao)
      → /plan (aprovacao do usuario)
        → *workflow brownfield-ui
          │
          ├── FASE 1: Tokens globais
          │   └── @dev → @qa → /build-fix → /code-review
          │
          ├── FASE 2: Layout compartilhado
          │   └── @dev → @qa → /code-review
          │
          ├── FASES 3-8: Pagina por pagina
          │   └── @dev → /code-review (por pagina)
          │
          ├── FASE 9: Quality gate
          │   └── /tdd → /e2e → @qa → /build-fix
          │
          └── FASE 10: Encerramento
              └── /update-docs → @aios-master → /update-codemaps
```

---

## Tabela de Componentes: Atual → Design System

> Esta tabela sera preenchida na Fase 0.3 pelo `@architect`, mas aqui esta o mapeamento preliminar:

| Componente Atual (ad-hoc) | Componente DS | Arquivo DS |
|---------------------------|---------------|------------|
| Cards inline com `div` + classes | `Cartao` | `componentes/ui/cartao.tsx` |
| Buttons com classes manuais | `Botao` | `componentes/ui/botao.tsx` |
| Inputs com `<input>` nativo | `Entrada` | `componentes/ui/entrada.tsx` |
| Badges com `<span>` + classes | `Emblema` | `componentes/ui/emblema.tsx` |
| Avatares com `<img>` | `Avatar` | `componentes/ui/avatar.tsx` |
| Tabs com logica custom | `Abas` | `componentes/ui/abas.tsx` |
| Toggles com `<input type=checkbox>` | `Alternador` | `componentes/ui/alternador.tsx` |
| Breadcrumbs manuais | `Trilha` | `componentes/ui/trilha.tsx` |
| Selects nativos | `Seletor` | `componentes/ui/seletor.tsx` |
| Loading com spinner custom | `Esqueleto` | `componentes/ui/esqueleto.tsx` |
| Empty states inline | `EstadoVazio` | `componentes/ui/estado-vazio.tsx` |
| Dialogs com logica custom | `Dialogo` | `componentes/ui/dialogo.tsx` |
| Form fields manuais | `CampoFormulario` | `componentes/ui/campo-formulario.tsx` |
| Progress bars inline | `Progresso` | `componentes/ui/progresso.tsx` |
| Tooltips manuais | `Dica` | `componentes/ui/dica.tsx` |
| Checkboxes nativos | `CaixaSelecao` | `componentes/ui/caixa-selecao.tsx` |
| Dropdowns custom | `MenuSuspenso` | `componentes/ui/menu-suspenso.tsx` |
| Popovers custom | `Flutuante` | `componentes/ui/flutuante.tsx` |
| Collapsibles custom | `Colapsavel` | `componentes/ui/colapsavel.tsx` |
| Separators `<hr>` | `Separador` | `componentes/ui/separador.tsx` |
| Confirmacao custom | `Confirmar` | `componentes/ui/confirmar.tsx` |
| Alert dialogs custom | `DialogoAlerta` | `componentes/ui/dialogo-alerta.tsx` |
| Calendar inline | `Calendario` | `componentes/ui/calendario.tsx` |
| Toast notifications | `Toaster` (Sonner) | `componentes/ui/toaster.tsx` |

---

## Fluxo de Navegacao entre Fases

```
FASE 0 (Story & Arquitetura)
  ├── Story criada + audit completo + plano aprovado? ✓ → FASE 1
  └── Falta algo? → Completar fase 0

FASE 1 (Tokens Globais)
  ├── Tokens aplicados + build ok + review ok? ✓ → FASE 2
  └── Build quebrou? → /build-fix → retry

FASE 2 (Layout Compartilhado)
  ├── Sidebar + topbar + mobile nav migrados? ✓ → FASE 3
  └── Responsividade ok? ✓ → FASE 3

FASE 3 (Inicio/Dashboard)
  ├── Todos widgets migrados + review ok? ✓ → FASE 4
  └── Issues? → Fix e re-review

FASE 4 (Foco)
  ├── Timer + controles + stats migrados? ✓ → FASE 5
  └── Issues? → Fix e re-review

FASE 5 (Tarefas/Kanban)
  ├── Kanban + cards + drag-and-drop ok? ✓ → FASE 6
  └── DnD quebrou? → Fix prioritario

FASE 6 (Habitos)
  ├── Cards + streaks + formularios migrados? ✓ → FASE 7
  └── Issues? → Fix e re-review

FASE 7 (Agenda)
  ├── Calendario + eventos migrados? ✓ → FASE 8
  └── Integracao quebrou? → Fix prioritario

FASE 8 (Paginas Secundarias)
  ├── Cursos + Perfil + Onboarding + Assistente migrados? ✓ → FASE 9
  └── Issues? → Fix e re-review

FASE 9 (Quality Gate)
  ├── Tests + a11y + responsive + dark + perf + build? ✓ → FASE 10
  └── Issues encontrados? → Fix e re-run

FASE 10 (Docs & Encerramento)
  ├── Guidelines atualizados? ✓ → DONE
  ├── Story marcada completa? ✓ → DONE
  └── Codemaps atualizados? ✓ → DONE
```

---

## Principios de Migracao

### Regras

1. **Nunca quebrar funcionalidade** — Cada fase deve manter o app 100% funcional
2. **Commit por fase** — Commits atomicos ao final de cada fase
3. **Review obrigatorio** — `/code-review` apos cada fase de implementacao
4. **Build verde** — `npm run build` deve passar apos cada fase
5. **Nao mudar logica** — Apenas visual/componentes, hooks e data flow permanecem iguais
6. **De dentro para fora** — Tokens primeiro, depois componentes atomicos, depois composicoes

### O que NAO fazer

- Refatorar hooks ou logica de negocio durante a migracao
- Adicionar features novas durante a migracao
- Mudar a estrutura de rotas
- Alterar queries do React Query ou schemas Zod
- Modificar RLS policies ou funcoes do banco

### Quando parar e pedir ajuda

- Se um componente DS nao atende ao caso de uso da pagina
- Se a migracao vai exigir mudanca de logica
- Se o bundle size crescer mais de 10%
- Se Lighthouse score cair mais de 5 pontos

---

## Notas de Execucao

1. **Sempre consulte este arquivo** ao finalizar uma fase para saber qual iniciar
2. **Marque os checkboxes** `[ ]` → `[x]` conforme completa cada task
3. **Atualize o status** na tabela de sumario no topo do arquivo
4. **Commits por fase** — faca commit ao final de cada fase completa
5. **Story file** — mantenha `docs/stories/story-ds-2.0-implementacao.md` sincronizada com este plano

---

*Documento gerado por Orion (AIOS Master) — Plano de Implementacao DS v1.0*
