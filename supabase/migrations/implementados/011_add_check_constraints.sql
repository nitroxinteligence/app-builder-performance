-- Migration: 011_add_check_constraints
-- Descrição: Adiciona CHECK constraints de integridade em todas as tabelas
-- relevantes para impedir valores inválidos na origem.
-- Referência: Story TD-2.0, Bloco 2 (DB-H09, DB-M10, DB-M02, DB-NEW-03, DB-NEW-04)
-- Nota: development_objectives não existe no banco live (foi substituída por objectives).

-- ==========================================
-- PASSO 1: Correção de dados inválidos pré-existentes
-- ==========================================

-- Garante que progresso_atual não exceda progresso_total em goals
UPDATE public.goals
SET progresso_atual = LEAST(progresso_atual, progresso_total)
WHERE progresso_atual > progresso_total;

-- Garante progresso_total >= 1 em goals
UPDATE public.goals
SET progresso_total = 1
WHERE progresso_total < 1;

-- Garante progresso_atual >= 0 em goals
UPDATE public.goals
SET progresso_atual = 0
WHERE progresso_atual < 0;

-- Garante XP >= 0 em todas as tabelas relevantes
UPDATE public.tasks SET xp_recompensa = 0 WHERE xp_recompensa < 0;
UPDATE public.goals SET xp_recompensa = 0 WHERE xp_recompensa < 0;

-- Garante total_xp >= 0 e level >= 1 em users
UPDATE public.users SET total_xp = 0 WHERE total_xp < 0;
UPDATE public.users SET level = 1 WHERE level < 1;

-- Correção condicional para objectives (se existir)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'objectives') THEN
    EXECUTE 'UPDATE public.objectives SET progresso_atual = 0 WHERE progresso_atual < 0';
    EXECUTE 'UPDATE public.objectives SET progresso_total = 1 WHERE progresso_total < 1';
  END IF;
END $$;

-- ==========================================
-- PASSO 2: CHECK constraints - Goals
-- ==========================================

DO $$ BEGIN
  ALTER TABLE public.goals
    ADD CONSTRAINT chk_goals_progresso_atual CHECK (progresso_atual >= 0);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE public.goals
    ADD CONSTRAINT chk_goals_progresso_total CHECK (progresso_total >= 1);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE public.goals
    ADD CONSTRAINT chk_goals_xp_recompensa CHECK (xp_recompensa >= 0);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ==========================================
-- PASSO 3: CHECK constraints - Objectives (condicional)
-- ==========================================

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'objectives') THEN
    BEGIN
      ALTER TABLE public.objectives
        ADD CONSTRAINT chk_objectives_progresso_atual CHECK (progresso_atual >= 0);
    EXCEPTION WHEN duplicate_object THEN null;
    END;
    BEGIN
      ALTER TABLE public.objectives
        ADD CONSTRAINT chk_objectives_progresso_total CHECK (progresso_total >= 1);
    EXCEPTION WHEN duplicate_object THEN null;
    END;
  END IF;
END $$;

-- ==========================================
-- PASSO 4: CHECK constraints - Tasks
-- ==========================================

DO $$ BEGIN
  ALTER TABLE public.tasks
    ADD CONSTRAINT chk_tasks_xp_recompensa CHECK (xp_recompensa >= 0);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ==========================================
-- PASSO 5: CHECK constraints - Users
-- ==========================================

DO $$ BEGIN
  ALTER TABLE public.users
    ADD CONSTRAINT chk_users_total_xp CHECK (total_xp >= 0);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE public.users
    ADD CONSTRAINT chk_users_level CHECK (level >= 1);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ==========================================
-- PASSO 6: CHECK constraints - Events
-- ==========================================

DO $$ BEGIN
  ALTER TABLE public.events
    ADD CONSTRAINT chk_events_horario CHECK (horario_fim > horario_inicio);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ==========================================
-- VERIFICAÇÃO (executar após migration)
-- ==========================================
-- SELECT conname, contype, conrelid::regclass
-- FROM pg_constraint
-- WHERE conname LIKE 'chk_%'
-- ORDER BY conrelid::regclass, conname;
