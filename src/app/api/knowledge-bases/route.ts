import { auth } from '@/lib/auth'
import { isWatsonConfigured } from '@/lib/config'
import { createWatsonKnowledgeBase, listWatsonKnowledgeBases } from '@/lib/watson'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  })
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!isWatsonConfigured()) {
    return NextResponse.json({ error: 'Watson not configured', knowledgeBases: [] }, { status: 200 })
  }
  try {
    const knowledgeBases = await listWatsonKnowledgeBases()
    return NextResponse.json({ knowledgeBases })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to list knowledge bases'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  })
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!isWatsonConfigured()) {
    return NextResponse.json({ error: 'Watson not configured' }, { status: 400 })
  }
  try {
    const formData = await request.formData()
    const name = formData.get('name') as string
    const description = formData.get('description') as string | null
    const files = formData.getAll('files') as File[]

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }
    if (files.length === 0) {
      return NextResponse.json({ error: 'At least one file is required' }, { status: 400 })
    }

    // Validate file constraints
    const MAX_FILES = 20
    const MAX_TOTAL_SIZE = 30 * 1024 * 1024 // 30MB
    if (files.length > MAX_FILES) {
      return NextResponse.json({ error: `Maximum ${MAX_FILES} files allowed` }, { status: 400 })
    }
    const totalSize = files.reduce((acc, f) => acc + f.size, 0)
    if (totalSize > MAX_TOTAL_SIZE) {
      return NextResponse.json({ error: 'Total file size exceeds 30MB limit' }, { status: 400 })
    }

    // Read files into buffers so Watson receives actual bytes (Node re-forwarding of File can fail)
    const filePayloads = await Promise.all(
      files.map(async (f) => ({
        buffer: await f.arrayBuffer(),
        name: f.name || 'document',
        type: f.type || 'application/octet-stream',
      }))
    )

    console.log('[API knowledge-bases POST] Create step: name=%s, fileCount=%d, description=%s', name, files.length, description ?? '(none)')
    const knowledgeBase = await createWatsonKnowledgeBase(name, filePayloads, description ?? undefined)
    console.log('[API knowledge-bases POST] Create success: kbId=%s', knowledgeBase?.id)
    return NextResponse.json({ knowledgeBase }, { status: 201 })
  } catch (e) {
    console.error('[API knowledge-bases POST] Create failed:', {
      errorName: e instanceof Error ? e.name : 'unknown',
      message: e instanceof Error ? e.message : String(e),
      stack: e instanceof Error ? e.stack : undefined,
      fullError: e,
    })
    const message = e instanceof Error ? e.message : 'Failed to create knowledge base'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
