'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

// Singleton browser client — single source of truth for all hooks and auth
// TODO(TD-2.0): Add Database generic after type regeneration
let instance: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient {
  if (!instance) {
    instance = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return instance
}

export const supabase = getSupabaseClient()
