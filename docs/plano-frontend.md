# Plano de Frontend — Builders Performance

## 1) Objetivo e Escopo
- Construir apenas o frontend em Next.js (App Router) com TypeScript, Tailwind e Shadcn.
- Seguir 100% o que está em `docs/escopo-do-projeto.md`, `docs/paginas-do-app.md` e `docs/visual-do-app.md`.
- Implementar página por página, começando pela Página 1 (Onboarding). Cada página só avança após aprovação.
- Evitar qualquer lógica de backend; usar dados mockados locais quando necessário.

## 2) Revisão dos documentos (resumo objetivo)
- Escopo: app SaaS gamificado com IA, uso diário, foco em rotina e performance.
- Visual: minimalista, referência Notion; Light mode padrão com Dark mode disponível. Paleta baseada em cinzas e `#212121`.
- Páginas (ordem em `docs/paginas-do-app.md`):
  1. Onboarding (Processo de onboarding com vídeos e bloqueio do botão “Próximo”)
  2. Daily Start (modal diário)
  3. Dashboard principal
  4. Kanban de tarefas (captura)
  5. Timer de foco (modo imersivo)
  6+. Outras páginas listadas no documento (seguir integralmente quando chegar nelas)

## 3) Arquitetura proposta (frontend)
- Next.js App Router com `app/` na raiz.
- Páginas com nomes em PT-BR, seguindo exemplos: `/onboarding`, `/inicio`, `/produtividade`, `/foco`.
- Estrutura sugerida (ajustável após aprovação):
  - `app/` (rotas)
  - `componentes/ui/` (Shadcn)
  - `componentes/onboarding/` (componentes específicos)
  - `lib/` (helpers simples, sem excesso)
- Design system via CSS variables do Shadcn, alinhado à paleta do `docs/visual-do-app.md`.
- Dark/Light com toggle (Shadcn), light como padrão.

## 4) Componentes e UI (Page 1)
- Componentes Shadcn previstos: `button`, `card`, `progress`, `separator`, `toggle`/`dropdown` para tema.
- Componentes próprios (PT-BR): `EtapaOnboarding`, `PlayerVideo`, `ControleEtapas`, `IndicadorProgresso`.
- Layout desktop-first com responsividade básica.

## 5) Regras de implementação
- Simplicidade máxima: sem abstrações desnecessárias.
- Código modular e fácil de manter.
- Conteúdo fiel aos documentos; sem inventar funcionalidades.

## 6) Pendências para iniciar a Página 1 (preciso confirmar)
- Lista final das etapas de onboarding (uma por página/funcionalidade).
A quantidade de etapas é a quantidade de paginas que tem no App e funções do App que precisam ser mostradas no onboarding.
- Título, descrição e URL do vídeo de cada etapa.
Primeiro titulo e descriçao, abaixo o video e abaixo o botao que deve aparecer depois, no canto inferior direito deixe um ICONE para abrir um chat de IA (Builder Assistant) que iremos implementar depois.
- Duração real de cada vídeo (mm:ss).
No máximo 4-5 minutos cada video de cada etapa.
- Tipo de vídeo (embed, link direto, arquivo local).
Embed em youtube ou vimeo, ainda iremos decidir.
- Regra exata de desbloqueio do botão “Próximo” (3 ou 4 minutos?).
Sim, 3 minutos.
- Existe botão “Voltar”? (o “Pular” é proibido).
Sim, existe. Mas o "Pular" é proibido.
- O contador reinicia ao recarregar?
Sim!
- Tipografia final (posso usar “Sora” + “Manrope” se não houver preferência).
Sim!

## 7) Equipe virtual (delegação simultânea)
- Produto/UX: consolidou o fluxo das páginas e prioridades.
- UI/Design: traduziu visual do Notion para tokens do Shadcn.
- Frontend: definiu estrutura de pastas e setup do Next.js.
- QA/Acc: listou pontos de acessibilidade e revisão de interação.

## 8) Próximos passos
- Aprovar este plano.
- Fornecer as pendências do onboarding.
- Após aprovação: iniciar implementação da Página 1 e aguardar validação.
