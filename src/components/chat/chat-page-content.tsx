'use client'

import { ChatInterface } from './chat-interface'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

interface ChatPageContentProps {
  agentId: string
  agentName?: string
  threadId: string | null
  initialMessages: Array<{ role: 'user' | 'assistant'; content: string }>
}

export function ChatPageContent({
  agentId,
  agentName,
  threadId: threadIdFromUrl,
  initialMessages,
}: ChatPageContentProps) {
  const [resolvedThreadId, setResolvedThreadId] = useState<string | null>(null)
  const threadId = threadIdFromUrl ?? resolvedThreadId

  return (
    <div className="flex h-full flex-col">
      <header className="flex shrink-0 items-center gap-2 border-b bg-background px-4 py-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold">
            {agentName ?? 'Agent'} {threadId && '(conversation)'}
          </h1>
          <p className="text-xs text-muted-foreground">
            watsonx Orchestrate
          </p>
        </div>
      </header>
      <div className="flex-1 overflow-hidden">
        <ChatInterface
          agentId={agentId}
          agentName={agentName}
          threadId={threadId}
          onThreadIdChange={setResolvedThreadId}
          initialMessages={initialMessages}
        />
      </div>
    </div>
  )
}
