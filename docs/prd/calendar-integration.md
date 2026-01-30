# Builders Performance — Integração com Calendários Externos (Brownfield Enhancement PRD)

> **Versão:** 1.0.0
> **Autor:** Morgan (PM Agent)
> **Data:** 2026-01-30
> **Status:** DRAFT
> **Modo de Execução:** YOLO

---

## 1. Intro — Análise do Projeto e Contexto

### 1.1 Fonte de Análise

- Análise IDE-based do projeto carregado
- Código-fonte da `/agenda` inspecionado: `page.tsx`, `calendario-view.tsx`, `useAgenda.ts`, `types/agenda.ts`
- Schema do banco: `007_create_events_table.sql`
- Auth existente: `lib/supabase/auth.ts`

### 1.2 Estado Atual do Projeto

**Builders Performance** é um app de produtividade pessoal com timer Pomodoro, Kanban, hábitos, calendário, cursos e gamificação XP/level. Construído com Next.js 16 App Router + Supabase + React Query + Radix UI + Tailwind CSS 4.

A página `/agenda` já possui:
- CRUD completo de eventos via Supabase (RLS por `auth.uid()`)
- Calendar picker com `react-day-picker`
- Componente `CalendarioView` com **botões stub** para Google Calendar e Outlook Calendar (sem funcionalidade)
- Campo `calendario` na tabela `events` com enum `'Manual' | 'Google' | 'Outlook'` — já preparado para integração
- Hook `useAgenda` com React Query (staleTime 2min)
- Tipagem completa em `types/agenda.ts`

### 1.3 Documentação Disponível

- [x] Tech Stack Documentation
- [x] Source Tree / Architecture
- [x] Coding Standards (Portuguese naming convention)
- [ ] API Documentation (não existe — operações diretas via Supabase client)
- [ ] External API Documentation (Google Calendar API / Microsoft Graph — a ser integrado)
- [x] UX/UI Guidelines (shadcn/Radix + Tailwind, estilo `new-york`)
- [x] Technical Debt Documentation (`docs/prd/technical-debt-assessment.md`)

### 1.4 Escopo do Enhancement

**Tipo:** Integration with New Systems

**Descrição:** Integrar a página `/agenda` com Google Calendar API e Microsoft Outlook Calendar (via Microsoft Graph API), permitindo sincronização bidirecional de eventos entre o Builders Performance e os calendários externos do usuário.

**Avaliação de Impacto:** Significant Impact (substantial existing code changes)

- Novos API routes no Next.js (server-side OAuth + token management)
- Nova tabela no Supabase para armazenar tokens OAuth
- Modificação do hook `useAgenda` para suportar sync
- Novos componentes de UI para status de conexão e gestão de integrações
- Middleware de callback OAuth
- Background sync via API routes

### 1.5 Objetivos

- Permitir que o usuário conecte sua conta Google e/ou Outlook Calendar ao Builders Performance
- Sincronizar eventos externos para visualização unificada na `/agenda`
- Permitir criação de eventos no Builders Performance que sejam refletidos no calendário externo
- Indicar visualmente a origem de cada evento (Manual, Google, Outlook)
- Manter a funcionalidade existente 100% intacta para usuários que não conectarem calendários

### 1.6 Contexto e Motivação

A página `/agenda` atualmente funciona como um calendário isolado. Usuários de produtividade utilizam Google Calendar e Outlook como suas ferramentas primárias de agendamento. Sem integração, o Builders Performance não reflete a realidade da agenda do usuário, reduzindo a utilidade do recurso e forçando entrada manual dupla de dados.

A integração com calendários externos transforma a `/agenda` de um calendário secundário em uma **visão unificada** da agenda do usuário, aumentando significativamente o valor e a aderência do app.

### 1.7 Change Log

| Change | Date | Version | Description | Author |
|--------|------|---------|-------------|--------|
| Criação inicial | 2026-01-30 | 1.0.0 | PRD criado em YOLO mode | Morgan (PM) |

---

## 2. Requisitos

### 2.1 Requisitos Funcionais

- **FR1:** O sistema deve permitir que o usuário conecte sua conta Google Calendar via OAuth 2.0 a partir da página `/agenda`
- **FR2:** O sistema deve permitir que o usuário conecte sua conta Outlook Calendar via OAuth 2.0 (Microsoft Graph API) a partir da página `/agenda`
- **FR3:** O sistema deve importar eventos do Google Calendar para a tabela `events` com `calendario = 'Google'`
- **FR4:** O sistema deve importar eventos do Outlook Calendar para a tabela `events` com `calendario = 'Outlook'`
- **FR5:** A sincronização de leitura (import) deve buscar eventos em um range de -30 a +90 dias a partir da data atual
- **FR6:** Eventos criados manualmente no Builders Performance (com `calendario = 'Manual'`) não devem ser enviados para calendários externos
- **FR7:** O sistema deve exibir um badge visual indicando a origem do evento (Manual, Google, Outlook) no `evento-card.tsx`
- **FR8:** O sistema deve permitir que o usuário desconecte um calendário externo a qualquer momento
- **FR9:** Ao desconectar, os eventos importados daquele calendário devem ser removidos da tabela `events`
- **FR10:** O sistema deve atualizar eventos sincronizados quando houver mudanças no calendário externo (sync incremental)
- **FR11:** O sistema deve armazenar um `external_event_id` para mapear eventos externos aos locais e evitar duplicação
- **FR12:** O sistema deve exibir o status de conexão (conectado/desconectado) para cada provedor no componente `CalendarioView`
- **FR13:** O sistema deve fazer refresh automático dos tokens OAuth antes de expirarem
- **FR14:** A sincronização deve ocorrer: (a) ao abrir a página `/agenda`, (b) via botão manual "Sincronizar agora"

### 2.2 Requisitos Não Funcionais

- **NFR1:** A sincronização inicial não deve levar mais de 5 segundos para carregar os eventos no range definido
- **NFR2:** Os tokens OAuth (access + refresh) devem ser armazenados de forma segura no Supabase, nunca expostos ao client-side
- **NFR3:** A feature não deve degradar a performance da página `/agenda` para usuários sem calendários conectados
- **NFR4:** O sistema deve funcionar com a mesma conta Supabase Auth do usuário, sem criar fluxo de login separado
- **NFR5:** A integração deve respeitar os rate limits das APIs externas (Google: 10 req/s por usuário; Microsoft Graph: 10.000 req/10min por app)
- **NFR6:** Todos os API routes devem validar a sessão do usuário via Supabase Auth server-side
- **NFR7:** O código deve seguir a convenção Portuguese naming do projeto
- **NFR8:** Erros de sincronização devem ser tratados gracefully com toast notifications, sem quebrar a UI

### 2.3 Requisitos de Compatibilidade

- **CR1 — API Compatibility:** Os API routes existentes (ex: `/api/foco/save-partial`) não devem ser afetados. Novos routes sob `/api/calendario/`
- **CR2 — Database Schema Compatibility:** A tabela `events` existente deve manter sua estrutura. Novos campos (`external_event_id`) adicionados via ALTER TABLE. Nova tabela `calendar_connections` para tokens
- **CR3 — UI/UX Consistency:** Os novos componentes devem usar Radix UI + Tailwind CSS 4 + shadcn `new-york` style, mantendo consistência com o design existente
- **CR4 — Integration Compatibility:** O hook `useAgenda` deve manter sua interface `UseAgendaReturn` existente. Novas funcionalidades adicionadas sem breaking changes

---

## 3. Objetivos de Interface do Usuário

### 3.1 Integração com UI Existente

A UI atual já possui os botões stub em `calendario-view.tsx` (linhas 50-71). A integração deve:
- Transformar os botões "Conectar" em botões funcionais que iniciam o fluxo OAuth
- Após conexão, trocar o botão para "Conectado" com opção de desconectar
- Adicionar indicador de última sincronização
- Adicionar botão "Sincronizar agora"

### 3.2 Telas Modificadas / Novas

| Tela | Tipo | Descrição |
|------|------|-----------|
| `calendario-view.tsx` | Modificação | Botões funcionais de conexão, status, sync |
| `evento-card.tsx` | Modificação | Badge de origem (Google/Outlook/Manual) |
| `/api/calendario/google/callback` | Nova | OAuth callback do Google |
| `/api/calendario/outlook/callback` | Nova | OAuth callback do Outlook |
| `/api/calendario/sync` | Nova | Endpoint de sincronização |
| `/api/calendario/connect` | Nova | Iniciar fluxo OAuth |
| `/api/calendario/disconnect` | Nova | Desconectar calendário |

### 3.3 Consistência de UI

- Usar `Botao` (shadcn), `Cartao`, `DialogoAlerta` existentes
- Ícones via `lucide-react`
- Toast via `sonner`
- Cores de status: verde (conectado), cinza (desconectado), amarelo (sincronizando)
- Badge de origem: ícone do Google (colorido), ícone do Outlook (azul), ícone manual (cinza)

---

## 4. Restrições Técnicas e Requisitos de Integração

### 4.1 Tech Stack Existente

- **Languages:** TypeScript 5 (strict)
- **Frameworks:** Next.js 16.1.1 (App Router, RSC), React 19
- **Database:** Supabase PostgreSQL com RLS
- **Infrastructure:** Vercel (presumido), Supabase Cloud
- **External Dependencies:** Google Calendar API v3, Microsoft Graph API v1.0

### 4.2 Abordagem de Integração

**Database Integration Strategy:**
- Nova tabela `calendar_connections` para armazenar OAuth tokens (access_token, refresh_token, expires_at, provider, scopes)
- Novo campo `external_event_id` na tabela `events` para mapeamento de eventos externos
- RLS policies na nova tabela seguindo o padrão existente (`auth.uid()`)
- Service role key para operações server-side de sync

**API Integration Strategy:**
- API routes em `app/api/calendario/` para operações server-side
- Google Calendar API v3: Scopes `calendar.readonly` (Phase 1), `calendar.events` (Phase 2 — write)
- Microsoft Graph API: Scopes `Calendars.Read` (Phase 1), `Calendars.ReadWrite` (Phase 2)
- Token refresh automático via API route antes de cada sync

**Frontend Integration Strategy:**
- Novo hook `useCalendarIntegration` para gerenciar estado de conexões
- Extensão do `useAgenda` para incluir sync trigger
- React Query para cache de status de conexão
- OAuth flow via redirect (não popup) — padrão já usado no projeto

**Testing Integration Strategy:**
- Unit tests para funções de transformação de eventos (Google → AgendaEvent, Outlook → AgendaEvent)
- Integration tests para API routes de sync
- E2E test para fluxo completo de conexão OAuth (mock)

### 4.3 Organização de Código

**File Structure Approach:**
```
app/api/calendario/
├── connect/route.ts          # POST - Iniciar OAuth
├── disconnect/route.ts       # POST - Desconectar
├── sync/route.ts             # POST - Trigger sync
├── google/
│   └── callback/route.ts     # GET - OAuth callback
└── outlook/
    └── callback/route.ts     # GET - OAuth callback

hooks/
├── useAgenda.ts              # Existente (modificado)
└── useCalendarIntegration.ts # Novo

lib/
├── calendario/
│   ├── google.ts             # Google Calendar API client
│   ├── outlook.ts            # Microsoft Graph API client
│   ├── sync.ts               # Lógica de sincronização
│   └── transformers.ts       # Transformação de eventos externos → AgendaEvent
└── schemas/
    └── calendario.ts         # Zod schemas para validação

componentes/agenda/
├── calendario-view.tsx       # Modificado (conexão funcional)
├── evento-card.tsx           # Modificado (badge de origem)
└── status-integracao.tsx     # Novo (status + sync button)

types/
├── agenda.ts                 # Existente (modificado)
└── calendario.ts             # Novo (tipos de integração)

supabase/migrations/
└── 0XX_calendar_connections.sql  # Nova migration
```

**Naming Conventions:** Portuguese naming (ex: `useCalendarIntegration` → `useIntegracaoCalendario` se seguir padrão existente, mas hooks atuais usam camelCase inglês como `useAgenda`, `useTarefas` — manter consistência)

**Coding Standards:** Seguir padrões existentes — React Query v5 mutations, Supabase client patterns, Zod validation, immutable updates

### 4.4 Deployment e Operações

**Build Process Integration:**
- Environment variables novas: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`
- Configurar OAuth redirect URIs nos consoles do Google Cloud e Azure AD
- Sem dependências externas novas (usa `fetch` nativo para API calls)

**Deployment Strategy:**
- Deploy incremental via stories
- Feature flag não necessário — botões já existem como stub, ativação é progressiva
- Rollback: reverter migration + redeploy

**Monitoring:**
- Logs de erro de sync via Supabase Logs
- Métricas: número de conexões ativas, frequência de sync, taxa de erro

**Configuration Management:**
- Secrets via environment variables (nunca no código)
- OAuth scopes configuráveis por env

### 4.5 Avaliação de Riscos

**Technical Risks:**
- OAuth token expiration/revocation sem tratamento pode quebrar sync silenciosamente
- Rate limiting das APIs externas pode afetar usuários com muitos eventos
- Inconsistência de dados se sync falhar parcialmente

**Integration Risks:**
- Google e Microsoft podem mudar APIs ou deprecar scopes
- Supabase Auth OAuth ≠ Calendar OAuth — são fluxos separados que devem coexistir
- Eventos deletados no calendário externo precisam ser detectados e removidos localmente

**Deployment Risks:**
- Configuração incorreta de OAuth redirect URIs causa falha no callback
- Secrets não configurados no ambiente de produção

**Mitigation Strategies:**
- Retry com backoff exponencial para falhas de sync
- Validação de tokens antes de cada operação
- Sync incremental (usar syncToken do Google / deltaLink do Microsoft) para reduzir chamadas
- Testes E2E com mocks das APIs externas
- Documentação clara de setup de OAuth no README

---

## 5. Estrutura de Epic e Stories

### 5.1 Abordagem de Epic

**Epic Structure Decision:** Single Epic — "Integração com Calendários Externos"

**Rationale:** Trata-se de uma única feature coesa (integração de calendários) que tem dependências lineares entre suas partes. Dividir em múltiplos epics fragmentaria o valor entregue. Um único epic com stories sequenciais permite entrega incremental dentro de um escopo unificado.

---

## 6. Epic 1: Integração com Calendários Externos

**Epic Goal:** Permitir que usuários do Builders Performance conectem Google Calendar e Outlook Calendar à página `/agenda`, visualizando todos os eventos em uma única interface.

**Integration Requirements:** Manter 100% de compatibilidade com a funcionalidade existente. Usuários sem calendários conectados não devem perceber nenhuma mudança.

---

### Story 1.1 — Infraestrutura de Tokens OAuth e Database Schema

> Como desenvolvedor,
> Eu quero uma tabela segura para armazenar tokens OAuth de calendários externos,
> Para que o sistema possa autenticar com Google e Microsoft APIs de forma segura.

**Acceptance Criteria:**
1. Nova tabela `calendar_connections` criada com campos: `id`, `user_id`, `provider` (Google/Outlook), `access_token` (encrypted), `refresh_token` (encrypted), `token_expires_at`, `scopes`, `external_email`, `is_active`, `last_sync_at`, `created_at`, `updated_at`
2. RLS policies aplicadas: usuário só acessa suas próprias conexões
3. Campo `external_event_id` adicionado à tabela `events` (nullable, TEXT)
4. Índice único em `events(user_id, external_event_id)` para prevenir duplicatas
5. Tipos TypeScript gerados e exportados em `types/calendario.ts`
6. Zod schemas criados em `lib/schemas/calendario.ts`

**Integration Verification:**
- IV1: Tabela `events` existente funciona normalmente após ALTER TABLE
- IV2: Todas as queries do `useAgenda` retornam resultados corretos
- IV3: CRUD de eventos manuais não é afetado

---

### Story 1.2 — Fluxo OAuth do Google Calendar

> Como usuário,
> Eu quero conectar minha conta Google Calendar clicando no botão "Conectar" na página de agenda,
> Para que o sistema possa acessar meus eventos do Google Calendar.

**Acceptance Criteria:**
1. API route `POST /api/calendario/connect` gera URL de autorização OAuth do Google com scopes `calendar.readonly`
2. API route `GET /api/calendario/google/callback` processa o código de autorização, troca por tokens e armazena na tabela `calendar_connections`
3. Botão "Conectar" do Google em `calendario-view.tsx` inicia o fluxo (redirect)
4. Após callback bem-sucedido, o usuário é redirecionado de volta para `/agenda` com toast de sucesso
5. Em caso de erro, o usuário é redirecionado para `/agenda` com toast de erro
6. Variáveis de ambiente `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` documentadas

**Integration Verification:**
- IV1: Fluxo de login/logout do Supabase Auth não é afetado
- IV2: Página `/agenda` carrega normalmente durante e após o fluxo OAuth
- IV3: Nenhum impacto em performance para usuários que não conectam Google

---

### Story 1.3 — Fluxo OAuth do Outlook Calendar

> Como usuário,
> Eu quero conectar minha conta Outlook Calendar clicando no botão "Conectar" na página de agenda,
> Para que o sistema possa acessar meus eventos do Outlook Calendar.

**Acceptance Criteria:**
1. API route `POST /api/calendario/connect` suporta provider `outlook` e gera URL de autorização Microsoft com scopes `Calendars.Read`
2. API route `GET /api/calendario/outlook/callback` processa o código de autorização, troca por tokens e armazena na tabela `calendar_connections`
3. Botão "Conectar" do Outlook em `calendario-view.tsx` inicia o fluxo (redirect)
4. Após callback bem-sucedido, o usuário é redirecionado de volta para `/agenda` com toast de sucesso
5. Em caso de erro, o usuário é redirecionado para `/agenda` com toast de erro
6. Variáveis de ambiente `MICROSOFT_CLIENT_ID` e `MICROSOFT_CLIENT_SECRET` documentadas

**Integration Verification:**
- IV1: Fluxo do Google Calendar (Story 1.2) continua funcionando
- IV2: Ambos os provedores podem estar conectados simultaneamente
- IV3: Supabase Auth não é afetado

---

### Story 1.4 — Sincronização de Eventos (Import)

> Como usuário,
> Eu quero que meus eventos do Google Calendar e Outlook Calendar apareçam na minha agenda do Builders Performance,
> Para que eu tenha uma visão unificada de todos os meus compromissos.

**Acceptance Criteria:**
1. API route `POST /api/calendario/sync` busca eventos dos calendários conectados no range -30 a +90 dias
2. Eventos do Google são transformados para o formato `AgendaEvent` com `calendario = 'Google'` e `external_event_id` preenchido
3. Eventos do Outlook são transformados para o formato `AgendaEvent` com `calendario = 'Outlook'` e `external_event_id` preenchido
4. Eventos novos são inseridos; eventos existentes (por `external_event_id`) são atualizados; eventos removidos do calendário externo são deletados localmente
5. Sync é disparado automaticamente ao carregar a página `/agenda` (se há conexões ativas)
6. Botão "Sincronizar agora" disponível no componente de status
7. Token refresh automático antes de cada sync (se token expirado)
8. Erros de sync exibem toast notification sem quebrar a UI

**Integration Verification:**
- IV1: Eventos manuais (`calendario = 'Manual'`) não são afetados pelo sync
- IV2: Performance da página com 0 conexões ativa é idêntica à atual
- IV3: React Query cache é invalidado corretamente após sync

---

### Story 1.5 — UI de Status e Gerenciamento de Conexões

> Como usuário,
> Eu quero ver quais calendários estão conectados e poder desconectá-los,
> Para que eu tenha controle sobre quais dados são sincronizados.

**Acceptance Criteria:**
1. Hook `useCalendarIntegration` criado com: `connections`, `isLoading`, `connect(provider)`, `disconnect(provider)`, `sync()`, `isSyncing`
2. Componente `calendario-view.tsx` atualizado: mostra status "Conectado" (verde) ou "Conectar" (cinza) para cada provedor
3. Botão de desconectar disponível para cada provedor conectado (com confirmação via `DialogoAlerta`)
4. API route `POST /api/calendario/disconnect` remove tokens e eventos importados do provedor
5. Indicador de "Última sincronização: X minutos atrás" visível
6. Novo componente `status-integracao.tsx` com botão "Sincronizar agora" e spinner durante sync
7. `evento-card.tsx` atualizado com badge de origem (ícone Google / Outlook / Manual)

**Integration Verification:**
- IV1: Layout da página `/agenda` mantém proporções e responsividade
- IV2: Dark mode funciona corretamente nos novos componentes
- IV3: Loading skeleton em `loading.tsx` não é afetado

---

### Story 1.6 — Tratamento de Erros, Token Refresh e Resiliência

> Como desenvolvedor,
> Eu quero que o sistema trate falhas de sync, tokens expirados e edge cases de forma resiliente,
> Para que a experiência do usuário seja confiável mesmo em condições adversas.

**Acceptance Criteria:**
1. Token refresh automático implementado: antes de cada sync, verificar `token_expires_at` e renovar se necessário
2. Se refresh token for revogado pelo usuário no Google/Microsoft, marcar conexão como `is_active = false` e exibir toast pedindo reconexão
3. Retry com backoff exponencial (3 tentativas) para falhas temporárias de API
4. Rate limiting respeitado: máximo 1 sync automático a cada 5 minutos por conexão
5. Erros específicos mapeados: token expirado, rate limit, rede, permissão revogada
6. Logs de erro registrados no console do servidor (não expostos ao client)
7. Validação Zod em todos os dados recebidos das APIs externas antes de inserir no banco

**Integration Verification:**
- IV1: Falha de sync não bloqueia carregamento da página
- IV2: Eventos manuais continuam funcionando mesmo se todas as integrações falharem
- IV3: Nenhum dado sensível (tokens) é exposto nos logs do client

---

## Apêndice A — Variáveis de Ambiente Necessárias

```env
# Google Calendar OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXT_PUBLIC_GOOGLE_REDIRECT_URI=

# Microsoft Outlook OAuth
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=
NEXT_PUBLIC_MICROSOFT_REDIRECT_URI=
```

## Apêndice B — Schema da Tabela `calendar_connections`

```sql
CREATE TABLE public.calendar_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('Google', 'Outlook')),
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ NOT NULL,
  scopes TEXT[] NOT NULL DEFAULT '{}',
  external_email TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_sync_at TIMESTAMPTZ,
  sync_token TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-- RLS
ALTER TABLE public.calendar_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY calendar_connections_select_own ON public.calendar_connections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY calendar_connections_insert_own ON public.calendar_connections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY calendar_connections_update_own ON public.calendar_connections
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY calendar_connections_delete_own ON public.calendar_connections
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY calendar_connections_service_role ON public.calendar_connections
  FOR ALL USING (auth.role() = 'service_role');

-- Indexes
CREATE INDEX idx_calendar_connections_user_id ON public.calendar_connections(user_id);
CREATE INDEX idx_calendar_connections_provider ON public.calendar_connections(user_id, provider);

-- Trigger
CREATE TRIGGER update_calendar_connections_updated_at
  BEFORE UPDATE ON public.calendar_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

## Apêndice C — Alteração na Tabela `events`

```sql
ALTER TABLE public.events
  ADD COLUMN external_event_id TEXT;

CREATE UNIQUE INDEX idx_events_external_id
  ON public.events(user_id, external_event_id)
  WHERE external_event_id IS NOT NULL;
```

## Apêndice D — Diagrama de Fluxo OAuth

```
Usuário clica "Conectar Google"
  → Frontend chama POST /api/calendario/connect?provider=google
  → API route gera authorization URL com state token
  → Redirect para Google OAuth consent screen
  → Usuário autoriza
  → Google redireciona para GET /api/calendario/google/callback?code=xxx&state=yyy
  → API route troca code por tokens
  → Armazena tokens em calendar_connections
  → Redirect para /agenda com ?connected=google
  → Frontend exibe toast de sucesso
  → Trigger sync automático
```

## Apêndice E — Decisões de Design e Trade-offs

| Decisão | Escolha | Alternativa Rejeitada | Rationale |
|---------|---------|----------------------|-----------|
| Sync direction | Read-only (Phase 1) | Bidirecional | Reduz complexidade e risco. Write pode ser Phase 2 |
| Token storage | Supabase table | Supabase Vault / external KMS | Vault é mais seguro mas adiciona complexidade. Para V1, tabela com RLS é suficiente |
| Sync trigger | On page load + manual | Webhook / Cron | Webhooks requerem infraestrutura adicional (pub/sub). Para V1, sync on-demand é suficiente |
| OAuth flow | Redirect | Popup window | Consistente com o padrão já usado no Supabase Auth do projeto |
| API client | Native fetch | googleapis / @microsoft/graph-client | Zero dependências novas. APIs REST são simples o suficiente |
| Sync range | -30 / +90 dias | All events / Custom | Balance entre utilidade e volume de dados |
| Event deletion on disconnect | Remove imported events | Keep as orphaned | Dados limpos. Usuário pode reconectar para reimportar |
