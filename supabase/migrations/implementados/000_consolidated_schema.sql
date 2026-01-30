-- ============================================================================
-- BUILDERS PERFORMANCE - CONSOLIDATED DATABASE SCHEMA
-- ============================================================================
-- Este arquivo contém o schema completo e consolidado para todas as páginas:
-- - /tarefas (Kanban de tarefas + pendências)
-- - /foco (Timer de foco com sessões)
-- - /habitos (Hábitos, metas e objetivos de desenvolvimento)
--
-- Data: 2026-01-28
-- Versão: 1.1.0 (corrigido cleanup)
-- ============================================================================

-- ============================================================================
-- PART 1: CLEANUP (safe to re-run - idempotente)
-- ============================================================================

-- Drop views first (order matters due to dependencies)
DROP VIEW IF EXISTS public.focus_sessions_with_task CASCADE;
DROP VIEW IF EXISTS public.habits_today CASCADE;

-- Drop functions (CASCADE removes dependent triggers)
DROP FUNCTION IF EXISTS public.complete_focus_session CASCADE;
DROP FUNCTION IF EXISTS public.get_focus_stats CASCADE;
DROP FUNCTION IF EXISTS public.cancel_active_sessions CASCADE;
DROP FUNCTION IF EXISTS public.calculate_focus_xp CASCADE;
DROP FUNCTION IF EXISTS public.add_task_time CASCADE;
DROP FUNCTION IF EXISTS public.add_user_xp CASCADE;
DROP FUNCTION IF EXISTS public.calculate_level CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column CASCADE;
DROP FUNCTION IF EXISTS public.check_habit CASCADE;
DROP FUNCTION IF EXISTS public.get_habit_streak CASCADE;

-- Drop tables (CASCADE removes policies, triggers, indexes, and foreign keys)
DROP TABLE IF EXISTS public.habit_checks CASCADE;
DROP TABLE IF EXISTS public.habits CASCADE;
DROP TABLE IF EXISTS public.habit_categories CASCADE;
DROP TABLE IF EXISTS public.development_objectives CASCADE;
DROP TABLE IF EXISTS public.goals CASCADE;
DROP TABLE IF EXISTS public.focus_sessions CASCADE;
DROP TABLE IF EXISTS public.pending_items CASCADE;
DROP TABLE IF EXISTS public.tasks CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Drop enums
DROP TYPE IF EXISTS public.session_status CASCADE;
DROP TYPE IF EXISTS public.focus_mode CASCADE;
DROP TYPE IF EXISTS public.kanban_column CASCADE;
DROP TYPE IF EXISTS public.task_status CASCADE;
DROP TYPE IF EXISTS public.task_priority CASCADE;
DROP TYPE IF EXISTS public.goal_status CASCADE;
DROP TYPE IF EXISTS public.objective_category CASCADE;

-- ============================================================================
-- PART 2: CREATE ENUMS
-- ============================================================================

-- Task and Kanban enums
CREATE TYPE public.task_priority AS ENUM ('baixa', 'media', 'alta', 'urgente');
CREATE TYPE public.task_status AS ENUM ('pendente', 'em_progresso', 'em_revisao', 'concluido');
CREATE TYPE public.kanban_column AS ENUM ('backlog', 'a_fazer', 'em_andamento', 'concluido');

-- Focus session enums
CREATE TYPE public.focus_mode AS ENUM ('pomodoro', 'deep_work', 'flowtime', 'custom');
CREATE TYPE public.session_status AS ENUM ('active', 'paused', 'completed', 'cancelled');

-- Goals and objectives enums
CREATE TYPE public.goal_status AS ENUM ('a_fazer', 'em_andamento', 'concluido');
CREATE TYPE public.objective_category AS ENUM ('pessoal', 'profissional', 'estudos', 'saude', 'financeiro');

-- ============================================================================
-- PART 3: CREATE TABLES
-- ============================================================================

-- -----------------------------------------------------------------------------
-- 3.1 USERS - Tabela principal de usuários
-- -----------------------------------------------------------------------------
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  total_xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  streak_shields INTEGER NOT NULL DEFAULT 2,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.users IS 'Tabela de usuários do Builders Performance';
COMMENT ON COLUMN public.users.total_xp IS 'Total de XP acumulado pelo usuário';
COMMENT ON COLUMN public.users.level IS 'Nível atual calculado com base no XP';
COMMENT ON COLUMN public.users.streak_shields IS 'Proteções de streak disponíveis (máx 2/semana)';
COMMENT ON COLUMN public.users.current_streak IS 'Streak atual em dias';
COMMENT ON COLUMN public.users.longest_streak IS 'Maior streak de todos os tempos';

-- -----------------------------------------------------------------------------
-- 3.2 TASKS - Tarefas do Kanban (página /tarefas)
-- -----------------------------------------------------------------------------
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  prioridade public.task_priority NOT NULL DEFAULT 'media',
  status public.task_status NOT NULL DEFAULT 'pendente',
  coluna public.kanban_column NOT NULL DEFAULT 'backlog',
  data_limite TIMESTAMPTZ,
  xp_recompensa INTEGER NOT NULL DEFAULT 10,
  projeto_id UUID,
  tags TEXT[] DEFAULT '{}',
  estimativa_tempo INTEGER,
  tempo_gasto INTEGER NOT NULL DEFAULT 0,
  ordem INTEGER NOT NULL DEFAULT 0,
  concluida_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.tasks IS 'Tarefas do Kanban do Builders Performance';
COMMENT ON COLUMN public.tasks.tempo_gasto IS 'Tempo total gasto na tarefa em minutos';
COMMENT ON COLUMN public.tasks.estimativa_tempo IS 'Estimativa de tempo para completar em minutos';
COMMENT ON COLUMN public.tasks.xp_recompensa IS 'XP ganho ao completar a tarefa';

-- -----------------------------------------------------------------------------
-- 3.3 PENDING_ITEMS - Pendências (página /tarefas modal de pendências)
-- -----------------------------------------------------------------------------
CREATE TABLE public.pending_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  prioridade public.task_priority NOT NULL DEFAULT 'media',
  categoria TEXT,
  prazo TEXT,
  data_vencimento TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.pending_items IS 'Pendências rápidas antes de virar tarefas no Kanban';

-- -----------------------------------------------------------------------------
-- 3.4 FOCUS_SESSIONS - Sessões de foco (página /foco)
-- -----------------------------------------------------------------------------
CREATE TABLE public.focus_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  modo public.focus_mode NOT NULL,
  duracao_planejada INTEGER NOT NULL,
  duracao_real INTEGER NOT NULL DEFAULT 0,
  xp_ganho INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  pausas JSONB NOT NULL DEFAULT '[]'::JSONB,
  status public.session_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.focus_sessions IS 'Sessões de foco do timer Pomodoro/Deep Work';
COMMENT ON COLUMN public.focus_sessions.duracao_planejada IS 'Duração planejada da sessão em segundos';
COMMENT ON COLUMN public.focus_sessions.duracao_real IS 'Duração real focada em segundos (excluindo pausas)';
COMMENT ON COLUMN public.focus_sessions.pausas IS 'Array JSON de pausas com started_at, ended_at, duration';
COMMENT ON COLUMN public.focus_sessions.xp_ganho IS 'XP ganho na sessão (1 XP por minuto)';

-- -----------------------------------------------------------------------------
-- 3.5 HABIT_CATEGORIES - Categorias de hábitos (página /habitos)
-- -----------------------------------------------------------------------------
CREATE TABLE public.habit_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  icone TEXT NOT NULL DEFAULT 'circle',
  cor TEXT DEFAULT '#6366f1',
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.habit_categories IS 'Categorias para agrupar hábitos (Saúde, Produtividade, etc.)';

-- -----------------------------------------------------------------------------
-- 3.6 HABITS - Hábitos diários (página /habitos)
-- -----------------------------------------------------------------------------
CREATE TABLE public.habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.habit_categories(id) ON DELETE SET NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  frequencia TEXT NOT NULL DEFAULT 'diario',
  dias_semana INTEGER[] DEFAULT '{1,2,3,4,5,6,0}',
  horario_lembrete TIME,
  xp_por_check INTEGER NOT NULL DEFAULT 15,
  streak_atual INTEGER NOT NULL DEFAULT 0,
  maior_streak INTEGER NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT true,
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.habits IS 'Hábitos diários/recorrentes do usuário';
COMMENT ON COLUMN public.habits.dias_semana IS 'Dias da semana que o hábito deve ser feito (0=dom, 6=sab)';
COMMENT ON COLUMN public.habits.xp_por_check IS 'XP ganho ao marcar o hábito como feito';

-- -----------------------------------------------------------------------------
-- 3.7 HABIT_CHECKS - Marcações de hábitos (página /habitos)
-- -----------------------------------------------------------------------------
CREATE TABLE public.habit_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  check_date DATE NOT NULL DEFAULT CURRENT_DATE,
  xp_ganho INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(habit_id, check_date)
);

COMMENT ON TABLE public.habit_checks IS 'Registro de hábitos completados por dia';

-- -----------------------------------------------------------------------------
-- 3.8 GOALS - Metas do ano (página /habitos - aba Metas)
-- -----------------------------------------------------------------------------
CREATE TABLE public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  progresso_atual INTEGER NOT NULL DEFAULT 0,
  progresso_total INTEGER NOT NULL DEFAULT 100,
  unidade TEXT DEFAULT 'unidades',
  status public.goal_status NOT NULL DEFAULT 'a_fazer',
  prazo TEXT,
  data_limite TIMESTAMPTZ,
  xp_recompensa INTEGER NOT NULL DEFAULT 100,
  concluida_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.goals IS 'Metas prioritárias do ano (100 push-ups, 24 livros, etc.)';

-- -----------------------------------------------------------------------------
-- 3.9 DEVELOPMENT_OBJECTIVES - Plano de desenvolvimento individual (página /habitos)
-- -----------------------------------------------------------------------------
CREATE TABLE public.development_objectives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  categoria public.objective_category NOT NULL DEFAULT 'pessoal',
  progresso_atual INTEGER NOT NULL DEFAULT 0,
  progresso_total INTEGER NOT NULL DEFAULT 10,
  status public.goal_status NOT NULL DEFAULT 'a_fazer',
  habitos_chave TEXT[] DEFAULT '{}',
  xp_recompensa INTEGER NOT NULL DEFAULT 50,
  concluida_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.development_objectives IS 'Objetivos de desenvolvimento individual (aprender inglês, mestrado, etc.)';

-- ============================================================================
-- PART 4: CREATE INDEXES
-- ============================================================================

-- Users indexes
CREATE INDEX idx_users_email ON public.users(email);

-- Tasks indexes
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_coluna ON public.tasks(coluna);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_prioridade ON public.tasks(prioridade);
CREATE INDEX idx_tasks_data_limite ON public.tasks(data_limite);
CREATE INDEX idx_tasks_user_coluna ON public.tasks(user_id, coluna);

-- Pending items indexes
CREATE INDEX idx_pending_items_user_id ON public.pending_items(user_id);

-- Focus sessions indexes
CREATE INDEX idx_focus_sessions_user_id ON public.focus_sessions(user_id);
CREATE INDEX idx_focus_sessions_task_id ON public.focus_sessions(task_id);
CREATE INDEX idx_focus_sessions_status ON public.focus_sessions(status);
CREATE INDEX idx_focus_sessions_started_at ON public.focus_sessions(started_at);
CREATE INDEX idx_focus_sessions_user_status ON public.focus_sessions(user_id, status);

-- Habit categories indexes
CREATE INDEX idx_habit_categories_user_id ON public.habit_categories(user_id);

-- Habits indexes
CREATE INDEX idx_habits_user_id ON public.habits(user_id);
CREATE INDEX idx_habits_category_id ON public.habits(category_id);
CREATE INDEX idx_habits_user_ativo ON public.habits(user_id, ativo);

-- Habit checks indexes
CREATE INDEX idx_habit_checks_habit_id ON public.habit_checks(habit_id);
CREATE INDEX idx_habit_checks_user_id ON public.habit_checks(user_id);
CREATE INDEX idx_habit_checks_date ON public.habit_checks(check_date);
CREATE INDEX idx_habit_checks_user_date ON public.habit_checks(user_id, check_date);

-- Goals indexes
CREATE INDEX idx_goals_user_id ON public.goals(user_id);
CREATE INDEX idx_goals_status ON public.goals(status);

-- Development objectives indexes
CREATE INDEX idx_development_objectives_user_id ON public.development_objectives(user_id);
CREATE INDEX idx_development_objectives_categoria ON public.development_objectives(categoria);
CREATE INDEX idx_development_objectives_status ON public.development_objectives(status);

-- ============================================================================
-- PART 5: ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.development_objectives ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PART 6: CREATE RLS POLICIES
-- ============================================================================

-- Users policies
CREATE POLICY "users_select_own" ON public.users FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "users_update_own" ON public.users FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "users_insert_own" ON public.users FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "users_service_role_all" ON public.users FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Tasks policies
CREATE POLICY "tasks_select_own" ON public.tasks FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "tasks_insert_own" ON public.tasks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tasks_update_own" ON public.tasks FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tasks_delete_own" ON public.tasks FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "tasks_service_role_all" ON public.tasks FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Pending items policies
CREATE POLICY "pending_items_select_own" ON public.pending_items FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "pending_items_insert_own" ON public.pending_items FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pending_items_update_own" ON public.pending_items FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pending_items_delete_own" ON public.pending_items FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "pending_items_service_role_all" ON public.pending_items FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Focus sessions policies
CREATE POLICY "focus_sessions_select_own" ON public.focus_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "focus_sessions_insert_own" ON public.focus_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "focus_sessions_update_own" ON public.focus_sessions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "focus_sessions_delete_own" ON public.focus_sessions FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "focus_sessions_service_role_all" ON public.focus_sessions FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Habit categories policies
CREATE POLICY "habit_categories_select_own" ON public.habit_categories FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "habit_categories_insert_own" ON public.habit_categories FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "habit_categories_update_own" ON public.habit_categories FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "habit_categories_delete_own" ON public.habit_categories FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "habit_categories_service_role_all" ON public.habit_categories FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Habits policies
CREATE POLICY "habits_select_own" ON public.habits FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "habits_insert_own" ON public.habits FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "habits_update_own" ON public.habits FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "habits_delete_own" ON public.habits FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "habits_service_role_all" ON public.habits FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Habit checks policies
CREATE POLICY "habit_checks_select_own" ON public.habit_checks FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "habit_checks_insert_own" ON public.habit_checks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "habit_checks_update_own" ON public.habit_checks FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "habit_checks_delete_own" ON public.habit_checks FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "habit_checks_service_role_all" ON public.habit_checks FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Goals policies
CREATE POLICY "goals_select_own" ON public.goals FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "goals_insert_own" ON public.goals FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "goals_update_own" ON public.goals FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "goals_delete_own" ON public.goals FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "goals_service_role_all" ON public.goals FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Development objectives policies
CREATE POLICY "dev_objectives_select_own" ON public.development_objectives FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "dev_objectives_insert_own" ON public.development_objectives FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "dev_objectives_update_own" ON public.development_objectives FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "dev_objectives_delete_own" ON public.development_objectives FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "dev_objectives_service_role_all" ON public.development_objectives FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================================
-- PART 7: CREATE FUNCTIONS
-- ============================================================================

-- Trigger function: update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Calculate level from XP
CREATE OR REPLACE FUNCTION public.calculate_level(xp INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN FLOOR(SQRT(xp::DECIMAL / 100)) + 1;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add XP to user and update level
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
  SELECT level INTO v_old_level FROM public.users WHERE id = p_user_id;
  UPDATE public.users SET total_xp = total_xp + p_xp_amount WHERE id = p_user_id RETURNING total_xp INTO v_new_xp;
  v_new_level := public.calculate_level(v_new_xp);
  IF v_new_level != v_old_level THEN
    UPDATE public.users SET level = v_new_level WHERE id = p_user_id;
  END IF;
  RETURN QUERY SELECT v_new_xp, v_new_level, (v_new_level > v_old_level);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add time to task
CREATE OR REPLACE FUNCTION public.add_task_time(
  p_task_id UUID,
  p_minutes INTEGER
)
RETURNS INTEGER AS $$
DECLARE
  v_new_time INTEGER;
BEGIN
  UPDATE public.tasks SET tempo_gasto = tempo_gasto + p_minutes WHERE id = p_task_id RETURNING tempo_gasto INTO v_new_time;
  RETURN v_new_time;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Calculate XP from focus time (1 XP per minute)
CREATE OR REPLACE FUNCTION public.calculate_focus_xp(duration_seconds INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN FLOOR(duration_seconds::DECIMAL / 60);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Complete a focus session
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

-- Get focus stats for a user
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

-- Cancel active sessions
CREATE OR REPLACE FUNCTION public.cancel_active_sessions(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE public.focus_sessions SET status = 'cancelled', ended_at = NOW()
  WHERE user_id = p_user_id AND status IN ('active', 'paused');
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check habit for a date
CREATE OR REPLACE FUNCTION public.check_habit(
  p_habit_id UUID,
  p_user_id UUID,
  p_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE(
  streak_atual INTEGER,
  xp_ganho INTEGER,
  new_total_xp INTEGER,
  new_level INTEGER,
  level_up BOOLEAN
) AS $$
DECLARE
  v_xp INTEGER;
  v_streak INTEGER;
  v_habit_record RECORD;
  v_xp_result RECORD;
  v_yesterday DATE;
  v_yesterday_checked BOOLEAN;
BEGIN
  SELECT h.xp_por_check, h.streak_atual INTO v_habit_record
  FROM public.habits h WHERE h.id = p_habit_id AND h.user_id = p_user_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Habit not found or not owned by user'; END IF;
  v_xp := v_habit_record.xp_por_check;
  v_streak := v_habit_record.streak_atual;
  IF EXISTS (SELECT 1 FROM public.habit_checks WHERE habit_id = p_habit_id AND check_date = p_date) THEN
    RETURN QUERY SELECT v_streak, 0, 0, 0, false;
    RETURN;
  END IF;
  v_yesterday := p_date - INTERVAL '1 day';
  SELECT EXISTS(SELECT 1 FROM public.habit_checks WHERE habit_id = p_habit_id AND check_date = v_yesterday) INTO v_yesterday_checked;
  IF v_yesterday_checked THEN v_streak := v_streak + 1; ELSE v_streak := 1; END IF;
  v_xp := v_xp + LEAST(v_xp, v_xp * (v_streak - 1) / 10);
  INSERT INTO public.habit_checks (habit_id, user_id, check_date, xp_ganho) VALUES (p_habit_id, p_user_id, p_date, v_xp);
  UPDATE public.habits SET streak_atual = v_streak, maior_streak = GREATEST(maior_streak, v_streak) WHERE id = p_habit_id;
  SELECT * INTO v_xp_result FROM public.add_user_xp(p_user_id, v_xp);
  RETURN QUERY SELECT v_streak, v_xp, v_xp_result.new_total_xp, v_xp_result.new_level, v_xp_result.level_up;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get habit streak
CREATE OR REPLACE FUNCTION public.get_habit_streak(p_habit_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_streak INTEGER := 0;
  v_date DATE := CURRENT_DATE;
  v_has_check BOOLEAN;
BEGIN
  LOOP
    SELECT EXISTS(SELECT 1 FROM public.habit_checks WHERE habit_id = p_habit_id AND check_date = v_date) INTO v_has_check;
    IF NOT v_has_check THEN EXIT; END IF;
    v_streak := v_streak + 1;
    v_date := v_date - INTERVAL '1 day';
  END LOOP;
  RETURN v_streak;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- PART 8: CREATE TRIGGERS
-- ============================================================================

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pending_items_updated_at BEFORE UPDATE ON public.pending_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_habit_categories_updated_at BEFORE UPDATE ON public.habit_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_habits_updated_at BEFORE UPDATE ON public.habits FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON public.goals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_development_objectives_updated_at BEFORE UPDATE ON public.development_objectives FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- PART 9: CREATE VIEWS
-- ============================================================================

CREATE OR REPLACE VIEW public.focus_sessions_with_task AS
SELECT
  fs.id, fs.user_id, fs.task_id, fs.modo, fs.duracao_planejada, fs.duracao_real,
  fs.xp_ganho, fs.started_at, fs.ended_at, fs.pausas, fs.status, fs.created_at,
  t.titulo as task_titulo, t.prioridade as task_prioridade, t.coluna as task_coluna
FROM public.focus_sessions fs
LEFT JOIN public.tasks t ON fs.task_id = t.id;

CREATE OR REPLACE VIEW public.habits_today AS
SELECT
  h.id, h.user_id, h.category_id, h.titulo, h.descricao, h.frequencia,
  h.dias_semana, h.xp_por_check, h.streak_atual, h.maior_streak, h.ativo, h.ordem,
  hc.titulo as category_titulo, hc.icone as category_icone, hc.cor as category_cor,
  CASE WHEN hcheck.id IS NOT NULL THEN true ELSE false END as feito_hoje
FROM public.habits h
LEFT JOIN public.habit_categories hc ON h.category_id = hc.id
LEFT JOIN public.habit_checks hcheck ON h.id = hcheck.habit_id AND hcheck.check_date = CURRENT_DATE
WHERE h.ativo = true;

-- ============================================================================
-- VERIFICATION QUERY (run this after migration to confirm success)
-- ============================================================================
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
-- Expected: development_objectives, focus_sessions, goals, habit_categories, habit_checks, habits, pending_items, tasks, users
-- ============================================================================