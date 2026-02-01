import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { ChatPageContent } from '@/components/chat/chat-page-content'
import { SidebarLeft } from '@/components/dashboard/sidebar-left'
import { SidebarRight } from '@/components/dashboard/sidebar-right'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { auth } from '@/lib/auth'
import { getWatsonAgent } from '@/lib/watson'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function ChatPage({
  params,
  searchParams,
}: {
  params: Promise<{ agentId: string }>
  searchParams: Promise<{ threadId?: string }>
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session?.user) {
    redirect('/login')
  }

  const { agentId } = await params
  const { threadId: threadIdParam } = await searchParams
  const threadId = threadIdParam ?? null

  const [agent, threadData] = await Promise.all([
    getWatsonAgent(agentId).catch(() => null),
    threadId
      ? prisma.chatThread
        .findFirst({
          where: { id: threadId, userId: session.user.id },
          include: {
            messages: { orderBy: { createdAt: 'asc' } },
          },
        })
        .then((t) => t ?? null)
      : Promise.resolve(null),
  ])

  const agentName = agent?.name as string | undefined
  const initialMessages =
    threadData?.messages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })) ?? []

  return (
    <SidebarProvider>
      <SidebarLeft />
      <SidebarInset>
        <header className="sticky top-0 flex h-14 shrink-0 items-center gap-2 bg-background">
          <div className="flex flex-1 items-center gap-2 px-3">
            <SidebarTrigger />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/dashboard">Agents</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="line-clamp-1">
                    {agentName ?? agentId} / Chat
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex h-[calc(100vh-3.5rem)] flex-col">
          <ChatPageContent
            agentId={agentId}
            agentName={agentName}
            threadId={threadId}
            initialMessages={initialMessages}
          />
        </div>
      </SidebarInset>
      <SidebarRight user={session.user} agentId={agentId} />
    </SidebarProvider>
  )
}
