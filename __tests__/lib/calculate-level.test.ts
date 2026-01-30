import { describe, it, expect } from 'vitest'
import {
  calcularNivel,
  xpParaNivel,
  progressoNivel,
} from '@/lib/utils/calculo-nivel'

describe('calcularNivel', () => {
  it('should return level 1 for 0 XP', () => {
    expect(calcularNivel(0)).toBe(1)
  })

  it('should return level 1 for 50 XP (below first threshold)', () => {
    expect(calcularNivel(50)).toBe(1)
  })

  it('should return level 2 for 100 XP', () => {
    expect(calcularNivel(100)).toBe(2)
  })

  it('should return level 2 for 200 XP', () => {
    expect(calcularNivel(200)).toBe(2)
  })

  it('should return level 3 for 400 XP', () => {
    expect(calcularNivel(400)).toBe(3)
  })

  it('should return level 4 for 900 XP', () => {
    expect(calcularNivel(900)).toBe(4)
  })

  it('should return level 5 for 1600 XP', () => {
    expect(calcularNivel(1600)).toBe(5)
  })

  it('should return level 6 for 2500 XP', () => {
    expect(calcularNivel(2500)).toBe(6)
  })

  it('should return level 11 for 10000 XP', () => {
    expect(calcularNivel(10000)).toBe(11)
  })

  it('should throw an error for negative XP', () => {
    expect(() => calcularNivel(-1)).toThrow('XP cannot be negative')
  })
})

describe('xpParaNivel', () => {
  it('should return 0 XP for level 1', () => {
    expect(xpParaNivel(1)).toBe(0)
  })

  it('should return 100 XP for level 2', () => {
    expect(xpParaNivel(2)).toBe(100)
  })

  it('should return 400 XP for level 3', () => {
    expect(xpParaNivel(3)).toBe(400)
  })

  it('should return 900 XP for level 4', () => {
    expect(xpParaNivel(4)).toBe(900)
  })

  it('should return 1600 XP for level 5', () => {
    expect(xpParaNivel(5)).toBe(1600)
  })

  it('should throw an error for level below 1', () => {
    expect(() => xpParaNivel(0)).toThrow('Level must be at least 1')
  })
})

describe('progressoNivel', () => {
  it('should return 0% progress at 0 XP', () => {
    const resultado = progressoNivel(0)

    expect(resultado.atual).toBe(0)
    expect(resultado.necessario).toBe(100)
    expect(resultado.porcentagem).toBe(0)
  })

  it('should return 50% progress at 50 XP (halfway to level 2)', () => {
    const resultado = progressoNivel(50)

    expect(resultado.atual).toBe(50)
    expect(resultado.necessario).toBe(100)
    expect(resultado.porcentagem).toBe(50)
  })

  it('should return 0% progress at exactly a level boundary (100 XP)', () => {
    const resultado = progressoNivel(100)

    expect(resultado.atual).toBe(0)
    expect(resultado.necessario).toBe(300)
    expect(resultado.porcentagem).toBe(0)
  })

  it('should calculate progress within level 3 (500 XP)', () => {
    const resultado = progressoNivel(500)

    expect(resultado.atual).toBe(100)
    expect(resultado.necessario).toBe(500)
    expect(resultado.porcentagem).toBe(20)
  })
})
