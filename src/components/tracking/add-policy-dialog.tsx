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

async function createPolicy(body: { title: string; content: string; category: string; effectiveAt?: string }) {
  const res = await fetch('/api/policies', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Failed to create policy')
  return data.policy as { id: string; title: string; category: string }
}

interface AddPolicyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const CATEGORIES = ['hr', 'it', 'security', 'compliance'] as const

export function AddPolicyDialog({ open, onOpenChange }: AddPolicyDialogProps) {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState<string>('hr')
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: createPolicy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracking', 'policies'] })
      onOpenChange(false)
      setTitle('')
      setContent('')
      setCategory('hr')
      setError(null)
    },
    onError: (e) => {
      setError(e instanceof Error ? e.message : 'Failed to create policy')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!title.trim() || !content.trim() || !category.trim()) return
    mutation.mutate({
      title: title.trim(),
      content: content.trim(),
      category: category.trim(),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add policy</DialogTitle>
          <DialogDescription>Create a new policy. Title, content, and category are required.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="policy-title">Title *</Label>
            <Input
              id="policy-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Policy title"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="policy-content">Content *</Label>
            <textarea
              id="policy-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Policy content"
              rows={4}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="policy-category">Category *</Label>
            <select
              id="policy-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              required
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending || !title.trim() || !content.trim()}>
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add policy'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
