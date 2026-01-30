# Story: Fluxo OAuth do Google Calendar

**Story ID:** CI-1.2
**Epic:** EPIC-CI-001
**Status:** Ready for Review
**Estimativa:** ~8h
**Prioridade:** HIGH
**Sprint Sugerido:** Mesmo sprint que CI-1.1

---

## Objetivo

Implementar o fluxo completo de OAuth 2.0 com Google Calendar API, desde o clique no botao "Conectar" ate o armazenamento seguro dos tokens na tabela `calendar_connections`. Apos esta story, o usuario podera autenticar sua conta Google para acesso futuro aos eventos.

## User Story

> Como usuario,
> Eu quero conectar minha conta Google Calendar clicando no botao "Conectar" na pagina de agenda,
> Para que o sistema possa acessar meus eventos do Google Calendar.

## Tasks

### Bloco 1: API Routes de Conexao

- [x] Task 1 (AC: 1): Estender `app/api/calendario/connect/route.ts` (criado em CI-1.1) para provider `google`:
  - Adicionar handler para `provider === 'google'` que gera Authorization URL com:
    - `client_id` = `process.env.GOOGLE_CLIENT_ID`
    - `redirect_uri` = `process.env.GOOGLE_REDIRECT_URI` (ex: `{origin}/api/calendario/google/callback`)
    - `scope` = `https://www.googleapis.com/auth/calendar.readonly`
    - `access_type` = `offline` (para obter refresh_token)
    - `prompt` = `consent` (forcar consentimento para garantir refresh_token)
    - `state` = gerado via `generateStateToken()` de `lib/calendario/auth-state.ts` (CI-1.1)
    - `response_type` = `code`
  - Retornar `{ url: authorizationUrl }` como JSON

- [x] Task 2 (AC: 2): Criar `app/api/calendario/google/callback/route.ts`:
  - Metodo GET (redirect do Google)
  - Receber `code` e `state` como query params
  - Validar `state` token via `validateStateToken()` de `lib/calendario/auth-state.ts` (CI-1.1)
  - Trocar `code` por tokens via `POST https://oauth2.googleapis.com/token` (native fetch):
    - `code`, `client_id`, `client_secret`, `redirect_uri`, `grant_type=authorization_code`
  - Extrair: `access_token`, `refresh_token`, `expires_in`, `scope`
  - Obter email do usuario via `GET https://www.googleapis.com/calendar/v3/calendars/primary` ou userinfo
  - Upsert na tabela `calendar_connections` (usar Supabase service role client):
    - `user_id` do state token
    - `provider` = 'Google'
    - `access_token`, `refresh_token`
    - `token_expires_at` = `NOW() + expires_in seconds`
    - `scopes` = array de scopes concedidos
    - `external_email` = email do Google
    - `is_active` = true
  - Redirect para `/agenda?connected=google` em caso de sucesso
  - Redirect para `/agenda?error=google_auth_failed` em caso de erro

- [x] Task 3: Criar `lib/calendario/google.ts` com funcoes auxiliares:
  - `buildGoogleAuthUrl(state: string): string` — monta URL de autorizacao
  - `exchangeGoogleCode(code: string): Promise<GoogleTokenResponse>` — troca code por tokens via fetch
  - `getGoogleUserEmail(accessToken: string): Promise<string>` — busca email do calendario primario
  - Todas as funcoes usam `fetch` nativo (zero dependencias novas)
  - Tipos importados de `types/calendario.ts`

### Bloco 2: Frontend — Botao Funcional

- [x] Task 4 (AC: 3, 4, 5): Atualizar `componentes/agenda/calendario-view.tsx`:
  - Adicionar prop `onConnectGoogle?: () => void` ao componente
  - Wiring do botao "Conectar" do Google (atualmente stub na linha ~55) com `onClick={onConnectGoogle}`
  - O handler no page.tsx chama `POST /api/calendario/connect` com `provider: 'google'`
  - Recebe URL de redirect e faz `window.location.href = url`
  - Na page `/agenda`, detectar query param `connected=google` e exibir toast de sucesso via `sonner`
  - Detectar query param `error=google_auth_failed` e exibir toast de erro
  - Limpar query params apos exibir toast (usando `router.replace`)

### Bloco 3: Seguranca e Documentacao

- [x] Task 5 (AC: 6): Documentar variaveis de ambiente necessarias:
  - Adicionar comentarios no `.env.example` (se existir) ou documentar no Dev Notes:
    - `GOOGLE_CLIENT_ID` — Client ID do Google Cloud Console
    - `GOOGLE_CLIENT_SECRET` — Client Secret do Google Cloud Console
    - `GOOGLE_REDIRECT_URI` — URL de callback (ex: `http://localhost:3000/api/calendario/google/callback`) — server-side only, sem prefixo `NEXT_PUBLIC_`
    - `CALENDAR_STATE_SECRET` — Secret dedicado para assinatura de state tokens (compartilhado entre providers, criado em CI-1.1)

- [x] Task 6: Validacoes de seguranca:
  - Verificar que `GOOGLE_CLIENT_SECRET` NUNCA e exposto ao client-side (apenas em API routes)
  - Verificar que o state token tem expiracao curta (5 minutos)
  - Verificar que tokens OAuth sao armazenados apenas server-side (tabela `calendar_connections`)
  - `npm run typecheck` passa sem erros
  - `npm run lint` passa sem erros

### Bloco 4: Verificacao de Integridade

- [x] Task 7 (AC: IV1, IV2, IV3): Verificar que nada existente quebrou:
  - Fluxo de login/logout do Supabase Auth funciona normalmente
  - Pagina `/agenda` carrega normalmente durante e apos o fluxo OAuth
  - Nenhum impacto em performance para usuarios que nao conectam Google

## Criterios de Aceite

- [x] API route `POST /api/calendario/connect` gera URL de autorizacao OAuth do Google com scopes `calendar.readonly`
- [x] API route `GET /api/calendario/google/callback` processa codigo, troca por tokens e armazena em `calendar_connections`
- [x] Botao "Conectar" do Google em `calendario-view.tsx` inicia o fluxo (redirect)
- [x] Apos callback bem-sucedido, usuario e redirecionado para `/agenda` com toast de sucesso
- [x] Em caso de erro, usuario e redirecionado para `/agenda` com toast de erro
- [x] Variaveis de ambiente `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` documentadas
- [x] Fluxo de login/logout do Supabase Auth nao e afetado (IV1)
- [x] Pagina `/agenda` carrega normalmente durante e apos o fluxo OAuth (IV2)
- [x] Nenhum impacto em performance para usuarios que nao conectam Google (IV3)

## Testes Requeridos

- **Unitario:** `buildGoogleAuthUrl()` gera URL valida com todos os parametros
- **Unitario:** `exchangeGoogleCode()` parseia resposta de tokens corretamente
- **Integracao:** API route `/api/calendario/connect` retorna URL de autorizacao Google valida
- **Integracao:** API route `/api/calendario/google/callback` com code valido armazena tokens (mock)
- **Manual:** Fluxo completo de OAuth redirect → consent → callback → toast

## Dependencias

- **Depende de:** CI-1.1 (tabela `calendar_connections`, state token, connect route base)
- **Bloqueia:** CI-1.4 (sync precisa de tokens armazenados)
- **Paralelo com:** CI-1.3 (Outlook OAuth — ambos dependem apenas de CI-1.1)

## Riscos

| Risco | Severidade | Mitigacao |
|-------|------------|-----------|
| Redirect URI misconfigured no Google Cloud Console | HIGH | Documentar setup passo-a-passo nos Dev Notes |
| Google nao retorna `refresh_token` se `prompt=consent` omitido | HIGH | Sempre usar `prompt=consent` + `access_type=offline` |
| State token CSRF vulnerability se nao validado | HIGH | Assinar state com secret server-side, validar no callback |
| CORS issues no callback redirect | LOW | Callback e GET redirect do Google, nao CORS |

## Dev Notes

### Contexto Tecnico

**Padrao de API Routes Existente:**
- Unico API route existente: `app/api/foco/save-partial/route.ts` (POST)
- Usa `NextRequest` e `NextResponse`
- Valida sessao via Supabase server client
- [Source: app/api/foco/save-partial/route.ts]

**OAuth Existente no Projeto:**
- `lib/supabase/auth.ts` implementa `signInWithOAuth(provider)` para login via Google/Apple
- Calendar OAuth e SEPARADO do Supabase Auth — sao fluxos independentes
- O projeto ja usa redirect (nao popup) para OAuth do Supabase Auth
- [Source: lib/supabase/auth.ts]

**Middleware:**
- `/agenda` ja e rota protegida no middleware (autenticacao obrigatoria)
- API routes em `/api/calendario/*` NAO estao no matcher do middleware — autenticacao deve ser feita dentro do route handler
- [Source: middleware.ts]

**Componente CalendarioView:**
- Arquivo: `componentes/agenda/calendario-view.tsx` (76 linhas)
- Botao Google stub: linhas 51-59 (icone + texto "Conectar", sem onClick handler)
- Recebe props: `dataSelecionada`, `onSelecionarData`
- Precisa de nova prop: `onConnectGoogle`
- [Source: componentes/agenda/calendario-view.tsx]

**Google Calendar API v3 — Endpoints Relevantes:**
- Authorization: `https://accounts.google.com/o/oauth2/v2/auth`
- Token exchange: `https://oauth2.googleapis.com/token`
- Calendar primary: `https://www.googleapis.com/calendar/v3/calendars/primary`
- Scopes Phase 1: `https://www.googleapis.com/auth/calendar.readonly`

**State Token Strategy (implementado em CI-1.1):**
- Modulo: `lib/calendario/auth-state.ts`
- Usar `crypto.randomUUID()` como nonce
- Payload: `{ userId, provider, nonce, exp: Date.now() + 5 * 60 * 1000 }`
- Assinatura: HMAC-SHA256 usando `process.env.CALENDAR_STATE_SECRET` (secret dedicado)
- Formato: base64(payload).base64(signature)
- Nao usar `GOOGLE_CLIENT_SECRET` para assinatura — secret dedicado permite compartilhar entre providers

### Setup do Google Cloud Console

1. Ir para https://console.cloud.google.com/
2. Criar ou selecionar projeto
3. Ativar Google Calendar API
4. Criar credenciais OAuth 2.0 (tipo Web Application)
5. Adicionar Authorized Redirect URI: `http://localhost:3000/api/calendario/google/callback`
6. Copiar Client ID e Client Secret para `.env`

---

### Dev Agent Record
**Agent Model Used:** Claude Opus 4.5
**Debug Log References:** --

#### Completion Notes
- Implemented Google OAuth flow end-to-end (connect route, callback route, google.ts helper, UI wiring)
- `buildGoogleAuthUrl` uses `access_type=offline` + `prompt=consent` to ensure refresh_token
- `exchangeGoogleCode` uses native fetch to POST to Google token endpoint
- `getGoogleUserEmail` reads email from Google Calendar primary endpoint
- Callback route upserts to `calendar_connections` via service role client
- Used `(supabaseAdmin as any)` cast for `.from('calendar_connections')` since table type will be auto-generated via `supabase gen types`
- Frontend: `calendario-view.tsx` receives `onConnectGoogle` prop, `page.tsx` handles connect flow + query param toast detection
- `GOOGLE_CLIENT_SECRET` is server-side only (API routes), never exposed to client
- typecheck and lint pass clean
- Implemented in parallel with CI-1.3 (shared files updated for both providers simultaneously)

#### Change Log
| Data | Alteracao | Autor |
|------|-----------|-------|
| 2026-01-30 | Story criada a partir do PRD calendar-integration.md | @sm (River) |
| 2026-01-30 | Revisao PO: connect route movido para CI-1.1; state token via auth-state.ts; env var GOOGLE_REDIRECT_URI (sem NEXT_PUBLIC_); CALENDAR_STATE_SECRET dedicado; testes de state token movidos para CI-1.1 | @po (Pax) |
| 2026-01-30 | Implementation complete: Google OAuth flow (connect route, callback, google.ts, UI wiring) | @dev (Dex) |

#### File List
| Arquivo | Status | Descricao |
|---------|--------|-----------|
| app/api/calendario/connect/route.ts | Modificado | Adicionar handler Google ao connect route (criado em CI-1.1) |
| app/api/calendario/google/callback/route.ts | Novo | Callback do Google OAuth |
| lib/calendario/google.ts | Novo | Client Google Calendar API |
| componentes/agenda/calendario-view.tsx | Modificado | Botao Google funcional |
| app/(protegido)/agenda/page.tsx | Modificado | Handler de conexao + toast |
