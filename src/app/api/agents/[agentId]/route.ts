import { auth } from '@/lib/auth'
import { isWatsonConfigured } from '@/lib/config'
import { getWatsonAgent } from '@/lib/watson'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ agentId: string }> }
) {
  const session = await auth.api.getSession({
    headers: request.headers,
  })
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { agentId } = await params
  if (!agentId) {
    return NextResponse.json({ error: 'Missing agentId' }, { status: 400 })
  }
  if (!isWatsonConfigured()) {
    return NextResponse.json({ error: 'Watson not configured' }, { status: 503 })
  }
  try {
    const agent = await getWatsonAgent(agentId)
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }
    return NextResponse.json(agent)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to get agent'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
