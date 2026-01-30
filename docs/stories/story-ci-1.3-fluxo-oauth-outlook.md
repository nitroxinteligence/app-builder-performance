# Story: Fluxo OAuth do Outlook Calendar

**Story ID:** CI-1.3
**Epic:** EPIC-CI-001
**Status:** Ready for Review
**Estimativa:** ~8h
**Prioridade:** HIGH
**Sprint Sugerido:** Mesmo sprint que CI-1.2

---

## Objetivo

Implementar o fluxo completo de OAuth 2.0 com Microsoft Graph API para Outlook Calendar, reaproveitando a infraestrutura compartilhada criada em CI-1.1 (state token, connect route base). Esta story pode ser desenvolvida em paralelo com CI-1.2 (Google OAuth). Apos CI-1.2 e CI-1.3, o usuario podera conectar tanto Google quanto Outlook simultaneamente.

## User Story

> Como usuario,
> Eu quero conectar minha conta Outlook Calendar clicando no botao "Conectar" na pagina de agenda,
> Para que o sistema possa acessar meus eventos do Outlook Calendar.

## Tasks

### Bloco 1: Extensao do API Route de Conexao

- [x] Task 1 (AC: 1): Estender `app/api/calendario/connect/route.ts` (criado em CI-1.1) para provider `outlook`:
  - Adicionar handler para `provider === 'outlook'` que gera Authorization URL com:
    - `client_id` = `process.env.MICROSOFT_CLIENT_ID`
    - `redirect_uri` = `process.env.MICROSOFT_REDIRECT_URI` (ex: `{origin}/api/calendario/outlook/callback`)
    - `scope` = `offline_access Calendars.Read User.Read`
    - `response_type` = `code`
    - `state` = gerado via `generateStateToken()` de `lib/calendario/auth-state.ts` (CI-1.1)
    - `response_mode` = `query`
  - Authorization endpoint: `https://login.microsoftonline.com/common/oauth2/v2.0/authorize`
  - Nota: `offline_access` e necessario para obter refresh_token na Microsoft

- [x] Task 2 (AC: 2): Criar `app/api/calendario/outlook/callback/route.ts`:
  - Metodo GET (redirect da Microsoft)
  - Receber `code` e `state` como query params
  - Validar `state` token via `validateStateToken()` de `lib/calendario/auth-state.ts` (CI-1.1)
  - Trocar `code` por tokens via `POST https://login.microsoftonline.com/common/oauth2/v2.0/token`:
    - `code`, `client_id`, `client_secret`, `redirect_uri`, `grant_type=authorization_code`, `scope`
  - Extrair: `access_token`, `refresh_token`, `expires_in`
  - Obter email do usuario via `GET https://graph.microsoft.com/v1.0/me` (header: `Authorization: Bearer {token}`)
  - Upsert na tabela `calendar_connections`:
    - `user_id` do state token
    - `provider` = 'Outlook'
    - `access_token`, `refresh_token`
    - `token_expires_at` = `NOW() + expires_in seconds`
    - `scopes` = `['Calendars.Read', 'User.Read']`
    - `external_email` = email do Microsoft profile
    - `is_active` = true
  - Redirect para `/agenda?connected=outlook` em caso de sucesso
  - Redirect para `/agenda?error=outlook_auth_failed` em caso de erro

- [x] Task 3: Criar `lib/calendario/outlook.ts` com funcoes auxiliares:
  - `buildOutlookAuthUrl(state: string): string` — monta URL de autorizacao Microsoft
  - `exchangeOutlookCode(code: string): Promise<OutlookTokenResponse>` — troca code por tokens via fetch
  - `getOutlookUserEmail(accessToken: string): Promise<string>` — busca email via Graph /me
  - Todas as funcoes usam `fetch` nativo
  - Tipos importados de `types/calendario.ts`

### Bloco 2: Frontend — Botao Funcional

- [x] Task 4 (AC: 3, 4, 5): Atualizar `componentes/agenda/calendario-view.tsx`:
  - Adicionar prop `onConnectOutlook?: () => void` ao componente
  - Wiring do botao "Conectar" do Outlook (atualmente stub na linha ~65) com `onClick={onConnectOutlook}`
  - O handler no page.tsx chama `POST /api/calendario/connect` com `provider: 'outlook'`
  - Recebe URL de redirect e faz `window.location.href = url`
  - Detectar query param `connected=outlook` e exibir toast de sucesso
  - Detectar query param `error=outlook_auth_failed` e exibir toast de erro
  - Se CI-1.2 ja foi implementado, reutilizar funcao de deteccao de query params; caso contrario, criar funcao unica reutilizavel

### Bloco 3: Seguranca e Documentacao

- [x] Task 5 (AC: 6): Documentar variaveis de ambiente:
  - `MICROSOFT_CLIENT_ID` — Application (client) ID do Azure AD
  - `MICROSOFT_CLIENT_SECRET` — Client Secret do Azure AD
  - `MICROSOFT_REDIRECT_URI` — URL de callback (ex: `http://localhost:3000/api/calendario/outlook/callback`) — server-side only, sem prefixo `NEXT_PUBLIC_`
  - `CALENDAR_STATE_SECRET` — ja configurado em CI-1.1 (compartilhado entre providers)

- [x] Task 6: Validacoes de seguranca:
  - Verificar que `MICROSOFT_CLIENT_SECRET` NUNCA e exposto ao client-side
  - Verificar que tokens OAuth sao armazenados apenas server-side
  - `npm run typecheck` passa sem erros
  - `npm run lint` passa sem erros

### Bloco 4: Verificacao de Integridade

- [x] Task 7 (AC: IV1, IV2, IV3): Verificar integridade:
  - Fluxo do Google Calendar (CI-1.2) continua funcionando
  - Ambos os provedores podem estar conectados simultaneamente (UNIQUE constraint e por `(user_id, provider)`)
  - Supabase Auth nao e afetado

## Criterios de Aceite

- [x] API route `POST /api/calendario/connect` suporta provider `outlook` e gera URL de autorizacao Microsoft com scopes `Calendars.Read`
- [x] API route `GET /api/calendario/outlook/callback` processa codigo, troca por tokens e armazena em `calendar_connections`
- [x] Botao "Conectar" do Outlook em `calendario-view.tsx` inicia o fluxo (redirect)
- [x] Apos callback bem-sucedido, usuario e redirecionado para `/agenda` com toast de sucesso
- [x] Em caso de erro, usuario e redirecionado para `/agenda` com toast de erro
- [x] Variaveis de ambiente `MICROSOFT_CLIENT_ID` e `MICROSOFT_CLIENT_SECRET` documentadas
- [x] Se CI-1.2 ja foi implementado, fluxo do Google Calendar continua funcionando (IV1)
- [x] Ambos os provedores podem estar conectados simultaneamente — UNIQUE(user_id, provider) permite (IV2)
- [x] Supabase Auth nao e afetado (IV3)

## Testes Requeridos

- **Unitario:** `buildOutlookAuthUrl()` gera URL valida com todos os parametros
- **Unitario:** `exchangeOutlookCode()` parseia resposta de tokens corretamente
- **Unitario:** `getOutlookUserEmail()` extrai email do response do Graph /me
- **Integracao:** API route `/api/calendario/connect` retorna URL valida para provider `outlook`
- **Integracao:** API route `/api/calendario/connect` rejeita provider invalido (400)
- **Integracao:** API route `/api/calendario/outlook/callback` com code valido armazena tokens (mock)
- **Integracao:** Ambos Google e Outlook podem ter tokens armazenados simultaneamente para o mesmo usuario
- **Manual:** Fluxo completo de OAuth redirect → consent → callback → toast

## Dependencias

- **Depende de:** CI-1.1 (tabela `calendar_connections`, state token, connect route base)
- **Bloqueia:** CI-1.4 (sync precisa de tokens armazenados)
- **Paralelo com:** CI-1.2 (Google OAuth — ambos dependem apenas de CI-1.1)

## Riscos

| Risco | Severidade | Mitigacao |
|-------|------------|-----------|
| Azure AD App Registration requer permissoes de admin tenant | HIGH | Usar endpoint `common` (multi-tenant) para contas pessoais + trabalho |
| Microsoft token response tem formato diferente do Google | MEDIUM | Tipagem separada em `OutlookTokenResponse`, parser dedicado |
| Scope `offline_access` pode ser negado pelo usuario | MEDIUM | Verificar scopes retornados no callback, avisar usuario se incompleto |

## Dev Notes

### Contexto Tecnico

**Diferenca entre Google e Microsoft OAuth:**
- Google: `access_type=offline` para refresh_token
- Microsoft: scope `offline_access` para refresh_token
- Google authorization: `https://accounts.google.com/o/oauth2/v2/auth`
- Microsoft authorization: `https://login.microsoftonline.com/common/oauth2/v2.0/authorize`
- Google token endpoint: `https://oauth2.googleapis.com/token`
- Microsoft token endpoint: `https://login.microsoftonline.com/common/oauth2/v2.0/token`

**Microsoft Graph API — Endpoints Relevantes:**
- Authorization: `https://login.microsoftonline.com/common/oauth2/v2.0/authorize`
- Token exchange: `https://login.microsoftonline.com/common/oauth2/v2.0/token`
- User profile: `https://graph.microsoft.com/v1.0/me`
- Calendar events: `https://graph.microsoft.com/v1.0/me/calendarView` (usado em CI-1.4)
- Scopes Phase 1: `offline_access Calendars.Read User.Read`

**Reaproveitamento de CI-1.1 (infraestrutura compartilhada):**
- State token: `lib/calendario/auth-state.ts` (generateStateToken / validateStateToken)
- Connect route: `app/api/calendario/connect/route.ts` — estender switch/if para provider `outlook`
- `CALENDAR_STATE_SECRET`: secret dedicado para assinatura (compartilhado entre providers)
- Toast detection: se CI-1.2 ja implementou funcao de query params, reutilizar; caso contrario, criar funcao unica
- [Source: CI-1.1 story, lib/calendario/auth-state.ts]

**Componente CalendarioView:**
- Botao Outlook stub: linhas 61-70 de `componentes/agenda/calendario-view.tsx`
- Adicionar prop `onConnectOutlook` similar a `onConnectGoogle` de CI-1.2
- [Source: componentes/agenda/calendario-view.tsx]

### Setup do Azure AD

1. Ir para https://portal.azure.com/ → Azure Active Directory → App Registrations
2. "New registration"
3. Name: "Builders Performance"
4. Supported account types: "Accounts in any organizational directory and personal Microsoft accounts"
5. Redirect URI: Web → `http://localhost:3000/api/calendario/outlook/callback`
6. Anotar Application (client) ID
7. Certificates & secrets → New client secret → Anotar value
8. API permissions → Add: Microsoft Graph → Delegated → `Calendars.Read`, `User.Read`

---

### Dev Agent Record
**Agent Model Used:** Claude Opus 4.5
**Debug Log References:** --

#### Completion Notes
- Implemented Outlook OAuth flow end-to-end (connect route extension, callback route, outlook.ts helper, UI wiring)
- `buildOutlookAuthUrl` uses `offline_access` scope + `response_mode=query` for Microsoft OAuth
- `exchangeOutlookCode` uses native fetch to POST to Microsoft token endpoint
- `getOutlookUserEmail` reads email from Microsoft Graph /me endpoint (mail fallback to userPrincipalName)
- Callback route upserts to `calendar_connections` via service role client
- Used `(supabaseAdmin as any)` cast for `.from('calendar_connections')` since table type will be auto-generated via `supabase gen types`
- Frontend: `calendario-view.tsx` receives `onConnectOutlook` prop, `page.tsx` handles connect flow + toast (shared handler for both providers)
- `MICROSOFT_CLIENT_SECRET` is server-side only, never exposed to client
- Both Google and Outlook can coexist — UNIQUE(user_id, provider) constraint allows simultaneous connections
- typecheck and lint pass clean
- Implemented in parallel with CI-1.2 (shared files updated for both providers simultaneously)

#### Change Log
| Data | Alteracao | Autor |
|------|-----------|-------|
| 2026-01-30 | Story criada a partir do PRD calendar-integration.md | @sm (River) |
| 2026-01-30 | Revisao PO: dependencia de CI-1.2 removida (agora depende apenas de CI-1.1); paralelo com CI-1.2; state token via auth-state.ts (CI-1.1); env var MICROSOFT_REDIRECT_URI (sem NEXT_PUBLIC_); reuse notes atualizados | @po (Pax) |
| 2026-01-30 | Implementation complete: Outlook OAuth flow (connect route, callback, outlook.ts, UI wiring) | @dev (Dex) |

#### File List
| Arquivo | Status | Descricao |
|---------|--------|-----------|
| app/api/calendario/connect/route.ts | Modificado | Suporte a provider `outlook` |
| app/api/calendario/outlook/callback/route.ts | Novo | Callback do Microsoft OAuth |
| lib/calendario/outlook.ts | Novo | Client Microsoft Graph API |
| componentes/agenda/calendario-view.tsx | Modificado | Botao Outlook funcional |
| app/(protegido)/agenda/page.tsx | Modificado | Handler de conexao Outlook + toast |
