'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

async function createTicket(body: { projectId: string; title: string; description?: string; status?: string; kind?: string }) {
  const res = await fetch('/api/tickets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Failed to create ticket')
  return data.ticket as { id: string; title: string; projectId: string }
}

interface Project { id: string; name: string; slug: string }
interface AddTicketDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projects: Project[]
}

export function AddTicketDialog({ open, onOpenChange, projects }: AddTicketDialogProps) {
  const queryClient = useQueryClient()
  const [projectId, setProjectId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('open')
  const [kind, setKind] = useState('task')
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: createTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracking', 'tickets'] })
      onOpenChange(false)
      setProjectId('')
      setTitle('')
      setDescription('')
      setStatus('open')
      setKind('task')
      setError(null)
    },
    onError: (e) => {
      setError(e instanceof Error ? e.message : 'Failed to create ticket')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!projectId.trim() || !title.trim()) return
    mutation.mutate({
      projectId: projectId.trim(),
      title: title.trim(),
      description: description.trim() || undefined,
      status,
      kind,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add ticket</DialogTitle>
          <DialogDescription>Create a new ticket in a project. Project and title are required.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ticket-project">Project *</Label>
            <select
              id="ticket-project"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              required
            >
              <option value="">Select project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ticket-title">Title *</Label>
            <Input
              id="ticket-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ticket title"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ticket-description">Description</Label>
            <Input
              id="ticket-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ticket-status">Status</Label>
              <select
                id="ticket-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                <option value="open">Open</option>
                <option value="in_progress">In progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ticket-kind">Kind</Label>
              <select
                id="ticket-kind"
                value={kind}
                onChange={(e) => setKind(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                <option value="task">Task</option>
                <option value="bug">Bug</option>
                <option value="feature">Feature</option>
                <option value="incident">Incident</option>
              </select>
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending || !projectId.trim() || !title.trim()}>
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add ticket'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
