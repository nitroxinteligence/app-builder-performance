-- ============================================================================
-- BUILDERS PERFORMANCE - COURSES SCHEMA
-- ============================================================================
-- Tabelas para cursos, módulos, aulas e progresso do usuário
-- Página: /cursos
-- Data: 2026-01-28
-- ============================================================================

-- ============================================================================
-- PART 1: CREATE ENUMS (idempotent)
-- ============================================================================

DO $$ BEGIN
  CREATE TYPE public.course_level AS ENUM ('iniciante', 'intermediario', 'avancado');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.course_status AS ENUM ('rascunho', 'publicado', 'arquivado');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- PART 2: CREATE TABLES
-- ============================================================================

-- -----------------------------------------------------------------------------
-- 2.1 COURSES - Cursos disponíveis
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT NOT NULL,
  nivel public.course_level NOT NULL DEFAULT 'iniciante',
  imagem_url TEXT,
  destaque BOOLEAN NOT NULL DEFAULT false,
  status public.course_status NOT NULL DEFAULT 'publicado',
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.courses IS 'Cursos disponíveis na plataforma';
COMMENT ON COLUMN public.courses.destaque IS 'Curso em destaque na página principal';

-- -----------------------------------------------------------------------------
-- 2.2 COURSE_MODULES - Módulos de cada curso
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.course_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.course_modules IS 'Módulos dentro de cada curso';

-- -----------------------------------------------------------------------------
-- 2.3 LESSONS - Aulas de cada módulo
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  duracao_segundos INTEGER NOT NULL DEFAULT 0,
  xp_recompensa INTEGER NOT NULL DEFAULT 10,
  video_url TEXT,
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.lessons IS 'Aulas dentro de cada módulo';
COMMENT ON COLUMN public.lessons.duracao_segundos IS 'Duração da aula em segundos';

-- -----------------------------------------------------------------------------
-- 2.4 LESSON_PROGRESS - Progresso do usuário nas aulas
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  concluida BOOLEAN NOT NULL DEFAULT false,
  xp_ganho INTEGER NOT NULL DEFAULT 0,
  concluida_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

COMMENT ON TABLE public.lesson_progress IS 'Progresso do usuário em cada aula';

-- ============================================================================
-- PART 3: CREATE INDEXES (idempotent)
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_courses_slug ON public.courses(slug);
CREATE INDEX IF NOT EXISTS idx_courses_categoria ON public.courses(categoria);
CREATE INDEX IF NOT EXISTS idx_courses_destaque ON public.courses(destaque);
CREATE INDEX IF NOT EXISTS idx_courses_status ON public.courses(status);

CREATE INDEX IF NOT EXISTS idx_course_modules_course_id ON public.course_modules(course_id);
CREATE INDEX IF NOT EXISTS idx_course_modules_ordem ON public.course_modules(course_id, ordem);

CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON public.lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_lessons_ordem ON public.lessons(module_id, ordem);

CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_id ON public.lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson_id ON public.lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_lesson ON public.lesson_progress(user_id, lesson_id);

-- ============================================================================
-- PART 4: ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PART 5: CREATE RLS POLICIES (idempotent)
-- ============================================================================

-- Courses - todos podem ver cursos publicados (incluindo anon)
DROP POLICY IF EXISTS "courses_select_all" ON public.courses;
CREATE POLICY "courses_select_all" ON public.courses
  FOR SELECT
  USING (status = 'publicado');

DROP POLICY IF EXISTS "courses_service_role_all" ON public.courses;
CREATE POLICY "courses_service_role_all" ON public.courses
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Modules - todos podem ver módulos de cursos publicados (incluindo anon)
DROP POLICY IF EXISTS "modules_select_all" ON public.course_modules;
CREATE POLICY "modules_select_all" ON public.course_modules
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.courses c WHERE c.id = course_id AND c.status = 'publicado'));

DROP POLICY IF EXISTS "modules_service_role_all" ON public.course_modules;
CREATE POLICY "modules_service_role_all" ON public.course_modules
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Lessons - todos podem ver aulas de cursos publicados (incluindo anon)
DROP POLICY IF EXISTS "lessons_select_all" ON public.lessons;
CREATE POLICY "lessons_select_all" ON public.lessons
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.course_modules m
    JOIN public.courses c ON c.id = m.course_id
    WHERE m.id = module_id AND c.status = 'publicado'
  ));

DROP POLICY IF EXISTS "lessons_service_role_all" ON public.lessons;
CREATE POLICY "lessons_service_role_all" ON public.lessons
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Lesson progress - apenas o próprio usuário
DROP POLICY IF EXISTS "lesson_progress_select_own" ON public.lesson_progress;
CREATE POLICY "lesson_progress_select_own" ON public.lesson_progress
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "lesson_progress_insert_own" ON public.lesson_progress;
CREATE POLICY "lesson_progress_insert_own" ON public.lesson_progress
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "lesson_progress_update_own" ON public.lesson_progress;
CREATE POLICY "lesson_progress_update_own" ON public.lesson_progress
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "lesson_progress_delete_own" ON public.lesson_progress;
CREATE POLICY "lesson_progress_delete_own" ON public.lesson_progress
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "lesson_progress_service_role_all" ON public.lesson_progress;
CREATE POLICY "lesson_progress_service_role_all" ON public.lesson_progress
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ============================================================================
-- PART 6: CREATE FUNCTIONS
-- ============================================================================

-- Trigger function: update updated_at timestamp (reuse existing if available)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Complete a lesson and grant XP
CREATE OR REPLACE FUNCTION public.complete_lesson(
  p_user_id UUID,
  p_lesson_id UUID
)
RETURNS TABLE(
  xp_ganho INTEGER,
  new_total_xp INTEGER,
  new_level INTEGER,
  level_up BOOLEAN
) AS $$
DECLARE
  v_lesson_xp INTEGER;
  v_xp_result RECORD;
  v_already_completed BOOLEAN;
BEGIN
  -- Check if already completed
  SELECT EXISTS(
    SELECT 1 FROM public.lesson_progress
    WHERE user_id = p_user_id AND lesson_id = p_lesson_id AND concluida = true
  ) INTO v_already_completed;

  IF v_already_completed THEN
    RETURN QUERY SELECT 0, 0, 0, false;
    RETURN;
  END IF;

  -- Get lesson XP
  SELECT xp_recompensa INTO v_lesson_xp
  FROM public.lessons WHERE id = p_lesson_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lesson not found';
  END IF;

  -- Upsert progress
  INSERT INTO public.lesson_progress (user_id, lesson_id, concluida, xp_ganho, concluida_em)
  VALUES (p_user_id, p_lesson_id, true, v_lesson_xp, NOW())
  ON CONFLICT (user_id, lesson_id)
  DO UPDATE SET concluida = true, xp_ganho = v_lesson_xp, concluida_em = NOW();

  -- Add XP to user
  SELECT * INTO v_xp_result FROM public.add_user_xp(p_user_id, v_lesson_xp);

  RETURN QUERY SELECT v_lesson_xp, v_xp_result.new_total_xp, v_xp_result.new_level, v_xp_result.level_up;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get course progress for a user
CREATE OR REPLACE FUNCTION public.get_course_progress(
  p_user_id UUID,
  p_course_id UUID
)
RETURNS TABLE(
  total_aulas BIGINT,
  aulas_concluidas BIGINT,
  progresso_percentual INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(l.id)::BIGINT AS total_aulas,
    COUNT(lp.id) FILTER (WHERE lp.concluida = true)::BIGINT AS aulas_concluidas,
    CASE
      WHEN COUNT(l.id) = 0 THEN 0
      ELSE ROUND((COUNT(lp.id) FILTER (WHERE lp.concluida = true)::DECIMAL / COUNT(l.id)) * 100)::INTEGER
    END AS progresso_percentual
  FROM public.lessons l
  JOIN public.course_modules m ON m.id = l.module_id
  LEFT JOIN public.lesson_progress lp ON lp.lesson_id = l.id AND lp.user_id = p_user_id
  WHERE m.course_id = p_course_id;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================================================
-- PART 7: CREATE TRIGGERS (idempotent)
-- ============================================================================

DROP TRIGGER IF EXISTS update_courses_updated_at ON public.courses;
CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_course_modules_updated_at ON public.course_modules;
CREATE TRIGGER update_course_modules_updated_at
  BEFORE UPDATE ON public.course_modules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_lessons_updated_at ON public.lessons;
CREATE TRIGGER update_lessons_updated_at
  BEFORE UPDATE ON public.lessons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_lesson_progress_updated_at ON public.lesson_progress;
CREATE TRIGGER update_lesson_progress_updated_at
  BEFORE UPDATE ON public.lesson_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================
-- SELECT
--   c.titulo as curso,
--   COUNT(DISTINCT m.id) as modulos,
--   COUNT(l.id) as aulas
-- FROM courses c
-- LEFT JOIN course_modules m ON m.course_id = c.id
-- LEFT JOIN lessons l ON l.module_id = m.id
-- GROUP BY c.id, c.titulo
-- ORDER BY c.ordem;
