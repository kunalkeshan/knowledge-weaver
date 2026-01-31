import { auth } from '@/lib/auth'
import { isWatsonConfigured } from '@/lib/config'
import { listWatsonAgents } from '@/lib/watson'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  })
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!isWatsonConfigured()) {
    return NextResponse.json({ error: 'Watson not configured', agents: [] }, { status: 200 })
  }
  try {
    const agents = await listWatsonAgents()
    return NextResponse.json({ agents })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to list agents'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
