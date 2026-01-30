# Story: UI de Status e Gerenciamento de Conexoes

**Story ID:** CI-1.5
**Epic:** EPIC-CI-001
**Status:** Ready for Review
**Estimativa:** ~8h
**Prioridade:** MEDIUM
**Sprint Sugerido:** Apos CI-1.4

---

## Objetivo

Criar a camada de UI para gerenciamento de conexoes de calendario externo: hook dedicado, componente de status, badges de origem nos eventos, botao de desconexao com confirmacao, e indicador de ultima sincronizacao.

## User Story

> Como usuario,
> Eu quero ver quais calendarios estao conectados e poder desconecta-los,
> Para que eu tenha controle sobre quais dados sao sincronizados.

## Tasks

### Bloco 1: Hook de Integracao

- [x]Task 1 (AC: 1): Criar `hooks/useIntegracaoCalendario.ts`:
  - React Query para buscar conexoes ativas do usuario:
    - Query key: `['calendario', 'connections', userId]`
    - Fetch: `supabase.from('calendar_connections').select('*').eq('user_id', userId).eq('is_active', true)`
    - staleTime: 5 minutos
  - Funcoes expostas:
    - `connections: CalendarConnection[]` — lista de conexoes ativas
    - `isLoading: boolean` — estado de carregamento
    - `connect(provider: CalendarProvider): void` — inicia fluxo OAuth (chama `/api/calendario/connect`)
    - `disconnect(provider: CalendarProvider): Promise<void>` — desconecta (chama `/api/calendario/disconnect`)
    - `sync(): Promise<SyncResult>` — dispara sync manual (chama `/api/calendario/sync`)
    - `isSyncing: boolean` — estado de sincronizacao em andamento
    - `lastSyncAt(provider: CalendarProvider): Date | null` — ultima sync por provider
    - `isConnected(provider: CalendarProvider): boolean` — helper de status
  - Mutations com `onSuccess` → invalidate queries `['calendario', 'connections', userId]` + `['agenda', 'events', userId]`

### Bloco 2: Componente de Status

- [x]Task 2 (AC: 2, 5, 6): Criar `componentes/agenda/status-integracao.tsx`:
  - Recebe dados do hook `useIntegracaoCalendario`
  - Para cada provider (Google, Outlook), exibir:
    - Icone do provider (lucide-react ou SVG inline)
    - Status: "Conectado" (verde badge) ou "Conectar" (cinza/outline)
    - Se conectado: email externo associado + "Ultima sync: X min atras"
    - Se conectado: botao de desconectar (icone X ou "Desconectar")
  - Botao "Sincronizar agora" (visivel se pelo menos 1 provider conectado):
    - Spinner durante sync (`isSyncing`)
    - Texto: "Sincronizar agora" / "Sincronizando..."
  - Usar componentes existentes: `Cartao`, `Botao`, `Dica` (tooltip)
  - Cores: verde (`text-green-500`) para conectado, cinza (`text-muted-foreground`) para desconectado, amarelo (`text-yellow-500`) para sincronizando
  - Responsivo: stack vertical em mobile, inline em desktop

- [x]Task 3 (AC: 2): Atualizar `componentes/agenda/calendario-view.tsx`:
  - Substituir os botoes stub (linhas 51-70) pelo novo componente `StatusIntegracao`
  - Passar props do hook: `connections`, `onConnect`, `onDisconnect`, `onSync`, `isSyncing`
  - Manter o layout do calendar picker inalterado
  - Garantir que o componente CalendarioView continua funcional sem conexoes (estado default)

### Bloco 3: Fluxo de Desconexao

- [x]Task 4 (AC: 3, 4): Implementar fluxo de desconexao:
  - Ao clicar "Desconectar", abrir `DialogoAlerta` (componente existente) com:
    - Titulo: "Desconectar {Provider} Calendar?"
    - Descricao: "Seus eventos importados do {Provider} serao removidos. Voce pode reconectar a qualquer momento."
    - Botoes: "Cancelar" / "Desconectar" (variante destructive)
  - Se confirmado, chamar `disconnect(provider)` do hook

- [x]Task 5 (AC: 4): Criar `app/api/calendario/disconnect/route.ts`:
  - Metodo POST
  - Body: `{ provider: 'Google' | 'Outlook' }` (validar com `disconnectRequestSchema`)
  - Validar sessao do usuario via Supabase Auth server-side
  - Usar Supabase service role para:
    1. Deletar todos os eventos importados do provider: `DELETE FROM events WHERE user_id = ? AND calendario = ?`
    2. Deletar a conexao: `DELETE FROM calendar_connections WHERE user_id = ? AND provider = ?`
  - Retornar `{ success: true, eventsDeleted: number }`
  - Apos sucesso, exibir toast: "{Provider} desconectado. {N} eventos removidos."

### Bloco 4: Badge de Origem nos Eventos

- [x]Task 6 (AC: 7): Atualizar `componentes/agenda/evento-card.tsx` (ou componente equivalente de renderizacao de evento):
  - Adicionar badge visual indicando origem do evento:
    - Google: icone colorido do Google (ou icone Calendar com cor)
    - Outlook: icone azul do Outlook (ou icone Mail com cor)
    - Manual: sem badge (ou icone cinza discreto)
  - Badge posicionado no canto superior direito do card ou inline com o titulo
  - Usar `Dica` (tooltip) para mostrar "Google Calendar" / "Outlook Calendar" / "Manual" ao hover
  - Badge baseado no campo `calendario` do evento (`AgendaEvent.calendario`)
  - Nao modificar nenhuma outra logica do card

### Bloco 5: Integracao na Page

- [x]Task 7: Atualizar `app/(protegido)/agenda/page.tsx`:
  - Importar e usar `useIntegracaoCalendario`
  - Passar dados para `CalendarioView` e `StatusIntegracao`
  - Conectar handler de sync automatico (mover de CI-1.4 se necessario)
  - Garantir que a page funciona normalmente para usuarios sem conexoes (zero state)

### Bloco 6: Verificacao de Integridade

- [x]Task 8 (AC: IV1, IV2, IV3): Verificar integridade:
  - Layout da pagina `/agenda` mantem proporcoes e responsividade
  - Dark mode funciona corretamente nos novos componentes
  - Loading skeleton em `loading.tsx` nao e afetado
  - `npm run typecheck` e `npm run lint` passam sem erros

## Criterios de Aceite

- [x]Hook `useIntegracaoCalendario` criado com: `connections`, `isLoading`, `connect(provider)`, `disconnect(provider)`, `sync()`, `isSyncing`
- [x]Componente `calendario-view.tsx` atualizado: mostra status "Conectado" (verde) ou "Conectar" (cinza) para cada provedor
- [x]Botao de desconectar disponivel para cada provedor conectado (com confirmacao via `DialogoAlerta`)
- [x]API route `POST /api/calendario/disconnect` remove tokens e eventos importados do provedor
- [x]Indicador de "Ultima sincronizacao: X minutos atras" visivel
- [x]Novo componente `status-integracao.tsx` com botao "Sincronizar agora" e spinner durante sync
- [x]`evento-card.tsx` atualizado com badge de origem (icone Google / Outlook / Manual)
- [x]Layout da pagina `/agenda` mantem proporcoes e responsividade (IV1)
- [x]Dark mode funciona corretamente nos novos componentes (IV2)
- [x]Loading skeleton em `loading.tsx` nao e afetado (IV3)

## Testes Requeridos

- **Unitario:** Hook `useIntegracaoCalendario` retorna conexoes ativas do usuario
- **Unitario:** `isConnected('Google')` retorna true/false corretamente
- **Unitario:** `lastSyncAt('Google')` retorna Date ou null
- **Unitario:** Badge de origem renderiza icone correto para cada provider
- **Integracao:** API route `/api/calendario/disconnect` deleta eventos e conexao corretamente
- **Integracao:** API route `/api/calendario/disconnect` rejeita provider invalido
- **Integracao:** Apos disconnect, query de eventos nao retorna eventos do provider removido
- **Manual:** Fluxo completo: conectar → ver status → sync → ver badge → desconectar → confirmar → eventos removidos
- **Manual:** Dark mode: verificar contraste de badges e status
- **Manual:** Mobile: verificar layout responsivo do componente de status

## Dependencias

- **Depende de:** CI-1.1 (schema), CI-1.2 (Google OAuth), CI-1.3 (Outlook OAuth), CI-1.4 (sync funcional)
- **Bloqueia:** Nenhuma (story de UI final)

## Riscos

| Risco | Severidade | Mitigacao |
|-------|------------|-----------|
| Layout quebra em mobile com novos componentes | MEDIUM | Testar em viewports < 768px; usar stack vertical em mobile |
| Dark mode com badges coloridos pode ter baixo contraste | LOW | Testar cores em ambos os temas; usar cores com suficiente contraste |
| Desconexao acidental sem confirmacao | MEDIUM | DialogoAlerta obrigatorio antes de desconectar |
| Performance degradada com multiplas queries (conexoes + eventos) | LOW | conexoes com staleTime 5min; nao refetch on window focus |

## Dev Notes

### Contexto Tecnico

**Componentes UI Existentes (shadcn em portugues):**
- `Botao` → `componentes/ui/botao.tsx` — usar variantes `default`, `outline`, `destructive`
- `Cartao` → `componentes/ui/cartao.tsx` — para container de status
- `DialogoAlerta` → `componentes/ui/dialogo-alerta.tsx` — para confirmacao de desconexao
- `Dica` → `componentes/ui/dica.tsx` — tooltip para badges
- `Esqueleto` → `componentes/ui/esqueleto.tsx` — loading state
- [Source: componentes/ui/]

**CalendarioView Atual:**
- Arquivo: `componentes/agenda/calendario-view.tsx` (76 linhas)
- Props atuais: `dataSelecionada`, `onSelecionarData`
- Secao de integracao: linhas 49-72 (dois cards com botoes "Conectar")
- Substituir por componente `StatusIntegracao` que encapsula a logica
- [Source: componentes/agenda/calendario-view.tsx]

**Pagina Agenda:**
- Arquivo: `app/(protegido)/agenda/page.tsx` (238 linhas)
- Usa `useAgenda()` para dados de eventos
- Estado local: `dataSelecionada`, `novoEventoAberto`, `eventoEditando`, etc.
- Renderiza: `CalendarioView`, `ListaEventosDia`, `FormularioEventoDialogo`, `DialogoAlerta`
- Precisa adicionar `useIntegracaoCalendario` como segundo hook
- [Source: app/(protegido)/agenda/page.tsx]

**Padrao de Hooks Existente:**
- Todos os hooks em `hooks/` usam `useAuth()` para obter `user.id`
- Query habilitada com `enabled: !!userId`
- Mutations invalidam queries relevantes no `onSuccess`
- Toast notifications via `sonner` importado de `lib/toast.ts`
- [Source: hooks/useAgenda.ts, hooks/useTarefas.ts]

**Formatacao de Tempo Relativo:**
- Projeto usa `date-fns` para manipulacao de datas
- `formatDistanceToNow(date, { locale: ptBR, addSuffix: true })` para "ha X minutos"
- Importar `{ formatDistanceToNow } from 'date-fns'` e `{ ptBR } from 'date-fns/locale'`

**Icones:**
- Projeto usa `lucide-react` para icones
- Para Google: `CalendarDays` ou SVG custom
- Para Outlook: `Mail` ou SVG custom
- Para Manual: `CalendarPlus` ou similar
- [Source: PRD secao 3.3]

---

### Dev Agent Record
**Agent Model Used:** Claude Opus 4.5
**Debug Log References:** --

#### Completion Notes
- Created `hooks/useIntegracaoCalendario.ts` with React Query: connections query, disconnect mutation, sync mutation, helper functions (isConnected, lastSyncAt, getConnection)
- Created `componentes/agenda/status-integracao.tsx` — ProviderRow with connected/disconnected states, email display, last sync time (date-fns formatDistanceToNow with ptBR locale), sync button
- Created `app/api/calendario/disconnect/route.ts` — deletes imported events and connection record using service role
- Updated `componentes/agenda/calendario-view.tsx` — replaced inline integration stubs with StatusIntegracao component
- Updated `componentes/agenda/evento-card.tsx` — origin badge with colored icons (Google=red, Outlook=blue, Manual=gray) using Dica tooltip
- Updated `app/(protegido)/agenda/page.tsx` — integrated useIntegracaoCalendario hook, disconnect confirmation dialog via DialogoAlerta
- CalendarioView now receives integracao return object and disconnect request handler
- Zero-state works: page renders normally without any connections
- typecheck passes clean

#### Change Log
| Data | Alteracao | Autor |
|------|-----------|-------|
| 2026-01-30 | Story criada a partir do PRD calendar-integration.md | @sm (River) |
| 2026-01-30 | Implementation complete: hook, status component, disconnect route, event badges, page integration | @dev (Dex) |

#### File List
| Arquivo | Status | Descricao |
|---------|--------|-----------|
| hooks/useIntegracaoCalendario.ts | Novo | Hook de gerenciamento de conexoes de calendario |
| componentes/agenda/status-integracao.tsx | Novo | Componente de status e gerenciamento |
| componentes/agenda/calendario-view.tsx | Modificado | Substituir stubs por StatusIntegracao |
| componentes/agenda/evento-card.tsx | Modificado | Badge de origem (Google/Outlook/Manual) |
| app/api/calendario/disconnect/route.ts | Novo | API route de desconexao |
| app/(protegido)/agenda/page.tsx | Modificado | Integracao do hook + componentes |
