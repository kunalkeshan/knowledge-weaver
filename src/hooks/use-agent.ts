import type { WatsonAgent } from '@/types/watson'
import { useQuery } from '@tanstack/react-query'

async function fetchAgent(agentId: string): Promise<WatsonAgent | null> {
  const res = await fetch(`/api/agents/${encodeURIComponent(agentId)}`, {
    credentials: 'include',
  })
  if (res.status === 404) return null
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error ?? `Agent failed: ${res.status}`)
  }
  return res.json() as Promise<WatsonAgent>
}

export function useAgent(agentId: string | null) {
  return useQuery({
    queryKey: ['agent', agentId],
    queryFn: () => fetchAgent(agentId!),
    enabled: Boolean(agentId),
  })
}
