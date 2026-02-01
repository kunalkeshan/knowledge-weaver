import { AgentGrid } from '@/components/agents/agent-grid'
import { SidebarLeft } from '@/components/dashboard/sidebar-left'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Bot, BookOpen, FileStack, FolderKanban, MessageSquare, Search, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { RecentChats } from '@/components/dashboard/recent-chats'

interface DashboardContentProps {
  user: {
    id: string
    name: string
    email: string
    image?: string | null
  }
}

export function DashboardContent({ user }: DashboardContentProps) {
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
                  <BreadcrumbPage className="line-clamp-1">
                    Dashboard
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              Community Knowledge Weaver
            </h1>
            <p className="text-muted-foreground">
              Turn scattered docs, forums, and wikis into actionable learning
              paths and guided workflows with agentic AI.
            </p>
          </div>

          <div className="grid gap-4 rounded-lg border bg-muted/30 p-4 md:grid-cols-3">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Documents indexed
              </p>
              <p className="text-2xl font-semibold">—</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Last sync
              </p>
              <p className="text-2xl font-semibold">—</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Recent learning paths
              </p>
              <p className="text-2xl font-semibold">—</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Link
              href="/dashboard/ask"
              className="group flex flex-col gap-3 rounded-xl border bg-card p-6 text-card-foreground shadow-sm transition-colors hover:bg-accent/50"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Search className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">Ask</h2>
                <p className="text-sm text-muted-foreground">
                  Ask a question. We route you to the right agent and open the chat.
                </p>
              </div>
            </Link>
            <Link
              href="/dashboard/tracking"
              className="group flex flex-col gap-3 rounded-xl border bg-card p-6 text-card-foreground shadow-sm transition-colors hover:bg-accent/50"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FolderKanban className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">Tracking</h2>
                <p className="text-sm text-muted-foreground">
                  Projects, tickets, notes, and policies. Sync to Watson for agents.
                </p>
              </div>
            </Link>
            <Link
              href="/dashboard/knowledge-base"
              className="group flex flex-col gap-3 rounded-xl border bg-card p-6 text-card-foreground shadow-sm transition-colors hover:bg-accent/50"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileStack className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">Build knowledge base</h2>
                <p className="text-sm text-muted-foreground">
                  Upload documents, connect Google Drive or Confluence, and
                  index your organizational knowledge.
                </p>
              </div>
            </Link>
            <Link
              href="/dashboard/workflows"
              className="group flex flex-col gap-3 rounded-xl border bg-card p-6 text-card-foreground shadow-sm transition-colors hover:bg-accent/50"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">
                  Generate a learning path
                </h2>
                <p className="text-sm text-muted-foreground">
                  Describe what you want to learn or solve. Get structured paths
                  for onboarding, process guides, or troubleshooting.
                </p>
              </div>
            </Link>
          </div>

          <div className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Bot className="h-4 w-4" />
              AI Agents
            </h3>
            <AgentGrid />
          </div>

          <div className="rounded-xl border bg-muted/30 p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <MessageSquare className="h-4 w-4" />
              Recent chats
            </h3>
            <RecentChats />
          </div>

          <div className="rounded-xl border bg-muted/30 p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <BookOpen className="h-4 w-4" />
              Recent learning paths
            </h3>
            <p className="text-sm text-muted-foreground">
              Your generated paths will appear here. Try generating a path from
              workflows to get started.
            </p>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
