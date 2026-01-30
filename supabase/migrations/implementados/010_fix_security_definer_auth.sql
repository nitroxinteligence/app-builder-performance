-- Migration: 010_fix_security_definer_auth
-- Descrição: Adiciona validação auth.uid() em todas as 7 funções SECURITY DEFINER
-- para impedir que um usuário autenticado manipule dados de outro.
-- Referência: Story TD-1.0, Bloco 2 (DB-C01)

-- ==========================================
-- 1. add_user_xp
-- ==========================================
CREATE OR REPLACE FUNCTION public.add_user_xp(
  p_user_id UUID,
  p_xp_amount INTEGER
)
RETURNS TABLE(new_total_xp INTEGER, new_level INTEGER, level_up BOOLEAN) AS $$
DECLARE
  v_old_level INTEGER;
  v_new_level INTEGER;
  v_new_xp INTEGER;
BEGIN
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: cannot modify another user XP';
  END IF;

  SELECT level INTO v_old_level FROM public.users WHERE id = p_user_id;
  UPDATE public.users SET total_xp = total_xp + p_xp_amount WHERE id = p_user_id RETURNING total_xp INTO v_new_xp;
  v_new_level := public.calculate_level(v_new_xp);
  IF v_new_level != v_old_level THEN
    UPDATE public.users SET level = v_new_level WHERE id = p_user_id;
  END IF;
  RETURN QUERY SELECT v_new_xp, v_new_level, (v_new_level > v_old_level);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 2. add_task_time
-- ==========================================
CREATE OR REPLACE FUNCTION public.add_task_time(
  p_task_id UUID,
  p_minutes INTEGER
)
RETURNS INTEGER AS $$
DECLARE
  v_new_time INTEGER;
  v_owner_id UUID;
BEGIN
  SELECT user_id INTO v_owner_id FROM public.tasks WHERE id = p_task_id;
  IF v_owner_id IS NULL THEN
    RAISE EXCEPTION 'Task not found';
  END IF;
  IF auth.uid() IS DISTINCT FROM v_owner_id THEN
    RAISE EXCEPTION 'Unauthorized: cannot modify another user task';
  END IF;

  UPDATE public.tasks SET tempo_gasto = tempo_gasto + p_minutes WHERE id = p_task_id RETURNING tempo_gasto INTO v_new_time;
  RETURN v_new_time;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 3. complete_focus_session
-- ==========================================
CREATE OR REPLACE FUNCTION public.complete_focus_session(
  p_session_id UUID,
  p_duration_real INTEGER,
  p_ended_at TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE(
  session_id UUID,
  xp_earned INTEGER,
  new_total_xp INTEGER,
  new_level INTEGER,
  level_up BOOLEAN
) AS $$
DECLARE
  v_user_id UUID;
  v_task_id UUID;
  v_xp INTEGER;
  v_result RECORD;
BEGIN
  -- Verify ownership before modifying
  SELECT fs.user_id INTO v_user_id FROM public.focus_sessions fs WHERE fs.id = p_session_id;
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Session not found';
  END IF;
  IF auth.uid() IS DISTINCT FROM v_user_id THEN
    RAISE EXCEPTION 'Unauthorized: cannot complete another user session';
  END IF;

  v_xp := public.calculate_focus_xp(p_duration_real);
  UPDATE public.focus_sessions SET status = 'completed', duracao_real = p_duration_real, xp_ganho = v_xp, ended_at = p_ended_at
  WHERE id = p_session_id RETURNING focus_sessions.user_id, focus_sessions.task_id INTO v_user_id, v_task_id;
  SELECT * INTO v_result FROM public.add_user_xp(v_user_id, v_xp);
  IF v_task_id IS NOT NULL THEN
    PERFORM public.add_task_time(v_task_id, FLOOR(p_duration_real::DECIMAL / 60)::INTEGER);
  END IF;
  RETURN QUERY SELECT p_session_id, v_xp, v_result.new_total_xp, v_result.new_level, v_result.level_up;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 4. get_focus_stats
-- ==========================================
CREATE OR REPLACE FUNCTION public.get_focus_stats(p_user_id UUID)
RETURNS TABLE(
  total_sessions BIGINT,
  total_seconds BIGINT,
  total_xp BIGINT,
  average_session_seconds NUMERIC,
  sessions_today BIGINT,
  seconds_today BIGINT,
  sessions_this_week BIGINT,
  seconds_this_week BIGINT
) AS $$
BEGIN
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: cannot access another user stats';
  END IF;

  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT,
    COALESCE(SUM(fs.duracao_real), 0)::BIGINT,
    COALESCE(SUM(fs.xp_ganho), 0)::BIGINT,
    COALESCE(AVG(fs.duracao_real), 0)::NUMERIC,
    COUNT(*) FILTER (WHERE fs.started_at >= CURRENT_DATE)::BIGINT,
    COALESCE(SUM(fs.duracao_real) FILTER (WHERE fs.started_at >= CURRENT_DATE), 0)::BIGINT,
    COUNT(*) FILTER (WHERE fs.started_at >= DATE_TRUNC('week', CURRENT_DATE))::BIGINT,
    COALESCE(SUM(fs.duracao_real) FILTER (WHERE fs.started_at >= DATE_TRUNC('week', CURRENT_DATE)), 0)::BIGINT
  FROM public.focus_sessions fs
  WHERE fs.user_id = p_user_id AND fs.status = 'completed';
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ==========================================
-- 5. cancel_active_sessions
-- ==========================================
CREATE OR REPLACE FUNCTION public.cancel_active_sessions(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: cannot cancel another user sessions';
  END IF;

  UPDATE public.focus_sessions SET status = 'cancelled', ended_at = NOW()
  WHERE user_id = p_user_id AND status IN ('active', 'paused');
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 6. complete_lesson
-- ==========================================
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
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: cannot complete lesson for another user';
  END IF;

  SELECT EXISTS(
    SELECT 1 FROM public.lesson_progress
    WHERE user_id = p_user_id AND lesson_id = p_lesson_id AND concluida = true
  ) INTO v_already_completed;

  IF v_already_completed THEN
    RETURN QUERY SELECT 0, 0, 0, false;
    RETURN;
  END IF;

  SELECT xp_recompensa INTO v_lesson_xp
  FROM public.lessons WHERE id = p_lesson_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lesson not found';
  END IF;

  INSERT INTO public.lesson_progress (user_id, lesson_id, concluida, xp_ganho, concluida_em)
  VALUES (p_user_id, p_lesson_id, true, v_lesson_xp, NOW())
  ON CONFLICT (user_id, lesson_id)
  DO UPDATE SET concluida = true, xp_ganho = v_lesson_xp, concluida_em = NOW();

  SELECT * INTO v_xp_result FROM public.add_user_xp(p_user_id, v_lesson_xp);

  RETURN QUERY SELECT v_lesson_xp, v_xp_result.new_total_xp, v_xp_result.new_level, v_xp_result.level_up;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 7. get_course_progress
-- ==========================================
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
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: cannot access another user course progress';
  END IF;

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
