-- ============================================================================
-- Migration 017: Audit Trail
-- ============================================================================
-- Creates audit_log table and trigger function to automatically log changes
-- to sensitive tables (users XP/level, focus_sessions, habits streaks).
-- ============================================================================

-- 1. Create audit_log table
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data JSONB,
  new_data JSONB,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- 3. RLS: users can only read their own audit records
CREATE POLICY "audit_log_select_own" ON public.audit_log
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- 4. RLS: only system (triggers) can insert — no direct user INSERT
CREATE POLICY "audit_log_insert_system" ON public.audit_log
  FOR INSERT TO authenticated
  WITH CHECK (false);

-- 5. Index for querying by user and table
CREATE INDEX IF NOT EXISTS idx_audit_log_user_table
  ON public.audit_log (user_id, table_name, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_log_record
  ON public.audit_log (record_id, created_at DESC);

-- 6. Trigger function
CREATE OR REPLACE FUNCTION public.log_audit_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_record_id UUID;
BEGIN
  -- Determine user_id from the record
  IF TG_OP = 'DELETE' THEN
    v_user_id := COALESCE(OLD.user_id, auth.uid());
    v_record_id := OLD.id;
  ELSE
    v_user_id := COALESCE(NEW.user_id, auth.uid());
    v_record_id := NEW.id;
  END IF;

  -- For users table, the id IS the user_id
  IF TG_TABLE_NAME = 'users' THEN
    IF TG_OP = 'DELETE' THEN
      v_user_id := OLD.id;
    ELSE
      v_user_id := NEW.id;
    END IF;
  END IF;

  INSERT INTO public.audit_log (table_name, record_id, action, old_data, new_data, user_id)
  VALUES (
    TG_TABLE_NAME,
    v_record_id,
    TG_OP,
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
    v_user_id
  );

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

-- 7. Apply triggers to sensitive tables

-- users: track XP, level changes
CREATE TRIGGER audit_users_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_change();

-- focus_sessions: track session completion/cancellation
CREATE TRIGGER audit_focus_sessions_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.focus_sessions
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_change();

-- habits: track streak changes
CREATE TRIGGER audit_habits_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.habits
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_change();
