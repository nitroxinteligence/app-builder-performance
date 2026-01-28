  1. Stack: Next.js App Router com TypeScript. Pode confirmar?
Sim!
  2. Gerenciador: npm (já existe package-lock.json). Pode confirmar?
Sim!

  Perguntas adicionais (as que ficaram em aberto + necessárias para Page 1):
  3) Prefere src/app ou app/ direto?
App/
  4) Posso usar npx create-next-app para iniciar o projeto (requer baixar deps)?
Sim!
  5) Qual versão mínima de Node devo assumir?
Voce pode usar a versão que achar mais recomendada.
  6) Estrutura de pastas: components/ui + components/onboarding? (ou outra)
Voce pode usar a estrutura que achar mais recomendado.
  7) Convenção de nomes para componentes e arquivos (PascalCase/Kebab-case)?
Voce pode usar a convenção que achar mais recomendada.
  8) Posso usar alias @/ no TS config?
Voce pode usar o que for mais recomendado.
  9) O layout global deve existir já na Page 1 ou só o fluxo de onboarding?
Voce pode usar o que for mais recomendado.
  10) A rota inicial deve ser /onboarding ou / renderiza o onboarding?
Voce pode usar o que for mais recomendado.
  11) Dados mockados locais estão ok (sem backend)?
Sim!
  12) O planejamento .md: prefere docs/plano-frontend.md ou PLAN.md na raiz?
docs/plano-frontend.md
  13) O planejamento deve ser em PT‑BR?
Sim! E todos os nomes de componentes e arquivos devem ser em PT‑BR e também o nome das paginas, ex: /onboarding, /inicio, /perfil, /produtividade, etc...
  14) Após aprovar o plano, confirmo: implemento só a Página 1 e espero sua aprovação?
Sim!
  15) Alguma restrição extra de dependências além de Shadcn/Tailwind/lucide?
Voce pode usar o que for mais recomendado.
  16) Favicon/título/metatags agora? Se sim, tem assets?
Ainda nao tenho assets.
  17) Deixo node_modules como está (não mexer) — confirma?
Sim!
  18) Ícones: Lucide ok?
Sim!
  19) Acessibilidade: exigência específica (contraste, aria, foco visível)?
Voce pode usar o que for mais recomendado.

  Onboarding (Page 1) — preciso dos detalhes:
  20) Quantas etapas exatamente?
A quantidade de etapas é a quantidade de paginas que tem no App e funções do App.
  21) Para cada etapa: título, descrição e URL do vídeo.
Primeiro titulo e descriçao, abaixo o video e abaixo o botao que deve aparecer depois, no canto inferior direito deixe um ICONE para abrir um chat de IA (Builder Assistant) que iremos implementar depois.
  22) Duração real (min:sec) de cada vídeo.
No máximo 4-5 minutos cada video de cada etapa.
  23) O vídeo será arquivo local, embed (YouTube/Vimeo) ou link direto?
Embed em youtube ou vimeo, ainda iremos decidir.
  24) O “Próximo” libera após 3 ou 4 minutos? Qual regra exata?
Libera após 3 ou 4 minutos.
  25) Pode haver botão “Voltar”? (o “Pular” é proibido, confirmado)
Botao "Voltar", mas o "Pular" é proibido.
  26) O contador deve reiniciar se o usuário recarregar a página?
Não.

  Tipografia:
  27) Posso escolher uma fonte Google (ex.: “Sora” para títulos + “Manrope” para texto) ou prefere outra?
Perfeito!