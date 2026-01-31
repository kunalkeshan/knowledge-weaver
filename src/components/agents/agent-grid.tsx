'use client'

import { useAgents } from '@/hooks/use-agents'
import { AgentCard } from './agent-card'
import { AgentCardSkeleton } from './agent-card-skeleton'

export function AgentGrid() {
  const { data: agents, isLoading, error } = useAgents()

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <AgentCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <p className="text-sm text-muted-foreground">
        Unable to load agents. Check Watson configuration.
      </p>
    )
  }

  if (!agents?.length) {
    return (
      <p className="text-sm text-muted-foreground">
        No agents available. Configure watsonx Orchestrate to see agents here.
      </p>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {agents.map((agent) => (
        <AgentCard key={agent.agent_id} agent={agent} />
      ))}
    </div>
  )
}
