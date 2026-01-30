-- ============================================================================
-- MIGRATION: Fix Database Table Naming
-- ============================================================================
-- Este script corrige os nomes das tabelas para corresponder aos hooks:
-- 1. Renomeia habit_checks → habit_history
-- 2. Renomeia development_objectives → objectives
-- 3. Cria tabela goal_milestones (marcos de metas)
-- 4. Cria tabela objective_columns (colunas Kanban para objetivos)
--
-- Data: 2026-01-28
-- Versão: 1.2.0
-- ============================================================================

-- ============================================================================
-- PART 1: RENAME habit_checks → habit_history
-- ============================================================================

-- 1.1 Drop existing views that reference habit_checks
DROP VIEW IF EXISTS public.habits_today CASCADE;

-- 1.2 Drop existing triggers on habit_checks
DROP TRIGGER IF EXISTS update_habit_checks_updated_at ON public.habit_checks;

-- 1.3 Drop existing RLS policies on habit_checks
DROP POLICY IF EXISTS "habit_checks_select_own" ON public.habit_checks;
DROP POLICY IF EXISTS "habit_checks_insert_own" ON public.habit_checks;
DROP POLICY IF EXISTS "habit_checks_update_own" ON public.habit_checks;
DROP POLICY IF EXISTS "habit_checks_delete_own" ON public.habit_checks;
DROP POLICY IF EXISTS "habit_checks_service_role_all" ON public.habit_checks;

-- 1.4 Drop existing indexes on habit_checks
DROP INDEX IF EXISTS public.idx_habit_checks_habit_id;
DROP INDEX IF EXISTS public.idx_habit_checks_user_id;
DROP INDEX IF EXISTS public.idx_habit_checks_date;
DROP INDEX IF EXISTS public.idx_habit_checks_user_date;

-- 1.5 Rename the table
ALTER TABLE public.habit_checks RENAME TO habit_history;

-- 1.6 Rename columns to match the TypeScript interface
ALTER TABLE public.habit_history RENAME COLUMN habit_id TO habito_id;
ALTER TABLE public.habit_history RENAME COLUMN check_date TO data;

-- 1.7 Add missing columns from TypeScript interface
ALTER TABLE public.habit_history ADD COLUMN IF NOT EXISTS concluido BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.habit_history ADD COLUMN IF NOT EXISTS horario TIME;

-- 1.8 Recreate indexes with new names
CREATE INDEX idx_habit_history_habito_id ON public.habit_history(habito_id);
CREATE INDEX idx_habit_history_user_id ON public.habit_history(user_id);
CREATE INDEX idx_habit_history_data ON public.habit_history(data);
CREATE INDEX idx_habit_history_user_data ON public.habit_history(user_id, data);

-- 1.9 Recreate RLS policies
CREATE POLICY "habit_history_select_own" ON public.habit_history
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "habit_history_insert_own" ON public.habit_history
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "habit_history_update_own" ON public.habit_history
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "habit_history_delete_own" ON public.habit_history
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "habit_history_service_role_all" ON public.habit_history
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- 1.10 Recreate the habits_today view with new table name
CREATE OR REPLACE VIEW public.habits_today AS
SELECT
  h.id, h.user_id, h.category_id, h.titulo, h.descricao, h.frequencia,
  h.dias_semana, h.xp_por_check, h.streak_atual, h.maior_streak, h.ativo, h.ordem,
  hc.titulo as category_titulo, hc.icone as category_icone, hc.cor as category_cor,
  CASE WHEN hh.id IS NOT NULL THEN true ELSE false END as feito_hoje
FROM public.habits h
LEFT JOIN public.habit_categories hc ON h.category_id = hc.id
LEFT JOIN public.habit_history hh ON h.id = hh.habito_id AND hh.data = CURRENT_DATE
WHERE h.ativo = true;

-- 1.11 Update the check_habit function to use new table/column names
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
  IF EXISTS (SELECT 1 FROM public.habit_history WHERE habito_id = p_habit_id AND data = p_date) THEN
    RETURN QUERY SELECT v_streak, 0, 0, 0, false;
    RETURN;
  END IF;
  v_yesterday := p_date - INTERVAL '1 day';
  SELECT EXISTS(SELECT 1 FROM public.habit_history WHERE habito_id = p_habit_id AND data = v_yesterday) INTO v_yesterday_checked;
  IF v_yesterday_checked THEN v_streak := v_streak + 1; ELSE v_streak := 1; END IF;
  v_xp := v_xp + LEAST(v_xp, v_xp * (v_streak - 1) / 10);
  INSERT INTO public.habit_history (habito_id, user_id, data, xp_ganho, concluido) VALUES (p_habit_id, p_user_id, p_date, v_xp, true);
  UPDATE public.habits SET streak_atual = v_streak, maior_streak = GREATEST(maior_streak, v_streak) WHERE id = p_habit_id;
  SELECT * INTO v_xp_result FROM public.add_user_xp(p_user_id, v_xp);
  RETURN QUERY SELECT v_streak, v_xp, v_xp_result.new_total_xp, v_xp_result.new_level, v_xp_result.level_up;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1.12 Update the get_habit_streak function to use new table/column names
CREATE OR REPLACE FUNCTION public.get_habit_streak(p_habit_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_streak INTEGER := 0;
  v_date DATE := CURRENT_DATE;
  v_has_check BOOLEAN;
BEGIN
  LOOP
    SELECT EXISTS(SELECT 1 FROM public.habit_history WHERE habito_id = p_habit_id AND data = v_date) INTO v_has_check;
    IF NOT v_has_check THEN EXIT; END IF;
    v_streak := v_streak + 1;
    v_date := v_date - INTERVAL '1 day';
  END LOOP;
  RETURN v_streak;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- PART 2: RENAME development_objectives → objectives
-- ============================================================================

-- 2.1 Drop existing triggers on development_objectives
DROP TRIGGER IF EXISTS update_development_objectives_updated_at ON public.development_objectives;

-- 2.2 Drop existing RLS policies on development_objectives
DROP POLICY IF EXISTS "dev_objectives_select_own" ON public.development_objectives;
DROP POLICY IF EXISTS "dev_objectives_insert_own" ON public.development_objectives;
DROP POLICY IF EXISTS "dev_objectives_update_own" ON public.development_objectives;
DROP POLICY IF EXISTS "dev_objectives_delete_own" ON public.development_objectives;
DROP POLICY IF EXISTS "dev_objectives_service_role_all" ON public.development_objectives;

-- 2.3 Drop existing indexes on development_objectives
DROP INDEX IF EXISTS public.idx_development_objectives_user_id;
DROP INDEX IF EXISTS public.idx_development_objectives_categoria;
DROP INDEX IF EXISTS public.idx_development_objectives_status;

-- 2.4 Rename the table
ALTER TABLE public.development_objectives RENAME TO objectives;

-- 2.5 Add missing columns from TypeScript Objetivo interface
ALTER TABLE public.objectives ADD COLUMN IF NOT EXISTS cor TEXT;
ALTER TABLE public.objectives ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE public.objectives ADD COLUMN IF NOT EXISTS data_inicio TIMESTAMPTZ;
ALTER TABLE public.objectives ADD COLUMN IF NOT EXISTS data_fim TIMESTAMPTZ;
ALTER TABLE public.objectives ADD COLUMN IF NOT EXISTS prioridade TEXT NOT NULL DEFAULT 'media';
ALTER TABLE public.objectives ADD COLUMN IF NOT EXISTS arquivado BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.objectives ADD COLUMN IF NOT EXISTS coluna_id UUID;
ALTER TABLE public.objectives ADD COLUMN IF NOT EXISTS meta_id UUID;
ALTER TABLE public.objectives ADD COLUMN IF NOT EXISTS ordem TEXT NOT NULL DEFAULT '0';

-- 2.6 Drop old columns that don't match TypeScript interface (after adding new ones)
-- Note: keeping categoria and habitos_chave for backwards compatibility
-- ALTER TABLE public.objectives DROP COLUMN IF EXISTS categoria;
-- ALTER TABLE public.objectives DROP COLUMN IF EXISTS habitos_chave;

-- 2.7 Recreate indexes with new names
CREATE INDEX idx_objectives_user_id ON public.objectives(user_id);
CREATE INDEX idx_objectives_status ON public.objectives(status);
CREATE INDEX idx_objectives_coluna_id ON public.objectives(coluna_id);
CREATE INDEX idx_objectives_meta_id ON public.objectives(meta_id);
CREATE INDEX idx_objectives_prioridade ON public.objectives(prioridade);

-- 2.8 Recreate RLS policies
CREATE POLICY "objectives_select_own" ON public.objectives
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "objectives_insert_own" ON public.objectives
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "objectives_update_own" ON public.objectives
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "objectives_delete_own" ON public.objectives
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "objectives_service_role_all" ON public.objectives
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- 2.9 Recreate trigger
CREATE TRIGGER update_objectives_updated_at
  BEFORE UPDATE ON public.objectives
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- PART 3: CREATE goal_milestones TABLE
-- ============================================================================

-- 3.1 Create the table
CREATE TABLE IF NOT EXISTS public.goal_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meta_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  concluido BOOLEAN NOT NULL DEFAULT false,
  data_conclusao TIMESTAMPTZ,
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.goal_milestones IS 'Marcos (milestones) dentro de cada meta';
COMMENT ON COLUMN public.goal_milestones.meta_id IS 'Referência à meta (goals) pai';
COMMENT ON COLUMN public.goal_milestones.ordem IS 'Ordem de exibição do marco';

-- 3.2 Create indexes
CREATE INDEX IF NOT EXISTS idx_goal_milestones_meta_id ON public.goal_milestones(meta_id);
CREATE INDEX IF NOT EXISTS idx_goal_milestones_concluido ON public.goal_milestones(concluido);

-- 3.3 Enable RLS
ALTER TABLE public.goal_milestones ENABLE ROW LEVEL SECURITY;

-- 3.4 Create RLS policies (check ownership via goals table)
CREATE POLICY "goal_milestones_select_own" ON public.goal_milestones
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.goals g
      WHERE g.id = goal_milestones.meta_id
      AND g.user_id = auth.uid()
    )
  );

CREATE POLICY "goal_milestones_insert_own" ON public.goal_milestones
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.goals g
      WHERE g.id = goal_milestones.meta_id
      AND g.user_id = auth.uid()
    )
  );

CREATE POLICY "goal_milestones_update_own" ON public.goal_milestones
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.goals g
      WHERE g.id = goal_milestones.meta_id
      AND g.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.goals g
      WHERE g.id = goal_milestones.meta_id
      AND g.user_id = auth.uid()
    )
  );

CREATE POLICY "goal_milestones_delete_own" ON public.goal_milestones
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.goals g
      WHERE g.id = goal_milestones.meta_id
      AND g.user_id = auth.uid()
    )
  );

CREATE POLICY "goal_milestones_service_role_all" ON public.goal_milestones
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- 3.5 Create trigger for updated_at
CREATE TRIGGER update_goal_milestones_updated_at
  BEFORE UPDATE ON public.goal_milestones
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- PART 4: CREATE objective_columns TABLE
-- ============================================================================

-- 4.1 Create the table
CREATE TABLE IF NOT EXISTS public.objective_columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  icone TEXT NOT NULL DEFAULT 'folder',
  cor TEXT NOT NULL DEFAULT '#6366f1',
  ordem TEXT NOT NULL DEFAULT '0',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.objective_columns IS 'Colunas Kanban para organizar objetivos';
COMMENT ON COLUMN public.objective_columns.ordem IS 'Ordem de exibição da coluna (string para ordenação lexicográfica)';

-- 4.2 Create indexes
CREATE INDEX IF NOT EXISTS idx_objective_columns_user_id ON public.objective_columns(user_id);
CREATE INDEX IF NOT EXISTS idx_objective_columns_ordem ON public.objective_columns(ordem);

-- 4.3 Enable RLS
ALTER TABLE public.objective_columns ENABLE ROW LEVEL SECURITY;

-- 4.4 Create RLS policies
CREATE POLICY "objective_columns_select_own" ON public.objective_columns
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "objective_columns_insert_own" ON public.objective_columns
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "objective_columns_update_own" ON public.objective_columns
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "objective_columns_delete_own" ON public.objective_columns
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "objective_columns_service_role_all" ON public.objective_columns
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- 4.5 Create trigger for updated_at
CREATE TRIGGER update_objective_columns_updated_at
  BEFORE UPDATE ON public.objective_columns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- PART 5: ADD FOREIGN KEY FROM objectives TO objective_columns
-- ============================================================================

-- 5.1 Add foreign key constraint
ALTER TABLE public.objectives
  ADD CONSTRAINT fk_objectives_coluna_id
  FOREIGN KEY (coluna_id)
  REFERENCES public.objective_columns(id)
  ON DELETE SET NULL;

-- 5.2 Add foreign key from objectives to goals (for meta_id)
ALTER TABLE public.objectives
  ADD CONSTRAINT fk_objectives_meta_id
  FOREIGN KEY (meta_id)
  REFERENCES public.goals(id)
  ON DELETE SET NULL;

-- ============================================================================
-- PART 6: SYNC EXISTING AUTH USERS TO PUBLIC.USERS
-- ============================================================================
-- This ensures all authenticated users have a record in the users table

INSERT INTO public.users (id, email, name, avatar_url, total_xp, level, streak_shields, current_streak, longest_streak, created_at, updated_at)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)),
  au.raw_user_meta_data->>'avatar_url',
  0,  -- total_xp
  1,  -- level
  2,  -- streak_shields
  0,  -- current_streak
  0,  -- longest_streak
  au.created_at,
  NOW()
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.users pu WHERE pu.id = au.id
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = COALESCE(EXCLUDED.name, public.users.name),
  updated_at = NOW();

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================
-- Run this to verify the migration:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
-- Expected: focus_sessions, goal_milestones, goals, habit_categories, habit_history, habits,
--           objective_columns, objectives, pending_items, tasks, users
--
-- Verify users synced:
-- SELECT u.id, u.email, u.name FROM public.users u;
-- ============================================================================
