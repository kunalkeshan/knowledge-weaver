import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const projects = await prisma.project.findMany({
    orderBy: { updatedAt: 'desc' },
    include: { _count: { select: { tickets: true } } },
  })
  return NextResponse.json({ projects })
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  let body: { name: string; slug?: string; description?: string; whereHosted?: string; status?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  if (!body.name?.trim()) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 })
  }
  const slug = (body.slug ?? body.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')).trim()
  const project = await prisma.project.create({
    data: {
      name: body.name.trim(),
      slug,
      description: body.description?.trim() ?? null,
      whereHosted: body.whereHosted?.trim() ?? null,
      status: body.status ?? 'active',
      createdById: session.user.id,
    },
  })
  return NextResponse.json({ project })
}
