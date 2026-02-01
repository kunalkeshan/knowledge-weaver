'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Bot, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

async function seedWatsonAgents(): Promise<{
  created: number
  errors: number
  agents: { agent_id: string; name?: string; kb_id: string; kb_name: string }[]
  errorDetails: { name: string; error: string }[]
}> {
  const res = await fetch('/api/admin/seed-watson-agents', {
    method: 'POST',
    credentials: 'include',
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? `Seed failed: ${res.status}`)
  return data
}

export function SeedWatsonAgentsButton() {
  const [message, setMessage] = useState<string | null>(null)
  const mutation = useMutation({
    mutationFn: seedWatsonAgents,
    onSuccess: (data) => {
      if (data.errors === 0) {
        setMessage(`Created ${data.created} agent(s) via Watson X API.`)
      } else {
        setMessage(
          `Created ${data.created}; ${data.errors} error(s): ${data.errorDetails.map((e) => e.error).join(', ')}`
        )
      }
    },
    onError: (e) => {
      setMessage(e instanceof Error ? e.message : 'Seed failed.')
    },
  })

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          setMessage(null)
          mutation.mutate()
        }}
        disabled={mutation.isPending}
      >
        {mutation.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
        <span className="ml-2">Seed Watson Agents</span>
      </Button>
      {message && (
        <span className="text-xs text-muted-foreground">{message}</span>
      )}
    </div>
  )
}
