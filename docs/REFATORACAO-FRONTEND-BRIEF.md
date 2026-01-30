# Brief: Refatoração Completa do Frontend — Builders Performance

## Objetivo
Refatorar TODO o frontend do app Builders Performance usando a referência visual em `docs/referencia-ui-builders.png`. O app atualmente está "morno/frio/pacato" e precisa virar algo **minimal mas com atitude — bold, vibrante, moderno**.

## Imagem de Referência
O arquivo `docs/referencia-ui-builders.png` contém a referência visual principal (dashboard ConstructHub). Use essa imagem para extrair tokens de design.

### Design Tokens Extraídos da Referência

#### Cores
| Role | Hex | Uso |
|------|-----|-----|
| Primary Orange | `#F26B2A` | Nav ativo, CTAs, progress bars, chart data |
| Primary Orange Hover | `#E05A1A` | Hover states |
| Primary Orange Light | `#FEF3EC` | Backgrounds com tint laranja |
| Primary Dark | `#1A1A1A` | Headings, texto primário |
| White | `#FFFFFF` | Cards, backgrounds |
| Background Gray | `#F5F5F5` | Área de conteúdo principal |
| Sidebar Background | `#FAFAFA` | Sidebar esquerda |
| Border Light | `#E8E8E8` | Bordas de cards, dividers |
| Text Secondary | `#6B6B6B` | Subtítulos, descrições |
| Text Tertiary | `#999999` | Placeholders |
| Success Green | `#2ECC71` | Indicadores positivos |
| Danger Red | `#E74C3C` | Indicadores negativos |
| Warning Yellow | `#F2C94C` | Alertas |
| Info Blue | `#3498DB` | Informações, links |

#### Tipografia
- Font Family: `Inter` ou `Plus Jakarta Sans` (moderna, clean)
- Headings: 24-32px, font-weight 700 (bold)
- Body: 14-16px, font-weight 400-500
- Caption/Meta: 12-13px, font-weight 400
- KPI Numbers: 28-36px, font-weight 700-800

#### Espaçamento
- Base unit: 4px
- Card padding: 20-24px
- Section gap: 24-32px
- Grid gap: 16-20px

#### Border Radius
- Cards: 12-16px
- Buttons: 8-10px
- Inputs: 8px
- Badges: 6px (ou full rounded)
- Avatars: full circle

#### Sombras
- Card shadow: `0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)`
- Elevated: `0 4px 12px rgba(0,0,0,0.1)`
- Dropdown: `0 8px 24px rgba(0,0,0,0.12)`

#### Componentes da Referência
- **Sidebar:** Vertical, ícones + labels, item ativo com accent laranja, fundo claro
- **Header:** Search bar, notifications bell, user avatar, breadcrumbs
- **KPI Cards:** Valor grande em bold, label em cinza, ícone ou mini-chart, trend indicator (↑12%)
- **Tables:** Header cinza claro, rows com hover, avatar + texto, status badges coloridos
- **Charts:** Area charts com gradiente, bar charts, line charts com data points laranja
- **Badges/Status:** Rounded, fundo colorido sutil, texto colorido (não bold)
- **Buttons:** Primary (laranja fill), Secondary (outline), Ghost (texto only)

## Stack Técnica Atual
- Next.js 16 App Router + React 19 + TypeScript 5
- TailwindCSS 4 + Radix UI + shadcn/ui (estilo new-york)
- Framer Motion para animações
- Recharts para gráficos
- Convenção portuguesa: rotas, componentes, hooks

## Estrutura do Projeto
```
componentes/ui/   → Componentes UI (shadcn adaptados em PT)
app/              → Pages (App Router)
hooks/            → Custom hooks (useTarefas, useHabitos, etc.)
lib/              → Utils, schemas, supabase client
docs/stories/     → Stories AIOS existentes
```

## AIOS Framework
O projeto usa Synkra AIOS com agentes: @dev, @qa, @architect, @pm, @po, @sm, @analyst.
Stories ficam em `docs/stories/`. Cada story segue o padrão AIOS com tasks, acceptance criteria, e file list.
O desenvolvimento é story-driven: ler story → implementar tasks → marcar checkboxes → commit.

## O Que Já Existe (Concluído)
- Epic Tech Debt (TD-0.0 a TD-6.0) — segurança, tipos, performance ✅
- Epic Calendar Integration (CI-1.1 a CI-1.6) — OAuth, sync, UI ✅  
- Design System Showcase (DS-1.0) + Implementação (DS-2.0) ✅

## O Que Precisa Ser Feito

### Fase 1: Design Tokens & Foundation
- Refatorar CSS custom properties com nova paleta (laranja como primária)
- Atualizar tailwind.config.ts com novos tokens
- Atualizar globals.css com as variáveis
- Criar lib/design-tokens.ts tipado

### Fase 2: Componentes Primitivos
- Refatorar todos os componentes em componentes/ui/ com novo visual
- Botões, cards, inputs, badges, avatars, toggles, progress bars
- Hover effects e micro-interações com Framer Motion

### Fase 3: Layout Shell (Sidebar + Header)
- Nova sidebar com ícones + labels, destaque laranja no ativo
- Novo header com search, notificações, avatar
- Layout responsivo (sidebar collapse → bottom nav mobile)

### Fase 4: Dashboard Principal (/inicio)
- Cards de KPIs redesenhados (XP, Level, Streak, Energia)
- Gráficos com gradientes (Recharts customizado)
- Daily Quests com novo visual
- Conquistas recentes

### Fase 5: Todas as Páginas Internas
- /tarefas — Kanban com cards redesenhados
- /foco — Timer visual imersivo atualizado
- /habitos — Heatmap, streak cards novo visual
- /agenda — Calendar view atualizado
- /cursos — Módulos com novo visual
- /perfil — Profile page atualizada

### Fase 6: Polish & Micro-interações
- Hover effects em cards/botões
- Animações de entrada (fade-in, slide-up)
- Loading skeletons atualizados
- Number counting animations para KPIs
- Progress bars animados
- Transições entre páginas (200-300ms)

## Referências Adicionais de Design
Consultar `docs/pesquisa-visual-referencias.md` para referências extras (dark mode, glassmorphism, bold typography, micro-interactions).

## Regras de Implementação
- Manter convenção portuguesa (nomes de arquivos, rotas, componentes)
- Usar Framer Motion para animações
- Manter compatibilidade com shadcn/ui e Radix UI
- Respeitar o padrão de data flow: Page → Hook → React Query → Supabase
- Fazer commits atômicos por feature
- Rodar `npm run typecheck` e `npm run lint` antes de cada commit
