'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { Loader2, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

async function triage(message: string): Promise<{ agentId: string; agentName?: string; isHighRisk?: boolean }> {
  const res = await fetch('/api/triage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ message }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? `Triage failed: ${res.status}`)
  return data
}

export function AskContent({ orchestratorAgentId }: { orchestratorAgentId?: string | null }) {
  const router = useRouter()
  const [message, setMessage] = useState('')
  const mutation = useMutation({
    mutationFn: async () => {
      if (orchestratorAgentId) {
        return { agentId: orchestratorAgentId, agentName: 'AskOrchestrate' }
      }
      return triage(message)
    },
    onSuccess: (data) => {
      const params = new URLSearchParams()
      params.set('message', message)
      if (data.isHighRisk) params.set('highRisk', '1')
      router.push(`/dashboard/agents/${data.agentId}/chat?${params.toString()}`)
    },
    onError: () => { },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = message.trim()
    if (!trimmed || mutation.isPending) return
    mutation.mutate()
  }

  return (
    <div className="max-w-2xl space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="e.g. How do I get VPN access? What’s our PII policy?"
          disabled={mutation.isPending}
          className="flex-1"
        />
        <Button type="submit" disabled={mutation.isPending || !message.trim()}>
          {mutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MessageCircle className="h-4 w-4" />
          )}
          <span className="ml-2">Ask</span>
        </Button>
      </form>
      {mutation.error && (
        <p className="text-sm text-destructive">
          {mutation.error instanceof Error ? mutation.error.message : 'Something went wrong.'}
        </p>
      )}
      <p className="text-xs text-muted-foreground">
        {orchestratorAgentId
          ? "You'll chat with the orchestrator, which will delegate to the right specialist."
          : "Your question is classified and you're sent to the right agent."}
        {' '}
        You can also pick an agent from the Dashboard.
      </p>
    </div>
  )
}
