  1. Qual stack base devo criar: Next.js (App Router) ou Vite + React (ou outra)?
Next.js
  2. JavaScript ou TypeScript?
O que voce recomenda para este projeto em larga escala? Este é um App SAAS que será para MUITOS usuários, entao precisa ser com arquitetura modular e altamente escalável.
  3. Mantemos npm (há package-lock.json) ou prefere pnpm/yarn?
O que voce recomenda?
  4. Posso inicializar o projeto do zero (não há src/ hoje) ou já existe algum padrão interno?
Inicializar do ZERO.
  5. Quer src/ como raiz de código (se for Vite) ou app/ direto (se for Next)?
Next.js
  6. Confirmo uso de Tailwind (necessário para Shadcn)?
Sim!
  7. Posso rodar o CLI do Shadcn para gerar componentes (exige acesso à rede para instalar deps)?
Sim, porém temos o MCP do shadcn que você pode utilizar.
  8. Pode incluir dependências padrão do Shadcn como lucide-react e tailwindcss-animate?
Sim!
  9. Quer que eu configure lint/format agora? Se sim, prefere ESLint + Prettier com quais regras?
Recomendo as regras padrão do Shadcn.
  10. Qual fonte devo usar? Preciso evitar Inter/Roboto/Arial/system; tem alguma preferência?
Sem preferência, pode usar qualquer fonte.
  11. Fonte via Google Fonts ok, ou você vai fornecer arquivos locais?
Google Fonts
  12. O texto da UI deve ser exatamente como nos docs (PT-BR), ou posso ajustar microcopy?
Sim, pode ajustar.
  13. Há logo oficial? Se não, usamos apenas o texto “Builders Performance”?
Por enquanto pode usar o texto Builders Performance
  14. Implemento light + dark tokens agora ou apenas light (dark só quando for pedido)?
Light + Dark
  15. Quer um toggle de tema já na UI? Se sim, como fica?
Sim, pode usar o shadcn ui para isso.
  16. Existe cor de destaque além de #212121 e os tons de cinza?
Sim, pode usar o #212121 como cor de destaque.
  17. Preferência de radius/spacing (ex.: 6px, 8px grid) ou sigo padrão Shadcn?
Padrão Shadcn.
  18. Onboarding: quantas etapas? Quais títulos, descrições e URLs de vídeo?
As etapas do Onboarding serão etapas ensinando a usar cada funçao do App.
Ex: "como utilizar a página "Produtividade" que no caso é a pagina de kanban de tarefas." e assim sucessivamente.
  19. As durações dos vídeos (4–5 min) devem ser reais por etapa ou posso usar placeholder?
Reais por etapa.
  20. O botão “Próximo” deve ficar bloqueado até 4 minutos assistidos (sem UI visível) – confirma?
O botão fica visível, porém bloqueado para clicar até chegar aos 3-4 minutos de vídeo.
  21. Quer indicador de progresso (ex.: Step 1/4) no onboarding? Se sim, como fica?
Sim, pode usar o shadcn ui para isso.
  22. Devo incluir “pular onboarding” ou isso é proibido?
Proibido.
  23. Responsividade: priorizamos mobile-first ou desktop-first?
Desktop first por enquanto.
  24. Para Page 1, devo manter apenas o fluxo de onboarding ou já incluir layout global?
Já incluir layout global.
  25. Navegação entre páginas será por rotas (ex.: /onboarding) ou por um wrapper único?
Rotas.
  26. Posso manter dados mockados em constantes locais (sem backend)?
Sim, por enquanto.
  27. Prefere estrutura de componentes em components/ui + components/onboarding?
O que voce recomenda?
  28. Quer algum padrão de nomenclatura para componentes/arquivos?
Padrão Shadcn.
  29. Onde devo criar o arquivo de planejamento .md? Ex.: PLAN.md na raiz ou docs/plano-frontend.md?
Docs/plano-frontend.md
  30. O planejamento deve ser em PT-BR?
Sim, mas também é ideal ter na pagina /perfil algo para mudar para inglês.
  31. Após aprovar o plano, confirmo que devo criar apenas a Página 1 e aguardar sua aprovação?
Sim, por enquanto.
  32. Há alguma restrição de dependências além de “use Shadcn” e “máximo simples”?
Não.
  33. Devo adicionar favicon/título/metatags agora? Se sim, tem assets?
Não temos assets ainda.
  34. Você quer que eu remova/ignore node_modules existentes ou só deixe como está?
O que voce recomenda?
  35. Alguma preferência de ícones (Lucide está ok)?
Icones mais minimalistas possiveis e icones diferentes, nada de icones padroes e batidos, mas sim icones minimalistas e diferentes. Um icone nao precisa EXATAMENTE representar algo. Ex: Um icone de "adicionar" nao precisa ser um "+", pode ser um icone diferente e mais criativo do que apenas um "+".
  36. Alguma exigência de acessibilidade (contraste, aria, etc.) desde já?
Não.