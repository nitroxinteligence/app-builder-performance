-- Migration: 009_revoke_handle_new_user
-- Descrição: Revoga acesso EXECUTE à função handle_new_user() para roles públicas.
-- A função continua sendo chamada internamente pelo trigger on_auth_user_created
-- (SECURITY DEFINER), mas não pode ser invocada diretamente via RPC.

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;

-- ==========================================
-- VERIFICAÇÃO PÓS-DEPLOY
-- Execute as queries abaixo para confirmar que o REVOKE foi aplicado.
-- Todas devem retornar FALSE.
-- ==========================================
--
-- SELECT has_function_privilege('anon', 'public.handle_new_user()', 'EXECUTE');
-- SELECT has_function_privilege('authenticated', 'public.handle_new_user()', 'EXECUTE');
-- SELECT has_function_privilege('public', 'public.handle_new_user()', 'EXECUTE');
--
-- SMOKE TEST: Signup/login deve continuar funcionando normalmente,
-- pois o trigger on_auth_user_created usa SECURITY DEFINER (executa como owner).
-- ==========================================
