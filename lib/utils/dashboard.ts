// ==========================================
// CONFIGURAÇÃO DE NÍVEIS
// ==========================================

const LEVEL_TITLES: Record<number, string> = {
  1: 'Iniciante',
  2: 'Iniciante',
  3: 'Aprendiz',
  4: 'Aprendiz',
  5: 'Construtor',
  6: 'Construtor',
  7: 'Construtor',
  8: 'Arquiteto',
  9: 'Arquiteto',
  10: 'Mestre',
}

// ==========================================
// FUNÇÕES UTILITÁRIAS
// ==========================================

// Canonical level formula — aligned with backend: FLOOR(SQRT(xp/100)) + 1
// XP needed per level: level N requires (N-1)^2 * 100 total XP
import { calcularNivel, xpParaNivel, progressoNivel } from './calculo-nivel'

export function getLevelTitle(level: number): string {
  if (level >= 10) return 'Mestre'
  return LEVEL_TITLES[level] || 'Iniciante'
}

export function calculateXpForLevel(level: number): number {
  return xpParaNivel(level)
}

export function calculateXpProgress(
  totalXp: number,
  currentLevel: number
): { xpAtual: number; xpTotal: number; percentual: number } {
  const progresso = progressoNivel(totalXp)
  return {
    xpAtual: progresso.atual,
    xpTotal: Math.max(1, progresso.necessario),
    percentual: progresso.porcentagem,
  }
}

export { calcularNivel }

export function formatFocusTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`
  }

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
  }

  return `${minutes}m`
}

export function getStartOfDay(date: Date = new Date()): string {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

export function getStartOfWeek(date: Date = new Date()): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

export function formatDate(date: Date = new Date()): string {
  return date.toISOString().split('T')[0]
}
