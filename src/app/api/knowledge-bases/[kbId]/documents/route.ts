import { auth } from '@/lib/auth'
import { isWatsonConfigured } from '@/lib/config'
import { addDocumentsToKnowledgeBase, deleteKnowledgeBaseDocuments } from '@/lib/watson'
import { NextResponse } from 'next/server'

export async function PUT(
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
  console.log('[API knowledge-bases/[kbId]/documents PUT] Start: kbId=%s', kbId)
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]

    if (files.length === 0) {
      console.log('[API knowledge-bases/[kbId]/documents PUT] Rejected: no files')
      return NextResponse.json({ error: 'At least one file is required' }, { status: 400 })
    }

    const fileInfos = files.map((f) => ({ name: f.name, type: f.type, size: f.size }))
    console.log('[API knowledge-bases/[kbId]/documents PUT] Files:', fileInfos)

    // Validate file constraints
    const MAX_FILES = 20
    const MAX_TOTAL_SIZE = 30 * 1024 * 1024 // 30MB
    if (files.length > MAX_FILES) {
      console.log('[API knowledge-bases/[kbId]/documents PUT] Rejected: too many files (%d)', files.length)
      return NextResponse.json({ error: `Maximum ${MAX_FILES} files allowed` }, { status: 400 })
    }
    const totalSize = files.reduce((acc, f) => acc + f.size, 0)
    if (totalSize > MAX_TOTAL_SIZE) {
      console.log('[API knowledge-bases/[kbId]/documents PUT] Rejected: total size %d exceeds limit', totalSize)
      return NextResponse.json({ error: 'Total file size exceeds 30MB limit' }, { status: 400 })
    }

    const knowledgeBase = await addDocumentsToKnowledgeBase(kbId, files)
    console.log('[API knowledge-bases/[kbId]/documents PUT] Success: kbId=%s', kbId)
    return NextResponse.json({ knowledgeBase })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to add documents'
    console.error('[API knowledge-bases/[kbId]/documents PUT] Failed: kbId=%s', kbId, e)
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
  console.log('[API knowledge-bases/[kbId]/documents DELETE] Start: kbId=%s', kbId)
  try {
    const body = await request.json()
    const documentNames = body.documents as string[]

    if (!documentNames || documentNames.length === 0) {
      console.log('[API knowledge-bases/[kbId]/documents DELETE] Rejected: no document names')
      return NextResponse.json({ error: 'Document names are required' }, { status: 400 })
    }
    console.log('[API knowledge-bases/[kbId]/documents DELETE] Documents to delete:', documentNames)

    await deleteKnowledgeBaseDocuments(kbId, documentNames)
    console.log('[API knowledge-bases/[kbId]/documents DELETE] Success: kbId=%s', kbId)
    return NextResponse.json({ success: true })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to delete documents'
    console.error('[API knowledge-bases/[kbId]/documents DELETE] Failed: kbId=%s', kbId, e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
