"use client"

import {
  AlertCircle,
  AlertTriangle,
  Aperture,
  Apple,
  ArrowLeft,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  Clock,
  Eye,
  EyeOff,
  Focus,
  Loader2,
  Lock,
  Mail,
  Mic,
  Moon,
  Pencil,
  Plus,
  RefreshCw,
  Repeat2,
  Search,
  Send,
  Sparkles,
  Sun,
  Target,
  Trash2,
  TrendingUp,
  X,
  Zap,
} from "lucide-react"

import { ColorSwatch } from "@/componentes/design-system/color-swatch"
import { IconGrid } from "@/componentes/design-system/icon-grid"
import { ShowcaseSection } from "@/componentes/design-system/showcase-section"
import { TokenDisplay } from "@/componentes/design-system/token-display"

const CORES_PRINCIPAL = [
  { nome: "Background", variavel: "--background" },
  { nome: "Foreground", variavel: "--foreground" },
  { nome: "Primary", variavel: "--primary" },
  { nome: "Primary FG", variavel: "--primary-foreground" },
  { nome: "Secondary", variavel: "--secondary" },
  { nome: "Secondary FG", variavel: "--secondary-foreground" },
  { nome: "Muted", variavel: "--muted" },
  { nome: "Muted FG", variavel: "--muted-foreground" },
  { nome: "Accent", variavel: "--accent" },
  { nome: "Accent FG", variavel: "--accent-foreground" },
  { nome: "Destructive", variavel: "--destructive" },
] as const

const CORES_UI = [
  { nome: "Card", variavel: "--card" },
  { nome: "Card FG", variavel: "--card-foreground" },
  { nome: "Popover", variavel: "--popover" },
  { nome: "Popover FG", variavel: "--popover-foreground" },
  { nome: "Border", variavel: "--border" },
  { nome: "Input", variavel: "--input" },
  { nome: "Ring", variavel: "--ring" },
] as const

const CORES_SIDEBAR = [
  { nome: "Sidebar", variavel: "--sidebar" },
  { nome: "Sidebar FG", variavel: "--sidebar-foreground" },
  { nome: "Sidebar Primary", variavel: "--sidebar-primary" },
  { nome: "Sidebar Accent", variavel: "--sidebar-accent" },
  { nome: "Sidebar Border", variavel: "--sidebar-border" },
] as const

const CORES_CHART = [
  { nome: "Chart 1", variavel: "--chart-1" },
  { nome: "Chart 2", variavel: "--chart-2" },
  { nome: "Chart 3", variavel: "--chart-3" },
  { nome: "Chart 4", variavel: "--chart-4" },
  { nome: "Chart 5", variavel: "--chart-5" },
] as const

const TIPOGRAFIA = [
  { nome: "Display", classe: "font-titulo text-4xl font-bold", texto: "Builders Performance" },
  { nome: "H1", classe: "font-titulo text-3xl font-bold", texto: "Heading 1 — Sora Bold" },
  { nome: "H2", classe: "font-titulo text-2xl font-bold", texto: "Heading 2 — Sora Bold" },
  { nome: "H3", classe: "font-titulo text-xl font-semibold", texto: "Heading 3 — Sora Semibold" },
  { nome: "H4", classe: "text-lg font-semibold", texto: "Heading 4 — Manrope Semibold" },
  { nome: "Body", classe: "text-base", texto: "Body text — Manrope Regular 16px. O texto base do app usa a fonte Manrope para leitura confortavel." },
  { nome: "Body Small", classe: "text-sm", texto: "Body small — Manrope Regular 14px. Usado em descricoes secundarias." },
  { nome: "Caption", classe: "text-xs text-muted-foreground", texto: "Caption — Manrope 12px. Usado em labels, timestamps e metadados." },
  { nome: "Overline", classe: "text-[10px] font-medium uppercase tracking-wider text-muted-foreground", texto: "OVERLINE — MANROPE 10PX UPPERCASE" },
  { nome: "Mono", classe: "font-mono text-sm", texto: "Monospace — para codigo e valores tecnicos" },
] as const

const SPACING = [
  { nome: "0.5", valor: "0.125rem (2px)" },
  { nome: "1", valor: "0.25rem (4px)" },
  { nome: "1.5", valor: "0.375rem (6px)" },
  { nome: "2", valor: "0.5rem (8px)" },
  { nome: "3", valor: "0.75rem (12px)" },
  { nome: "4", valor: "1rem (16px)" },
  { nome: "5", valor: "1.25rem (20px)" },
  { nome: "6", valor: "1.5rem (24px)" },
  { nome: "8", valor: "2rem (32px)" },
  { nome: "10", valor: "2.5rem (40px)" },
  { nome: "12", valor: "3rem (48px)" },
  { nome: "16", valor: "4rem (64px)" },
  { nome: "20", valor: "5rem (80px)" },
  { nome: "24", valor: "6rem (96px)" },
] as const

const RADIUS_TOKENS = [
  { nome: "radius-sm", variavel: "calc(var(--radius) - 4px)", valor: "12px" },
  { nome: "radius-md", variavel: "calc(var(--radius) - 2px)", valor: "14px" },
  { nome: "radius-lg", variavel: "var(--radius)", valor: "16px" },
  { nome: "radius-xl", variavel: "calc(var(--radius) + 4px)", valor: "20px" },
  { nome: "radius-2xl", variavel: "calc(var(--radius) + 8px)", valor: "24px" },
  { nome: "radius-3xl", variavel: "calc(var(--radius) + 12px)", valor: "28px" },
  { nome: "radius-4xl", variavel: "calc(var(--radius) + 16px)", valor: "32px" },
] as const

const SHADOWS = [
  { nome: "shadow-sm", classe: "shadow-sm" },
  { nome: "shadow", classe: "shadow" },
  { nome: "shadow-md", classe: "shadow-md" },
  { nome: "shadow-lg", classe: "shadow-lg" },
  { nome: "shadow-xl", classe: "shadow-xl" },
  { nome: "shadow-2xl", classe: "shadow-2xl" },
] as const

const ICONES_APP = [
  { nome: "AlertCircle", Icone: AlertCircle },
  { nome: "AlertTriangle", Icone: AlertTriangle },
  { nome: "Aperture", Icone: Aperture },
  { nome: "Apple", Icone: Apple },
  { nome: "ArrowLeft", Icone: ArrowLeft },
  { nome: "BookOpen", Icone: BookOpen },
  { nome: "CalendarDays", Icone: CalendarDays },
  { nome: "Check", Icone: Check },
  { nome: "CheckCircle2", Icone: CheckCircle2 },
  { nome: "ChevronDown", Icone: ChevronDown },
  { nome: "ChevronUp", Icone: ChevronUp },
  { nome: "Circle", Icone: Circle },
  { nome: "Clock", Icone: Clock },
  { nome: "Eye", Icone: Eye },
  { nome: "EyeOff", Icone: EyeOff },
  { nome: "Focus", Icone: Focus },
  { nome: "Loader2", Icone: Loader2 },
  { nome: "Lock", Icone: Lock },
  { nome: "Mail", Icone: Mail },
  { nome: "Mic", Icone: Mic },
  { nome: "Moon", Icone: Moon },
  { nome: "Pencil", Icone: Pencil },
  { nome: "Plus", Icone: Plus },
  { nome: "RefreshCw", Icone: RefreshCw },
  { nome: "Repeat2", Icone: Repeat2 },
  { nome: "Search", Icone: Search },
  { nome: "Send", Icone: Send },
  { nome: "Sparkles", Icone: Sparkles },
  { nome: "Sun", Icone: Sun },
  { nome: "Target", Icone: Target },
  { nome: "Trash2", Icone: Trash2 },
  { nome: "TrendingUp", Icone: TrendingUp },
  { nome: "X", Icone: X },
  { nome: "Zap", Icone: Zap },
] as const

export default function TokensPage() {
  return (
    <div className="space-y-12">
      <div className="space-y-2">
        <h1 className="font-titulo text-3xl font-bold tracking-tight">
          Design Tokens
        </h1>
        <p className="text-muted-foreground">
          Fundacao visual do Builders Performance — cores, tipografia, espacamento,
          radius, sombras, motion e icones.
        </p>
      </div>

      {/* 2.1 — Paleta de Cores */}
      <ShowcaseSection
        id="cores"
        titulo="Paleta de Cores"
        descricao="CSS variables definidas em globals.css — tema claro e escuro"
      >
        <div className="space-y-6">
          <div>
            <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
              Cores Principais
            </h3>
            <div className="flex flex-wrap gap-4">
              {CORES_PRINCIPAL.map((cor) => (
                <ColorSwatch
                  key={cor.variavel}
                  nome={cor.nome}
                  variavel={cor.variavel}
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
              Cores de Interface
            </h3>
            <div className="flex flex-wrap gap-4">
              {CORES_UI.map((cor) => (
                <ColorSwatch
                  key={cor.variavel}
                  nome={cor.nome}
                  variavel={cor.variavel}
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
              Sidebar
            </h3>
            <div className="flex flex-wrap gap-4">
              {CORES_SIDEBAR.map((cor) => (
                <ColorSwatch
                  key={cor.variavel}
                  nome={cor.nome}
                  variavel={cor.variavel}
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
              Graficos
            </h3>
            <div className="flex flex-wrap gap-4">
              {CORES_CHART.map((cor) => (
                <ColorSwatch
                  key={cor.variavel}
                  nome={cor.nome}
                  variavel={cor.variavel}
                />
              ))}
            </div>
          </div>
        </div>
      </ShowcaseSection>

      {/* 2.2 — Tipografia */}
      <ShowcaseSection
        id="tipografia"
        titulo="Tipografia"
        descricao="Fonte titulo: Sora — Fonte corpo: Manrope"
      >
        <div className="space-y-4">
          {TIPOGRAFIA.map(({ nome, classe, texto }) => (
            <div key={nome} className="flex items-baseline gap-4 border-b border-border pb-3 last:border-0">
              <span className="w-24 shrink-0 text-xs font-medium text-muted-foreground">
                {nome}
              </span>
              <p className={classe}>{texto}</p>
            </div>
          ))}
        </div>
      </ShowcaseSection>

      {/* 2.3 — Spacing Scale */}
      <ShowcaseSection
        id="spacing"
        titulo="Spacing Scale"
        descricao="Escala Tailwind de espacamento"
      >
        <div className="space-y-2">
          {SPACING.map(({ nome, valor }) => (
            <div key={nome} className="flex items-center gap-4">
              <span className="w-10 shrink-0 text-right font-mono text-xs text-muted-foreground">
                {nome}
              </span>
              <div
                className="h-4 rounded-sm bg-primary"
                style={{ width: `${parseFloat(nome) * 16}px` }}
              />
              <span className="text-xs text-muted-foreground">{valor}</span>
            </div>
          ))}
        </div>
      </ShowcaseSection>

      {/* 2.4 — Border Radius */}
      <ShowcaseSection
        id="radius"
        titulo="Border Radius"
        descricao="Tokens de arredondamento baseados em --radius: 1rem"
      >
        <div className="flex flex-wrap gap-4">
          {RADIUS_TOKENS.map(({ nome, variavel, valor }) => (
            <TokenDisplay
              key={nome}
              nome={nome}
              valor={`${variavel} = ${valor}`}
              preview={
                <div
                  className="h-12 w-12 border-2 border-primary bg-primary/10"
                  style={{ borderRadius: `var(--${nome})` }}
                />
              }
            />
          ))}
        </div>
      </ShowcaseSection>

      {/* 2.5 — Shadows */}
      <ShowcaseSection
        id="shadows"
        titulo="Shadows"
        descricao="Escala de sombras Tailwind"
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {SHADOWS.map(({ nome, classe }) => (
            <div key={nome} className="flex flex-col items-center gap-2">
              <div
                className={`h-16 w-16 rounded-lg border border-border bg-card ${classe}`}
              />
              <span className="text-xs text-muted-foreground">{nome}</span>
            </div>
          ))}
        </div>
      </ShowcaseSection>

      {/* 2.6 — Motion / Animation */}
      <ShowcaseSection
        id="motion"
        titulo="Motion & Animation"
        descricao="Tokens de animacao via tw-animate-css — respects prefers-reduced-motion"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2 rounded-lg border border-border p-4">
            <p className="text-sm font-medium">Fade In</p>
            <div className="animate-in fade-in h-10 w-10 rounded-md bg-primary" />
            <p className="font-mono text-[10px] text-muted-foreground">animate-in fade-in</p>
          </div>
          <div className="space-y-2 rounded-lg border border-border p-4">
            <p className="text-sm font-medium">Slide In (Bottom)</p>
            <div className="animate-in slide-in-from-bottom-2 h-10 w-10 rounded-md bg-primary" />
            <p className="font-mono text-[10px] text-muted-foreground">animate-in slide-in-from-bottom-2</p>
          </div>
          <div className="space-y-2 rounded-lg border border-border p-4">
            <p className="text-sm font-medium">Zoom In</p>
            <div className="animate-in zoom-in-95 h-10 w-10 rounded-md bg-primary" />
            <p className="font-mono text-[10px] text-muted-foreground">animate-in zoom-in-95</p>
          </div>
          <div className="space-y-2 rounded-lg border border-border p-4">
            <p className="text-sm font-medium">Spin</p>
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="font-mono text-[10px] text-muted-foreground">animate-spin</p>
          </div>
          <div className="space-y-2 rounded-lg border border-border p-4">
            <p className="text-sm font-medium">Pulse</p>
            <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
            <p className="font-mono text-[10px] text-muted-foreground">animate-pulse (skeleton)</p>
          </div>
          <div className="space-y-2 rounded-lg border border-border p-4">
            <p className="text-sm font-medium">Bounce</p>
            <div className="h-10 w-10 animate-bounce rounded-md bg-primary" />
            <p className="font-mono text-[10px] text-muted-foreground">animate-bounce</p>
          </div>
        </div>

        <div className="mt-4 rounded-md bg-muted/50 p-3">
          <p className="text-xs text-muted-foreground">
            O app respeita <code className="font-mono">prefers-reduced-motion</code> —
            todas as animacoes sao desativadas automaticamente para usuarios que
            preferem movimento reduzido.
          </p>
        </div>
      </ShowcaseSection>

      {/* 2.7 — Iconografia */}
      <ShowcaseSection
        id="icones"
        titulo="Iconografia"
        descricao={`${ICONES_APP.length} icones Lucide React em uso no app`}
      >
        <IconGrid icones={ICONES_APP} />
      </ShowcaseSection>
    </div>
  )
}
