# Repository Guidelines

## Project Structure and Module Organization
- `app/` hosts the Next.js App Router routes and layout.
- `componentes/` contains shared UI and feature components (Shadcn-based).
- `lib/` holds small utilities (example: `lib/utilidades.ts`).
- `docs/` holds product scope, screen flows, and visual style references (e.g., `docs/escopo-do-projeto.md`, `docs/paginas-do-app.md`, `docs/visual-do-app.md`).
- `public/` is for static assets.
- `node_modules/` is a local install artifact; do not edit it directly.

## Build, Test, and Development Commands
- `npm install` installs dependencies.
- `npm run dev` starts the local dev server.
- `npm run build` builds the production bundle.
- `npm run lint` runs ESLint.

## Coding Style and Naming Conventions
- Markdown: keep headings ordered, use short paragraphs, and keep file names in kebab-case (example `docs/escopo-do-projeto.md`).
- Component, file, and route names should be in PT-BR (examples: `/onboarding`, `componentes/tema/alternador-tema.tsx`).
- Use Shadcn UI patterns and Tailwind utility classes; keep components minimal and modular.
- JSON: use 2-space indentation and keep a trailing newline.

## Testing Guidelines
- No test framework is configured.
- When adding tests, choose a framework, document naming patterns (example `*.test.ts`), and add an `npm test` script.

## Commit and Pull Request Guidelines
- Git history is not available in this folder, so no existing commit convention can be inferred.
- Use concise, imperative commit subjects (example "Add onboarding flow specs") and include scope when helpful.
- PRs should describe intent, link relevant specs in `docs/`, and include screenshots for UX changes.

## Security and Configuration
- Do not commit secrets. If runtime config is introduced, add `.env.example` and document required keys.
