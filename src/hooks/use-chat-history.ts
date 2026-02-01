import { useQuery } from '@tanstack/react-query'

export interface ChatThreadSummary {
  id: string
  agentId: string
  agentName: string | null
  watsonThreadId: string | null
  createdAt: string
  updatedAt: string
  messageCount?: number
  /** First user message in the thread (for sidebar title) */
  firstUserMessage: string | null
}

export interface ChatMessageRecord {
  id: string
  threadId: string
  role: string
  content: string
  createdAt: string
}

async function fetchThreads(agentId?: string): Promise<ChatThreadSummary[]> {
  const url = agentId ? `/api/chat/threads?agentId=${encodeURIComponent(agentId)}` : '/api/chat/threads'
  const res = await fetch(url, { credentials: 'include' })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error ?? `Threads failed: ${res.status}`)
  }
  const data = (await res.json()) as { threads?: ChatThreadSummary[] }
  return Array.isArray(data.threads) ? data.threads : []
}

export function useChatThreads(agentId?: string) {
  return useQuery({
    queryKey: ['chat', 'threads', agentId ?? 'all'],
    queryFn: () => fetchThreads(agentId),
  })
}

export interface ThreadWithMessages {
  thread: {
    id: string
    agentId: string
    agentName: string | null
    watsonThreadId: string | null
  }
  messages: ChatMessageRecord[]
}

async function fetchThreadMessages(threadId: string): Promise<ThreadWithMessages | null> {
  const res = await fetch(`/api/chat/threads/${encodeURIComponent(threadId)}/messages`, { credentials: 'include' })
  if (res.status === 404) return null
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error ?? `Messages failed: ${res.status}`)
  }
  return res.json() as Promise<ThreadWithMessages>
}

export function useThreadMessages(threadId: string | null) {
  return useQuery({
    queryKey: ['chat', 'thread', threadId],
    queryFn: () => fetchThreadMessages(threadId!),
    enabled: Boolean(threadId),
  })
}
