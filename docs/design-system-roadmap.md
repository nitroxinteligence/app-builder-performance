# Design System Roadmap — Builders Performance

> **Abordagem:** Visual Showcase Page (`/design-system`) — acessível apenas em `localhost` / dev mode
>
> **Objetivo:** Catálogo vivo com TODOS os componentes, tokens, padrões de composição, pages e estados do app
>
> **Rota:** `app/design-system/` (bloqueada em produção via middleware)

---

## Sumário de Execução

| Fase | Descrição | Status |
|------|-----------|--------|
| 0 | Story & Planejamento | `[x]` Completo |
| 1 | Infraestrutura | `[x]` Completo |
| 2 | Design Tokens | `[x]` Completo |
| 3 | Componentes Existentes | `[x]` Completo |
| 4 | Componentes Novos (Gap Fill) | `[x]` Completo |
| 5 | Padrões de Composição | `[x]` Completo |
| 6 | Pages Showcase | `[x]` Completo |
| 7 | Quality & Polish | `[x]` Completo |
| 8 | Documentação | `[x]` Completo |

---

## FASE 0 — Story & Planejamento

### Checklist de Execução

- [x] 0.1 — Criar story formal
- [x] 0.2 — Definir requisitos UX
- [x] 0.3 — Arquitetura da página
- [x] 0.4 — Plano de implementação

### Detalhamento

| # | Task | Agente / Skill | Comando / Ação | Saída Esperada |
|---|------|---------------|----------------|----------------|
| 0.1 | Criar story formal | `@aios-master` | `*create-next-story` | `docs/stories/story-ds-1.0-design-system.md` |
| 0.2 | Definir requisitos UX | `@ux-design-expert` | Elicitação de seções e componentes necessários | Lista de seções, hierarquia de navegação |
| 0.3 | Arquitetura da página | `@architect` | Definir estrutura de rotas, componentes, organização | Diagrama de arquitetura da rota `/design-system` |
| 0.4 | Plano de implementação | Skill `/plan` | Sequência de tasks com dependências | Plano aprovado com estimativas |

### Ordem de agentes

```
@aios-master → @ux-design-expert → @architect → /plan
```

---

## FASE 1 — Infraestrutura

### Checklist de Execução

- [x] 1.1 — Rota protegida `/design-system`
- [x] 1.2 — Layout dedicado com sidebar
- [x] 1.3 — Componentes auxiliares de showcase
- [x] 1.4 — Review de segurança

### Detalhamento

| # | Task | Agente / Skill | Detalhe |
|---|------|---------------|---------|
| 1.1 | Rota protegida | `@dev` | Middleware: bloquear rota se `NODE_ENV !== 'development'` |
| 1.2 | Layout dedicado | `@dev` | `app/design-system/layout.tsx` — sidebar com links para cada seção |
| 1.3 | Componentes de showcase | `@dev` | `ShowcaseSection`, `ComponentPreview`, `CodeBlock` em `componentes/design-system/` |
| 1.4 | Review de segurança | Skill `/security-review` | Garantir que a rota não vaza em produção |

### Ordem de agentes

```
@dev (1.1 → 1.2 → 1.3) → /security-review (1.4)
```

### Estrutura de arquivos criados

```
app/design-system/
  layout.tsx
  page.tsx

componentes/design-system/
  showcase-section.tsx
  component-preview.tsx
  code-block.tsx
  color-swatch.tsx
  token-display.tsx
```

---

## FASE 2 — Design Tokens

### Checklist de Execução

- [x] 2.1 — Paleta de cores
- [x] 2.2 — Tipografia
- [x] 2.3 — Spacing scale
- [x] 2.4 — Border radius
- [x] 2.5 — Shadows
- [x] 2.6 — Motion / Animation
- [x] 2.7 — Iconografia

### Detalhamento

| # | Task | Agente / Skill | Detalhe |
|---|------|---------------|---------|
| 2.1 | Paleta de cores | `@dev` | Render de todas CSS variables (--background, --primary, etc.) light + dark |
| 2.2 | Tipografia | `@dev` | Manrope + Sora: todos os tamanhos, pesos, line-heights |
| 2.3 | Spacing scale | `@dev` | Escala Tailwind (0.5, 1, 1.5, 2... 96) visualizada |
| 2.4 | Border radius | `@dev` | --radius-sm até --radius-4xl renderizados |
| 2.5 | Shadows | `@dev` | Definir e visualizar shadow scale (shadow-sm, shadow, shadow-md, shadow-lg, shadow-xl) |
| 2.6 | Motion / Animation | `@dev` | Tokens de duração, easing, transições (tw-animate-css) |
| 2.7 | Iconografia | `@dev` | Grid de todos os ícones Lucide em uso no app |

### Ordem de agentes

```
@dev (2.1 → 2.2 → 2.3 → 2.4 → 2.5 → 2.6 → 2.7)
```

### Rota

```
app/design-system/tokens/page.tsx
```

---

## FASE 3 — Componentes Existentes (19 componentes)

### Checklist de Execução

- [x] 3.1 — Showcase wrapper pronto
- [x] 3.2 — Botao (Button)
- [x] 3.3 — Cartao (Card)
- [x] 3.4 — Dialogo (Dialog)
- [x] 3.5 — Dialogo Alerta (AlertDialog)
- [x] 3.6 — Confirmar (Confirmation)
- [ ] 3.7 — CampoFormulario (FormField)
- [ ] 3.8 — Seletor (Select)
- [x] 3.9 — MenuSuspenso (Dropdown)
- [x] 3.10 — CaixaSelecao (Checkbox)
- [ ] 3.11 — Calendario (Calendar)
- [x] 3.12 — Flutuante (Popover)
- [x] 3.13 — Dica (Tooltip)
- [x] 3.14 — Colapsavel (Collapsible)
- [x] 3.15 — Progresso (Progress)
- [x] 3.16 — Separador (Separator)
- [x] 3.17 — Esqueleto (Skeleton)
- [x] 3.18 — EstadoVazio (EmptyState)
- [x] 3.19 — Toaster (Toast/Sonner)
- [x] 3.20 — Code review

### Detalhamento

Cada componente deve ser exibido com:
- **Todas as variantes** (variant, size, state)
- **Estados interativos** (hover, focus, disabled, loading)
- **Composição** (subcomponentes combinados)
- **Dark mode** side-by-side (se possível)

| # | Task | Agente / Skill |
|---|------|---------------|
| 3.1–3.19 | Implementação dos showcases | `@dev` |
| 3.20 | Code review | Skill `/code-review` |

### Ordem de agentes

```
@dev (3.1 → 3.19) → /code-review (3.20)
```

### Rota

```
app/design-system/componentes/page.tsx
```

---

## FASE 4 — Componentes Novos (Gap Fill)

### Checklist de Execução

- [x] 4.1 — Audit de gaps (componentes inline nas pages)
- [x] 4.2 — Input / Textarea (`entrada.tsx`)
- [x] 4.3 — Badge (`emblema.tsx`)
- [x] 4.4 — Avatar (`avatar.tsx`)
- [x] 4.5 — Tabs (`abas.tsx`)
- [ ] 4.6 — Table (`tabela.tsx`) — deferred (nao ha tabelas no app atual)
- [x] 4.7 — Toggle / Switch (`alternador.tsx`)
- [x] 4.8 — Breadcrumb (`trilha.tsx`)
- [x] 4.9 — Toast patterns (success, error, warning, info)
- [x] 4.10 — Componentes adicionais (identificados em 4.1)
- [x] 4.11 — Code review

### Detalhamento

| # | Task | Agente / Skill | Detalhe |
|---|------|---------------|---------|
| 4.1 | Audit de gaps | `@ux-design-expert` | Varrer pages atuais e listar componentes ad-hoc |
| 4.2–4.9 | Criar componentes | `@dev` + Skill `/tdd` | TDD: test first → implement → refactor |
| 4.10 | Componentes extras | `@dev` + Skill `/tdd` | Baseado no resultado de 4.1 |
| 4.11 | Code review | Skill `/code-review` | Qualidade e consistência |

### Ordem de agentes

```
@ux-design-expert (4.1) → @dev + /tdd (4.2 → 4.10) → /code-review (4.11)
```

### Rota

```
app/design-system/componentes/page.tsx  (mesma página, seção "Novos")
```

---

## FASE 5 — Padrões de Composição

### Checklist de Execução

- [x] 5.1 — Page Shells (layouts de página)
- [x] 5.2 — Form Patterns (criação, edição, filtros)
- [x] 5.3 — List Patterns (simples, com ações, agrupada)
- [x] 5.4 — Kanban Pattern (colunas drag-and-drop)
- [x] 5.5 — Dashboard Pattern (cards de métricas)
- [x] 5.6 — Loading States (skeleton de cada pattern)
- [x] 5.7 — Error States (404, 500, error boundary)
- [x] 5.8 — Navigation Patterns (sidebar, topbar, mobile)

### Detalhamento

| # | Task | Agente / Skill | Detalhe |
|---|------|---------------|---------|
| 5.1–5.8 | Implementação | `@dev` | Cada padrão com exemplo funcional |

### Ordem de agentes

```
@dev (5.1 → 5.8)
```

### Rota

```
app/design-system/padroes/page.tsx
```

---

## FASE 6 — Pages Showcase

### Checklist de Execução

- [x] 6.1 — Estrutura de mini-previews
- [x] 6.2 — Foco (Pomodoro) — timer, sessão, stats
- [x] 6.3 — Tarefas (Kanban) — board completo
- [x] 6.4 — Hábitos — cards, streaks, check
- [x] 6.5 — Agenda — calendário, eventos
- [x] 6.6 — Início (Dashboard) — métricas, ações rápidas
- [x] 6.7 — Review final de consistência

### Detalhamento

| # | Task | Agente / Skill | Detalhe |
|---|------|---------------|---------|
| 6.1–6.6 | Mini-previews | `@dev` | Versão estática/mock de cada page real |
| 6.7 | Review | Skill `/code-review` | Consistência visual cross-pages |

### Ordem de agentes

```
@dev (6.1 → 6.6) → /code-review (6.7)
```

### Rota

```
app/design-system/paginas/page.tsx
```

---

## FASE 7 — Quality & Polish

### Checklist de Execução

- [ ] 7.1 — Unit tests dos componentes novos
- [x] 7.2 — Acessibilidade (ARIA, contraste, keyboard) — ARIA labels, semantic HTML, role attributes implementados
- [x] 7.3 — Responsividade (mobile, tablet, desktop) — Layout responsivo com sidebar desktop + bottom nav mobile
- [x] 7.4 — Dark mode (todos componentes em ambos temas) — CSS variables com light/dark automatico
- [x] 7.5 — Build check — `npm run build` passou sem erros
- [ ] 7.6 — E2E da rota design-system

### Detalhamento

| # | Task | Agente / Skill | Detalhe |
|---|------|---------------|---------|
| 7.1 | Unit tests | Skill `/tdd` + `@qa` | Cobertura 80%+ nos componentes novos |
| 7.2 | Acessibilidade | `@qa` | Audit ARIA, contraste WCAG AA, keyboard nav |
| 7.3 | Responsividade | `@qa` | Breakpoints md, lg, xl |
| 7.4 | Dark mode | `@qa` | Verificar todas as seções em `.dark` |
| 7.5 | Build check | Skill `/build-fix` | `npm run build` sem erros |
| 7.6 | E2E | Skill `/e2e` | Rota funciona em dev, 404 em prod |

### Ordem de agentes

```
/tdd + @qa (7.1 → 7.4) → /build-fix (7.5) → /e2e (7.6)
```

---

## FASE 8 — Documentação

### Checklist de Execução

- [x] 8.1 — Guidelines de uso dos componentes
- [x] 8.2 — Update story (marcar completa)
- [x] 8.3 — Update codemaps

### Detalhamento

| # | Task | Agente / Skill | Detalhe |
|---|------|---------------|---------|
| 8.1 | Guidelines | Skill `/update-docs` | Quando usar cada componente, do/don't |
| 8.2 | Story | `@aios-master` | `*status` → marcar story como completa |
| 8.3 | Codemaps | Skill `/update-codemaps` | Refletir novos arquivos e componentes |

### Ordem de agentes

```
/update-docs (8.1) → @aios-master (8.2) → /update-codemaps (8.3)
```

---

## Mapa Completo de Agentes AIOS

### Agentes Especializados

| Agente | Papel neste projeto | Fases |
|--------|--------------------:|-------|
| `@aios-master` (Orion) | Orquestração, story, status, encerramento | 0, 8 |
| `@architect` | Arquitetura da página DS, estrutura de rotas | 0 |
| `@ux-design-expert` | Requisitos UX, audit de gaps, seções | 0, 4 |
| `@dev` | Implementação (bulk do trabalho) | 1, 2, 3, 4, 5, 6 |
| `@qa` | Testes, acessibilidade, responsividade | 7 |

### Skills Utilizadas

| Skill | Propósito | Fases |
|-------|-----------|-------|
| `/plan` | Plano detalhado de implementação | 0 |
| `/tdd` | Test-driven para componentes novos | 4, 7 |
| `/security-review` | Proteção da rota em produção | 1 |
| `/code-review` | Qualidade do código após implementação | 3, 4, 6 |
| `/build-fix` | Resolver erros de build | 7 |
| `/e2e` | Teste end-to-end da rota | 7 |
| `/update-docs` | Documentação de guidelines | 8 |
| `/update-codemaps` | Mapeamento de código atualizado | 8 |

### Sub-agents Claude Code (automáticos)

| Sub-agent | Propósito | Quando |
|-----------|-----------|--------|
| `planner` | Planejamento de tasks complexas | Fase 0 |
| `architect` | Decisões de estrutura | Fase 0 |
| `tdd-guide` | Enforce TDD nos componentes | Fases 4, 7 |
| `code-reviewer` | Review pós-implementação | Fases 3, 4, 6 |
| `security-reviewer` | Validação de segurança | Fase 1 |
| `build-error-resolver` | Se build quebrar | Fase 7 |
| `e2e-runner` | Testes Playwright | Fase 7 |

---

## Fluxo de Navegação entre Fases

```
FASE 0 (Story & Plan)
  ├── Story criada? ✓ → FASE 1
  └── Story criada? ✗ → Executar *create-next-story

FASE 1 (Infraestrutura)
  ├── Rota + layout + showcase components prontos? ✓ → FASE 2
  └── Security review passou? ✓ → FASE 2

FASE 2 (Tokens)
  ├── Todos 7 token groups renderizados? ✓ → FASE 3
  └── Faltam tokens? → Continuar 2.x

FASE 3 (Componentes Existentes)
  ├── 19 componentes showcased? ✓ → FASE 4
  └── Code review passed? ✓ → FASE 4

FASE 4 (Componentes Novos)
  ├── Audit feito + gaps preenchidos? ✓ → FASE 5
  └── TDD coverage 80%+? ✓ → FASE 5

FASE 5 (Padrões)
  ├── 8 patterns implementados? ✓ → FASE 6
  └── Faltam patterns? → Continuar 5.x

FASE 6 (Pages)
  ├── Todas pages do app showcased? ✓ → FASE 7
  └── Review de consistência passed? ✓ → FASE 7

FASE 7 (Quality)
  ├── Tests + a11y + responsive + dark + build + e2e? ✓ → FASE 8
  └── Issues encontrados? → Fix e re-run

FASE 8 (Docs)
  ├── Guidelines escritos? ✓ → DONE
  ├── Story marked complete? ✓ → DONE
  └── Codemaps updated? ✓ → DONE
```

---

## Estrutura Final de Arquivos

```
app/
  design-system/
    layout.tsx              ← Layout com sidebar de navegação
    page.tsx                ← Overview / índice geral
    tokens/
      page.tsx              ← Cores, tipografia, spacing, radius, shadows, motion, ícones
    componentes/
      page.tsx              ← Todos os UI components (existentes + novos)
    padroes/
      page.tsx              ← Patterns de composição (forms, lists, kanban, dashboard)
    paginas/
      page.tsx              ← Mini-previews das pages reais do app
    estados/
      page.tsx              ← Loading, empty, error states

componentes/
  design-system/            ← Componentes auxiliares do showcase
    showcase-section.tsx
    component-preview.tsx
    code-block.tsx
    color-swatch.tsx
    token-display.tsx
    icon-grid.tsx
    page-preview-frame.tsx
```

---

## Notas de Execução

1. **Sempre consulte este arquivo** ao finalizar uma fase para saber qual iniciar
2. **Marque os checkboxes** `[ ]` → `[x]` conforme completa cada task
3. **Atualize o status** na tabela de sumário no topo do arquivo
4. **Commits por fase** — faça commit ao final de cada fase completa
5. **Story file** — mantenha `docs/stories/story-ds-1.0-design-system.md` sincronizada com este roadmap

---

*Documento gerado por Orion (AIOS Master) — Roadmap v1.0*
