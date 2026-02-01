import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  })
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { searchParams } = new URL(request.url)
  const agentId = searchParams.get('agentId') ?? undefined
  try {
    const rows = await prisma.chatThread.findMany({
      where: { userId: session.user.id, ...(agentId ? { agentId } : {}) },
      orderBy: { updatedAt: 'desc' },
      take: 50,
      select: {
        id: true,
        agentId: true,
        agentName: true,
        watsonThreadId: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { messages: true } },
      },
    })
    const threads = rows.map(({ _count, ...t }) => ({
      ...t,
      messageCount: _count.messages,
    }))
    return NextResponse.json({ threads })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to list threads'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
