import { NextResponse } from 'next/server'

import { createServerSupabaseClient, createServerSupabaseAdmin } from '@/lib/supabase/server'
import { syncCalendarEvents, getActiveConnections } from '@/lib/calendario/sync'
import type { SyncResult } from '@/types/calendario'

export async function POST() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const supabaseAdmin = await createServerSupabaseAdmin()
    const connections = await getActiveConnections(supabaseAdmin, user.id)

    if (connections.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          results: [],
          totalCreated: 0,
          totalUpdated: 0,
          totalDeleted: 0,
        },
      })
    }

    const results: SyncResult[] = []
    let totalCreated = 0
    let totalUpdated = 0
    let totalDeleted = 0

    for (const connection of connections) {
      try {
        const result = await syncCalendarEvents(supabaseAdmin, connection, user.id)
        results.push(result)
        totalCreated += result.created
        totalUpdated += result.updated
        totalDeleted += result.deleted
      } catch (error) {
        // Task 11: Minimal error handling — don't break other connections
        results.push({
          provider: connection.provider,
          created: 0,
          updated: 0,
          deleted: 0,
          errors: [{
            external_event_id: 'sync_failed',
            message: error instanceof Error ? error.message : 'Unknown sync error',
          }],
          sync_token: null,
        })
      }
    }

    return NextResponse.json({
      success: true,
      data: { results, totalCreated, totalUpdated, totalDeleted },
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
