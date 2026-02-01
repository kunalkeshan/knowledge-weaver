import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('projectId') ?? undefined
  const tag = searchParams.get('tag') ?? undefined
  const notes = await prisma.note.findMany({
    where: { ...(projectId ? { projectId } : {}), ...(tag ? { tag } : {}) },
    orderBy: { updatedAt: 'desc' },
    include: { project: { select: { id: true, name: true, slug: true } } },
  })
  return NextResponse.json({ notes })
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  let body: { title: string; content: string; tag?: string; projectId?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  if (!body.title?.trim() || !body.content?.trim()) {
    return NextResponse.json({ error: 'title and content are required' }, { status: 400 })
  }
  const note = await prisma.note.create({
    data: {
      title: body.title.trim(),
      content: body.content.trim(),
      tag: body.tag?.trim() ?? null,
      projectId: body.projectId?.trim() ?? null,
      createdById: session.user.id,
    },
  })
  return NextResponse.json({ note })
}
