-- ============================================================================
-- Migration 015: batch_reorder_tasks RPC
-- ============================================================================
-- Replaces N individual HTTP calls for reordering tasks with a single
-- database transaction. All updates succeed or none do (atomicity).
-- ============================================================================

CREATE OR REPLACE FUNCTION public.batch_reorder_tasks(
  p_user_id UUID,
  p_tasks JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  task_item JSONB;
BEGIN
  -- Validate calling user matches p_user_id
  IF p_user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: user mismatch';
  END IF;

  -- Loop through each task and update order/column atomically
  FOR task_item IN SELECT * FROM jsonb_array_elements(p_tasks)
  LOOP
    UPDATE public.tasks
    SET
      ordem = (task_item->>'ordem')::NUMERIC,
      coluna = (task_item->>'coluna')::kanban_column,
      updated_at = NOW()
    WHERE id = (task_item->>'id')::UUID
      AND user_id = p_user_id;
  END LOOP;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.batch_reorder_tasks(UUID, JSONB) TO authenticated;
