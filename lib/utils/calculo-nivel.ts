/**
 * Calculates the user level based on total XP.
 *
 * Formula: FLOOR(SQRT(xp / 100)) + 1
 *
 * Level progression:
 * - Level 1: 0-99 XP
 * - Level 2: 100-399 XP
 * - Level 3: 400-899 XP
 * - Level 4: 900-1599 XP
 * - Level 5: 1600-2499 XP
 * - ...and so on
 */
export function calcularNivel(xp: number): number {
  if (xp < 0) {
    throw new Error('XP cannot be negative')
  }

  return Math.floor(Math.sqrt(xp / 100)) + 1
}

/**
 * Calculates the minimum XP required to reach a given level.
 *
 * Inverse of the level formula: (level - 1)^2 * 100
 */
export function xpParaNivel(nivel: number): number {
  if (nivel < 1) {
    throw new Error('Level must be at least 1')
  }

  return (nivel - 1) ** 2 * 100
}

/**
 * Calculates the XP progress within the current level.
 *
 * Returns an object with:
 * - `atual`: current XP within the level
 * - `necessario`: total XP needed for the next level
 * - `porcentagem`: progress percentage (0-100)
 */
export function progressoNivel(xp: number): {
  atual: number
  necessario: number
  porcentagem: number
} {
  const nivelAtual = calcularNivel(xp)
  const xpNivelAtual = xpParaNivel(nivelAtual)
  const xpProximoNivel = xpParaNivel(nivelAtual + 1)

  const atual = xp - xpNivelAtual
  const necessario = xpProximoNivel - xpNivelAtual

  return {
    atual,
    necessario,
    porcentagem: Math.round((atual / necessario) * 100),
  }
}
