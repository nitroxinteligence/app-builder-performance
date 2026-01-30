# Story RF-5.0 — Redesign Paginas Internas com Design System

**Epic:** Refatoracao Frontend
**Status:** Concluido
**Prioridade:** Alta
**Sprint:** 5/6

---

## Objetivo

Redesenhar todas as 5 paginas internas (/tarefas, /foco, /habitos, /agenda, /cursos) utilizando o novo design system (design tokens de `lib/design-tokens.ts`, animacoes de `lib/animacoes.ts`, e componentes UI refatorados de `componentes/ui/`).

## Criterios de Aceitacao

- [x] /tarefas: Cards usando tokens (radius, sombra, borda-cartao), Emblema para XP e prioridade, hover CSS, grid 4 colunas
- [x] /foco: Modo imersivo escuro quando sessao ativa, timer com gradiente laranja, Emblema para XP preview, animacoes framer-motion
- [x] /habitos: Streak counter com icone Flame, Emblema para status (Feito/Fazer), Progresso por categoria, motion buttons
- [x] /agenda: Cores por categoria via border-left, Emblema para status e categoria, motion containers
- [x] /cursos: Cards interativos (hover scale+shadow), Emblema para badges (concluido, nivel, categoria), Award icon para conclusao
- [x] TypeScript check limpo (0 erros)
- [x] Build passa (exceto env vars Supabase ausentes - esperado)

## Alteracoes por Pagina

### 1. /tarefas (Kanban)
**Arquivos alterados:**
- `componentes/tarefas/tarefa-card.tsx` — Emblema para prioridade e XP reward, token-based border/shadow/radius
- `componentes/tarefas/kanban-coluna.tsx` — Emblema para contagem, shadow tokens, success color para concluido
- `componentes/tarefas/kanban-board.tsx` — motion.section com variantesEntrada, grid-cols-4

### 2. /foco (Timer)
**Arquivos alterados:**
- `componentes/foco/timer-display.tsx` — Modo imersivo escuro (bg-[#1A1A1A] quando sessao ativa), Emblema para XP, motion.section, gradiente primario
- `componentes/foco/estatisticas-foco.tsx` — motion.section, semantic colors (info, success, warning), icon containers com rounded-xl

### 3. /habitos
**Arquivos alterados:**
- `componentes/habitos/habito-card.tsx` — motion.button com hover/tap, Flame icon para streaks, Emblema sucesso/aviso, token-based styles
- `componentes/habitos/categorias-habitos.tsx` — Progresso bar por categoria, primary icon container

### 4. /agenda
**Arquivos alterados:**
- `componentes/agenda/evento-card.tsx` — motion.div com hover, border-left por categoria (info/success/warning/primary), Emblema para status e categoria
- `componentes/agenda/lista-eventos-dia.tsx` — motion.div com variantesEntrada, Emblema para status em proximos eventos, token-based card styles

### 5. /cursos
**Arquivos alterados:**
- `app/(protegido)/cursos/page.tsx` — Cartao interativo com hover, Emblema para categoria/nivel/conclusao, Award icon, motion container, active category button style

## Padroes Aplicados

- **Design Tokens**: `var(--radius)`, `var(--borda-cartao)`, `var(--shadow-sm)`, `var(--shadow-md)`, semantic colors (success, warning, info, primary)
- **Animacoes**: `variantesEntrada`, `variantesHover`, `variantesClique`, `transicaoRapida`, `transicaoSuave`
- **Componentes UI**: `Emblema` (badges), `Progresso` (barras), `Cartao` (interativo prop), `Botao` (motion)
- **Imutabilidade**: Nenhuma mutacao direta em state
- **Acessibilidade**: `aria-pressed`, `aria-label`, semantic HTML mantidos

## File List

```
componentes/tarefas/tarefa-card.tsx
componentes/tarefas/kanban-coluna.tsx
componentes/tarefas/kanban-board.tsx
componentes/foco/timer-display.tsx
componentes/foco/estatisticas-foco.tsx
componentes/habitos/habito-card.tsx
componentes/habitos/categorias-habitos.tsx
componentes/agenda/evento-card.tsx
componentes/agenda/lista-eventos-dia.tsx
app/(protegido)/cursos/page.tsx
docs/stories/story-rf-5.0-paginas-internas-redesign.md
```
