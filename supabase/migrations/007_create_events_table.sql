-- ============================================================================
-- BUILDERS PERFORMANCE - EVENTS TABLE MIGRATION (Idempotent)
-- ============================================================================
-- Tabela para eventos da agenda (página /agenda)
--
-- Data: 2026-01-28
-- Versão: 1.1.0 (idempotent)
-- ============================================================================

-- ============================================================================
-- PART 1: CREATE ENUMS (idempotent)
-- ============================================================================

DO $$ BEGIN
  CREATE TYPE public.event_status AS ENUM ('confirmado', 'pendente', 'foco');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.calendar_integration AS ENUM ('Manual', 'Google', 'Outlook');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- PART 2: CREATE TABLE (idempotent)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  data DATE NOT NULL,
  horario_inicio TIME NOT NULL,
  horario_fim TIME NOT NULL,
  categoria TEXT NOT NULL DEFAULT 'Reunião',
  local TEXT,
  status public.event_status NOT NULL DEFAULT 'confirmado',
  calendario public.calendar_integration NOT NULL DEFAULT 'Manual',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.events IS 'Eventos da agenda do Builders Performance';
COMMENT ON COLUMN public.events.data IS 'Data do evento (YYYY-MM-DD)';
COMMENT ON COLUMN public.events.horario_inicio IS 'Horário de início (HH:MM)';
COMMENT ON COLUMN public.events.horario_fim IS 'Horário de fim (HH:MM)';
COMMENT ON COLUMN public.events.categoria IS 'Categoria do evento (Reunião, Bloco de foco, Aula / Mentoria, Pessoal)';
COMMENT ON COLUMN public.events.calendario IS 'Fonte da integração do calendário';

-- ============================================================================
-- PART 3: CREATE INDEXES (idempotent)
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_events_user_id ON public.events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_data ON public.events(data);
CREATE INDEX IF NOT EXISTS idx_events_user_data ON public.events(user_id, data);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);

-- ============================================================================
-- PART 4: ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PART 5: CREATE RLS POLICIES (idempotent)
-- ============================================================================

DO $$ BEGIN
  CREATE POLICY "events_select_own" ON public.events FOR SELECT TO authenticated USING (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "events_insert_own" ON public.events FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "events_update_own" ON public.events FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "events_delete_own" ON public.events FOR DELETE TO authenticated USING (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "events_service_role_all" ON public.events FOR ALL TO service_role USING (true) WITH CHECK (true);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- PART 6: CREATE TRIGGER (idempotent)
-- ============================================================================

DROP TRIGGER IF EXISTS update_events_updated_at ON public.events;
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- PART 7: SEED DATA (Development only - inserts only if mock user exists)
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.users WHERE id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID) THEN
    INSERT INTO public.events (id, user_id, titulo, descricao, data, horario_inicio, horario_fim, categoria, local, status, calendario)
    VALUES
      ('e0011111-1111-4111-8111-111111111111'::UUID, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID, 'Reunião de alinhamento', 'Sprint e prioridades da semana.', CURRENT_DATE, '09:00', '09:45', 'Reunião', 'Google Meet', 'confirmado', 'Google'),
      ('e0022222-2222-4222-8222-222222222222'::UUID, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID, 'Deep work', 'Bloco de foco para entregas principais.', CURRENT_DATE, '10:00', '12:00', 'Bloco de foco', 'Sala silenciosa', 'foco', 'Manual'),
      ('e0033333-3333-4333-8333-333333333333'::UUID, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID, 'Call com cliente', 'Revisão do dashboard e próximos passos.', CURRENT_DATE, '15:30', '16:15', 'Reunião', 'Zoom', 'confirmado', 'Outlook'),
      ('e0044444-4444-4444-8444-444444444444'::UUID, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID, 'Mentoria Builder', 'Plano individual e hábitos da semana.', CURRENT_DATE + INTERVAL '1 day', '11:00', '11:40', 'Aula / Mentoria', 'Google Meet', 'pendente', 'Google'),
      ('e0055555-5555-4555-8555-555555555555'::UUID, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID, 'Treino funcional', 'Cardio + mobilidade.', CURRENT_DATE + INTERVAL '1 day', '18:30', '19:20', 'Pessoal', 'Academia', 'confirmado', 'Manual')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================
-- SELECT * FROM public.events WHERE user_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
