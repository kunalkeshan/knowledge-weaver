import { auth } from '@/lib/auth'
import { isWatsonConfigured } from '@/lib/config'
import { triageMessage } from '@/lib/triage'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!isWatsonConfigured()) {
    return NextResponse.json({ error: 'Watson not configured' }, { status: 503 })
  }

  let body: { message?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const message = typeof body.message === 'string' ? body.message.trim() : ''
  if (!message) {
    return NextResponse.json({ error: 'message is required' }, { status: 400 })
  }

  try {
    const result = await triageMessage(message)
    if (!result) {
      return NextResponse.json({ error: 'No agent available' }, { status: 503 })
    }
    return NextResponse.json(result)
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[triage]', e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
