# Story: Refatoracao God Components

**Story ID:** TD-4.0
**Epic:** EPIC-TD-001
**Status:** Draft
**Estimativa:** ~53h
**Prioridade:** CRITICAL
**Sprint Sugerido:** 4-5

---

## Objetivo

Maior esforco do epic, maior retorno. Dividir as 4 paginas gigantes (habitos: 2314 linhas, foco: 1281, tarefas: 1062, agenda: 863) em componentes menores, testaveis e performaticos. Extrair logica de estado do timer de foco (26 useState) para hooks dedicados. Padronizar formularios com react-hook-form + Zod. Ao final, nenhuma pagina excedera 400 linhas, cada sub-componente tera testes, e a experiencia de desenvolvimento sera dramaticamente melhorada.

## Debitos Incluidos

| ID | Debito | Severidade | Horas |
|----|--------|-----------|-------|
| FE-M02 | **Estado local descontrolado no Foco (26 useState)** -- Risco real de bugs no timer (feature core): glitches quando multiplos states atualizam, perda de contexto em modais, `sendBeacon` com estado fragmentado. | HIGH | 6-8h |
| FE-C01 | **God Components** -- 4 paginas violam limite de 800 linhas: `habitos/page.tsx` (2314), `foco/page.tsx` (1281), `tarefas/page.tsx` (1062), `agenda/page.tsx` (863). Re-renders excessivos causam lentidao perceptivel. | CRITICAL | 24-32h |
| FE-H01 | **Sem formularios estruturados** -- Existem labels, mas sem react-hook-form. Validacao inconsistente, estado manual via useState, falta de mensagens de erro inline. | HIGH | 8-12h |
| FE-NEW-01 | **God Component: acoes-rapidas.tsx (1065 linhas)** -- Componente criado pos-assessment contendo 4 modais de formularios + timer logic + acoes rapidas. Viola limite de 400 linhas. | HIGH | 4-6h |
| FE-NEW-02 | **formulario-habito.tsx (851 linhas)** -- Componente de formulario que excede limite de 800 linhas. Contem 4 formularios distintos em um unico arquivo. | MEDIUM | 2-3h |
| FE-NEW-03 | **useHabitosPage.ts (493 linhas)** -- Hook mistura estado de UI, data fetching e logica de negocios. Deveria ser separado em hooks menores por dominio. | MEDIUM | 2h |

## Tasks

### Bloco 1: Extracao de Hooks do Foco (FE-M02) -- PRIMEIRO
- [ ] Task 1: Auditar os 26 useState em `app/foco/page.tsx` e categorizar por dominio (timer, historico, sessao, UI)
- [ ] Task 2: Criar `hooks/useFocoTimer.ts` -- logica do timer: countdown, pause, resume, estado do Pomodoro/Deep Work
- [ ] Task 3: Criar `hooks/useFocoHistorico.ts` -- historico de sessoes, estatisticas diarias/semanais
- [ ] Task 4: Criar `hooks/useFocoSessao.ts` -- gerenciamento de sessao ativa, sendBeacon, complete/cancel
- [ ] Task 5: Refatorar `app/foco/page.tsx` para usar os 3 hooks extraidos
- [ ] Task 6: Verificar que o timer funciona identicamente (nenhuma regressao): start, pause, resume, complete, cancel
- [ ] Task 7: Verificar que `sendBeacon` funciona corretamente com estado dos hooks
- [ ] Task 8: Contar useState restantes no componente principal -- alvo: maximo 10

### Bloco 2: Dividir God Components (FE-C01) -- depende de Bloco 1 e CC-C01 (testes)
#### 2A: Foco (1281 linhas -> ~5 componentes)
- [ ] Task 9: Escrever testes snapshot e de comportamento para `foco/page.tsx` ANTES de refatorar
- [ ] Task 10: Criar `componentes/foco/timer-display.tsx` -- display do timer, controles play/pause/stop
- [ ] Task 11: Criar `componentes/foco/sessao-ativa.tsx` -- painel da sessao em andamento
- [ ] Task 12: Criar `componentes/foco/historico-sessoes.tsx` -- lista de sessoes anteriores
- [ ] Task 13: Criar `componentes/foco/estatisticas-foco.tsx` -- metricas diarias/semanais
- [ ] Task 14: Criar `componentes/foco/configuracao-timer.tsx` -- settings de Pomodoro/Deep Work
- [ ] Task 15: Refatorar `app/(protegido)/foco/page.tsx` para compor os sub-componentes
- [ ] Task 16: Verificar que nenhuma pagina excede 400 linhas
- [ ] Task 17: Executar testes snapshot -- nenhuma regressao visual

#### 2B: Habitos (2314 linhas -> ~6 componentes)
- [ ] Task 18: Escrever testes snapshot e de comportamento para `habitos/page.tsx` ANTES de refatorar
- [ ] Task 19: Criar `componentes/habitos/lista-habitos.tsx` -- lista de habitos com check diario
- [ ] Task 20: Criar `componentes/habitos/habito-card.tsx` -- card individual de habito com streak
- [ ] Task 21: Criar `componentes/habitos/formulario-habito.tsx` -- criar/editar habito
- [ ] Task 22: Criar `componentes/habitos/categorias-habitos.tsx` -- gerenciamento de categorias
- [ ] Task 23: Criar `componentes/habitos/estatisticas-habitos.tsx` -- metricas de consistencia
- [ ] Task 24: Criar `componentes/habitos/aba-metas.tsx` -- aba de metas (se aplicavel)
- [ ] Task 25: Refatorar `app/(protegido)/habitos/page.tsx` para compor os sub-componentes
- [ ] Task 26: Verificar que nenhuma pagina excede 400 linhas
- [ ] Task 27: Executar testes snapshot -- nenhuma regressao visual

#### 2C: Tarefas (1062 linhas -> ~5 componentes)
- [ ] Task 28: Escrever testes snapshot e de comportamento para `tarefas/page.tsx` ANTES de refatorar
- [ ] Task 29: Criar `componentes/tarefas/kanban-board.tsx` -- board completo com colunas
- [ ] Task 30: Criar `componentes/tarefas/kanban-coluna.tsx` -- coluna individual com drag-and-drop
- [ ] Task 31: Criar `componentes/tarefas/tarefa-card.tsx` -- card individual de tarefa
- [ ] Task 32: Criar `componentes/tarefas/formulario-tarefa.tsx` -- criar/editar tarefa
- [ ] Task 33: Criar `componentes/tarefas/filtros-tarefas.tsx` -- barra de filtros
- [ ] Task 34: Refatorar `app/(protegido)/tarefas/page.tsx` para compor os sub-componentes
- [ ] Task 35: Verificar que drag-and-drop funciona corretamente apos refatoracao
- [ ] Task 36: Executar testes snapshot -- nenhuma regressao visual

#### 2D: Agenda (863 linhas -> ~4 componentes)
- [ ] Task 37: Escrever testes snapshot e de comportamento para `agenda/page.tsx` ANTES de refatorar
- [ ] Task 38: Criar `componentes/agenda/calendario-view.tsx` -- visualizacao do calendario
- [ ] Task 39: Criar `componentes/agenda/evento-card.tsx` -- card individual de evento
- [ ] Task 40: Criar `componentes/agenda/formulario-evento.tsx` -- criar/editar evento
- [ ] Task 41: Criar `componentes/agenda/lista-eventos-dia.tsx` -- lista de eventos do dia selecionado
- [ ] Task 42: Refatorar `app/(protegido)/agenda/page.tsx` para compor os sub-componentes
- [ ] Task 43: Executar testes snapshot -- nenhuma regressao visual

#### 2E: Acoes Rapidas (1065 linhas -> ~4 componentes) (FE-NEW-01)
- [ ] Task 52: Escrever testes snapshot para `inicio/acoes-rapidas.tsx` ANTES de refatorar
- [ ] Task 53: Criar `componentes/inicio/modal-foco-rapido.tsx` -- modal de inicio rapido de sessao foco
- [ ] Task 54: Criar `componentes/inicio/modal-evento-rapido.tsx` -- modal de criacao rapida de evento
- [ ] Task 55: Criar `componentes/inicio/modal-tarefa-rapida.tsx` -- modal de criacao rapida de tarefa
- [ ] Task 56: Criar `componentes/inicio/modal-habito-rapido.tsx` -- modal de criacao rapida de habito
- [ ] Task 57: Refatorar `acoes-rapidas.tsx` para compor os sub-componentes (alvo: < 200 linhas)

#### 2F: Formulario Habito e Hook (FE-NEW-02, FE-NEW-03)
- [ ] Task 58: Dividir `componentes/habitos/formulario-habito.tsx` (851 linhas) em formularios individuais por tipo
- [ ] Task 59: Separar `componentes/habitos/useHabitosPage.ts` em hooks menores: `useHabitosUI`, `useHabitosData`, `useHabitosFiltros`

### Bloco 3: Formularios Estruturados (FE-H01) -- depende de Bloco 2
- [ ] Task 44: Instalar `react-hook-form` e `@hookform/resolvers`
- [ ] Task 45: Criar componente `componentes/ui/campo-formulario.tsx` padronizado (wrapper de FormField com label, input, mensagem de erro)
- [ ] Task 46: Migrar formulario de habitos para usar react-hook-form + zodResolver + schemas da Onda 2
- [ ] Task 47: Migrar formulario de tarefas para usar react-hook-form + zodResolver
- [ ] Task 48: Migrar formulario de eventos para usar react-hook-form + zodResolver
- [ ] Task 49: Migrar formulario de metas para usar react-hook-form + zodResolver
- [ ] Task 50: Migrar formularios de auth (`entrar/`, `criar-conta/`) para react-hook-form
- [ ] Task 51: Verificar que validacao inline funciona em todos os formularios (mensagem de erro por campo)

## Criterios de Aceite

- [ ] Nenhuma pagina excede 400 linhas
- [ ] Sub-componentes organizados em `componentes/{feature}/`
- [ ] Cada sub-componente tem pelo menos 1 teste (snapshot ou comportamento)
- [ ] Nenhuma regressao visual (testes snapshot passam)
- [ ] Performance de re-render medida com React DevTools profiler (nao pior que antes)
- [ ] Maximo 10 useState no componente principal do Foco
- [ ] Logica do timer em `useFocoTimer` -- timer funciona identicamente
- [ ] `sendBeacon` funciona corretamente com hooks extraidos
- [ ] Drag-and-drop do Kanban funciona corretamente apos refatoracao
- [ ] react-hook-form + zodResolver configurados
- [ ] Componente `CampoFormulario` padronizado criado
- [ ] Validacao inline por campo em todos os formularios migrados
- [ ] Zero re-renders por keystroke em formularios (react-hook-form gerencia estado)
- [ ] Cobertura de testes >= 80% nos sub-componentes criados
- [ ] `npm run lint` passa sem novos erros
- [ ] `npm run typecheck` passa sem novos erros

## Testes Requeridos

- **Snapshot:** Cada sub-componente extraido (antes e depois da refatoracao)
- **Unitario:** `useFocoTimer` -- start, pause, resume, complete, countdown
- **Unitario:** `useFocoSessao` -- create session, complete session, cancel session
- **Unitario:** `useFocoHistorico` -- fetch historico, calcular estatisticas
- **Unitario:** `CampoFormulario` -- renderiza label, input, mensagem de erro
- **Integracao:** Formulario de habitos com react-hook-form: preenchimento, validacao inline, submit
- **Integracao:** Kanban drag-and-drop: mover tarefa entre colunas
- **Integracao:** Timer completo: iniciar sessao -> pausar -> retomar -> completar
- **Manual:** React DevTools profiler antes e depois da refatoracao (comparar re-renders)
- **Manual:** Navegacao completa por todas as paginas refatoradas

## Dependencias

- **Depende de:**
  - TD-1.0 -- CC-C01 (testes configurados) e pre-requisito absoluto para refatoracao segura (RC04)
  - TD-3.0 -- Layout estavel (FE-N05) necessario antes de dividir componentes de paginas
  - TD-2.0 -- Schemas Zod (FE-H03) necessarios para formularios com zodResolver
- **Bloqueia:**
  - TD-5.0 (Performance) -- FE-C01 (componentes extraidos) necessario para code splitting e RSC

## Riscos

| Risco | Severidade | Mitigacao |
|-------|------------|-----------|
| **RC04:** Refatoracao de God Components sem testes = alto risco de regressao | HIGH | CC-C01 ANTES de FE-C01. Escrever testes snapshot/integration ANTES de refatorar cada pagina. Cobertura minima 80% por componente. |
| Drag-and-drop (`@hello-pangea/dnd`) pode quebrar ao extrair componentes | MEDIUM | Manter `DragDropContext` no nivel mais alto (page). `Droppable` e `Draggable` nos sub-componentes. Testar exaustivamente. |
| `sendBeacon` depende de closure sobre estado -- hooks podem quebrar referencia | MEDIUM | Usar `useRef` para estado que precisa ser lido no `sendBeacon`. Testar cenario: iniciar sessao -> fechar aba -> verificar beacon enviado. |
| React-hook-form pode conflitar com padroes existentes de useState em formularios | LOW | Migrar um formulario por vez. Manter estado manual como fallback ate verificar que rhf funciona. |

## Dev Notes

- **Ordem de execucao:** Bloco 1 (hooks do foco) -> Bloco 2 (dividir componentes) -> Bloco 3 (formularios). Dentro do Bloco 2, a ordem pode ser paralela, mas recomenda-se comecar pelo Foco (ja tem hooks extraidos do Bloco 1).
- **FE-M02:** Os 26 useState identificados no assessment incluem estado de timer, estado de sessao, estado de UI (modais, tabs), e estado de formulario. Categorizar antes de extrair.
- **FE-C01:** A divisao de componentes deve seguir o princípio de responsabilidade unica. Cada componente deve ter uma unica razao para mudar. Usar `componentes/{feature}/` como diretorio.
- **FE-C01:** Ao dividir, manter a composicao na pagina principal. A pagina deve ser apenas "cola" entre componentes, passando props minimas. Evitar prop drilling -- usar hooks com context quando necessario.
- **FE-H01:** O `CampoFormulario` deve ser um componente wrapper que encapsula `FormField` do react-hook-form com `FormItem`, `FormLabel`, `FormControl`, `FormMessage`. Usar `shadcn/ui` Form components se disponiveis.
- **Performance:** Apos dividir componentes, medir re-renders com React DevTools Profiler. Comparar com baseline (antes da refatoracao). Espera-se que re-renders diminuam significativamente (apenas sub-componentes afetados re-renderizam).
- **Sprint planning:** Esta story e a mais longa do epic (~45h). Considerar dividir em 2 sprints: Sprint 4 (Bloco 1 + Bloco 2A/2B) e Sprint 5 (Bloco 2C/2D + Bloco 3).

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
