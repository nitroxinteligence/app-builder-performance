# Story: Reestruturacao Frontend

**Story ID:** TD-3.0
**Epic:** EPIC-TD-001
**Status:** Draft
**Estimativa:** ~30h
**Prioridade:** CRITICAL
**Sprint Sugerido:** 3

---

## Objetivo

Preparar a estrutura de layout para refatoracao de God Components e desbloquear acesso mobile. Ao final, a aplicacao tera: layout compartilhado via route groups (eliminando remontagem da sidebar), navegacao mobile funcional com bottom tab bar + drawer, e paginas internas responsivas em qualquer tamanho de tela. Esta onda e a que mais impacta diretamente o crescimento da base de usuarios.

## Debitos Incluidos

| ID | Debito | Severidade | Horas |
|----|--------|-----------|-------|
| FE-N05 | **Sidebar duplicada em cada pagina** -- Cada pagina importa `<Sidebar>` individualmente. Causa flash de remontagem ao navegar. Deveria ser parte de layout compartilhado (`app/(protegido)/layout.tsx`). | MEDIUM | 3-4h |
| FE-C02 | **Navegacao mobile inexistente** -- Sidebar usa `hidden lg:flex`. Zero alternativa para telas < 1024px. Nenhum hamburger, bottom tab bar, drawer ou qualquer mecanismo de navegacao mobile. Aplicacao completamente inacessivel em smartphones e tablets. | CRITICAL | 12-16h |
| FE-N03 | **Responsividade insuficiente nas paginas internas** -- `habitos/page.tsx` tem apenas 19 breakpoints responsive, `foco/page.tsx` tem 5, `tarefas/page.tsx` tem 13. Layouts rigidos para paginas de 1000-2300 linhas. | HIGH | 8-12h |
| A11Y-NEW-01 | **aria-labels insuficientes** -- Apenas 68 `aria-label` em 19 arquivos. Muitos elementos interativos (botoes, inputs, links) sem labels acessiveis. Viola WCAG 4.1.2 (Name, Role, Value). | MEDIUM | 2h |

## Tasks

### Bloco 1: Layout Compartilhado (FE-N05) -- PRIMEIRO
- [ ] Task 1: Criar route group `app/(auth)/` para rotas de autenticacao (`entrar/`, `criar-conta/`)
- [ ] Task 2: Criar route group `app/(protegido)/` para rotas que requerem autenticacao
- [ ] Task 3: Mover paginas protegidas para dentro de `app/(protegido)/`: `foco/`, `tarefas/`, `habitos/`, `agenda/`, `cursos/`, `inicio/`, `perfil/`
- [ ] Task 4: Criar `app/(protegido)/layout.tsx` com `<Sidebar>` integrada no layout
- [ ] Task 5: Remover importacao individual de `<Sidebar>` de cada pagina protegida
- [ ] Task 6: Verificar que navegacao entre paginas NAO causa remontagem da sidebar (DevTools: observe React component tree)
- [ ] Task 7: Verificar que middleware.ts continua protegendo rotas corretamente apos mover para route groups
- [ ] Task 8: Atualizar imports relativos que possam ter quebrado com a reorganizacao de pastas

### Bloco 2: Navegacao Mobile (FE-C02) -- depende de Bloco 1
- [ ] Task 9: Criar componente `componentes/layout/bottom-tab-bar.tsx` com 5 tabs principais: Foco, Tarefas, Habitos, Agenda, Inicio
- [ ] Task 10: Implementar tab "Mais" que abre drawer com rotas secundarias: Cursos, Perfil, Configuracoes
- [ ] Task 11: Adicionar breakpoint logic: bottom tab bar visivel em `< 1024px`, oculta em `>= 1024px`
- [ ] Task 12: Sidebar desktop: manter `hidden lg:flex` existente (visivel em `>= 1024px`)
- [ ] Task 13: Integrar bottom tab bar no `app/(protegido)/layout.tsx`
- [ ] Task 14: Garantir safe area respeitada em iOS (`env(safe-area-inset-bottom)`)
- [ ] Task 15: Garantir que nenhum conteudo fica oculto sob o tab bar (padding-bottom adequado)
- [ ] Task 16: Testar navegacao completa em viewport 375px (iPhone SE), 390px (iPhone 14), 768px (iPad)
- [ ] Task 17: Testar transicao entre breakpoints: redimensionar janela de 1200px para 800px e vice-versa

### Bloco 3: Responsividade Interna (FE-N03) -- depende de Bloco 2
- [ ] Task 18: Ajustar grid Kanban em `tarefas/page.tsx`: coluna unica em mobile (`< 768px`), scroll horizontal ou tabs em tablet, grid completo em desktop
- [ ] Task 19: Ajustar formularios em `habitos/page.tsx`: stack vertical em mobile, grid em desktop
- [ ] Task 20: Ajustar calendario em `agenda/page.tsx`: vista diaria/semanal como padrao em mobile, mensal em desktop
- [ ] Task 21: Ajustar timer em `foco/page.tsx`: layout vertical em mobile, horizontal em desktop
- [ ] Task 22: Verificar que nenhuma pagina tem overflow horizontal em 375px, 768px, 1024px, 1440px
- [ ] Task 23: Testar scroll vertical em todas as paginas com conteudo longo (lista de habitos, lista de tarefas)

### Bloco 4: Acessibilidade de Elementos Interativos (A11Y-NEW-01)
- [ ] Task 24: Auditar todos os `<button>`, `<input>`, `<a>`, `<select>` e componentes interativos sem `aria-label` ou texto visivel
- [ ] Task 25: Adicionar `aria-label` em botoes com apenas icone (sidebar, modais, cards)
- [ ] Task 26: Adicionar `aria-label` em inputs de formularios que usam placeholder como unico label

## Criterios de Aceite

- [ ] Route groups `(auth)` e `(protegido)` criados e funcionais
- [ ] Sidebar integrada em `app/(protegido)/layout.tsx` (nao importada individualmente por pagina)
- [ ] Sidebar persiste entre navegacoes -- zero remontagem ao navegar entre paginas protegidas
- [ ] Bottom tab bar visivel em viewports < 1024px
- [ ] Sidebar visivel em viewports >= 1024px, bottom tab bar oculta
- [ ] Todas as rotas acessiveis em mobile via bottom tab bar + drawer "Mais"
- [ ] Tab "Mais" abre drawer com rotas secundarias (Cursos, Perfil)
- [ ] Safe area respeitada em iOS
- [ ] Nenhum conteudo oculto sob o tab bar
- [ ] Nenhum overflow horizontal em 375px, 768px, 1024px, 1440px
- [ ] Grid Kanban adaptado para mobile (coluna unica ou scroll horizontal)
- [ ] Calendario adaptado para mobile (vista diaria/semanal padrao)
- [ ] Formularios stack vertical em mobile
- [ ] Middleware continua protegendo rotas corretamente
- [ ] `npm run lint` passa sem novos erros
- [ ] `npm run typecheck` passa sem novos erros

## Testes Requeridos

- **Unitario:** Componente `BottomTabBar` renderiza 5 tabs + "Mais"
- **Unitario:** Drawer "Mais" abre e fecha corretamente
- **Integracao:** Navegacao mobile entre todas as rotas
- **E2E (desejavel):** Fluxo completo em viewport 375px: login -> navegar por todas as tabs -> logout
- **Manual:** Verificar em Chrome DevTools nos seguintes viewports: 375px, 390px, 768px, 1024px, 1440px
- **Manual:** Verificar que sidebar NAO remonta ao navegar (React DevTools profiler)
- **Manual:** Verificar safe area no iOS Simulator (se disponivel)
- **Manual:** Redimensionar janela continuamente e verificar transicao suave entre breakpoints

## Dependencias

- **Depende de:**
  - TD-2.0 (Integridade + Tipos) -- tipos estaveis e validacao antes de reestruturar frontend
  - FE-N05 (layout compartilhado) ANTES de FE-C02 (mobile nav) -- evitar refatoracao dupla (RC05)
  - FE-C02 ANTES de FE-N03 (responsividade) -- responsividade depende de navegacao mobile funcional
- **Bloqueia:**
  - TD-4.0 (God Components) -- layout estavel necessario antes de dividir componentes

## Riscos

| Risco | Severidade | Mitigacao |
|-------|------------|-----------|
| **RC05:** Layout compartilhado + Mobile nav = refatoracao dupla se feitos na ordem errada | MEDIUM | FE-N05 (layout) PRIMEIRO, depois FE-C02 (mobile nav). Ambos nesta story, nessa ordem estrita. |
| Route groups podem quebrar rotas existentes | MEDIUM | Testar TODAS as rotas apos mover para route groups. Verificar middleware. Verificar links internos com `<Link href>`. |
| Bottom tab bar pode conflitar com teclado virtual em mobile | LOW | Usar `position: fixed` com `bottom: 0` e `z-index` adequado. Testar com teclado visivel em formularios. |
| Safe area em iOS pode variar entre dispositivos | LOW | Usar `env(safe-area-inset-bottom)` com fallback `pb-4`. Testar no iOS Simulator se possivel. |
| Middleware pode nao reconhecer rotas dentro de route groups | MEDIUM | Route groups sao transparentes para URL -- `(protegido)/foco` ainda e `/foco` na URL. Middleware deve funcionar sem alteracao, mas verificar. |

## Dev Notes

- **FE-N05:** Route groups em Next.js App Router sao agrupamentos logicos que NAO afetam a URL. `app/(protegido)/foco/page.tsx` ainda e acessivel em `/foco`. O middleware nao precisa mudar.
- **FE-C02:** Bottom tab bar deve usar componentes Radix UI (Sheet para drawer) para manter consistencia com o design system do projeto.
- **FE-C02:** Breakpoints sugeridos pelo assessment: `< 768px` mobile, `>= 1024px` desktop, `768px-1024px` tablet (sidebar colapsada ou bottom bar).
- **FE-N03:** A responsividade interna e um trabalho grande por causa dos God Components (2314, 1281, 1062, 863 linhas). Na Onda 4, esses componentes serao divididos, o que facilitara ajustes finos. Nesta onda, foco nos ajustes de grid/layout macro, nao em cada sub-secao.
- **FE-N03:** Para o Kanban, considerar `overflow-x-auto` com scroll horizontal em mobile como alternativa rapida a redesign completo.
- **Layout:** O `app/(protegido)/layout.tsx` deve incluir: `<Sidebar>` (desktop), `<BottomTabBar>` (mobile), `<main>` com padding adequado para ambos.

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
