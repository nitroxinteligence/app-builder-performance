import { describe, it, expect } from 'vitest'
import {
  eventoCreateSchema,
  eventoUpdateSchema,
} from '@/lib/schemas/evento'
import {
  completarAulaSchema,
  progressoAulaUpdateSchema,
} from '@/lib/schemas/curso'
import {
  perfilUpdateSchema,
} from '@/lib/schemas/perfil'
import {
  habitoCreateSchema,
  habitoUpdateSchema,
  categoriaHabitoCreateSchema,
  metaCreateSchema,
  metaUpdateSchema,
  objetivoCreateSchema,
  marcoMetaCreateSchema,
} from '@/lib/schemas/habito'

// ==========================================
// EVENTO SCHEMAS
// ==========================================

describe('eventoCreateSchema', () => {
  it('aceita dados válidos', () => {
    const input = {
      titulo: 'Reunião de equipe',
      data: '2026-02-01',
      horario_inicio: '09:00',
      horario_fim: '10:00',
      categoria: 'Reunião',
      status: 'confirmado' as const,
      calendario: 'Manual' as const,
      user_id: '550e8400-e29b-41d4-a716-446655440000',
    }
    const result = eventoCreateSchema.safeParse(input)
    expect(result.success).toBe(true)
  })

  it('rejeita título vazio', () => {
    const input = {
      titulo: '',
      data: '2026-02-01',
      horario_inicio: '09:00',
      horario_fim: '10:00',
      user_id: '550e8400-e29b-41d4-a716-446655440000',
    }
    const result = eventoCreateSchema.safeParse(input)
    expect(result.success).toBe(false)
  })

  it('rejeita horário de fim anterior ao início', () => {
    const input = {
      titulo: 'Reunião',
      data: '2026-02-01',
      horario_inicio: '10:00',
      horario_fim: '09:00',
      categoria: 'Reunião',
      status: 'confirmado' as const,
      calendario: 'Manual' as const,
      user_id: '550e8400-e29b-41d4-a716-446655440000',
    }
    const result = eventoCreateSchema.safeParse(input)
    expect(result.success).toBe(false)
  })

  it('rejeita data em formato inválido', () => {
    const input = {
      titulo: 'Reunião',
      data: '01/02/2026',
      horario_inicio: '09:00',
      horario_fim: '10:00',
      user_id: '550e8400-e29b-41d4-a716-446655440000',
    }
    const result = eventoCreateSchema.safeParse(input)
    expect(result.success).toBe(false)
  })
})

describe('eventoUpdateSchema', () => {
  it('aceita atualização parcial', () => {
    const result = eventoUpdateSchema.safeParse({ titulo: 'Novo título' })
    expect(result.success).toBe(true)
  })

  it('aceita objeto vazio', () => {
    const result = eventoUpdateSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('rejeita status inválido', () => {
    const result = eventoUpdateSchema.safeParse({ status: 'invalido' })
    expect(result.success).toBe(false)
  })
})

// ==========================================
// CURSO SCHEMAS
// ==========================================

describe('completarAulaSchema', () => {
  it('aceita dados válidos', () => {
    const result = completarAulaSchema.safeParse({
      user_id: '550e8400-e29b-41d4-a716-446655440000',
      lesson_id: '660e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.success).toBe(true)
  })

  it('rejeita UUID inválido', () => {
    const result = completarAulaSchema.safeParse({
      user_id: 'not-a-uuid',
      lesson_id: '660e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.success).toBe(false)
  })

  it('rejeita campos ausentes', () => {
    const result = completarAulaSchema.safeParse({
      user_id: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.success).toBe(false)
  })
})

describe('progressoAulaUpdateSchema', () => {
  it('aceita atualização parcial', () => {
    const result = progressoAulaUpdateSchema.safeParse({ concluida: true })
    expect(result.success).toBe(true)
  })

  it('rejeita XP negativo', () => {
    const result = progressoAulaUpdateSchema.safeParse({ xp_ganho: -10 })
    expect(result.success).toBe(false)
  })

  it('aceita objeto vazio', () => {
    const result = progressoAulaUpdateSchema.safeParse({})
    expect(result.success).toBe(true)
  })
})

// ==========================================
// PERFIL SCHEMA
// ==========================================

describe('perfilUpdateSchema', () => {
  it('aceita nome válido', () => {
    const result = perfilUpdateSchema.safeParse({ name: 'João Silva' })
    expect(result.success).toBe(true)
  })

  it('rejeita nome vazio', () => {
    const result = perfilUpdateSchema.safeParse({ name: '' })
    expect(result.success).toBe(false)
  })

  it('aceita avatar_url válida', () => {
    const result = perfilUpdateSchema.safeParse({
      avatar_url: 'https://example.com/avatar.png',
    })
    expect(result.success).toBe(true)
  })

  it('aceita avatar_url null', () => {
    const result = perfilUpdateSchema.safeParse({ avatar_url: null })
    expect(result.success).toBe(true)
  })
})

// ==========================================
// HABITO SCHEMAS (já existiam, validando)
// ==========================================

describe('habitoCreateSchema', () => {
  it('aceita dados válidos', () => {
    const result = habitoCreateSchema.safeParse({
      titulo: 'Meditar',
      user_id: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.success).toBe(true)
  })

  it('rejeita título vazio', () => {
    const result = habitoCreateSchema.safeParse({
      titulo: '',
      user_id: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.success).toBe(false)
  })

  it('aplica defaults corretos', () => {
    const result = habitoCreateSchema.parse({
      titulo: 'Ler',
      user_id: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.dificuldade).toBe('medio')
    expect(result.frequencia).toBe('diario')
    expect(result.ativo).toBe(true)
  })
})

describe('habitoUpdateSchema', () => {
  it('aceita atualização parcial', () => {
    const result = habitoUpdateSchema.safeParse({ titulo: 'Novo nome' })
    expect(result.success).toBe(true)
  })

  it('rejeita dificuldade inválida', () => {
    const result = habitoUpdateSchema.safeParse({ dificuldade: 'impossivel' })
    expect(result.success).toBe(false)
  })
})

// ==========================================
// META SCHEMAS
// ==========================================

describe('metaCreateSchema', () => {
  it('aceita dados válidos', () => {
    const result = metaCreateSchema.safeParse({
      titulo: 'Ler 24 livros',
      user_id: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.success).toBe(true)
  })

  it('rejeita progresso_total = 0', () => {
    const result = metaCreateSchema.safeParse({
      titulo: 'Meta',
      progresso_total: 0,
      user_id: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.success).toBe(false)
  })

  it('rejeita progresso_atual negativo', () => {
    const result = metaCreateSchema.safeParse({
      titulo: 'Meta',
      progresso_atual: -1,
      user_id: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.success).toBe(false)
  })
})

describe('metaUpdateSchema', () => {
  it('aceita atualização de status', () => {
    const result = metaUpdateSchema.safeParse({ status: 'em_andamento' })
    expect(result.success).toBe(true)
  })

  it('rejeita status inválido', () => {
    const result = metaUpdateSchema.safeParse({ status: 'invalido' })
    expect(result.success).toBe(false)
  })
})

// ==========================================
// OBJETIVO SCHEMAS
// ==========================================

describe('objetivoCreateSchema', () => {
  it('aceita dados válidos', () => {
    const result = objetivoCreateSchema.safeParse({
      titulo: 'Aprender TypeScript',
      user_id: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.success).toBe(true)
  })

  it('rejeita sem user_id', () => {
    const result = objetivoCreateSchema.safeParse({
      titulo: 'Objetivo',
    })
    expect(result.success).toBe(false)
  })
})

// ==========================================
// CATEGORIA HABITO SCHEMAS
// ==========================================

describe('categoriaHabitoCreateSchema', () => {
  it('aceita dados válidos', () => {
    const result = categoriaHabitoCreateSchema.safeParse({
      nome: 'Saúde',
      user_id: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.success).toBe(true)
  })

  it('rejeita cor inválida', () => {
    const result = categoriaHabitoCreateSchema.safeParse({
      nome: 'Saúde',
      cor: 'vermelho',
      user_id: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.success).toBe(false)
  })
})

// ==========================================
// MARCO META SCHEMAS
// ==========================================

describe('marcoMetaCreateSchema', () => {
  it('aceita dados válidos', () => {
    const result = marcoMetaCreateSchema.safeParse({
      meta_id: '550e8400-e29b-41d4-a716-446655440000',
      titulo: 'Completar módulo 1',
    })
    expect(result.success).toBe(true)
  })

  it('rejeita meta_id inválido', () => {
    const result = marcoMetaCreateSchema.safeParse({
      meta_id: 'invalido',
      titulo: 'Marco',
    })
    expect(result.success).toBe(false)
  })

  it('rejeita título vazio', () => {
    const result = marcoMetaCreateSchema.safeParse({
      meta_id: '550e8400-e29b-41d4-a716-446655440000',
      titulo: '',
    })
    expect(result.success).toBe(false)
  })
})
