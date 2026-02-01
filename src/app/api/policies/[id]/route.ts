import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  const policy = await prisma.policy.findUnique({
    where: { id },
  })
  if (!policy) {
    return NextResponse.json({ error: 'Policy not found' }, { status: 404 })
  }
  return NextResponse.json({ policy })
}
