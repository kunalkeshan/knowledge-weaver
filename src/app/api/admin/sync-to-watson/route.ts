import { auth } from '@/lib/auth'
import { isWatsonConfigured } from '@/lib/config'
import { runSyncToWatson } from '@/lib/sync-to-watson'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!isWatsonConfigured()) {
    return NextResponse.json({ error: 'Watson not configured' }, { status: 503 })
  }

  try {
    const result = await runSyncToWatson()
    return NextResponse.json(result)
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    console.error('[sync-to-watson]', e)
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
