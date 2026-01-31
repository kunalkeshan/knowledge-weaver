import type { WatsonAgent } from '@/types/watson'
import { useQuery } from '@tanstack/react-query'

async function fetchAgents(): Promise<WatsonAgent[]> {
  const res = await fetch('/api/agents', { credentials: 'include' })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error ?? `Agents failed: ${res.status}`)
  }
  const data = (await res.json()) as { agents?: WatsonAgent[] }
  return Array.isArray(data.agents) ? data.agents : []
}

export function useAgents() {
  return useQuery({
    queryKey: ['agents'],
    queryFn: fetchAgents,
  })
}
