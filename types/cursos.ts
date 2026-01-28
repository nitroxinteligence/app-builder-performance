// ==========================================
// TIPOS BASE DO BANCO DE DADOS
// ==========================================

export type CourseLevel = 'iniciante' | 'intermediario' | 'avancado'
export type CourseStatus = 'rascunho' | 'publicado' | 'arquivado'

// ==========================================
// AULA
// ==========================================

export interface Lesson {
  id: string
  module_id: string
  titulo: string
  descricao: string | null
  duracao_segundos: number
  xp_recompensa: number
  video_url: string | null
  ordem: number
  created_at: string
  updated_at: string
}

export interface LessonWithProgress extends Lesson {
  concluida: boolean
  duracao: string
  xp: string
}

// ==========================================
// MÓDULO
// ==========================================

export interface CourseModule {
  id: string
  course_id: string
  titulo: string
  descricao: string | null
  ordem: number
  created_at: string
  updated_at: string
}

export interface CourseModuleWithLessons extends CourseModule {
  aulas: LessonWithProgress[]
}

// ==========================================
// CURSO (DATABASE)
// ==========================================

export interface CourseDB {
  id: string
  slug: string
  titulo: string
  descricao: string | null
  categoria: string
  nivel: CourseLevel
  imagem_url: string | null
  destaque: boolean
  status: CourseStatus
  ordem: number
  created_at: string
  updated_at: string
}

// ==========================================
// CURSO (UI - com nivel transformado para label)
// ==========================================

export interface Course {
  id: string
  slug: string
  titulo: string
  descricao: string | null
  categoria: string
  nivel: string
  imagem_url: string | null
  destaque: boolean
  status: CourseStatus
  ordem: number
  created_at: string
  updated_at: string
}

export interface CourseWithModules extends Course {
  modulos: CourseModuleWithLessons[]
}

// ==========================================
// PROGRESSO
// ==========================================

export interface LessonProgress {
  id: string
  user_id: string
  lesson_id: string
  concluida: boolean
  xp_ganho: number
  concluida_em: string | null
  created_at: string
  updated_at: string
}

export interface CourseProgress {
  totalAulas: number
  aulasConcluidas: number
  progresso: number
}

// ==========================================
// RESUMO DO CURSO (UI)
// ==========================================

export interface CursoComResumo {
  curso: Course
  resumo: CourseProgress
}

// ==========================================
// NOVOS CONTEÚDOS (BLOQUEADOS)
// ==========================================

export interface NovoConteudo {
  id: string
  titulo: string
  descricao: string
  nivel: string
}

// ==========================================
// DADOS COMPOSTOS DA PÁGINA DE CURSOS
// ==========================================

export interface CursosData {
  cursos: CursoComResumo[]
  categorias: string[]
  cursosDestaque: CursoComResumo[]
  cursosContinuar: CursoComResumo[]
  novosConteudos: NovoConteudo[]
  isLoading: boolean
  error: Error | null
}

// ==========================================
// RESULTADO DE COMPLETE LESSON
// ==========================================

export interface CompleteLessonResult {
  xp_ganho: number
  new_total_xp: number
  new_level: number
  level_up: boolean
}
