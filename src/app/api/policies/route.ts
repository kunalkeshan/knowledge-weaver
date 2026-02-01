import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category') ?? undefined
  const policies = await prisma.policy.findMany({
    where: category ? { category } : undefined,
    orderBy: { effectiveAt: 'desc' },
  })
  return NextResponse.json({ policies })
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  let body: { title: string; content: string; category: string; effectiveAt?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  if (!body.title?.trim() || !body.content?.trim() || !body.category?.trim()) {
    return NextResponse.json({ error: 'title, content, and category are required' }, { status: 400 })
  }
  const policy = await prisma.policy.create({
    data: {
      title: body.title.trim(),
      content: body.content.trim(),
      category: body.category.trim(),
      effectiveAt: body.effectiveAt ? new Date(body.effectiveAt) : new Date(),
      createdById: session.user.id,
    },
  })
  return NextResponse.json({ policy })
}
