'use client'

import { useChatThreads } from '@/hooks/use-chat-history'
import { MessageSquare } from 'lucide-react'
import Link from 'next/link'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60_000)
  const diffHours = Math.floor(diffMs / 3_600_000)
  const diffDays = Math.floor(diffMs / 86_400_000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

export function SidebarLeft(
  props: React.ComponentProps<typeof Sidebar>
) {
  const { data: threads, isLoading, error } = useChatThreads()

  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg">
              <Link href="/dashboard">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <MessageSquare className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Dashboard</span>
                  <span className="truncate text-xs text-muted-foreground">
                    Chats
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Recent chats</SidebarGroupLabel>
          <SidebarGroupContent>
            {isLoading ? (
              <SidebarMenu>
                {[1, 2, 3, 4].map((i) => (
                  <SidebarMenuItem key={i}>
                    <div className="h-10 animate-pulse rounded-md bg-muted/50" />
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            ) : error ? (
              <p className="px-2 py-2 text-xs text-muted-foreground">
                Could not load chats.
              </p>
            ) : !threads?.length ? (
              <p className="px-2 py-2 text-xs text-muted-foreground">
                No conversations yet. Start a chat from the dashboard.
              </p>
            ) : (
              <SidebarMenu>
                {threads.slice(0, 20).map((thread) => (
                  <SidebarMenuItem key={thread.id}>
                    <SidebarMenuButton asChild tooltip={`${thread.agentName ?? thread.agentId} · ${formatRelativeTime(thread.updatedAt)}`}>
                      <Link
                        href={`/dashboard/agents/${thread.agentId}/chat?threadId=${encodeURIComponent(thread.id)}`}
                      >
                        <MessageSquare className="size-4 shrink-0" />
                        <span className="truncate">
                          {thread.agentName ?? thread.agentId}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
