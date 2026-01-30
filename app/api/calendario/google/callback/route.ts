import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { validateStateToken } from '@/lib/calendario/auth-state'
import { exchangeGoogleCode, getGoogleUserEmail } from '@/lib/calendario/google'
import { createServerSupabaseAdmin } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'

type CalendarConnectionInsert = Database['public']['Tables']['calendar_connections']['Insert']

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const errorParam = searchParams.get('error')

  if (errorParam) {
    return NextResponse.redirect(
      new URL('/agenda?error=google_auth_denied', request.url)
    )
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL('/agenda?error=google_auth_failed', request.url)
    )
  }

  try {
    const { userId } = validateStateToken(state)

    const tokens = await exchangeGoogleCode(code)

    const email = await getGoogleUserEmail(tokens.access_token)

    const supabaseAdmin = await createServerSupabaseAdmin()

    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString()

    const connectionData: CalendarConnectionInsert = {
      user_id: userId,
      provider: 'Google',
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token ?? '',
      token_expires_at: expiresAt,
      scopes: tokens.scope.split(' '),
      external_email: email,
      is_active: true,
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- calendar_connections table type will be auto-generated via supabase gen types
    const { error: upsertError } = await (supabaseAdmin as any)
      .from('calendar_connections')
      .upsert(connectionData, { onConflict: 'user_id,provider' })

    if (upsertError) {
      throw new Error(`Failed to store connection: ${upsertError.message}`)
    }

    return NextResponse.redirect(
      new URL('/agenda?connected=google', request.url)
    )
  } catch {
    return NextResponse.redirect(
      new URL('/agenda?error=google_auth_failed', request.url)
    )
  }
}
