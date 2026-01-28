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

const XP_PER_LEVEL = 500
const XP_GROWTH_FACTOR = 1.2

// ==========================================
// FUNÇÕES UTILITÁRIAS
// ==========================================

export function getLevelTitle(level: number): string {
  if (level >= 10) return 'Mestre'
  return LEVEL_TITLES[level] || 'Iniciante'
}

export function calculateXpForLevel(level: number): number {
  if (level <= 1) return 0
  return Math.floor(XP_PER_LEVEL * Math.pow(XP_GROWTH_FACTOR, level - 1))
}

export function calculateXpProgress(
  totalXp: number,
  currentLevel: number
): { xpAtual: number; xpTotal: number; percentual: number } {
  const xpForCurrentLevel = calculateXpForLevel(currentLevel)
  const xpForNextLevel = calculateXpForLevel(currentLevel + 1)
  const xpNeeded = xpForNextLevel - xpForCurrentLevel
  const xpProgress = totalXp - xpForCurrentLevel
  const percentual =
    xpNeeded === 0
      ? 100
      : Math.min(100, Math.max(0, Math.round((xpProgress / xpNeeded) * 100)))

  return {
    xpAtual: Math.max(0, xpProgress),
    xpTotal: Math.max(1, xpNeeded),
    percentual,
  }
}

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
