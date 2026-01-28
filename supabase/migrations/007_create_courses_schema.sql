-- ============================================================================
-- BUILDERS PERFORMANCE - COURSES SCHEMA
-- ============================================================================
-- Tabelas para cursos, módulos, aulas e progresso do usuário
-- Página: /cursos
-- Data: 2026-01-28
-- ============================================================================

-- ============================================================================
-- PART 1: CREATE ENUMS
-- ============================================================================

CREATE TYPE public.course_level AS ENUM ('iniciante', 'intermediario', 'avancado');
CREATE TYPE public.course_status AS ENUM ('rascunho', 'publicado', 'arquivado');

-- ============================================================================
-- PART 2: CREATE TABLES
-- ============================================================================

-- -----------------------------------------------------------------------------
-- 2.1 COURSES - Cursos disponíveis
-- -----------------------------------------------------------------------------
CREATE TABLE public.courses (
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
CREATE TABLE public.course_modules (
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
CREATE TABLE public.lessons (
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
CREATE TABLE public.lesson_progress (
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
-- PART 3: CREATE INDEXES
-- ============================================================================

CREATE INDEX idx_courses_slug ON public.courses(slug);
CREATE INDEX idx_courses_categoria ON public.courses(categoria);
CREATE INDEX idx_courses_destaque ON public.courses(destaque);
CREATE INDEX idx_courses_status ON public.courses(status);

CREATE INDEX idx_course_modules_course_id ON public.course_modules(course_id);
CREATE INDEX idx_course_modules_ordem ON public.course_modules(course_id, ordem);

CREATE INDEX idx_lessons_module_id ON public.lessons(module_id);
CREATE INDEX idx_lessons_ordem ON public.lessons(module_id, ordem);

CREATE INDEX idx_lesson_progress_user_id ON public.lesson_progress(user_id);
CREATE INDEX idx_lesson_progress_lesson_id ON public.lesson_progress(lesson_id);
CREATE INDEX idx_lesson_progress_user_lesson ON public.lesson_progress(user_id, lesson_id);

-- ============================================================================
-- PART 4: ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PART 5: CREATE RLS POLICIES
-- ============================================================================

-- Courses - todos podem ver cursos publicados (incluindo anon)
CREATE POLICY "courses_select_all" ON public.courses
  FOR SELECT
  USING (status = 'publicado');

CREATE POLICY "courses_service_role_all" ON public.courses
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Modules - todos podem ver módulos de cursos publicados (incluindo anon)
CREATE POLICY "modules_select_all" ON public.course_modules
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.courses c WHERE c.id = course_id AND c.status = 'publicado'));

CREATE POLICY "modules_service_role_all" ON public.course_modules
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Lessons - todos podem ver aulas de cursos publicados (incluindo anon)
CREATE POLICY "lessons_select_all" ON public.lessons
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.course_modules m
    JOIN public.courses c ON c.id = m.course_id
    WHERE m.id = module_id AND c.status = 'publicado'
  ));

CREATE POLICY "lessons_service_role_all" ON public.lessons
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Lesson progress - apenas o próprio usuário
CREATE POLICY "lesson_progress_select_own" ON public.lesson_progress
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "lesson_progress_insert_own" ON public.lesson_progress
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "lesson_progress_update_own" ON public.lesson_progress
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "lesson_progress_delete_own" ON public.lesson_progress
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

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
-- PART 7: CREATE TRIGGERS
-- ============================================================================

CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_course_modules_updated_at
  BEFORE UPDATE ON public.course_modules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at
  BEFORE UPDATE ON public.lessons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lesson_progress_updated_at
  BEFORE UPDATE ON public.lesson_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- PART 8: SEED DATA
-- ============================================================================

-- Curso 1: Builders Performance Júnior
INSERT INTO public.courses (id, slug, titulo, descricao, categoria, nivel, destaque, ordem)
VALUES (
  '11111111-aaaa-4111-8111-111111111111'::UUID,
  'builders-performance-junior',
  'Builders Performance Júnior',
  'Fundamentos de produtividade, rotina e performance para iniciar sua jornada.',
  'Produtividade',
  'iniciante',
  true,
  1
);

-- Módulos do Curso 1
INSERT INTO public.course_modules (id, course_id, titulo, descricao, ordem)
VALUES
  ('22221111-aaaa-4111-8111-111111111111'::UUID, '11111111-aaaa-4111-8111-111111111111'::UUID, 'Boas-vindas', 'Entenda o método e a visão do Builder Performance.', 1),
  ('22222222-aaaa-4111-8111-111111111111'::UUID, '11111111-aaaa-4111-8111-111111111111'::UUID, 'Rotina que funciona', 'Estruturação diária e energia sustentável.', 2);

-- Aulas do Módulo 1.1
INSERT INTO public.lessons (id, module_id, titulo, descricao, duracao_segundos, xp_recompensa, ordem)
VALUES
  ('33331111-aaaa-4111-8111-111111111111'::UUID, '22221111-aaaa-4111-8111-111111111111'::UUID, 'Introdução ao programa', 'Panorama do curso e da sua evolução.', 380, 10, 1),
  ('33332222-aaaa-4111-8111-111111111111'::UUID, '22221111-aaaa-4111-8111-111111111111'::UUID, 'O método Builder', 'Como as camadas de rotina se conectam.', 555, 15, 2);

-- Aulas do Módulo 1.2
INSERT INTO public.lessons (id, module_id, titulo, descricao, duracao_segundos, xp_recompensa, ordem)
VALUES
  ('33333333-aaaa-4111-8111-111111111111'::UUID, '22222222-aaaa-4111-8111-111111111111'::UUID, 'Rituais diários', 'Manhãs e finais de dia com consistência.', 760, 20, 1),
  ('33334444-aaaa-4111-8111-111111111111'::UUID, '22222222-aaaa-4111-8111-111111111111'::UUID, 'Ambiente e foco', 'Como preparar o espaço para alta performance.', 605, 20, 2),
  ('33335555-aaaa-4111-8111-111111111111'::UUID, '22222222-aaaa-4111-8111-111111111111'::UUID, 'Gestão de energia', 'Alavancas simples para render mais.', 530, 15, 3);

-- Curso 2: Imersão Produto Rápido
INSERT INTO public.courses (id, slug, titulo, descricao, categoria, nivel, destaque, ordem)
VALUES (
  '11111111-bbbb-4111-8111-111111111111'::UUID,
  'imersao-produto-rapido',
  'Imersão Produto Rápido',
  'Planejamento e execução para tirar ideias do papel com velocidade.',
  'Execução',
  'intermediario',
  true,
  2
);

-- Módulos do Curso 2
INSERT INTO public.course_modules (id, course_id, titulo, descricao, ordem)
VALUES
  ('22221111-bbbb-4111-8111-111111111111'::UUID, '11111111-bbbb-4111-8111-111111111111'::UUID, 'Alinhamento estratégico', 'Clareza de objetivo e foco de entrega.', 1),
  ('22222222-bbbb-4111-8111-111111111111'::UUID, '11111111-bbbb-4111-8111-111111111111'::UUID, 'Entrega contínua', 'Cadência, feedback e evolução.', 2);

-- Aulas do Módulo 2.1
INSERT INTO public.lessons (id, module_id, titulo, descricao, duracao_segundos, xp_recompensa, ordem)
VALUES
  ('33331111-bbbb-4111-8111-111111111111'::UUID, '22221111-bbbb-4111-8111-111111111111'::UUID, 'Definindo objetivos', 'Direção clara antes de construir.', 670, 20, 1),
  ('33332222-bbbb-4111-8111-111111111111'::UUID, '22221111-bbbb-4111-8111-111111111111'::UUID, 'Roadmap em 3 semanas', 'Plano enxuto com entregas reais.', 842, 25, 2);

-- Aulas do Módulo 2.2
INSERT INTO public.lessons (id, module_id, titulo, descricao, duracao_segundos, xp_recompensa, ordem)
VALUES
  ('33333333-bbbb-4111-8111-111111111111'::UUID, '22222222-bbbb-4111-8111-111111111111'::UUID, 'Loop de feedback', 'Feedback rápido para decisão rápida.', 570, 15, 1),
  ('33334444-bbbb-4111-8111-111111111111'::UUID, '22222222-bbbb-4111-8111-111111111111'::UUID, 'Ritmo de execução', 'Como manter velocidade sem burnout.', 825, 25, 2);

-- Curso 3: Foco Profundo
INSERT INTO public.courses (id, slug, titulo, descricao, categoria, nivel, destaque, ordem)
VALUES (
  '11111111-cccc-4111-8111-111111111111'::UUID,
  'foco-profundo',
  'Foco Profundo',
  'Treinamento prático para sessões de deep work e produtividade sustentada.',
  'Foco',
  'intermediario',
  false,
  3
);

-- Módulos do Curso 3
INSERT INTO public.course_modules (id, course_id, titulo, descricao, ordem)
VALUES
  ('22221111-cccc-4111-8111-111111111111'::UUID, '11111111-cccc-4111-8111-111111111111'::UUID, 'Fundamentos do foco', 'O que rouba sua atenção e como recuperar.', 1),
  ('22222222-cccc-4111-8111-111111111111'::UUID, '11111111-cccc-4111-8111-111111111111'::UUID, 'Sessões guiadas', 'Rotinas para entrar em flow rapidamente.', 2);

-- Aulas do Módulo 3.1
INSERT INTO public.lessons (id, module_id, titulo, descricao, duracao_segundos, xp_recompensa, ordem)
VALUES
  ('33331111-cccc-4111-8111-111111111111'::UUID, '22221111-cccc-4111-8111-111111111111'::UUID, 'Mapa de distrações', 'Identifique seus principais gatilhos.', 460, 10, 1),
  ('33332222-cccc-4111-8111-111111111111'::UUID, '22221111-cccc-4111-8111-111111111111'::UUID, 'Setup de imersão', 'Prepare a mente e o ambiente.', 620, 15, 2);

-- Aulas do Módulo 3.2
INSERT INTO public.lessons (id, module_id, titulo, descricao, duracao_segundos, xp_recompensa, ordem)
VALUES
  ('33333333-cccc-4111-8111-111111111111'::UUID, '22222222-cccc-4111-8111-111111111111'::UUID, 'Pomodoro avançado', 'Como customizar ciclos sem perder ritmo.', 725, 20, 1),
  ('33334444-cccc-4111-8111-111111111111'::UUID, '22222222-cccc-4111-8111-111111111111'::UUID, 'Recuperação ativa', 'Pausas que recuperam energia de verdade.', 535, 15, 2);

-- Curso 4: Rotina para Builders
INSERT INTO public.courses (id, slug, titulo, descricao, categoria, nivel, destaque, ordem)
VALUES (
  '11111111-dddd-4111-8111-111111111111'::UUID,
  'rotina-para-builders',
  'Rotina para Builders',
  'Crie sistemas pessoais para evoluir hábitos, tarefas e metas.',
  'Rotina',
  'avancado',
  false,
  4
);

-- Módulos do Curso 4
INSERT INTO public.course_modules (id, course_id, titulo, descricao, ordem)
VALUES
  ('22221111-dddd-4111-8111-111111111111'::UUID, '11111111-dddd-4111-8111-111111111111'::UUID, 'Arquitetura da rotina', 'Estruture sua semana com intenção.', 1),
  ('22222222-dddd-4111-8111-111111111111'::UUID, '11111111-dddd-4111-8111-111111111111'::UUID, 'Hábitos que sustentam', 'Mantenha consistência ao longo dos meses.', 2);

-- Aulas do Módulo 4.1
INSERT INTO public.lessons (id, module_id, titulo, descricao, duracao_segundos, xp_recompensa, ordem)
VALUES
  ('33331111-dddd-4111-8111-111111111111'::UUID, '22221111-dddd-4111-8111-111111111111'::UUID, 'Planejamento semanal', 'Priorização e execução realista.', 805, 25, 1),
  ('33332222-dddd-4111-8111-111111111111'::UUID, '22221111-dddd-4111-8111-111111111111'::UUID, 'Revisões de progresso', 'Como ajustar o rumo toda semana.', 610, 20, 2);

-- Aulas do Módulo 4.2
INSERT INTO public.lessons (id, module_id, titulo, descricao, duracao_segundos, xp_recompensa, ordem)
VALUES
  ('33333333-dddd-4111-8111-111111111111'::UUID, '22222222-dddd-4111-8111-111111111111'::UUID, 'Gatilhos e recompensas', 'Estruture hábitos fáceis de cumprir.', 580, 15, 1);

-- Progresso do usuário mock (algumas aulas concluídas)
INSERT INTO public.lesson_progress (user_id, lesson_id, concluida, xp_ganho, concluida_em)
VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID, '33331111-aaaa-4111-8111-111111111111'::UUID, true, 10, NOW() - INTERVAL '5 days'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID, '33332222-aaaa-4111-8111-111111111111'::UUID, true, 15, NOW() - INTERVAL '4 days'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID, '33331111-bbbb-4111-8111-111111111111'::UUID, true, 20, NOW() - INTERVAL '2 days')
ON CONFLICT (user_id, lesson_id) DO NOTHING;

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
