# Visual do App

## Direção visual
Estética minimalista inspirada no layout "Actual": superfícies claras, bordas suaves, sem sombras, bastante respiro e hierarquia tipográfica limpa. O foco é leitura e clareza, com elementos discretos e estados ativos bem definidos.

## Paleta e superfícies
Lightmode:
- Fundo geral: #f6f6f6
- Sidebar: #f4f4f4
- Cards/Popover: #ffffff
- Bordas/Inputs: #eeeeee
- Texto principal: #1f1f1f
- Texto secundário: #6b6b6b
- Primário (laranja): #f97316 (texto #ffffff)
- Secundário/Realces: #fff1e6 / #fff7ed (texto #9a3412)

Darkmode:
- Fundo geral: #151515
- Sidebar: #1b1b1b
- Cards/Popover: #1f1f1f
- Bordas/Inputs: #2a2a2a
- Texto principal: #f5f5f5
- Texto secundário: #a0a0a0
- Primário (laranja): #fb923c (texto #151515)
- Secundário/Realces: #2a1d16 / #2f1c12 (texto #fdba74)

## Layout e componentes
- Sem topnav. Sidebar fixa à esquerda com colapso, com destaques em laranja suave.
- Área principal com container `max-w-6xl` e padding lateral 24px.
- Cards sem sombra, borda 1px `var(--border)`, raio 16px (`rounded-2xl`) e padding 24px.
- Botões primários sólidos e secundários suaves, com hover discreto.
- Ícones em 16px; textos da sidebar com peso 600.
