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
  const tickets = await prisma.ticket.findMany({
    where: projectId ? { projectId } : undefined,
    orderBy: { updatedAt: 'desc' },
    include: { project: { select: { id: true, name: true, slug: true } } },
  })
  return NextResponse.json({ tickets })
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  let body: { projectId: string; title: string; description?: string; status?: string; kind?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  if (!body.projectId?.trim() || !body.title?.trim()) {
    return NextResponse.json({ error: 'projectId and title are required' }, { status: 400 })
  }
  const ticket = await prisma.ticket.create({
    data: {
      projectId: body.projectId.trim(),
      title: body.title.trim(),
      description: body.description?.trim() ?? null,
      status: body.status ?? 'open',
      kind: body.kind ?? 'task',
    },
  })
  return NextResponse.json({ ticket })
}
