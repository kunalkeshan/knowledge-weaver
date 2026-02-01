'use client'

import { useEffect, useState } from 'react'
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

async function createNote(body: { title: string; content: string; tag?: string; projectId?: string }) {
  const res = await fetch('/api/notes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Failed to create note')
  return data.note as { id: string; title: string }
}

interface Project { id: string; name: string; slug: string }
interface AddNoteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projects: Project[]
  /** When set, the note is scoped to this project and the project selector is hidden. */
  defaultProjectId?: string
}

export function AddNoteDialog({ open, onOpenChange, projects, defaultProjectId }: AddNoteDialogProps) {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tag, setTag] = useState('')
  const [projectId, setProjectId] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open && defaultProjectId) setProjectId(defaultProjectId)
  }, [open, defaultProjectId])

  const mutation = useMutation({
    mutationFn: createNote,
    onSuccess: () => {
      if (defaultProjectId) {
        queryClient.invalidateQueries({ queryKey: ['tracking', 'project-notes', defaultProjectId] })
      } else {
        queryClient.invalidateQueries({ queryKey: ['tracking', 'notes'] })
      }
      onOpenChange(false)
      setTitle('')
      setContent('')
      setTag('')
      setProjectId(defaultProjectId ?? '')
      setError(null)
    },
    onError: (e) => {
      setError(e instanceof Error ? e.message : 'Failed to create note')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!title.trim() || !content.trim()) return
    const effectiveProjectId = defaultProjectId ?? (projectId.trim() || undefined)
    mutation.mutate({
      title: title.trim(),
      content: content.trim(),
      tag: tag.trim() || undefined,
      projectId: effectiveProjectId,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add note</DialogTitle>
          <DialogDescription>Create a new note. Title and content are required.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="note-title">Title *</Label>
            <Input
              id="note-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="note-content">Content *</Label>
            <textarea
              id="note-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Note content"
              rows={4}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="note-tag">Tag</Label>
            <Input
              id="note-tag"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="e.g. runbook, how-to"
            />
          </div>
          {!defaultProjectId && (
            <div className="space-y-2">
              <Label htmlFor="note-project">Project (optional)</Label>
              <select
                id="note-project"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                <option value="">None</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending || !title.trim() || !content.trim()}>
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add note'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
