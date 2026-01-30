import { NextResponse } from "next/server"

import { savePartialSession } from "@/app/(protegido)/foco/actions"
import type { FocusPause } from "@/lib/supabase/types"

interface SavePartialRequest {
  sessionId: string
  duracaoReal: number
  pausas: FocusPause[]
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SavePartialRequest

    if (!body.sessionId) {
      return NextResponse.json(
        { success: false, error: "sessionId is required" },
        { status: 400 }
      )
    }

    const result = await savePartialSession({
      sessionId: body.sessionId,
      duracaoReal: body.duracaoReal ?? 0,
      pausas: body.pausas ?? [],
    })

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
