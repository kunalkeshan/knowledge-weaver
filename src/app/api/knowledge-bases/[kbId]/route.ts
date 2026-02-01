import { auth } from '@/lib/auth'
import { isWatsonConfigured } from '@/lib/config'
import { deleteWatsonKnowledgeBase, getWatsonKnowledgeBaseWithDocuments } from '@/lib/watson'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ kbId: string }> }
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
  const { kbId } = await params
  try {
    const knowledgeBase = await getWatsonKnowledgeBaseWithDocuments(kbId)
    if (!knowledgeBase) {
      return NextResponse.json({ error: 'Knowledge base not found' }, { status: 404 })
    }
    return NextResponse.json({ knowledgeBase })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to get knowledge base'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ kbId: string }> }
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
  const { kbId } = await params
  try {
    await deleteWatsonKnowledgeBase(kbId)
    return NextResponse.json({ success: true })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to delete knowledge base'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
