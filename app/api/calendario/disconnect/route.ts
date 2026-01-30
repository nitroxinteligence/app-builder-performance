import { NextResponse } from 'next/server'

import { disconnectRequestSchema } from '@/lib/schemas/calendario'
import { createServerSupabaseClient, createServerSupabaseAdmin } from '@/lib/supabase/server'

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
    const parsed = disconnectRequestSchema.safeParse(body)

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
    const supabaseAdmin = await createServerSupabaseAdmin()

    // Delete imported events from this provider
    const { count: eventsDeleted } = await supabaseAdmin
      .from('events')
      .delete({ count: 'exact' })
      .eq('user_id', user.id)
      .eq('calendario', provider)

    // Delete the connection record
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- calendar_connections table type will be auto-generated via supabase gen types
    const { error: deleteError } = await (supabaseAdmin as any)
      .from('calendar_connections')
      .delete()
      .eq('user_id', user.id)
      .eq('provider', provider)

    if (deleteError) {
      throw new Error(`Failed to delete connection: ${deleteError.message}`)
    }

    return NextResponse.json({
      success: true,
      data: { eventsDeleted: eventsDeleted ?? 0 },
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
