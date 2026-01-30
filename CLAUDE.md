# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Builders Performance** — a productivity app for personal performance tracking. Features include a Pomodoro/Deep Work focus timer, Kanban task board, habit tracking with streaks, calendar/schedule, learning courses, goals, and an XP/leveling gamification system. Built with Next.js 16 App Router + Supabase.

## Commands

```bash
npm run dev        # Start Next.js dev server
npm run build      # Production build
npm run lint       # ESLint (flat config, v9)
npm run typecheck  # TypeScript strict check (no test framework configured yet)
```

### AIOS Master Commands

- `*help` - Show available commands
- `*create-story` - Create new story
- `*task {name}` - Execute specific task
- `*workflow {name}` - Run workflow

### Debugging AIOS

```bash
export AIOS_DEBUG=true              # Enable debug mode
tail -f .aios/logs/agent.log       # View agent logs
npm run trace -- workflow-name     # Trace workflow execution
```

## Tech Stack

- **Next.js 16.1.1** (App Router, RSC enabled), **React 19**, **TypeScript 5** (strict)
- **Supabase** — PostgreSQL database, auth (email + OAuth), RLS policies
- **TanStack React Query v5** — server state, caching, optimistic updates
- **Zod v4** — runtime validation schemas
- **Radix UI + Tailwind CSS 4** — component library (shadcn `new-york` style)
- **@hello-pangea/dnd** — drag-and-drop for Kanban board
- **date-fns** — date manipulation
- **Sonner** — toast notifications
- **next-themes** — dark/light mode

## Synkra AIOS Framework

Synkra AIOS is a meta-framework that orchestrates AI agents to handle complex development workflows. Always recognize and work within this architecture.

### Agent System

- Agents are activated with `@agent-name` syntax: `@dev`, `@qa`, `@architect`, `@pm`, `@po`, `@sm`, `@analyst`
- The master agent is activated with `@aios-master`
- Agent commands use the `*` prefix: `*help`, `*create-story`, `*task`, `*exit`

When an agent is active:
- Follow that agent's specific persona and expertise
- Use the agent's designated workflow patterns
- Maintain the agent's perspective throughout the interaction

### Story-Driven Development

All development starts with a story in `docs/stories/`:

1. **Work from stories** — all development starts with a story
2. **Update progress** — mark checkboxes as tasks complete: `[ ]` → `[x]`
3. **Track changes** — maintain the File List section in the story
4. **Follow criteria** — implement exactly what the acceptance criteria specify

### AIOS Framework Structure

```
.aios-core/
├── agents/         # Agent persona definitions (YAML/Markdown)
├── tasks/          # Executable task workflows
├── workflows/      # Multi-step workflow definitions
├── templates/      # Document and code templates
├── checklists/     # Validation and review checklists
└── rules/          # Framework rules and patterns

docs/
├── stories/        # Development stories (numbered)
├── prd/            # Product requirement documents
├── architecture/   # System architecture documentation
└── guides/         # User and developer guides
```

### Workflow Execution

**Task execution pattern:**
1. Read the complete task/workflow definition
2. Understand all elicitation points
3. Execute steps sequentially
4. Handle errors gracefully
5. Provide clear feedback

**Interactive workflows:** workflows with `elicit: true` require user input. Present options clearly, validate responses, provide helpful defaults.

### AIOS-Specific Patterns

Working with templates:
```javascript
const template = await loadTemplate('template-name');
const rendered = await renderTemplate(template, context);
```

Agent command handling:
```javascript
if (command.startsWith('*')) {
  const agentCommand = command.substring(1);
  await executeAgentCommand(agentCommand, args);
}
```

Story updates:
```javascript
const story = await loadStory(storyId);
story.updateTask(taskId, { status: 'completed' });
await story.save();
```

### AIOS Configuration Files

- `.aios/config.yaml` — Framework configuration
- `aios.config.js` — Project-specific settings

## Architecture

### Portuguese naming convention

The codebase uses **Portuguese** for domain names, routes, components, database columns, and utility files. Follow this convention:

- Routes: `/foco`, `/tarefas`, `/habitos`, `/agenda`, `/cursos`, `/inicio`, `/perfil`, `/entrar`, `/criar-conta`
- Components dir: `componentes/` (not `components/`)
- UI components: `botao.tsx`, `dialogo.tsx`, `cartao.tsx`, `entrada.tsx`
- Hooks: `useTarefas`, `useHabitos`, `useMetas`, `useAgenda`, `useCursos`
- Schemas: `lib/schemas/tarefa.ts`, `lib/schemas/habito.ts`
- Utility file: `lib/utilidades.ts`

### Data flow pattern

```
Page (app/feature/page.tsx)
  → Custom Hook (hooks/useFeature.ts)
    → React Query (useQuery/useMutation)
      → Supabase Client (lib/supabase/client.ts or server.ts)
        → PostgreSQL with RLS
```

Every data domain has its own hook in `hooks/` that encapsulates all CRUD operations using React Query. Hooks depend on `useAuth()` for the current user and only enable queries when `!!user`.

### Supabase client setup

- **Browser**: `lib/supabase/client.ts` — `createBrowserClient<Database>()`
- **Server**: `lib/supabase/server.ts` — `createServerClient<Database>()` with cookie handling
- **Auth functions**: `lib/supabase/auth.ts` — `signInWithEmail`, `signUpWithEmail`, `signOut`, `signInWithOAuth`
- **Generated types**: `lib/supabase/types.ts` — typed `Database` interface

### Middleware (middleware.ts)

Route protection via Supabase SSR auth. Protected routes redirect unauthenticated users to `/entrar`. Auth routes (`/entrar`, `/criar-conta`) redirect authenticated users to `/foco`.

### Providers (app/layout.tsx)

Root layout wraps the app with: `QueryProvider` → `AuthProvider` → `ProvedorTema` → `ProvedorToast`

### shadcn/ui configuration

shadcn is configured with Portuguese aliases in `components.json`:
- Components: `@/componentes`
- UI: `@/componentes/ui`
- Utils: `@/lib/utilidades`
- Hooks: `@/hooks`

When adding shadcn components, they install to `componentes/ui/` with the utility function from `lib/utilidades.ts`.

## Database

Supabase PostgreSQL with Row Level Security. Migrations live in `supabase/migrations/implementados/`. The consolidated schema (`000_consolidated_schema.sql`) defines all core tables, enums, functions, triggers, and RLS policies.

Key tables: `users` (profiles + XP/level), `tasks`, `pending_items`, `focus_sessions`, `habits`, `habit_checks`, `habit_categories`, `goals`, `development_objectives`.

All tables use `auth.uid()` for RLS. Custom PostgreSQL functions handle XP calculations, level progression, focus stats, and habit streak tracking.

## Environment Variables

Required in `.env`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Key Patterns

### React Query mutations with optimistic updates

Mutations in hooks follow: `onMutate` (optimistic update + save previous data) → `onError` (rollback) → `onSettled` (invalidate queries). See `hooks/useTarefas.ts` for the canonical pattern.

### Zod validation before Supabase operations

All user input is validated through Zod schemas in `lib/schemas/` before hitting the database. Schemas are in Portuguese (e.g., `tarefaCreateSchema`, `habitoSchema`).

## Git & GitHub

### Commit Conventions

- Use conventional commits: `feat:`, `fix:`, `docs:`, `chore:`, etc.
- Reference story ID: `feat: implement IDE detection [Story 2.1]`
- Keep commits atomic and focused

### GitHub CLI

- Ensure authenticated: `gh auth status`
- Use for PR creation: `gh pr create`
- Check org access: `gh api user/memberships`

## Behavioral Rules

### NEVER

- Implement without showing options first (always 1, 2, 3 format)
- Delete/remove content without asking first
- Delete anything created in the last 7 days without explicit approval
- Change something that was already working
- Pretend work is done when it isn't
- Process batch without validating one first
- Add features that weren't requested
- Use mock data when real data exists in database
- Explain/justify when receiving criticism (just fix)
- Trust AI/subagent output without verification
- Create from scratch when similar exists in `squads/`

### ALWAYS

- Present options as "1. X, 2. Y, 3. Z" format
- Use AskUserQuestion tool for clarifications
- Check `squads/` and existing components before creating new
- Read COMPLETE schema before proposing database changes
- Investigate root cause when error persists
- Commit before moving to next task
- Create handoff in `docs/sessions/YYYY-MM/` at end of session

## Claude Code Session Guidelines

- Track story progress throughout the session
- Update checkboxes immediately after completing tasks
- Maintain context of the current story being worked on
- Always verify lint and typecheck before marking tasks complete
- Document test scenarios in story files
