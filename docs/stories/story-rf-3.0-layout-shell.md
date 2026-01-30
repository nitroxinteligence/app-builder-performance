# Story RF-3.0: Layout Shell - Sidebar + Header + Navigation

**Epic:** Refatoracao Frontend
**Status:** Em Progresso
**Prioridade:** Alta
**Branch:** `vk/bb4d-3-6-layout-shell`

---

## Descricao

Refatorar o layout principal do app (sidebar, header, navegacao) usando os design tokens e componentes UI ja mergeados nas Tasks 1 e 2.

## Pre-requisitos

- [x] Task 1: Design Spec & Tokens (mergeada)
- [x] Task 2: Componentes UI (mergeada)

## Criterios de Aceitacao

- [x] Sidebar vertical com fundo usando token surface/sidebar
- [x] Sidebar com icones Lucide + labels
- [x] Item ativo: background brand/subtle + texto brand/default (#F26B2A)
- [x] Logo/branding no topo da sidebar
- [x] Sidebar collapse responsivo (telas menores)
- [x] Header com search bar usando componente Entrada
- [x] Header com notification bell + badge counter usando Emblema
- [x] Header com user avatar usando componente Avatar
- [x] Header com breadcrumb de navegacao
- [x] Navegacao com links para todas as rotas: /inicio, /tarefas, /foco, /habitos, /agenda, /cursos
- [x] Active state detection via usePathname()
- [x] Mobile: bottom navigation
- [x] Todos os componentes usando design tokens de design-tokens.ts

## Tarefas

- [x] 1. Extrair dados de navegacao para modulo compartilhado `lib/navegacao.ts`
- [x] 2. Refatorar Sidebar com tokens de design e estilo brand
- [x] 3. Criar componente Header com search, notificacoes, avatar, breadcrumb
- [x] 4. Refatorar BottomTabBar para usar dados compartilhados
- [x] 5. Atualizar layout protegido para incluir Header
- [x] 6. Verificar typecheck e lint

## Arquivos Modificados

- `lib/navegacao.ts` (novo)
- `componentes/layout/sidebar.tsx` (refatorado)
- `componentes/layout/cabecalho.tsx` (novo)
- `componentes/layout/bottom-tab-bar.tsx` (refatorado)
- `app/(protegido)/layout.tsx` (atualizado)
- `app/(protegido)/inicio/dados-dashboard.ts` (mantido para retrocompatibilidade)
