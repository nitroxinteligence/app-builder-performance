# Relatorio Completo - App Builder Performance

## Data: 2026-01-31
## Status Geral: ~65% completo

---

## Resumo Executivo

O **Builders Performance** e um app de produtividade pessoal gamificado construido com Next.js 16, React 19, Supabase e Tailwind CSS 4. O projeto possui uma base solida de infraestrutura (auth, banco de dados, React Query, design system) e a maioria das features principais tem frontend funcional. Porem, existem lacunas criticas: o **Assistente IA** (diferencial do produto) esta completamente mockado, o sistema de **gamificacao** tem bugs de formula nivel/XP, nao ha **testes automatizados** em producao, a **infraestrutura de deploy/CI-CD e inexistente**, e varias integracao externas planejadas nao foram implementadas. O app funciona localmente mas nao esta pronto para producao.

---

## 1. Por Pagina

### /inicio (Dashboard)

- [x] Implementado: Saudacao dinmica (Bom dia/tarde/noite), 4 KPI cards (XP, Streak, Energia, Tarefas), grafico de atividade semanal, progresso semanal, missoes diarias, agenda do dia, conquistas recentes, briefing do assistente, acoes rapidas
- [x] Hooks: `useDashboardData()` com 4 queries separadas (user level, daily stats, weekly stats, focus stats)
- [x] Loading state: Skeleton completo por secao
- [x] Dark mode: Sim
- [x] Animacoes: `AnimacaoPagina`, `SecaoAnimada`, `DivAnimada`
- [ ] Faltando: Missoes diarias sao geradas client-side (hardcoded logic, nao persistidas no banco)
- [ ] Faltando: Missoes semanais fixas (nao dinamicas)
- [ ] Faltando: Briefing do assistente e placeholder (nao conectado a IA)
- [ ] Faltando: Conquistas/Badges nao tem sistema backend real
- [ ] Bug: Formula de nivel diverge entre frontend (`XP_PER_LEVEL * Math.pow(1.2, level-1)`) e backend (`FLOOR(SQRT(xp/100)) + 1`)

### /tarefas (Kanban Board)

- [x] Implementado: 4 colunas Kanban (Backlog, A fazer, Em andamento, Concluido), drag-and-drop com @hello-pangea/dnd, CRUD completo, busca/filtro, pendencias (aprovar/rejeitar), reordenacao batch
- [x] Hooks: `useTarefas()` com 7 sub-hooks (CRUD + mover + reordenar)
- [x] Optimistic updates: Sim (useMoverTarefa com rollback)
- [x] Validacao Zod: tarefaCreateSchema, tarefaUpdateSchema
- [x] Loading state: Skeleton kanban
- [x] Dark mode: Sim
- [x] XP: 30 XP por tarefa nova, 20 XP por pendencia aprovada
- [ ] Faltando: Subtarefas/checklist dentro de tarefas
- [ ] Faltando: Etiquetas/tags customizaveis
- [ ] Faltando: Anexos em tarefas

### /foco (Timer Pomodoro/Deep Work)

- [x] Implementado: 4 modos (Pomodoro 25min, Deep Work 50min, Flowtime, Custom), timer circular com progresso, selecao de tarefa vinculada, pausa/resume, historico paginado, estatisticas (total sessoes, tempo, XP, media), modal de conclusao com XP ganho, level-up animation, som de alarme via Web Audio API, auto-save parcial via sendBeacon
- [x] Hooks: `useFocoTimer()`, `useFocoSessao()`, `useFocoHistorico()` - 3 hooks especializados
- [x] Server Actions: createFocusSession, completeFocusSession, updateFocusSession, cancelFocusSession, savePartialSession, getActiveSession, getAvailableTasks, getFocusStats, getFocusHistory
- [x] API Route: POST /api/foco/save-partial para salvar ao fechar aba
- [x] LocalStorage: Persistencia do estado da sessao para recovery
- [x] Loading state: Skeleton completo
- [x] Dark mode: Sim
- [ ] Faltando: Modo Break (intervalo curto/longo) nao implementado como modo separado
- [ ] Faltando: Notificacao push quando timer termina (apenas som local)
- [ ] Faltando: Estatisticas avancadas (grafico de produtividade ao longo do tempo)

### /habitos (Tracking de Habitos + Objetivos + Metas)

- [x] Implementado: 2 abas (Plano Individual + Metas do Ano), lista de habitos com toggle diario, categorias de habitos, streak tracking com formula de bonus XP, Kanban de objetivos individuais (Backlog > Planejando > Em progresso > Concluido) com drag-and-drop, Kanban de metas anuais, CRUD completo para habitos/objetivos/metas/marcos
- [x] Hooks: `useHabitos()` (8 sub-hooks), `useMetas()` (18+ sub-hooks)
- [x] Optimistic updates: Sim (useMoverObjetivo)
- [x] Validacao Zod: 30+ schemas (habito, objetivo, meta, marco, categoria)
- [x] Streak formula backend: `base_xp + (base_xp * (streak - 1) / 10)` com bonus progressivo
- [x] Loading state: Skeleton
- [x] Dark mode: Sim
- [ ] Faltando: Streak shields (protecao de streak) - campo existe no banco mas logica de consumo nao implementada
- [ ] Faltando: Heatmap visual de habitos (planejado no escopo)
- [ ] Faltando: Historico/calendario de check-ins passados
- [ ] Faltando: Weekly challenges (apenas texto hardcoded)

### /agenda (Calendario/Agenda)

- [x] Implementado: Mini calendario para selecao de data, lista de eventos do dia selecionado, proximos 5 eventos, CRUD completo de eventos manuais, integracao OAuth com Google Calendar e Outlook, auto-sync na carga da pagina, status de integracao, desconectar calendario
- [x] Hooks: `useAgenda()` (CRUD), `useIntegracaoCalendario()` (OAuth + sync)
- [x] API Routes: POST /api/calendario/connect, /api/calendario/sync, /api/calendario/disconnect, callbacks Google/Outlook
- [x] Backend: Tabela calendar_connections com tokens, tabela events com external_event_id, state token HMAC-SHA256
- [x] Validacao Zod: calendario schemas (connect, disconnect, sync)
- [x] Loading state: Skeleton
- [x] Dark mode: Sim
- [ ] Faltando: Visualizacao semanal/mensal do calendario
- [ ] Faltando: Recorrencia de eventos
- [ ] Faltando: Drag-and-drop para reagendar eventos
- [ ] Faltando: Notificacoes/lembretes de eventos
- [ ] Faltando: Sync bidirecional (atualmente read-only Phase 1)

### /assistente (Chat AI)

- [x] Implementado: UI completa de chat - sidebar com conversas, busca, hero state com saudacao personalizada, 4 cards de sugestao, mensagens user/assistant com text/details/actions, input multilinea com Enter/Shift+Enter, upload de arquivos (imagens, PDFs, docs), preview de imagem, botao de voz, disclaimer de IA
- [x] Layout: Full-width imersivo (sem shell padrao no desktop)
- [x] Loading state: Skeleton
- [x] Dark mode: Sim
- [ ] **CRITICO - Faltando: API real de IA** - Todas as respostas sao mock/hardcoded
- [ ] **CRITICO - Faltando: Integracao com Claude/OpenAI API** - Zero backend de IA
- [ ] Faltando: Gravacao real de audio (botao existe mas nao grava)
- [ ] Faltando: Processamento real de arquivos uploadados
- [ ] Faltando: Context builder (puxar dados do usuario para contexto da IA)
- [ ] Faltando: Morning briefing automatico
- [ ] Faltando: Analise de performance contextual
- [ ] Faltando: Persistencia de conversas no banco de dados (apenas state local)

### /cursos (Plataforma de Cursos)

- [x] Implementado: Catalogo com busca e filtro por categoria/nivel, secoes (Continuar Assistindo, Destaques, Novos, Todos), cards com progresso, curso detail com modulos e aulas, pagina de aula com sidebar navegavel, mark as complete com XP, like button, area de notas, 3 niveis (iniciante, intermediario, avancado)
- [x] Hooks: `useCursos()`, `useCursosData()`, `useCursoBySlug()`, `useCompleteLesson()`
- [x] Backend: Tabelas courses, course_modules, lessons, lesson_progress com RLS (public read, service_role write)
- [x] RPC: complete_lesson() com atomic XP, get_course_progress()
- [x] Loading state: Skeleton grid
- [x] Dark mode: Sim
- [ ] Faltando: Player de video real (placeholder com icone de play)
- [ ] Faltando: Sistema de comentarios (shell UI existe mas nao funcional)
- [ ] Faltando: Admin panel para gerenciar cursos
- [ ] Faltando: Upload de videos
- [ ] Faltando: Certificados de conclusao

### /perfil (Perfil do Usuario)

- [x] Implementado: Edicao de nome, secao de seguranca (alterar senha com validacao), 4 toggles de preferencias (notificacoes email, lembretes foco, resumo semanal, updates cursos), sidebar com avatar (upload/remover foto com preview, limite 5MB), status da conta
- [x] Hooks: `useUpdatePerfil()`, `useAlterarSenha()`, `useUploadAvatar()`, `useRemoverAvatar()`
- [x] Storage: Bucket 'avatars' no Supabase com cache busting
- [x] Validacao Zod: perfilUpdateSchema, alterarSenhaSchema
- [x] Loading state: Skeleton
- [x] Dark mode: Sim
- [ ] Faltando: Preferencias de notificacao nao persistidas no banco (apenas UI)
- [ ] Faltando: Edicao de email
- [ ] Faltando: Deletar conta
- [ ] Faltando: Exportar dados (LGPD)

### Auth (/entrar, /criar-conta, /recuperar-senha, /redefinir-senha)

- [x] Implementado: Login email/senha completo, OAuth (Google, Apple), registro multi-step (3 etapas: Perfil > Papel > Confirmacao email), formatacao de telefone brasileiro, 7 papeis pre-definidos + custom, recuperacao de senha com envio de email, redefinicao de senha com validacao, sidebar com branding/gradiente, responsive
- [x] Middleware: Rotas protegidas redirecionam para /entrar, rotas auth redirecionam autenticados para /foco
- [x] Callback: /auth/callback para OAuth
- [x] Dark mode: Sim
- [ ] Faltando: Verificacao de email obrigatoria (config.toml tem enable_confirmations = false)
- [ ] Faltando: MFA/2FA (TOTP desabilitado no config)
- [ ] Faltando: Rate limiting real (apenas config padrao do Supabase)

### /onboarding

- [x] Implementado: Componente FluxoOnboarding com callback de conclusao navegando para /inicio
- [ ] Faltando: Conteudo detalhado do onboarding nao auditado (delegado a componente)

### Paginas Estaticas

- [x] /privacidade: Politica de privacidade completa em portugues
- [x] /termos: Termos de servico completos em portugues

### /design-system (Dev-only)

- [x] Implementado: Hub de navegacao com 5 sub-paginas (Tokens, Componentes, Padroes, Paginas, Estados), 19+ componentes showcase, 8 padroes de composicao, 5 previews de pagina, dark mode toggle
- [x] Status: Completo e funcional

---

## 2. Backend

### 2.1 Supabase Tables

| Tabela | Status | Colunas Chave | Notas |
|--------|--------|---------------|-------|
| users | ✅ Completa | id, email, nome, avatar_url, total_xp, nivel, streak_atual, maior_streak, ultimo_login, papel | Profile + gamificacao |
| tasks | ✅ Completa | id, user_id, titulo, descricao, prioridade, coluna, status, ordem, prazo, tempo_gasto, deleted_at | Kanban com soft delete |
| pending_items | ✅ Completa | id, user_id, titulo, descricao, prioridade, categoria, prazo | Pendencias lightweight |
| focus_sessions | ✅ Completa | id, user_id, task_id, modo, duracao_planejada, duracao_real, xp_ganho, status, pausas, started_at, ended_at, deleted_at | Timer com soft delete |
| habits | ✅ Completa | id, user_id, category_id, titulo, descricao, dificuldade, frequencia, xp_base, streak_atual, maior_streak, escudos, ativo, deleted_at | Habitos com soft delete |
| habit_categories | ✅ Completa | id, user_id, titulo, icone, cor | Categorias de habitos |
| habit_checks | ✅ Completa | id, habit_id, user_id, check_date, observacao | UNIQUE(habit_id, check_date) |
| goals | ✅ Completa | id, user_id, titulo, descricao, status, progresso_atual, progresso_total, ano, trimestre, cor, deleted_at | Metas anuais |
| development_objectives | ✅ Completa | id, user_id, titulo, descricao, status, column_id, ordem, prioridade, tags, data_inicio, data_fim | Objetivos individuais |
| events | ✅ Completa | id, user_id, titulo, descricao, data, hora_inicio, hora_fim, categoria, local, status, calendario, external_event_id | Agenda com integracao |
| calendar_connections | ✅ Completa | id, user_id, provider, access_token, refresh_token, token_expires_at, scopes, external_email, is_active, last_sync_at, sync_token | OAuth tokens |
| courses | ✅ Completa | id, slug, titulo, descricao, categoria, nivel, imagem_url, destaque, status, ordem | Cursos (public read) |
| course_modules | ✅ Completa | id, course_id, titulo, descricao, ordem | Modulos de curso |
| lessons | ✅ Completa | id, module_id, titulo, descricao, duracao_segundos, xp_recompensa, video_url, ordem | Aulas |
| lesson_progress | ✅ Completa | id, user_id, lesson_id, concluida, xp_ganho, concluida_em | UNIQUE(user_id, lesson_id) |
| notifications | ✅ Completa | id, user_id, tipo, titulo, mensagem, lida, dados_extra | 7 tipos de notificacao |
| audit_log | ✅ Completa | id, table_name, record_id, action, old_data, new_data, user_id | Audit trail automatico |

**Total: 17 tabelas | 11 enums | 14 funcoes | 17+ triggers | 2 views | 50+ indexes | 100+ RLS policies**

### 2.2 RLS Policies

| Padrao | Tabelas | Status |
|--------|---------|--------|
| Own data (CRUD por user_id) | users, tasks, pending_items, focus_sessions, habits, habit_categories, habit_checks, goals, development_objectives, events, calendar_connections, notifications, lesson_progress | ✅ Completo |
| Public read, admin write | courses, course_modules, lessons | ✅ Completo |
| Trigger only (no user insert) | audit_log | ✅ Completo |
| Service role bypass | Todas as tabelas | ✅ Completo |
| Soft delete filter | tasks, habits, goals, focus_sessions | ✅ SELECT filtra deleted_at IS NULL |

### 2.3 PostgreSQL Functions

| Funcao | Tipo | Status | Notas |
|--------|------|--------|-------|
| calculate_level(xp) | IMMUTABLE | ✅ | `FLOOR(SQRT(xp/100)) + 1` |
| add_user_xp(user_id, xp) | SECURITY DEFINER | ⚠️ | Funciona mas sem validacao de auth.uid() interna |
| complete_focus_session(...) | SECURITY DEFINER | ⚠️ | Calcula XP, marca sessao, atualiza tarefa |
| cancel_active_sessions(user_id) | SECURITY DEFINER | ⚠️ | Cancela sessoes ativas |
| calculate_focus_xp(seconds) | IMMUTABLE | ✅ | 1 XP por minuto |
| get_focus_stats(user_id) | SECURITY DEFINER | ⚠️ | Stats completas (total, hoje, semana) |
| check_habit(habit_id, user_id, date) | SECURITY DEFINER | ⚠️ | Streak logic + bonus XP |
| get_habit_streak(habit_id) | STABLE | ✅ | Conta streak consecutivo |
| complete_lesson(user_id, lesson_id) | SECURITY DEFINER | ⚠️ | Atomic XP + progress |
| get_course_progress(user_id, course_id) | SECURITY DEFINER | ⚠️ | Calcula % conclusao |
| update_updated_at_column() | TRIGGER | ✅ | Padrao para todas tabelas |
| handle_new_user() | SECURITY DEFINER | ✅ | Auth > Profile sync |
| log_audit_change() | SECURITY DEFINER | ✅ | Audit trail trigger |
| batch_reorder_tasks(json) | SECURITY DEFINER | ⚠️ | Reordenacao batch |

**Nota sobre SECURITY DEFINER**: A migration 010 adicionou correcoes de seguranca, mas as funcoes marcadas com ⚠️ usam SECURITY DEFINER e devem ser chamadas apenas via server actions (que verificam auth). A documentacao de technical debt aponta que 7 funcoes originalmente nao validavam auth.uid() internamente - a migration 010 corrigiu parcialmente isso.

### 2.4 API Routes

| Endpoint | Metodo | Status | Descricao |
|----------|--------|--------|-----------|
| /api/foco/save-partial | POST | ✅ | Auto-save sessao ao fechar aba |
| /api/calendario/connect | POST | ✅ | Iniciar fluxo OAuth (gera state token) |
| /api/calendario/google/callback | GET | ✅ | Callback OAuth Google |
| /api/calendario/outlook/callback | GET | ✅ | Callback OAuth Outlook |
| /api/calendario/sync | POST | ✅ | Sync incremental de eventos |
| /api/calendario/disconnect | POST | ✅ | Desconectar calendario |

### 2.5 Server Actions (app/(protegido)/foco/actions.ts)

| Action | Status | Descricao |
|--------|--------|-----------|
| getAvailableTasks() | ✅ | Tarefas nao concluidas |
| markTaskAsCompleted(taskId) | ✅ | Marca tarefa como concluida |
| createFocusSession(input) | ✅ | Cria sessao com validacao Zod |
| updateFocusSession(input) | ✅ | Update parcial |
| completeFocusSession(input) | ✅ | RPC com calculo de XP |
| cancelFocusSession(sessionId) | ✅ | Cancela sessao |
| savePartialSession(input) | ✅ | Save parcial (page close) |
| getActiveSession() | ✅ | Recupera sessao ativa |
| getFocusHistory(filters, pagination) | ✅ | Historico paginado |
| getFocusStats() | ✅ | Estatisticas completas |
| getCurrentUser() | ✅ | Dados do usuario |

### 2.6 Auth Flow

| Funcionalidade | Status | Notas |
|----------------|--------|-------|
| Login email/senha | ✅ | signInWithPassword |
| Registro email/senha | ✅ | signUp com metadata |
| OAuth Google | ✅ | signInWithOAuth |
| OAuth Apple | ✅ | signInWithOAuth |
| Logout | ✅ | Limpa query client + signOut |
| Recuperar senha | ✅ | resetPasswordForEmail |
| Redefinir senha | ✅ | updateUser |
| Middleware SSR | ✅ | Session refresh + redirect |
| Verificacao de email | ❌ | Desabilitado (enable_confirmations = false) |
| MFA/2FA | ❌ | TOTP desabilitado |
| Rate limiting | ⚠️ | Apenas defaults do Supabase |

### 2.7 Storage Buckets

| Bucket | Status | Notas |
|--------|--------|-------|
| avatars | ✅ | Upload/remover foto de perfil |
| Outros | ❌ | Nenhum outro bucket configurado |

### 2.8 Migrations

**Total: 19 migrations (000-018)** em `supabase/migrations/implementados/`

| # | Arquivo | Status |
|---|---------|--------|
| 000 | consolidated_schema.sql (31KB) | ✅ Schema completo |
| 001 | auth_profiles_trigger.sql | ✅ Auth > Profile sync |
| 002 | create_admin_user.sql | ⚠️ Seed data em migration |
| 003 | reset_admin_password.sql | ⚠️ Seed data em migration |
| 004 | fix_database_naming.sql | ✅ Correcao nomes PT |
| 005 | fix_goals_schema.sql | ✅ |
| 006 | fix_habits_schema.sql | ✅ |
| 007 | create_events_table.sql | ✅ |
| 008 | create_courses_schema.sql | ✅ |
| 009 | revoke_handle_new_user.sql | ✅ Seguranca |
| 010 | fix_security_definer_auth.sql | ✅ Correcao DEFINER |
| 011 | add_check_constraints.sql | ✅ |
| 012 | add_composite_indexes.sql | ✅ |
| 013 | calendar_connections.sql | ✅ OAuth + external_event_id |
| 014 | add_missing_check_constraints.sql | ✅ |
| 015 | batch_reorder_tasks.sql | ✅ |
| 016 | add_soft_delete.sql | ✅ |
| 017 | add_audit_trail.sql | ✅ |
| 018 | create_notifications_table.sql | ✅ |

---

## 3. Integracoes Externas

| Integracao | Status | Notas |
|------------|--------|-------|
| Google Calendar OAuth | ⚠️ Parcial | Infrastructure pronta (CI-1.1 done), fluxo OAuth nao finalizado (CI-1.2 pending) |
| Outlook Calendar OAuth | ⚠️ Parcial | Infrastructure pronta, fluxo OAuth nao finalizado (CI-1.3 pending) |
| AI/LLM (Claude/OpenAI) | ❌ Nao implementado | UI completa mas zero backend - diferencial do produto |
| Notificacoes Push | ❌ Nao implementado | Nenhum service worker |
| Notificacoes Email | ❌ Nao implementado | SMTP nao configurado |
| Analytics | ❌ Nao implementado | Sentry DSN no .env.example mas nao integrado |
| Pagamentos | ❌ Nao implementado | Nenhuma integracao Stripe/Mercado Pago |
| Google OAuth (Auth) | ✅ Implementado | Via Supabase Auth |
| Apple OAuth (Auth) | ✅ Implementado | Via Supabase Auth |

---

## 4. Gamificacao (XP/Level System)

| Feature | Status | Detalhes |
|---------|--------|----------|
| Sistema de XP | ✅ Funcional | 1 XP/min foco, 30 XP/tarefa nova, 20 XP/pendencia, variable XP habitos |
| Calculo de Level | ⚠️ Bug | Frontend usa exponencial, backend usa raiz quadrada - **DIVERGENCIA** |
| Level Progression | ✅ Backend | `FLOOR(SQRT(xp/100)) + 1` - 9 niveis documentados |
| Streak tracking (Habitos) | ✅ Funcional | Contagem consecutiva com bonus XP progressivo |
| Streak tracking (Login) | ⚠️ Parcial | Campo existe, logica de atualizacao nao verificada |
| Streak Shields | ❌ Nao implementado | Campo `escudos` existe mas sem logica de consumo (2/semana planejado) |
| Badges/Conquistas | ❌ Nao implementado | Secao no dashboard mas sem sistema backend de conquistas |
| Missoes Diarias | ⚠️ Mock | Geradas client-side com logica hardcoded, nao persistidas |
| Missoes Semanais | ❌ Mock | 4 missoes fixas hardcoded |
| Daily Login XP | ⚠️ Parcial | Tracking existe mas sem trigger automatico |
| Level-up Animation | ✅ Funcional | Modal de celebracao ao subir de nivel |
| XP por Complete Lesson | ✅ Funcional | Atomic via complete_lesson() RPC |

---

## 5. Infraestrutura

| Item | Status | Notas |
|------|--------|-------|
| Deploy configurado | ❌ | Nenhum vercel.json, Dockerfile, ou CI/CD |
| CI/CD Pipeline | ❌ | Zero GitHub Actions workflows |
| Docker | ❌ | Nenhum Dockerfile ou docker-compose |
| Monitoring/APM | ❌ | Nenhum Sentry, DataDog, ou similar |
| Analytics | ❌ | Nenhum tracking implementado |
| Error Tracking | ❌ | Apenas console.error local |
| Performance Monitoring | ❌ | Nenhum Web Vitals tracking |
| CDN/Assets | ⚠️ | Next.js default (nao otimizado) |
| Env vars documentadas | ✅ | .env.example com todas variaveis |
| Supabase local setup | ✅ | config.toml completo |

### 5.1 Testes

| Tipo | Status | Detalhes |
|------|--------|----------|
| Framework | ✅ | Vitest v4.0.18 configurado |
| Setup file | ✅ | vitest.setup.ts com @testing-library/jest-dom |
| Coverage threshold | ✅ | 80% configurado (statements, branches, functions, lines) |
| Unit tests | ⚠️ | 9 arquivos de teste existem |
| Integration tests | ⚠️ | 1 teste de hook (useTarefas) com mock |
| Component tests | ⚠️ | 1 snapshot test (estado-vazio) |
| E2E tests | ❌ | Zero - nenhum Playwright/Cypress |
| Coverage real | ❌ | Provavelmente <10% (9 arquivos para codebase inteiro) |

**Arquivos de teste existentes:**
1. `__tests__/lib/calculate-level.test.ts` - XP/level calculation
2. `__tests__/lib/schemas.test.ts` - Zod schema validation
3. `__tests__/componentes/estado-vazio.test.tsx` - Component snapshot
4. `__tests__/hooks/useTarefas.test.tsx` - React Query hook
5. `lib/calendario/__tests__/auth-state.test.ts` - OAuth state token
6. `lib/calendario/__tests__/resilience.test.ts` - HTTP retry logic
7. `lib/calendario/__tests__/sync.test.ts` - Calendar sync diff
8. `lib/calendario/__tests__/transformers.test.ts` - Event transformation
9. `lib/schemas/__tests__/calendario.test.ts` - Calendar schemas

---

## 6. Hooks Inventory (15 hooks)

| Hook | Linhas | React Query | Optimistic | Error Handling |
|------|--------|-------------|------------|----------------|
| useTarefas | ~1023 | ✅ | ✅ (mover) | ✅ |
| useHabitos | ~844 | ✅ | ❌ | ✅ |
| useFocoSessao | ~500+ | ❌ (server actions) | ✅ (manual) | ✅ |
| useFocoTimer | ~362 | ❌ (pure state) | N/A | ✅ |
| useFocoHistorico | ~159 | ❌ (server actions) | N/A | ✅ |
| usePerfil | ~220 | ✅ | ❌ | ✅ |
| useAgenda | ~220 | ✅ | ❌ | ✅ |
| useCursos | ~590 | ✅ | ❌ | ✅ |
| useMetas | ~1100+ | ✅ | ✅ (mover) | ✅ |
| usePendencias | ~189 | ✅ | ❌ | ✅ |
| useNotificacoes | ~189 | ✅ | ✅ | ✅ |
| useDashboard | ~750+ | ✅ | N/A | ✅ |
| useConfirmar | ~89 | ❌ (UI state) | N/A | N/A |
| useContadorAnimado | ~63 | ❌ (animation) | N/A | N/A |
| useIntegracaoCalendario | ~280 | ✅ | ❌ | ✅ |

---

## 7. Componentes UI (shadcn/ui - PT)

| Componente | Arquivo | Status |
|------------|---------|--------|
| Abas | abas.tsx | ✅ |
| Alternador | alternador.tsx | ✅ |
| Animacoes | animacoes.tsx | ✅ |
| Avatar | avatar.tsx | ✅ |
| Botao | botao.tsx | ✅ |
| Caixa-selecao | caixa-selecao.tsx | ✅ |
| Calendario | calendario.tsx | ✅ |
| Campo-formulario | campo-formulario.tsx | ✅ |
| Cartao | cartao.tsx | ✅ |
| Colapsavel | colapsavel.tsx | ✅ |
| Confirmar | confirmar.tsx | ✅ |
| Dialogo | dialogo.tsx | ✅ |
| Dialogo-alerta | dialogo-alerta.tsx | ✅ |
| Dica (Tooltip) | dica.tsx | ✅ |
| Emblema (Badge) | emblema.tsx | ✅ |
| Entrada (Input) | entrada.tsx | ✅ |
| Esqueleto (Skeleton) | esqueleto.tsx | ✅ |
| Estado-vazio | estado-vazio.tsx | ✅ |
| Flutuante (Popover) | flutuante.tsx | ✅ |
| Menu-suspenso (Dropdown) | menu-suspenso.tsx | ✅ |
| Progresso | progresso.tsx | ✅ |
| Seletor (Select) | seletor.tsx | ✅ |
| Separador | separador.tsx | ✅ |
| Toaster | toaster.tsx | ✅ |
| Trilha (Slider) | trilha.tsx | ✅ |

**Total: 25 componentes UI base**

---

## 8. Debitos Tecnicos Conhecidos

### CRITICOS (P0)

| ID | Descricao | Impacto |
|----|-----------|---------|
| BUG-01 | Formula de nivel diverge frontend vs backend | Usuario ve nivel errado |
| BUG-02 | Supabase client triplo (singleton + factory + AuthProvider) | Sessao inconsistente, logout pode nao propagar |
| SEC-01 | SECURITY DEFINER functions originalmente sem validacao auth (migration 010 corrigiu parcialmente) | Potencial manipulacao de XP cross-user |
| FEAT-01 | Assistente IA completamente mockado | Feature core do produto nao funciona |
| INFRA-01 | Zero CI/CD e deploy automation | Nao pode ir para producao |

### ALTOS (P1)

| ID | Descricao | Impacto |
|----|-----------|---------|
| DEBT-01 | TypeScript types desatualizados (lib/supabase/types.ts) | Type safety comprometida |
| DEBT-02 | Seed data em migrations de producao (admin user hardcoded) | Dados de teste em prod |
| DEBT-03 | Coverage de testes <10% estimada | Refatoracao cega |
| DEBT-04 | Verificacao de email desabilitada | Contas sem validacao |
| FEAT-02 | Streak shields nao implementados | Feature prometida incompleta |
| FEAT-03 | Badges/conquistas sem backend | Gamificacao incompleta |
| FEAT-04 | Missoes diarias nao persistidas | Sem tracking real |
| FEAT-05 | Notificacoes push inexistentes | Engajamento comprometido |
| UX-01 | Calendar integration OAuth fluxo incompleto (CI-1.2/1.3 pending) | Feature parcial |

### MEDIOS (P2)

| ID | Descricao | Impacto |
|----|-----------|---------|
| DEBT-05 | useMetas.ts com 1100+ linhas | Manutenibilidade |
| DEBT-06 | useTarefas.ts com 1023 linhas | Manutenibilidade |
| FEAT-06 | Video player placeholder nos cursos | Cursos sem conteudo real |
| FEAT-07 | Comentarios em aulas (shell vazio) | Interatividade faltando |
| FEAT-08 | Preferencias de perfil nao persistidas | UI decorativa |
| FEAT-09 | Exportar dados LGPD | Compliance |
| FEAT-10 | Visualizacao semanal/mensal calendario | UX agenda |
| UX-02 | Heatmap de habitos nao implementado | Visualizacao faltando |

---

## 9. Prioridades (O Que Fazer Primeiro)

### Wave 0: Quick Wins (imediato)

1. **Corrigir formula de nivel** - Alinhar frontend com backend (`FLOOR(SQRT(xp/100)) + 1`)
2. **Unificar Supabase client** - Remover instancias duplicadas, manter singleton
3. **Habilitar verificacao de email** - `enable_confirmations = true` no Supabase
4. **Mover seed data** - Tirar admin user de migrations para seed.sql

### Wave 1: Seguranca + Fundacao

1. **Auditar SECURITY DEFINER** - Verificar que migration 010 cobriu todos os casos
2. **Regenerar tipos TypeScript** - `supabase gen types typescript`
3. **Expandir testes** - Pelo menos 1 teste por hook principal (target: 30+ tests)
4. **Setup CI/CD basico** - GitHub Actions: lint + typecheck + test

### Wave 2: Feature Core

1. **Implementar Assistente IA** - Integracao real com API (Claude/OpenAI), persistencia de conversas, context builder
2. **Completar Calendar Integration** - Finalizar CI-1.2 (Google OAuth) e CI-1.3 (Outlook OAuth)
3. **Implementar Streak Shields** - Logica de consumo e UI

### Wave 3: Gamificacao Completa

1. **Sistema de Badges/Conquistas** - Tabela, triggers, UI
2. **Missoes Diarias backend** - Geracao e tracking persistido
3. **Weekly Challenges** - Backend com logica real

### Wave 4: Producao

1. **Deploy Vercel** - vercel.json, env vars, domain
2. **Monitoring** - Sentry error tracking
3. **E2E Tests** - Playwright para fluxos criticos
4. **LGPD compliance** - Exportar/deletar dados

### Wave 5: Polish

1. **Video player real** para cursos
2. **Notificacoes push** via service worker
3. **Calendario semanal/mensal** view
4. **Heatmap** de habitos
5. **Admin panel** para cursos

---

## 10. Estimativa de Esforco

| Area | Tarefas | Complexidade | Prioridade |
|------|---------|-------------|------------|
| Bug fixes (nivel, client, seeds) | 4 tarefas | Baixa | P0 - Imediato |
| Seguranca (DEFINER audit, email verif) | 3 tarefas | Media | P0 - Imediato |
| CI/CD basico (GH Actions) | 1 tarefa | Media | P1 - Semana 1 |
| Testes (expandir cobertura) | 10+ tarefas | Media-Alta | P1 - Semana 1-2 |
| TypeScript types regen | 1 tarefa | Baixa | P1 - Semana 1 |
| Assistente IA completo | 5+ tarefas | Alta | P2 - Semana 2-4 |
| Calendar OAuth completo | 4 stories | Alta | P2 - Semana 2-3 |
| Streak Shields | 1 tarefa | Baixa | P2 - Semana 2 |
| Badges/Conquistas | 3 tarefas | Media | P3 - Semana 3-4 |
| Missoes Diarias backend | 2 tarefas | Media | P3 - Semana 3-4 |
| Deploy Vercel | 1 tarefa | Baixa | P4 - Semana 4 |
| Monitoring (Sentry) | 1 tarefa | Baixa | P4 - Semana 4 |
| E2E Tests (Playwright) | 5+ tarefas | Media | P4 - Semana 4-5 |
| Video player cursos | 1 tarefa | Media | P5 - Futuro |
| Push notifications | 2 tarefas | Alta | P5 - Futuro |
| Admin panel cursos | 3+ tarefas | Alta | P5 - Futuro |
| LGPD (export/delete) | 2 tarefas | Media | P5 - Futuro |

---

## 11. Resumo Final por Area

| Area | % Completo | Status |
|------|-----------|--------|
| **Auth (Login/Registro/OAuth)** | 90% | ✅ Funcional, falta email verif + MFA |
| **Dashboard (/inicio)** | 75% | ⚠️ Funcional, missoes mock, badges faltando |
| **Kanban (/tarefas)** | 95% | ✅ Completo, poderia ter subtarefas |
| **Timer (/foco)** | 90% | ✅ Muito completo, falta push notif |
| **Habitos (/habitos)** | 80% | ⚠️ Core funciona, shields e heatmap faltando |
| **Agenda (/agenda)** | 70% | ⚠️ CRUD ok, OAuth calendar incompleto |
| **Assistente (/assistente)** | 20% | ❌ UI linda mas zero backend IA |
| **Cursos (/cursos)** | 75% | ⚠️ Estrutura completa, falta video player real |
| **Perfil (/perfil)** | 85% | ⚠️ Funcional, preferencias nao persistidas |
| **Gamificacao (XP/Level)** | 50% | ⚠️ Base funciona mas badges/missions/shields faltando |
| **Backend (Supabase)** | 85% | ✅ Schema solido, 17 tabelas, RLS completo |
| **Testes** | 10% | ❌ 9 arquivos para codebase inteiro |
| **CI/CD** | 0% | ❌ Zero automacao |
| **Deploy** | 0% | ❌ Nao configurado |
| **Monitoring** | 0% | ❌ Nenhum tracking |
| **Integracoes externas** | 20% | ❌ Calendar parcial, IA zero, push zero |

### Score Geral: ~65%

**O que funciona bem:** Auth, Kanban, Timer, CRUD geral, design system, dark mode, UX/UI polida
**O que precisa de trabalho:** Assistente IA, gamificacao completa, calendar OAuth, testes, CI/CD, deploy

---

*Relatorio gerado em 2026-01-31 por Atlas (Analyst Agent)*
*-- Atlas, investigando a verdade*
