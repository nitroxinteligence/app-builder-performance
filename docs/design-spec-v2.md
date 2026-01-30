# Design Spec v2 — Builders Performance

**Versao:** 2.0.0
**Data:** 2026-01-30
**Referencia visual:** Dashboard ConstructHub (laranja coral, card-based, clean)

---

## 1. Identidade Visual

### 1.1 Conceito

Estetica moderna, limpa e card-based inspirada no ConstructHub. Superficies claras com acentos em laranja coral (#F26B2A). Hierarquia visual forte, muito respiro, cantos arredondados generosos. Foco em leitura, clareza e sensacao de progresso.

### 1.2 Principios

1. **Clareza** — hierarquia tipografica e espacamento generoso
2. **Consistencia** — tokens reutilizaveis em todo o app
3. **Acessibilidade** — contraste WCAG AA, `prefers-reduced-motion`
4. **Performance** — dark mode completo, sem sombras pesadas

---

## 2. Paleta de Cores

### 2.1 Cores Primarias

| Token | Hex | Uso |
|---|---|---|
| `primaria` | `#F26B2A` | CTA, botoes primarios, links ativos, ring de foco |
| `primaria-foreground` | `#FFFFFF` | Texto sobre primaria |
| `primaria-hover` | `#D95A1F` | Hover em botoes primarios |
| `primaria-ativa` | `#C04F1A` | Estado ativo/pressed |
| `primaria-suave` | `#FEF0E8` | Fundo de badges, chips, highlights |

### 2.2 Cores Neutras

| Token | Hex (Claro) | Hex (Escuro) | Uso |
|---|---|---|---|
| `fundo` | `#F5F5F5` | `#1A1A1A` | Fundo geral da aplicacao |
| `superficie` | `#FFFFFF` | `#242424` | Cards, popovers, modais |
| `superficie-elevada` | `#FFFFFF` | `#2E2E2E` | Elementos flutuantes |
| `borda` | `#E8E8E8` | `#333333` | Bordas de cards e inputs |
| `borda-sutil` | `#F0F0F0` | `#2A2A2A` | Separadores, divisores |
| `texto-primario` | `#1A1A1A` | `#F5F5F5` | Titulos, texto principal |
| `texto-secundario` | `#6B6B6B` | `#A0A0A0` | Texto auxiliar, labels |
| `texto-terciario` | `#999999` | `#666666` | Placeholders, hints |

### 2.3 Cores Semanticas

| Token | Hex | Uso |
|---|---|---|
| `sucesso` | `#2ECC71` | Conclusao, streaks ativos, checks |
| `sucesso-suave` | `#E8F8F0` | Fundo de badges de sucesso |
| `perigo` | `#E74C3C` | Acoes destrutivas, erros |
| `perigo-suave` | `#FDE8E6` | Fundo de alertas de erro |
| `aviso` | `#F2C94C` | Alertas, prazos proximos |
| `aviso-suave` | `#FEF9E7` | Fundo de alertas de aviso |
| `info` | `#3498DB` | Links, informacoes, dicas |
| `info-suave` | `#E8F4FD` | Fundo de badges informativos |

### 2.4 Cores de Graficos

| Token | Hex | Uso |
|---|---|---|
| `grafico-1` | `#F26B2A` | Serie principal (laranja) |
| `grafico-2` | `#2ECC71` | Serie secundaria (verde) |
| `grafico-3` | `#3498DB` | Serie terciaria (azul) |
| `grafico-4` | `#F2C94C` | Serie quaternaria (amarelo) |
| `grafico-5` | `#9B59B6` | Serie quinaria (roxo) |

### 2.5 Sidebar

| Token | Hex (Claro) | Hex (Escuro) |
|---|---|---|
| `sidebar` | `#FAFAFA` | `#1E1E1E` |
| `sidebar-foreground` | `#1A1A1A` | `#F5F5F5` |
| `sidebar-primaria` | `#F26B2A` | `#F26B2A` |
| `sidebar-primaria-foreground` | `#FFFFFF` | `#FFFFFF` |
| `sidebar-accent` | `#FEF0E8` | `#3D2415` |
| `sidebar-accent-foreground` | `#C04F1A` | `#FDBA74` |
| `sidebar-borda` | `#E8E8E8` | `#333333` |

---

## 3. Tipografia

### 3.1 Fontes

| Tipo | Fonte | Variavel CSS | Peso | Uso |
|---|---|---|---|---|
| Titulos | **Sora** | `--fonte-titulo` | 600-700 | Headings H1-H4, titulos de cards |
| Corpo | **Manrope** | `--fonte-corpo` | 400-600 | Texto geral, labels, botoes |

### 3.2 Escala Tipografica

| Nome | Tamanho | Peso | Line Height | Uso |
|---|---|---|---|---|
| `titulo-xl` | 32px / 2rem | 700 | 1.2 | Titulo de pagina |
| `titulo-lg` | 24px / 1.5rem | 600 | 1.3 | Secoes principais |
| `titulo-md` | 20px / 1.25rem | 600 | 1.3 | Titulos de cards |
| `titulo-sm` | 16px / 1rem | 600 | 1.4 | Sub-titulos |
| `corpo-lg` | 16px / 1rem | 400 | 1.6 | Texto de leitura |
| `corpo-md` | 14px / 0.875rem | 400 | 1.5 | Texto padrao de interface |
| `corpo-sm` | 12px / 0.75rem | 400 | 1.5 | Labels, captions |
| `corpo-xs` | 10px / 0.625rem | 500 | 1.4 | Badges, tags |

---

## 4. Espacamento

### 4.1 Escala de Espacamento

Base: 4px. Escala geometrica.

| Token | Valor | Uso |
|---|---|---|
| `espaco-1` | 4px | Gaps minimos, padding de badges |
| `espaco-2` | 8px | Gap entre icone e texto |
| `espaco-3` | 12px | Padding interno de botoes sm |
| `espaco-4` | 16px | Padding padrao de inputs |
| `espaco-5` | 20px | Gap entre items de lista |
| `espaco-6` | 24px | Padding interno de cards |
| `espaco-8` | 32px | Gap entre secoes |
| `espaco-10` | 40px | Margin entre blocos |
| `espaco-12` | 48px | Padding de pagina |
| `espaco-16` | 64px | Espacamento de secoes maiores |

### 4.2 Layout

| Propriedade | Valor | Uso |
|---|---|---|
| Container max-width | 1200px (max-w-6xl) | Area principal |
| Padding lateral pagina | 24px (mobile) / 32px (desktop) | Respiro lateral |
| Gap entre cards | 16px (mobile) / 24px (desktop) | Grid de cards |
| Sidebar aberta | 224px | Desktop |
| Sidebar fechada | 56px | Desktop colapsada |

---

## 5. Arredondamento (Border Radius)

| Token | Valor | Uso |
|---|---|---|
| `arredondamento` (base) | 16px / 1rem | Base de calculo |
| `arredondamento-sm` | 12px | Badges, chips, tags |
| `arredondamento-md` | 14px | Inputs, selects |
| `arredondamento-lg` | 16px | Cards, botoes |
| `arredondamento-xl` | 20px | Modais, popovers |
| `arredondamento-2xl` | 24px | Cards de destaque |
| `arredondamento-3xl` | 28px | Containers hero |
| `arredondamento-4xl` | 32px | Elementos arredondados especiais |
| `arredondamento-full` | 9999px | Avatares, pills |

---

## 6. Sombras

Sombras suaves e sutis. Estilo card-based sem sombras pesadas.

| Token | Valor | Uso |
|---|---|---|
| `sombra-nenhuma` | `none` | Cards padrao (apenas borda) |
| `sombra-sm` | `0 1px 2px rgba(0,0,0,0.04)` | Hover sutil |
| `sombra-md` | `0 2px 8px rgba(0,0,0,0.06)` | Cards elevados, dropdowns |
| `sombra-lg` | `0 4px 16px rgba(0,0,0,0.08)` | Modais, popovers |
| `sombra-xl` | `0 8px 32px rgba(0,0,0,0.12)` | Elementos flutuantes |

**Dark mode:** Sombras substituidas por bordas mais claras. Sem box-shadow em dark mode.

---

## 7. Transicoes e Animacoes

### 7.1 Duracoes

| Token | Valor | Uso |
|---|---|---|
| `transicao-rapida` | 100ms | Hover de botoes, focus |
| `transicao-normal` | 200ms | Abertura de menus, toggles |
| `transicao-lenta` | 300ms | Abertura de modais, slides |
| `transicao-muito-lenta` | 500ms | Animacoes de entrada de pagina |

### 7.2 Easing

| Token | Valor | Uso |
|---|---|---|
| `easing-padrao` | `cubic-bezier(0.4, 0, 0.2, 1)` | Transicoes gerais |
| `easing-entrada` | `cubic-bezier(0, 0, 0.2, 1)` | Elementos entrando |
| `easing-saida` | `cubic-bezier(0.4, 0, 1, 1)` | Elementos saindo |

### 7.3 Reducao de Movimento

Respeitar `prefers-reduced-motion: reduce`:
- Desabilitar todas as animacoes decorativas
- Manter transicoes essenciais (focus, hover) com duracao minima
- Desabilitar scroll-behavior smooth

---

## 8. Icones

- **Biblioteca:** Lucide React
- **Tamanho padrao:** 16px (sidebar, botoes)
- **Tamanho grande:** 20px (headers, estados vazios)
- **Tamanho XL:** 24px (ilustracoes, empty states)
- **Stroke width:** 1.5 (padrao Lucide)

---

## 9. Componentes — Especificacao

### 9.1 Botoes

| Variante | Background | Texto | Borda | Uso |
|---|---|---|---|---|
| Primario | `#F26B2A` | `#FFFFFF` | nenhuma | CTA principal |
| Secundario | `#FEF0E8` | `#C04F1A` | nenhuma | Acoes secundarias |
| Outline | transparente | `#1A1A1A` | `#E8E8E8` | Acoes terciarias |
| Ghost | transparente | `#6B6B6B` | nenhuma | Acoes discretas |
| Destrutivo | `#E74C3C` | `#FFFFFF` | nenhuma | Acoes perigosas |

Tamanhos: `sm` (32px h), `md` (40px h), `lg` (48px h), `icon` (40x40px).
Arredondamento: `arredondamento-lg` (16px).

### 9.2 Cards

- Background: `superficie` (branco / #242424 dark)
- Borda: 1px `borda` (#E8E8E8 / #333333 dark)
- Arredondamento: `arredondamento-2xl` (24px)
- Padding: `espaco-6` (24px)
- Sombra: `sombra-nenhuma` (padrao), `sombra-sm` no hover

### 9.3 Inputs

- Height: 40px
- Padding: 12px 16px
- Borda: 1px `borda`
- Arredondamento: `arredondamento-md` (14px)
- Focus ring: 2px `primaria` com offset 2px
- Placeholder: `texto-terciario`

### 9.4 Badges / Tags

- Padding: 4px 8px
- Arredondamento: `arredondamento-sm` (12px)
- Font size: `corpo-xs` (10px) / `corpo-sm` (12px)
- Font weight: 500-600
- Variantes: primaria, sucesso, perigo, aviso, info (usando cores suaves como fundo)

---

## 10. Prioridades Kanban

| Prioridade | Cor | Badge |
|---|---|---|
| Alta | `#E74C3C` | Fundo `#FDE8E6`, texto `#E74C3C` |
| Media | `#F2C94C` | Fundo `#FEF9E7`, texto `#B7950B` |
| Baixa | `#2ECC71` | Fundo `#E8F8F0`, texto `#27AE60` |

---

## 11. Gamificacao Visual

### 11.1 XP e Level

- Barra de progresso: gradient de `primaria` para `#FF8C42`
- Badge de nivel: circulo `primaria` com numero branco
- Animacao de level up: pulse + confetti

### 11.2 Streaks

- Icone de fogo em `#F26B2A` (ativo) / `#999999` (inativo)
- Badge de streak: fundo `#FEF0E8`, texto `#F26B2A`

### 11.3 Daily Quests

- Item completo: check verde `#2ECC71`, texto com line-through sutil
- Item pendente: circulo outline `#E8E8E8`, texto normal
- Barra de progresso: `primaria`

---

## 12. Dark Mode

Troca completa de tokens via classe CSS `.dark`. Principios:

1. **Fundo:** #1A1A1A (mais escuro que o atual #151515 para menos fadiga)
2. **Superficie:** #242424 (cards)
3. **Bordas:** #333333 (mais visiveis que #2A2A2A)
4. **Primaria:** Manter #F26B2A (contraste suficiente sobre escuro)
5. **Texto:** #F5F5F5 (principal), #A0A0A0 (secundario)
6. **Sombras:** Removidas, substituidas por bordas

---

## 13. Breakpoints

| Nome | Valor | Uso |
|---|---|---|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablet |
| `lg` | 1024px | Desktop (sidebar aparece) |
| `xl` | 1280px | Desktop largo |
| `2xl` | 1536px | Monitores grandes |

---

## 14. Mapeamento de CSS Custom Properties

Todas as variaveis em `:root` e `.dark`:

```css
:root {
  /* Base */
  --radius: 1rem;

  /* Primaria */
  --primary: #F26B2A;
  --primary-foreground: #FFFFFF;
  --primary-hover: #D95A1F;
  --primary-active: #C04F1A;
  --primary-soft: #FEF0E8;

  /* Neutras */
  --background: #F5F5F5;
  --foreground: #1A1A1A;
  --card: #FFFFFF;
  --card-foreground: #1A1A1A;
  --popover: #FFFFFF;
  --popover-foreground: #1A1A1A;
  --muted: #F0F0F0;
  --muted-foreground: #6B6B6B;
  --accent: #FEF0E8;
  --accent-foreground: #C04F1A;
  --secondary: #FEF0E8;
  --secondary-foreground: #C04F1A;

  /* Semanticas */
  --destructive: #E74C3C;
  --success: #2ECC71;
  --warning: #F2C94C;
  --info: #3498DB;
  --success-soft: #E8F8F0;
  --warning-soft: #FEF9E7;
  --danger-soft: #FDE8E6;
  --info-soft: #E8F4FD;

  /* Bordas */
  --border: #E8E8E8;
  --input: #E8E8E8;
  --ring: #F26B2A;
  --borda-cartao: #E8E8E8;

  /* Graficos */
  --chart-1: #F26B2A;
  --chart-2: #2ECC71;
  --chart-3: #3498DB;
  --chart-4: #F2C94C;
  --chart-5: #9B59B6;

  /* Sidebar */
  --sidebar: #FAFAFA;
  --sidebar-foreground: #1A1A1A;
  --sidebar-primary: #F26B2A;
  --sidebar-primary-foreground: #FFFFFF;
  --sidebar-accent: #FEF0E8;
  --sidebar-accent-foreground: #C04F1A;
  --sidebar-border: #E8E8E8;
  --sidebar-ring: #F26B2A;

  /* Sombras */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.04);
  --shadow-md: 0 2px 8px rgba(0,0,0,0.06);
  --shadow-lg: 0 4px 16px rgba(0,0,0,0.08);
  --shadow-xl: 0 8px 32px rgba(0,0,0,0.12);

  /* Transicoes */
  --transition-fast: 100ms;
  --transition-normal: 200ms;
  --transition-slow: 300ms;
  --transition-slower: 500ms;
  --easing-default: cubic-bezier(0.4, 0, 0.2, 1);
  --easing-in: cubic-bezier(0, 0, 0.2, 1);
  --easing-out: cubic-bezier(0.4, 0, 1, 1);
}

.dark {
  --primary: #F26B2A;
  --primary-foreground: #FFFFFF;
  --primary-hover: #FF7E3F;
  --primary-active: #E05E22;
  --primary-soft: #3D2415;

  --background: #1A1A1A;
  --foreground: #F5F5F5;
  --card: #242424;
  --card-foreground: #F5F5F5;
  --popover: #242424;
  --popover-foreground: #F5F5F5;
  --muted: #2A2A2A;
  --muted-foreground: #A0A0A0;
  --accent: #3D2415;
  --accent-foreground: #FDBA74;
  --secondary: #3D2415;
  --secondary-foreground: #FDBA74;

  --destructive: #E74C3C;
  --success: #2ECC71;
  --warning: #F2C94C;
  --info: #3498DB;
  --success-soft: #1A2E22;
  --warning-soft: #2E2A1A;
  --danger-soft: #2E1A1A;
  --info-soft: #1A2430;

  --border: #333333;
  --input: #333333;
  --ring: #F26B2A;
  --borda-cartao: #333333;

  --chart-1: #F26B2A;
  --chart-2: #2ECC71;
  --chart-3: #3498DB;
  --chart-4: #F2C94C;
  --chart-5: #9B59B6;

  --sidebar: #1E1E1E;
  --sidebar-foreground: #F5F5F5;
  --sidebar-primary: #F26B2A;
  --sidebar-primary-foreground: #FFFFFF;
  --sidebar-accent: #3D2415;
  --sidebar-accent-foreground: #FDBA74;
  --sidebar-border: #333333;
  --sidebar-ring: #F26B2A;

  --shadow-sm: none;
  --shadow-md: none;
  --shadow-lg: none;
  --shadow-xl: none;
}
```

---

*Documento gerado em 2026-01-30. Referencia visual: ConstructHub dashboard.*
