-- ============================================================
-- Migration 018: Create notifications table
-- ============================================================

-- Enum for notification type
DO $$ BEGIN
  CREATE TYPE notification_type AS ENUM (
    'sistema',
    'conquista',
    'lembrete',
    'tarefa',
    'habito',
    'foco',
    'curso'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo      TEXT NOT NULL,
  mensagem    TEXT NOT NULL,
  tipo        notification_type NOT NULL DEFAULT 'sistema',
  lida        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id
  ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON notifications(user_id, lida)
  WHERE lida = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_created
  ON notifications(created_at DESC);

-- RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);

-- Storage bucket for avatars (if not exists)
-- Note: Run this via Supabase Dashboard or supabase CLI:
-- supabase storage create avatars --public
