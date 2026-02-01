import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  const note = await prisma.note.findUnique({
    where: { id },
    include: { project: true },
  })
  if (!note) {
    return NextResponse.json({ error: 'Note not found' }, { status: 404 })
  }
  return NextResponse.json({ note })
}
