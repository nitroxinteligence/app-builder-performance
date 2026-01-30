-- Migration: 014_add_missing_check_constraints
-- Descrição: Adiciona CHECK constraints faltantes identificadas na Story TD-2.0.
-- Referência: Story TD-2.0, Bloco 2 (DB-M02, DB-M10)
-- Nota: Complementa migration 011 que cobriu goals, objectives, tasks, users, events.

-- ==========================================
-- PASSO 1: Correção de dados inválidos pré-existentes
-- ==========================================

-- goals.status pode ter valores inesperados após conversão de ENUM para TEXT (migration 005)
UPDATE public.goals
SET status = 'nao_iniciada'
WHERE status NOT IN ('nao_iniciada', 'em_andamento', 'pausada', 'atrasada', 'concluida');

-- habits.xp_por_check negativo
UPDATE public.habits SET xp_por_check = 0 WHERE xp_por_check < 0;

-- lessons.xp_recompensa negativo (tabela do courses schema - migration 008)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'lessons') THEN
    EXECUTE 'UPDATE public.lessons SET xp_recompensa = 0 WHERE xp_recompensa < 0';
  END IF;
END $$;

-- development_objectives.xp_recompensa negativo
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'development_objectives') THEN
    EXECUTE 'UPDATE public.development_objectives SET xp_recompensa = 0 WHERE xp_recompensa < 0';
  END IF;
END $$;

-- ==========================================
-- PASSO 2: CHECK constraint - goals.status (TEXT sem CHECK após migration 005)
-- ==========================================

DO $$ BEGIN
  ALTER TABLE public.goals
    ADD CONSTRAINT chk_goals_status CHECK (
      status IN ('nao_iniciada', 'em_andamento', 'pausada', 'atrasada', 'concluida')
    );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ==========================================
-- PASSO 3: CHECK constraint - habits.xp_por_check
-- ==========================================

DO $$ BEGIN
  ALTER TABLE public.habits
    ADD CONSTRAINT chk_habits_xp_por_check CHECK (xp_por_check >= 0);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ==========================================
-- PASSO 4: CHECK constraint - lessons.xp_recompensa (condicional)
-- ==========================================

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'lessons') THEN
    BEGIN
      ALTER TABLE public.lessons
        ADD CONSTRAINT chk_lessons_xp_recompensa CHECK (xp_recompensa >= 0);
    EXCEPTION WHEN duplicate_object THEN null;
    END;
  END IF;
END $$;

-- ==========================================
-- PASSO 5: CHECK constraint - development_objectives.xp_recompensa (condicional)
-- ==========================================

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'development_objectives') THEN
    BEGIN
      ALTER TABLE public.development_objectives
        ADD CONSTRAINT chk_dev_objectives_xp_recompensa CHECK (xp_recompensa >= 0);
    EXCEPTION WHEN duplicate_object THEN null;
    END;
  END IF;
END $$;

-- ==========================================
-- VERIFICAÇÃO (executar após migration)
-- ==========================================
-- SELECT conname, contype, conrelid::regclass
-- FROM pg_constraint
-- WHERE conname LIKE 'chk_%'
-- ORDER BY conrelid::regclass, conname;
