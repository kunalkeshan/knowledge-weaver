'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { CloudUpload, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

async function syncToWatson(): Promise<{ ok: boolean; synced: { agentName: string; kbId: string; docName: string }[]; errors: { agentName?: string; error: string }[] }> {
  const res = await fetch('/api/admin/sync-to-watson', {
    method: 'POST',
    credentials: 'include',
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? `Sync failed: ${res.status}`)
  return data
}

export function SyncToWatsonButton() {
  const [message, setMessage] = useState<string | null>(null)
  const mutation = useMutation({
    mutationFn: syncToWatson,
    onSuccess: (data) => {
      if (data.ok) {
        setMessage(`Synced to ${data.synced.length} agent(s).`)
      } else {
        setMessage(`Synced ${data.synced.length}; ${data.errors.length} error(s): ${data.errors.map((e) => e.error).join(', ')}`)
      }
    },
    onError: (e) => {
      setMessage(e instanceof Error ? e.message : 'Sync failed.')
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
          <CloudUpload className="h-4 w-4" />
        )}
        <span className="ml-2">Sync to Watson</span>
      </Button>
      {message && (
        <span className="text-xs text-muted-foreground">{message}</span>
      )}
    </div>
  )
}
