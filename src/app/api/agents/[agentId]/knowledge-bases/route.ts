import { auth } from '@/lib/auth'
import { isWatsonConfigured } from '@/lib/config'
import { getWatsonAgentFull, getWatsonKnowledgeBaseWithDocuments, updateWatsonAgent } from '@/lib/watson'
import type { WatsonKnowledgeBase } from '@/types/watson'
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
  if (!isWatsonConfigured()) {
    return NextResponse.json({ error: 'Watson not configured', knowledgeBases: [] }, { status: 200 })
  }
  const { agentId } = await params
  try {
    const agent = await getWatsonAgentFull(agentId)
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    // Fetch details for each linked knowledge base (with documents from /status)
    const knowledgeBases: WatsonKnowledgeBase[] = []
    for (const kbId of agent.knowledge_base) {
      const kb = await getWatsonKnowledgeBaseWithDocuments(kbId)
      if (kb) {
        knowledgeBases.push(kb)
      }
    }

    return NextResponse.json({ knowledgeBases, knowledgeBaseIds: agent.knowledge_base })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to get agent knowledge bases'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ agentId: string }> }
) {
  const session = await auth.api.getSession({
    headers: request.headers,
  })
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!isWatsonConfigured()) {
    return NextResponse.json({ error: 'Watson not configured' }, { status: 400 })
  }
  const { agentId } = await params
  let body: { action?: string; knowledgeBaseId?: string } = {}
  try {
    body = await request.json()
    const action = body.action as 'link' | 'unlink'
    const kbId = body.knowledgeBaseId as string

    if (!action || !kbId) {
      return NextResponse.json({ error: 'Action and knowledgeBaseId are required' }, { status: 400 })
    }

    const agent = await getWatsonAgentFull(agentId)
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    let newKnowledgeBase: string[]
    if (action === 'link') {
      if (agent.knowledge_base.includes(kbId)) {
        return NextResponse.json({ error: 'Knowledge base already linked' }, { status: 400 })
      }
      newKnowledgeBase = [...agent.knowledge_base, kbId]
    } else {
      newKnowledgeBase = agent.knowledge_base.filter((id) => id !== kbId)
    }

    console.log('[API agents/knowledge-bases PATCH] Link step: agentId=%s, action=%s, kbId=%s', agentId, body.action, kbId)
    const updatedAgent = await updateWatsonAgent(agentId, { knowledge_base: newKnowledgeBase })
    console.log('[API agents/knowledge-bases PATCH] Link success: agentId=%s', agentId)
    return NextResponse.json({ agent: updatedAgent, knowledgeBaseIds: updatedAgent.knowledge_base })
  } catch (e) {
    console.error('[API agents/knowledge-bases PATCH] Link failed:', {
      agentId,
      action: body?.action,
      knowledgeBaseId: body?.knowledgeBaseId,
      errorName: e instanceof Error ? e.name : 'unknown',
      message: e instanceof Error ? e.message : String(e),
      stack: e instanceof Error ? e.stack : undefined,
      fullError: e,
    })
    const message = e instanceof Error ? e.message : 'Failed to update agent knowledge bases'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
