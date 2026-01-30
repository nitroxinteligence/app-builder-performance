import { NextResponse } from 'next/server'

import { generateStateToken } from '@/lib/calendario/auth-state'
import { connectRequestSchema } from '@/lib/schemas/calendario'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body: unknown = await request.json()
    const parsed = connectRequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request body',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const { provider } = parsed.data
    const state = generateStateToken(user.id, provider)

    return NextResponse.json({
      success: true,
      data: { provider, state },
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
