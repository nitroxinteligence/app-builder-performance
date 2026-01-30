-- ============================================================================
-- MIGRATION: Fix Habits Table Schema
-- ============================================================================
-- A tabela habits tem colunas faltando e nomes diferentes do TypeScript.
--
-- Diferenças:
-- - category_id → categoria_id (renomear)
-- - ordem INTEGER → ordem TEXT (alterar tipo)
-- - Faltando: icone, cor, dificuldade, objetivo_id, total_conclusoes
-- ============================================================================

-- ============================================================================
-- PART 0: DROP VIEWS THAT DEPEND ON COLUMNS WE'RE CHANGING
-- ============================================================================

DROP VIEW IF EXISTS public.habits_today CASCADE;

-- ============================================================================
-- PART 1: ADD MISSING COLUMNS
-- ============================================================================

-- Add icone column
ALTER TABLE public.habits ADD COLUMN IF NOT EXISTS icone TEXT NOT NULL DEFAULT 'check';

-- Add cor column
ALTER TABLE public.habits ADD COLUMN IF NOT EXISTS cor TEXT;

-- Add dificuldade column
ALTER TABLE public.habits ADD COLUMN IF NOT EXISTS dificuldade TEXT NOT NULL DEFAULT 'medio';

-- Add objetivo_id column (reference to objectives)
ALTER TABLE public.habits ADD COLUMN IF NOT EXISTS objetivo_id UUID;

-- Add total_conclusoes column
ALTER TABLE public.habits ADD COLUMN IF NOT EXISTS total_conclusoes INTEGER NOT NULL DEFAULT 0;

-- ============================================================================
-- PART 2: RENAME COLUMNS
-- ============================================================================

-- Rename category_id to categoria_id (if category_id exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'habits' AND column_name = 'category_id'
  ) THEN
    ALTER TABLE public.habits RENAME COLUMN category_id TO categoria_id;
  END IF;
END $$;

-- ============================================================================
-- PART 3: CHANGE ORDEM TYPE FROM INTEGER TO TEXT
-- ============================================================================

-- Change ordem from INTEGER to TEXT
ALTER TABLE public.habits ALTER COLUMN ordem TYPE TEXT USING ordem::TEXT;

-- Set default for ordem
ALTER TABLE public.habits ALTER COLUMN ordem SET DEFAULT '0';

-- ============================================================================
-- PART 4: ADD INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_habits_categoria_id ON public.habits(categoria_id);
CREATE INDEX IF NOT EXISTS idx_habits_objetivo_id ON public.habits(objetivo_id);
CREATE INDEX IF NOT EXISTS idx_habits_dificuldade ON public.habits(dificuldade);

-- ============================================================================
-- PART 5: FIX HABIT_CATEGORIES TABLE
-- ============================================================================

-- Rename titulo to nome (if titulo exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'habit_categories' AND column_name = 'titulo'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'habit_categories' AND column_name = 'nome'
  ) THEN
    ALTER TABLE public.habit_categories RENAME COLUMN titulo TO nome;
  END IF;
END $$;

-- Add descricao column if not exists
ALTER TABLE public.habit_categories ADD COLUMN IF NOT EXISTS descricao TEXT;

-- Change ordem from INTEGER to TEXT
ALTER TABLE public.habit_categories ALTER COLUMN ordem TYPE TEXT USING ordem::TEXT;
ALTER TABLE public.habit_categories ALTER COLUMN ordem SET DEFAULT '0';

-- ============================================================================
-- PART 6: RECREATE HABITS_TODAY VIEW
-- ============================================================================

CREATE OR REPLACE VIEW public.habits_today AS
SELECT
  h.id, h.user_id, h.categoria_id, h.titulo, h.descricao, h.frequencia,
  h.dias_semana, h.icone, h.cor, h.dificuldade, h.streak_atual, h.maior_streak, h.ativo, h.ordem,
  hc.nome as category_nome, hc.icone as category_icone, hc.cor as category_cor,
  CASE WHEN hh.id IS NOT NULL THEN true ELSE false END as feito_hoje
FROM public.habits h
LEFT JOIN public.habit_categories hc ON h.categoria_id = hc.id
LEFT JOIN public.habit_history hh ON h.id = hh.habito_id AND hh.data = CURRENT_DATE
WHERE h.ativo = true;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'habits' ORDER BY ordinal_position;
--
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'habit_categories' ORDER BY ordinal_position;
-- ============================================================================
