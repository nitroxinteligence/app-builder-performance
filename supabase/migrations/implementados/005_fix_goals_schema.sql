-- ============================================================================
-- MIGRATION: Fix Goals Table Schema
-- ============================================================================
-- A tabela goals está faltando colunas que o TypeScript espera.
-- Este script adiciona as colunas faltantes.
--
-- Data: 2026-01-28
-- ============================================================================

-- ============================================================================
-- PART 1: ADD MISSING COLUMNS TO GOALS TABLE
-- ============================================================================

-- Add categoria column
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS categoria TEXT;

-- Add cor column with default
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS cor TEXT NOT NULL DEFAULT '#6366f1';

-- Add icone column with default
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS icone TEXT NOT NULL DEFAULT 'target';

-- Add tags array
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Add ano column (default to current year)
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS ano INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM NOW())::INTEGER;

-- Add trimestre column
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS trimestre INTEGER;

-- Add data_inicio column
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS data_inicio TIMESTAMPTZ;

-- Add data_fim column
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS data_fim TIMESTAMPTZ;

-- Add prioridade column
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS prioridade TEXT NOT NULL DEFAULT 'media';

-- Add visibilidade column
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS visibilidade TEXT NOT NULL DEFAULT 'privada';

-- Add notas_progresso column
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS notas_progresso TEXT;

-- Add ordem column (critical - used for ordering)
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS ordem TEXT NOT NULL DEFAULT '0';

-- ============================================================================
-- PART 2: CREATE INDEX FOR ORDEM
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_goals_ordem ON public.goals(ordem);
CREATE INDEX IF NOT EXISTS idx_goals_ano ON public.goals(ano);

-- ============================================================================
-- PART 3: UPDATE STATUS ENUM (if needed)
-- ============================================================================
-- The TypeScript expects: 'nao_iniciada', 'em_andamento', 'pausada', 'atrasada', 'concluida'
-- The database has: 'a_fazer', 'em_andamento', 'concluido'
--
-- We need to alter the enum or use TEXT instead. Using TEXT is safer.

-- First, change the column to TEXT temporarily
ALTER TABLE public.goals ALTER COLUMN status TYPE TEXT;

-- Update existing values to match TypeScript
UPDATE public.goals SET status = 'nao_iniciada' WHERE status = 'a_fazer';
UPDATE public.goals SET status = 'concluida' WHERE status = 'concluido';

-- Set default
ALTER TABLE public.goals ALTER COLUMN status SET DEFAULT 'nao_iniciada';

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- Run this to verify:
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'goals' ORDER BY ordinal_position;
-- ============================================================================
