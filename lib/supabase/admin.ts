import 'server-only'

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Creates a Supabase admin client with the service role key.
 * Bypasses RLS — use only in server actions that verify user identity
 * via getCurrentUserId() before executing queries.
 */
export function createAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Missing Supabase environment variables for admin client')
  }

  return createClient(url, key)
}
