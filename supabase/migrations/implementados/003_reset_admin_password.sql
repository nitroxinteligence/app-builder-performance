-- ============================================================================
-- BUILDERS PERFORMANCE - RESET ADMIN PASSWORD
-- ============================================================================
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- A nova senha será exibida como resultado da query
--
-- Data: 2026-01-28
-- ============================================================================

-- Primeiro, gere a nova senha e veja o resultado
WITH new_password AS (
  SELECT encode(gen_random_bytes(12), 'base64') AS senha
),
update_user AS (
  UPDATE auth.users
  SET
    encrypted_password = crypt((SELECT senha FROM new_password), gen_salt('bf')),
    updated_at = NOW()
  WHERE email = 'admin@buildersperformance.com'
  RETURNING id, email
)
SELECT
  u.id AS user_id,
  u.email,
  p.senha AS nova_senha,
  '⚠️ SALVE ESTA SENHA AGORA!' AS aviso
FROM update_user u, new_password p;
