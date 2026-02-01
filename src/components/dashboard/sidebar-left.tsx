'use client'

import { useChatThreads, useDeleteChatThread } from '@/hooks/use-chat-history'
import { FolderKanban, Loader2, MessageSquare, MoreHorizontal, Search, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { GitHubIcon } from '@/components/icons/social/github-icon'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import type { ChatThreadSummary } from '@/hooks/use-chat-history'

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
  const { data: threads, isLoading, isError, isFetching, error, refetch } = useChatThreads()
  const deleteMutation = useDeleteChatThread()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { isMobile } = useSidebar()

  const handleDeleteThread = (thread: ChatThreadSummary) => {
    deleteMutation.mutate(thread.id, {
      onSuccess: () => {
        const currentThreadId = searchParams.get('threadId')
        const isViewingDeletedThread =
          pathname?.includes('/agents/') &&
          pathname?.includes('/chat') &&
          currentThreadId === thread.id
        if (isViewingDeletedThread) {
          router.push(`/dashboard/agents/${thread.agentId}/chat`)
        }
      },
    })
  }

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
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg">
              <Link href="/dashboard/ask">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Search className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Ask</span>
                  <span className="truncate text-xs text-muted-foreground">
                    Route to agent
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg">
              <Link href="/dashboard/tracking">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <FolderKanban className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Tracking</span>
                  <span className="truncate text-xs text-muted-foreground">
                    Projects, tickets, notes
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="flex min-h-0 flex-col overflow-hidden">
        <SidebarGroup className="flex min-h-0 flex-1 flex-col">
          <SidebarGroupLabel>Recent chats</SidebarGroupLabel>
          <SidebarGroupContent className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto">
              {isLoading ? (
                <SidebarMenu>
                  {[1, 2, 3, 4].map((i) => (
                    <SidebarMenuItem key={i}>
                      <div className="h-10 animate-pulse rounded-md bg-muted/50" />
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              ) : isError ? (
                <div className="flex flex-col gap-2 px-2 py-2">
                  <p className="text-xs text-muted-foreground">
                    {error instanceof Error ? error.message : 'Could not load chats.'}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-fit text-xs"
                    onClick={() => refetch()}
                    disabled={isFetching}
                  >
                    {isFetching ? 'Retrying…' : 'Retry'}
                  </Button>
                </div>
              ) : !threads?.length ? (
                <p className="px-2 py-2 text-xs text-muted-foreground">
                  No conversations yet. Start a chat from the dashboard.
                </p>
              ) : (
                <SidebarMenu>
                  {threads.slice(0, 20).map((thread) => {
                    const label = thread.firstUserMessage?.trim()
                      ? (thread.firstUserMessage.length > 48
                        ? thread.firstUserMessage.slice(0, 48).trim() + '…'
                        : thread.firstUserMessage)
                      : (thread.agentName ?? thread.agentId)
                    return (
                      <SidebarMenuItem key={thread.id}>
                        <SidebarMenuButton asChild tooltip={`${label} · ${formatRelativeTime(thread.updatedAt)}`}>
                          <Link
                            href={`/dashboard/agents/${thread.agentId}/chat?threadId=${encodeURIComponent(thread.id)}`}
                          >
                            <MessageSquare className="size-4 shrink-0" />
                            <span className="truncate">
                              {label}
                            </span>
                          </Link>
                        </SidebarMenuButton>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <SidebarMenuAction
                              showOnHover
                              onClick={(e) => e.stopPropagation()}
                              onPointerDown={(e) => e.stopPropagation()}
                              aria-label="Chat options"
                            >
                              <MoreHorizontal className="size-4" />
                            </SidebarMenuAction>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            className="w-56 rounded-lg"
                            side={isMobile ? 'bottom' : 'right'}
                            align={isMobile ? 'end' : 'start'}
                          >
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              disabled={deleteMutation.isPending}
                              onClick={() => handleDeleteThread(thread)}
                            >
                              {deleteMutation.isPending && deleteMutation.variables === thread.id ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : (
                                <Trash2 className="size-4" />
                              )}
                              <span>
                                {deleteMutation.isPending && deleteMutation.variables === thread.id
                                  ? 'Deleting…'
                                  : 'Delete'}
                              </span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              )}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="mt-auto">
        <a
          href="https://github.com/kunalkeshan/knowledge-weaver"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View repository on GitHub"
          className="inline-flex items-center gap-2 rounded-md p-2 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <GitHubIcon className="size-5 shrink-0" />
          <span className="truncate text-sm group-data-[collapsible=icon]:hidden">GitHub</span>
        </a>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
