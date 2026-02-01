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

async function createProject(body: { name: string; slug?: string; description?: string; whereHosted?: string; status?: string }) {
  const res = await fetch('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Failed to create project')
  return data.project as { id: string; name: string; slug: string }
}

interface AddProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddProjectDialog({ open, onOpenChange }: AddProjectDialogProps) {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [whereHosted, setWhereHosted] = useState('')
  const [status, setStatus] = useState('active')
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracking', 'projects'] })
      onOpenChange(false)
      setName('')
      setSlug('')
      setDescription('')
      setWhereHosted('')
      setStatus('active')
      setError(null)
    },
    onError: (e) => {
      setError(e instanceof Error ? e.message : 'Failed to create project')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const slugValue = slug.trim() || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    mutation.mutate({
      name: name.trim(),
      slug: slugValue || undefined,
      description: description.trim() || undefined,
      whereHosted: whereHosted.trim() || undefined,
      status: status || 'active',
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add project</DialogTitle>
          <DialogDescription>Create a new project. Name is required.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">Name *</Label>
            <Input
              id="project-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Project name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-slug">Slug (optional)</Label>
            <Input
              id="project-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="url-friendly-slug"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-description">Description</Label>
            <Input
              id="project-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-whereHosted">Where hosted</Label>
            <Input
              id="project-whereHosted"
              value={whereHosted}
              onChange={(e) => setWhereHosted(e.target.value)}
              placeholder="e.g. GitHub, Vercel"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-status">Status</Label>
            <select
              id="project-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
            >
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending || !name.trim()}>
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
