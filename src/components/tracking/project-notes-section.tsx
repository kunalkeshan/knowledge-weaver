'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BookOpen, Plus } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { AddNoteDialog } from '@/components/tracking/add-note-dialog'

async function fetchNotesForProject(projectId: string) {
  const res = await fetch(`/api/notes?projectId=${encodeURIComponent(projectId)}`, {
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Failed to fetch notes')
  const data = await res.json()
  return data.notes as Array<{
    id: string
    title: string
    tag: string | null
    content: string
    project: { name: string } | null
  }>
}

interface ProjectNotesSectionProps {
  projectId: string
  projectName: string
}

export function ProjectNotesSection({ projectId, projectName }: ProjectNotesSectionProps) {
  const [addNoteOpen, setAddNoteOpen] = useState(false)
  const notesQuery = useQuery({
    queryKey: ['tracking', 'project-notes', projectId],
    queryFn: () => fetchNotesForProject(projectId),
  })

  const notes = notesQuery.data ?? []
  const projects = [{ id: projectId, name: projectName, slug: '' }]

  return (
    <div className="space-y-2 rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          Notes
        </h2>
        <Button variant="outline" size="sm" onClick={() => setAddNoteOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add note
        </Button>
      </div>
      {notesQuery.isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : notesQuery.error ? (
        <p className="text-sm text-destructive">Failed to load notes.</p>
      ) : notes.length === 0 ? (
        <p className="text-sm text-muted-foreground">No notes yet. Add one above.</p>
      ) : (
        <ul className="space-y-2">
          {notes.map((n) => (
            <li key={n.id}>
              <Link
                href={`/dashboard/tracking/projects/${projectId}/notes/${n.id}`}
                className="block rounded-lg border bg-background px-3 py-2 text-sm transition-colors hover:bg-muted/50"
              >
                <p className="font-medium">{n.title}</p>
                <div className="mt-1 flex items-center gap-2">
                  {n.tag && <Badge variant="outline">{n.tag}</Badge>}
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{n.content}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <AddNoteDialog
        open={addNoteOpen}
        onOpenChange={setAddNoteOpen}
        projects={projects}
        defaultProjectId={projectId}
      />
    </div>
  )
}
