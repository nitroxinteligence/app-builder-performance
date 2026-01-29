'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/providers/auth-provider'
import type {
  Course,
  CourseDB,
  CourseModule,
  Lesson,
  LessonProgress,
  LessonWithProgress,
  CursoComResumo,
  CourseProgress,
  NovoConteudo,
  CursosData,
  CompleteLessonResult,
  CourseModuleWithLessons,
} from '@/types/cursos'

// ==========================================
// QUERY KEYS
// ==========================================

const createQueryKey = (userId: string | undefined, segment: string) =>
  ['cursos', segment, userId].filter(Boolean)

const COURSES_KEY = (userId: string | undefined) => createQueryKey(userId, 'list')
const COURSE_DETAIL_KEY = (userId: string | undefined, slug: string) =>
  [...createQueryKey(userId, 'detail'), slug]

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
}

function mapNivelToLabel(nivel: string): string {
  const nivelMap: Record<string, string> = {
    iniciante: 'Iniciante',
    intermediario: 'Intermediário',
    avancado: 'Avançado',
  }
  return nivelMap[nivel] ?? nivel
}

function calculateProgress(
  lessons: Lesson[],
  progressMap: Map<string, LessonProgress>
): CourseProgress {
  const totalAulas = lessons.length
  const aulasConcluidas = lessons.filter(
    (lesson) => progressMap.get(lesson.id)?.concluida
  ).length
  const progresso = totalAulas > 0
    ? Math.round((aulasConcluidas / totalAulas) * 100)
    : 0

  return { totalAulas, aulasConcluidas, progresso }
}

// ==========================================
// FETCH FUNCTIONS
// ==========================================

interface CourseWithRelations {
  course: CourseDB
  modules: CourseModule[]
  lessons: Lesson[]
}

async function fetchCoursesWithRelations(): Promise<CourseWithRelations[]> {
  const [coursesResult, modulesResult, lessonsResult] = await Promise.all([
    supabase
      .from('courses')
      .select('*')
      .eq('status', 'publicado')
      .order('ordem'),
    supabase
      .from('course_modules')
      .select('*')
      .order('ordem'),
    supabase
      .from('lessons')
      .select('*')
      .order('ordem'),
  ])

  if (coursesResult.error) {
    throw new Error(`Erro ao buscar cursos: ${coursesResult.error.message}`)
  }
  if (modulesResult.error) {
    throw new Error(`Erro ao buscar módulos: ${modulesResult.error.message}`)
  }
  if (lessonsResult.error) {
    throw new Error(`Erro ao buscar aulas: ${lessonsResult.error.message}`)
  }

  const courses = (coursesResult.data ?? []) as CourseDB[]
  const modules = (modulesResult.data ?? []) as CourseModule[]
  const lessons = (lessonsResult.data ?? []) as Lesson[]

  return courses.map((course: CourseDB) => {
    const courseModules = modules.filter((m: CourseModule) => m.course_id === course.id)
    const moduleIds = new Set(courseModules.map((m: CourseModule) => m.id))
    const courseLessons = lessons.filter((l: Lesson) => moduleIds.has(l.module_id))

    return {
      course,
      modules: courseModules,
      lessons: courseLessons,
    }
  })
}

async function fetchUserProgress(userId: string): Promise<Map<string, LessonProgress>> {
  const { data, error } = await supabase
    .from('lesson_progress')
    .select('*')
    .eq('user_id', userId)

  if (error) {
    throw new Error(`Erro ao buscar progresso: ${error.message}`)
  }

  const progressMap = new Map<string, LessonProgress>()
  for (const progress of data ?? []) {
    progressMap.set(progress.lesson_id, progress)
  }

  return progressMap
}

async function fetchUpcomingCourses(): Promise<NovoConteudo[]> {
  const { data, error } = await supabase
    .from('courses')
    .select('id, titulo, descricao, nivel')
    .eq('status', 'rascunho')
    .order('ordem')

  if (error) {
    throw new Error(`Erro ao buscar novos conteúdos: ${error.message}`)
  }

  return (data ?? []).map((course) => ({
    id: course.id,
    titulo: course.titulo,
    descricao: course.descricao ?? '',
    nivel: mapNivelToLabel(course.nivel),
  }))
}

async function fetchCursosData(userId: string | undefined): Promise<CursosData> {
  const [coursesWithRelations, novosConteudos] = await Promise.all([
    fetchCoursesWithRelations(),
    fetchUpcomingCourses(),
  ])

  let progressMap = new Map<string, LessonProgress>()
  if (userId) {
    progressMap = await fetchUserProgress(userId)
  }

  const cursosComResumo: CursoComResumo[] = coursesWithRelations.map(
    ({ course, lessons }: CourseWithRelations) => {
      const resumo = calculateProgress(lessons, progressMap)
      const cursoTransformado: Course = {
        ...course,
        nivel: mapNivelToLabel(course.nivel),
      }
      return {
        curso: cursoTransformado,
        resumo,
      }
    }
  )

  const categorias = [
    'Todos',
    ...Array.from(new Set(cursosComResumo.map((c) => c.curso.categoria))),
  ]

  const cursosDestaque = cursosComResumo.filter((c) => c.curso.destaque)

  const cursosContinuar = cursosComResumo.filter(
    (c) => c.resumo.progresso > 0 && c.resumo.progresso < 100
  )

  return {
    cursos: cursosComResumo,
    categorias,
    cursosDestaque,
    cursosContinuar,
    novosConteudos,
    isLoading: false,
    error: null,
  }
}

// ==========================================
// HOOKS
// ==========================================

export function useCursos() {
  const { user } = useAuth()
  const userId = user?.id

  return useQuery({
    queryKey: COURSES_KEY(userId),
    queryFn: () => fetchCursosData(userId),
    staleTime: 1000 * 60 * 5,
  })
}

export function useCursosData(): CursosData {
  const { data, isLoading, error } = useCursos()

  if (isLoading || !data) {
    return {
      cursos: [],
      categorias: ['Todos'],
      cursosDestaque: [],
      cursosContinuar: [],
      novosConteudos: [],
      isLoading: true,
      error: null,
    }
  }

  return {
    ...data,
    isLoading: false,
    error: error instanceof Error ? error : null,
  }
}

interface CursoDetailData {
  curso: Course
  modulos: CourseModuleWithLessons[]
  resumo: CourseProgress
}

export function useCursoBySlug(slug: string) {
  const { user } = useAuth()
  const userId = user?.id

  return useQuery<CursoDetailData>({
    queryKey: COURSE_DETAIL_KEY(userId, slug),
    queryFn: async (): Promise<CursoDetailData> => {
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'publicado')
        .single()

      if (courseError) {
        throw new Error(`Curso não encontrado: ${courseError.message}`)
      }

      const course = courseData as CourseDB

      const { data: modulesData, error: modulesError } = await supabase
        .from('course_modules')
        .select('*')
        .eq('course_id', course.id)
        .order('ordem')

      if (modulesError) {
        throw new Error(`Erro ao buscar módulos: ${modulesError.message}`)
      }

      const modules = (modulesData ?? []) as CourseModule[]
      const moduleIds = modules.map((m: CourseModule) => m.id)

      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .in('module_id', moduleIds)
        .order('ordem')

      if (lessonsError) {
        throw new Error(`Erro ao buscar aulas: ${lessonsError.message}`)
      }

      const lessons = (lessonsData ?? []) as Lesson[]

      let progressMap = new Map<string, LessonProgress>()
      if (userId) {
        const lessonIds = lessons.map((l: Lesson) => l.id)
        const { data: progress } = await supabase
          .from('lesson_progress')
          .select('*')
          .eq('user_id', userId)
          .in('lesson_id', lessonIds)

        for (const p of (progress ?? []) as LessonProgress[]) {
          progressMap.set(p.lesson_id, p)
        }
      }

      const modulosComAulas: CourseModuleWithLessons[] = modules.map(
        (modulo: CourseModule) => {
          const aulasDoModulo: LessonWithProgress[] = lessons
            .filter((l: Lesson) => l.module_id === modulo.id)
            .map((aula: Lesson) => ({
              ...aula,
              duracao: formatDuration(aula.duracao_segundos),
              xp: `+${aula.xp_recompensa} XP`,
              concluida: progressMap.get(aula.id)?.concluida ?? false,
            }))

          return {
            ...modulo,
            aulas: aulasDoModulo,
          }
        }
      )

      const resumo = calculateProgress(lessons, progressMap)

      const cursoTransformado: Course = {
        ...course,
        nivel: mapNivelToLabel(course.nivel),
      }

      return {
        curso: cursoTransformado,
        modulos: modulosComAulas,
        resumo,
      }
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
  })
}

export function useCompleteLesson() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (lessonId: string): Promise<CompleteLessonResult> => {
      if (!user?.id) {
        throw new Error('Usuário não autenticado')
      }

      const { data, error } = await supabase.rpc('complete_lesson', {
        p_user_id: user.id,
        p_lesson_id: lessonId,
      })

      if (error) {
        throw new Error(`Erro ao completar aula: ${error.message}`)
      }

      const result = data?.[0]
      if (!result) {
        throw new Error('Resposta inválida do servidor')
      }

      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cursos'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

// ==========================================
// UTILITIES EXPORTS
// ==========================================

export { formatDuration, mapNivelToLabel, calculateProgress }
