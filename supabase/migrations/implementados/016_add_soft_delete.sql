-- ============================================================================
-- Migration 016: Soft Delete
-- ============================================================================
-- Adds deleted_at column to critical tables, updates RLS SELECT policies
-- to automatically filter soft-deleted records, and adds partial indexes
-- for query performance on non-deleted rows.
-- ============================================================================

-- 1. Add deleted_at column to critical tables
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.habits ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.objectives ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.focus_sessions ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- 2. Drop existing SELECT policies and recreate with deleted_at filter
-- This ensures soft-deleted records are automatically excluded from all queries.

-- tasks
DROP POLICY IF EXISTS "tasks_select_own" ON public.tasks;
CREATE POLICY "tasks_select_own" ON public.tasks
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id AND deleted_at IS NULL);

-- habits
DROP POLICY IF EXISTS "habits_select_own" ON public.habits;
CREATE POLICY "habits_select_own" ON public.habits
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id AND deleted_at IS NULL);

-- goals
DROP POLICY IF EXISTS "goals_select_own" ON public.goals;
CREATE POLICY "goals_select_own" ON public.goals
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id AND deleted_at IS NULL);

-- objectives (policy was renamed from dev_objectives_select_own to objectives_select_own in migration 004)
DROP POLICY IF EXISTS "objectives_select_own" ON public.objectives;
DROP POLICY IF EXISTS "dev_objectives_select_own" ON public.objectives;
DO $$ BEGIN
  CREATE POLICY "objectives_select_own" ON public.objectives
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id AND deleted_at IS NULL);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- focus_sessions
DROP POLICY IF EXISTS "focus_sessions_select_own" ON public.focus_sessions;
CREATE POLICY "focus_sessions_select_own" ON public.focus_sessions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id AND deleted_at IS NULL);

-- 3. Partial indexes for query performance on non-deleted rows
CREATE INDEX IF NOT EXISTS idx_tasks_active
  ON public.tasks (user_id, ordem)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_habits_active
  ON public.habits (user_id)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_goals_active
  ON public.goals (user_id)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_objectives_active
  ON public.objectives (user_id)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_focus_sessions_active
  ON public.focus_sessions (user_id, started_at)
  WHERE deleted_at IS NULL;
