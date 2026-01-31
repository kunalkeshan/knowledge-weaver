import type { WatsonAgent } from '@/types/watson'
import { Bot, MessageSquare } from 'lucide-react'
import Link from 'next/link'

interface AgentCardProps {
  agent: WatsonAgent
}

export function AgentCard({ agent }: AgentCardProps) {
  const name = (agent.name as string) ?? agent.agent_id
  const description = (agent.description as string) ?? 'AI agent'

  return (
    <Link
      href={`/dashboard/agents/${agent.agent_id}/chat`}
      className="group flex flex-col gap-3 rounded-xl border bg-card p-6 text-card-foreground shadow-sm transition-colors hover:bg-accent/50"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Bot className="h-6 w-6" />
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">{name}</h2>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {description}
        </p>
      </div>
      <span className="mt-auto flex items-center gap-1.5 text-sm text-muted-foreground group-hover:text-foreground">
        <MessageSquare className="h-4 w-4" />
        Chat with agent
      </span>
    </Link>
  )
}
