# Epic: Integracao com Calendarios Externos

**Epic ID:** EPIC-CI-001
**Data:** 2026-01-30
**Autor:** @sm (River) -- Synkra AIOS
**PRD:** [calendar-integration.md](../prd/calendar-integration.md)
**Status:** Planejado
**Fase:** Phase 1 (Read-only / Import)

---

## Objetivo

Integrar a pagina `/agenda` do Builders Performance com Google Calendar API e Microsoft Outlook Calendar (Microsoft Graph API), permitindo sincronizacao de leitura (import) de eventos externos. O usuario podera conectar suas contas via OAuth 2.0, visualizar todos os eventos em uma unica interface, e gerenciar suas conexoes.

Phase 1 foca exclusivamente em **import (read-only)**. Sincronizacao bidirecional (write) sera Phase 2.

## Decisoes-Chave (YOLO Mode)

| Decisao | Escolha | Alternativa Rejeitada |
|---------|---------|----------------------|
| Sync direction | Read-only (Phase 1) | Bidirecional |
| Token storage | Supabase table com RLS | Supabase Vault / KMS |
| Sync trigger | On page load + manual button | Webhooks / Cron |
| OAuth flow | Redirect | Popup window |
| API client | Native fetch | googleapis / @microsoft/graph-client |
| State token signing | CALENDAR_STATE_SECRET dedicado | Usar GOOGLE_CLIENT_SECRET (acoplamento) |
| Redirect URI env vars | Server-only (sem NEXT_PUBLIC_) | NEXT_PUBLIC_ prefix (exposicao desnecessaria) |
| Sync range | -30 / +90 dias | All events / Custom |
| Event deletion on disconnect | Remove imported events | Keep orphaned |

## Escopo

### Impacto no Sistema

| Area | Impacto |
|------|---------|
| Database | Nova tabela `calendar_connections`, novo campo `external_event_id` em `events` |
| Auth Infra | `lib/calendario/auth-state.ts` — state token (HMAC-SHA256) compartilhado entre providers |
| API Routes | 5 novos routes em `app/api/calendario/` (connect base em CI-1.1, handlers em CI-1.2/CI-1.3) |
| Hooks | Novo `useIntegracaoCalendario`, modificacao em `useAgenda` |
| Lib | Novo modulo `lib/calendario/` (google, outlook, sync, transformers) |
| Schemas | Novo `lib/schemas/calendario.ts` |
| Types | Novo `types/calendario.ts` |
| Components | Modificacao em `calendario-view.tsx`, `evento-card.tsx`, novo `status-integracao.tsx` |
| Env Vars | 5 novos secrets (CALENDAR_STATE_SECRET + Google/Microsoft client ID + secret + redirect URI) |

### Stubs Existentes no Codigo

O codebase ja possui preparacao para esta integracao:
- `types/agenda.ts`: tipo `CalendarIntegration = 'Manual' | 'Google' | 'Outlook'`
- `007_create_events_table.sql`: enum `calendar_integration` com os 3 valores
- `calendario-view.tsx` (linhas 51-70): botoes stub "Conectar" para Google e Outlook

## Stories

| Story ID | Nome | Arquivo | Horas | Prioridade |
|----------|------|---------|-------|------------|
| CI-1.1 | Infraestrutura de Tokens OAuth, Database Schema e Auth State | [story-ci-1.1](story-ci-1.1-infraestrutura-oauth-schema.md) | ~8h | HIGH |
| CI-1.2 | Fluxo OAuth do Google Calendar | [story-ci-1.2](story-ci-1.2-fluxo-oauth-google.md) | ~8h | HIGH |
| CI-1.3 | Fluxo OAuth do Outlook Calendar | [story-ci-1.3](story-ci-1.3-fluxo-oauth-outlook.md) | ~8h | HIGH |
| CI-1.4 | Sincronizacao de Eventos (Import) | [story-ci-1.4](story-ci-1.4-sincronizacao-eventos.md) | ~12h | HIGH |
| CI-1.5 | UI de Status e Gerenciamento | [story-ci-1.5](story-ci-1.5-ui-status-gerenciamento.md) | ~8h | MEDIUM |
| CI-1.6 | Tratamento de Erros e Resiliencia | [story-ci-1.6](story-ci-1.6-erros-resiliencia.md) | ~6h | MEDIUM |
| **TOTAL** | -- | -- | **~50h** | -- |

## Dependencias

### Cadeia de Dependencias entre Stories

```
CI-1.1 (Schema + Types + Auth State + Connect Route Base)
  |      -- sem dependencias, base para todas as outras
  |      -- inclui: tabela calendar_connections, tipos, schemas,
  |         auth-state.ts (state token), connect route base
  |
  +--> CI-1.2 (Google OAuth) -- depende de CI-1.1
  |      |                      PARALELO com CI-1.3
  |      |
  +--> CI-1.3 (Outlook OAuth) -- depende de CI-1.1
  |      |                       PARALELO com CI-1.2
  |      |
  +------+--> CI-1.4 (Sync) -- depende de pelo menos 1 provider (CI-1.2 ou CI-1.3)
                |
                +--> CI-1.5 (UI Status) -- depende de CI-1.4
                |
                +--> CI-1.6 (Resiliencia) -- depende de CI-1.4
```

### Dependencias Externas

| Dependencia | Status | Detalhes |
|-------------|--------|----------|
| Google Cloud Console | PENDENTE | Criar projeto OAuth, configurar redirect URI |
| Azure AD App Registration | PENDENTE | Registrar app, configurar redirect URI |
| Env vars em producao | PENDENTE | 7 env vars a configurar no Vercel/hosting (CALENDAR_STATE_SECRET + 3 Google + 3 Microsoft) |

### Pre-requisitos do Projeto

- Epic EPIC-TD-001 nao e bloqueante, mas stories TD-1.0 (seguranca) e TD-2.0 (tipos) sao recomendadas antes de iniciar

## Quality Gates

| Gate | Aplicacao | Detalhes |
|------|-----------|----------|
| Lint + Typecheck | Todas as stories | `npm run lint` e `npm run typecheck` devem passar antes de marcar task como concluida |
| Code Review | Todas as stories | Code review via @code-reviewer ou CodeRabbit antes de merge |
| Testes unitarios | CI-1.1, CI-1.2, CI-1.3, CI-1.4, CI-1.6 | Cobertura minima 80% nos novos modulos |
| Testes integracao | CI-1.2, CI-1.3, CI-1.4, CI-1.5 | API routes testadas com mocks |
| Teste manual | CI-1.2, CI-1.3, CI-1.4, CI-1.5 | Fluxo completo OAuth → sync → visualizacao |
| Security review | CI-1.2, CI-1.3 | Verificar que secrets nao vazam no client bundle |

## Riscos

| Risco | Severidade | Mitigacao |
|-------|------------|-----------|
| OAuth redirect URI misconfigured | HIGH | Documentar setup detalhado nos Dev Notes de CI-1.2 e CI-1.3 |
| Token expiration/revocation silenciosa | HIGH | Story CI-1.6 dedica-se inteiramente a resiliencia |
| Rate limiting Google/Microsoft APIs | MEDIUM | Sync on-demand (nao polling) + rate limit local (CI-1.6) |
| Inconsistencia de dados em sync parcial | MEDIUM | Sync transacional: all-or-nothing por provider |
| Google/Microsoft deprecam scopes | LOW | Scopes readonly sao estaveis; monitorar changelogs |
| Calendar OAuth != Supabase OAuth (fluxos coexistentes) | MEDIUM | Fluxos completamente separados; Calendar OAuth usa API routes proprias |

## Variaveis de Ambiente

```env
# Calendar Integration — State Token (shared between providers)
CALENDAR_STATE_SECRET=

# Google Calendar OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=

# Microsoft Outlook OAuth
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=
MICROSOFT_REDIRECT_URI=
```

> **Nota:** Redirect URIs sao usados apenas em API routes (server-side). Nao usar prefixo `NEXT_PUBLIC_` para evitar exposicao desnecessaria no bundle do client.

---

### Change Log

| Data | Alteracao | Autor |
|------|-----------|-------|
| 2026-01-30 | Epic criado com 6 stories a partir do PRD calendar-integration.md | @sm (River) |
| 2026-01-30 | Revisao PO: (1) Moveu auth-state + connect route base para CI-1.1, liberando CI-1.2/CI-1.3 para paralelo; (2) Esclareceu escopo token refresh/error handling entre CI-1.4 e CI-1.6; (3) Removeu prefixo NEXT_PUBLIC_ de redirect URIs; (4) Adicionou CALENDAR_STATE_SECRET dedicado; (5) Adicionou secao Quality Gates | @po (Pax) |

---

*Epic gerado por @sm (River) -- Synkra AIOS v2.0*
*Baseado no PRD Integracao com Calendarios Externos v1.0.0*
