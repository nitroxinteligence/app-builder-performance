import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { createServerSupabaseClient, createServerSupabaseAdmin } from '@/lib/supabase/server'
import { syncCalendarEvents, getActiveConnections } from '@/lib/calendario/sync'
import { logSync, logSyncError } from '@/lib/calendario/resilience'
import type { SyncResult } from '@/types/calendario'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse optional force flag from body
    let force = false
    try {
      const body = await request.json()
      force = body?.force === true
    } catch {
      // No body or invalid JSON — default to force=false (auto-sync)
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

    logSync('All', user.id, `Syncing ${connections.length} connection(s), force=${force}`)

    const results: SyncResult[] = []
    let totalCreated = 0
    let totalUpdated = 0
    let totalDeleted = 0

    for (const connection of connections) {
      try {
        const result = await syncCalendarEvents(supabaseAdmin, connection, user.id, { force })
        results.push(result)
        totalCreated += result.created
        totalUpdated += result.updated
        totalDeleted += result.deleted
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown sync error'
        logSyncError(connection.provider, user.id, `Sync failed: ${errorMessage}`)

        results.push({
          provider: connection.provider,
          created: 0,
          updated: 0,
          deleted: 0,
          errors: [{
            external_event_id: 'sync_failed',
            message: errorMessage,
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
