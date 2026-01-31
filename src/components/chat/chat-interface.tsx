'use client'

import { useChat, fetchServerSentEvents } from '@tanstack/ai-react'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'
import { ChatInput } from './chat-input'
import { ChatMessage } from './chat-message'

interface ChatInterfaceProps {
  agentId: string
  agentName?: string
  threadId: string | null
  onThreadIdChange?: (threadId: string | null) => void
  initialMessages?: Array<{ role: 'user' | 'assistant'; content: string }>
}

function uiMessagesFromHistory(
  initial: Array<{ role: 'user' | 'assistant'; content: string }>
) {
  return initial.map((m, i) => ({
    id: `hist-${i}`,
    role: m.role as 'user' | 'assistant',
    parts: [{ type: 'text' as const, content: m.content }],
  }))
}

export function ChatInterface({
  agentId,
  agentName,
  threadId,
  onThreadIdChange,
  initialMessages = [],
}: ChatInterfaceProps) {
  const queryClient = useQueryClient()
  const body = useMemo(
    () => ({
      agentId,
      threadId: threadId ?? undefined,
      agentName: agentName ?? undefined,
    }),
    [agentId, threadId, agentName]
  )

  const initial = useMemo(
    () => uiMessagesFromHistory(initialMessages),
    [initialMessages]
  )

  const onFinish = useCallback(async () => {
    queryClient.invalidateQueries({ queryKey: ['chat', 'threads'] })
    queryClient.invalidateQueries({ queryKey: ['chat', 'thread', threadId] })
    if (!threadId && onThreadIdChange) {
      try {
        const res = await fetch(
          `/api/chat/threads?agentId=${encodeURIComponent(agentId)}`,
          { credentials: 'include' }
        )
        if (res.ok) {
          const data = (await res.json()) as { threads?: Array<{ id: string }> }
          const first = data.threads?.[0]
          if (first) onThreadIdChange(first.id)
        }
      } catch {
        // ignore
      }
    }
  }, [queryClient, threadId, agentId, onThreadIdChange])

  const { messages, sendMessage, isLoading } = useChat({
    connection: fetchServerSentEvents('/api/chat'),
    body,
    initialMessages: initial,
    onFinish,
  })

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-2 overflow-y-auto p-2">
        {messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Send a message to start the conversation.
          </p>
        ) : (
          <>
            {messages.map((msg, i) => {
              const isLast = i === messages.length - 1
              const showThinking =
                isLoading && isLast && msg.role === 'assistant' && !msg.parts?.some((p) => p.type === 'text' && p.content)
              return (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  showThinkingDots={showThinking}
                />
              )
            })}
            {isLoading && messages.length > 0 && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex w-full gap-3 rounded-lg px-3 py-2 bg-background" aria-label="Thinking">
                <div className="flex flex-1 flex-col gap-1">
                  <span className="text-xs font-medium text-muted-foreground">Assistant</span>
                  <div className="flex items-center gap-1.5 py-1">
                    <span className="thinking-dot" />
                    <span className="thinking-dot" />
                    <span className="thinking-dot" />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <div className="border-t bg-background p-3">
        <ChatInput onSend={sendMessage} disabled={isLoading} />
      </div>
    </div>
  )
}
