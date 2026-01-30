-- ============================================================================
-- BUILDERS PERFORMANCE - CALENDAR CONNECTIONS MIGRATION (Idempotent)
-- ============================================================================
-- Tabela para armazenar tokens OAuth de calendarios externos (Google/Outlook)
-- e campo external_event_id na tabela events para mapeamento de eventos importados.
--
-- Data: 2026-01-30
-- Story: CI-1.1
-- Versao: 1.0.0 (idempotent)
-- ============================================================================

-- ============================================================================
-- PART 1: CREATE TABLE calendar_connections (idempotent)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.calendar_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('Google', 'Outlook')),
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ NOT NULL,
  scopes TEXT[] NOT NULL DEFAULT '{}',
  external_email TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_sync_at TIMESTAMPTZ,
  sync_token TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.calendar_connections IS 'Conexoes OAuth com calendarios externos (Google Calendar, Outlook)';
COMMENT ON COLUMN public.calendar_connections.provider IS 'Provedor do calendario (Google ou Outlook)';
COMMENT ON COLUMN public.calendar_connections.access_token IS 'Token de acesso OAuth';
COMMENT ON COLUMN public.calendar_connections.refresh_token IS 'Token de refresh OAuth';
COMMENT ON COLUMN public.calendar_connections.token_expires_at IS 'Data/hora de expiracao do access token';
COMMENT ON COLUMN public.calendar_connections.scopes IS 'Scopes autorizados pelo usuario';
COMMENT ON COLUMN public.calendar_connections.external_email IS 'Email da conta externa conectada';
COMMENT ON COLUMN public.calendar_connections.is_active IS 'Se a conexao esta ativa';
COMMENT ON COLUMN public.calendar_connections.last_sync_at IS 'Ultima sincronizacao realizada';
COMMENT ON COLUMN public.calendar_connections.sync_token IS 'Token de sync incremental do provider';

-- ============================================================================
-- PART 2: UNIQUE CONSTRAINT (idempotent)
-- ============================================================================

DO $$ BEGIN
  ALTER TABLE public.calendar_connections
    ADD CONSTRAINT calendar_connections_user_provider_unique UNIQUE (user_id, provider);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- PART 3: CREATE INDEXES (idempotent)
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_calendar_connections_user_id
  ON public.calendar_connections(user_id);

CREATE INDEX IF NOT EXISTS idx_calendar_connections_provider
  ON public.calendar_connections(user_id, provider);

-- ============================================================================
-- PART 4: ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.calendar_connections ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PART 5: CREATE RLS POLICIES (idempotent)
-- ============================================================================

DO $$ BEGIN
  CREATE POLICY "calendar_connections_select_own"
    ON public.calendar_connections
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "calendar_connections_insert_own"
    ON public.calendar_connections
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "calendar_connections_update_own"
    ON public.calendar_connections
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "calendar_connections_delete_own"
    ON public.calendar_connections
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "calendar_connections_service_role_all"
    ON public.calendar_connections
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- PART 6: CREATE TRIGGER (idempotent)
-- ============================================================================

DROP TRIGGER IF EXISTS update_calendar_connections_updated_at ON public.calendar_connections;
CREATE TRIGGER update_calendar_connections_updated_at
  BEFORE UPDATE ON public.calendar_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- PART 7: ALTER TABLE events — ADD external_event_id (idempotent)
-- ============================================================================

DO $$ BEGIN
  ALTER TABLE public.events ADD COLUMN external_event_id TEXT;
EXCEPTION
  WHEN duplicate_column THEN null;
END $$;

-- ============================================================================
-- PART 8: UNIQUE INDEX for external events (idempotent)
-- ============================================================================

CREATE UNIQUE INDEX IF NOT EXISTS idx_events_external_id
  ON public.events(user_id, external_event_id)
  WHERE external_event_id IS NOT NULL;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- SELECT * FROM public.calendar_connections WHERE user_id = 'test-uuid';
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'external_event_id';
