'use client'

import { useChatThreads } from '@/hooks/use-chat-history'
import Link from 'next/link'

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

export function RecentChats() {
  const { data: threads, isLoading, error } = useChatThreads()

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-14 animate-pulse rounded-lg bg-muted/50"
          />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <p className="text-sm text-muted-foreground">
        Could not load recent chats.
      </p>
    )
  }

  if (!threads?.length) {
    return (
      <p className="text-sm text-muted-foreground">
        No conversations yet. Start a chat with an agent above.
      </p>
    )
  }

  return (
    <ul className="space-y-1">
      {threads.slice(0, 10).map((thread) => {
        const label = thread.firstUserMessage?.trim()
          ? (thread.firstUserMessage.length > 56
            ? thread.firstUserMessage.slice(0, 56).trim() + '…'
            : thread.firstUserMessage)
          : (thread.agentName ?? thread.agentId)
        return (
          <li key={thread.id}>
            <Link
              href={`/dashboard/agents/${thread.agentId}/chat?threadId=${encodeURIComponent(thread.id)}`}
              className="flex flex-col gap-0.5 rounded-lg border border-transparent px-3 py-2 text-left transition-colors hover:border-sidebar-border hover:bg-sidebar-accent/50"
            >
              <span className="truncate text-sm font-medium">
                {label}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                {thread.messageCount != null && (
                  <>
                    {thread.messageCount} message{thread.messageCount !== 1 ? 's' : ''}
                    <span aria-hidden>·</span>
                  </>
                )}
                {formatRelativeTime(thread.updatedAt)}
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
