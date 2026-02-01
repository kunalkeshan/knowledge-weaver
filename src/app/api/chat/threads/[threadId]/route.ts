import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ threadId: string }> }
) {
  const session = await auth.api.getSession({
    headers: _request.headers,
  })
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { threadId } = await params
  if (!threadId) {
    return NextResponse.json({ error: 'Missing threadId' }, { status: 400 })
  }
  try {
    const result = await prisma.chatThread.deleteMany({
      where: { id: threadId, userId: session.user.id },
    })
    if (result.count === 0) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 })
    }
    return new NextResponse(null, { status: 204 })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to delete thread'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
