-- Migration: 012_add_composite_indexes
-- Descrição: Adiciona index composto para otimizar queries de focus_sessions.
-- Referência: Story TD-2.0, Bloco 3 (DB-M03)

-- Index composto para queries de focus_sessions filtradas por user + status + started_at
-- Usado pelas funções get_focus_stats e cancel_active_sessions
CREATE INDEX IF NOT EXISTS idx_focus_sessions_user_status_started
  ON public.focus_sessions(user_id, status, started_at);

-- ==========================================
-- VERIFICAÇÃO (executar após migration)
-- ==========================================
-- EXPLAIN ANALYZE
-- SELECT * FROM public.focus_sessions
-- WHERE user_id = 'some-uuid' AND status = 'completed'
-- ORDER BY started_at DESC;
