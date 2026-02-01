'use client'

import { useQuery } from '@tanstack/react-query'
import { BookOpen, FileText, FolderKanban, Shield } from 'lucide-react'
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

async function fetchProjects() {
  const res = await fetch('/api/projects', { credentials: 'include' })
  if (!res.ok) throw new Error('Failed to fetch projects')
  const data = await res.json()
  return data.projects as Array<{ id: string; name: string; slug: string; description: string | null; whereHosted: string | null; status: string; _count: { tickets: number } }>
}

async function fetchTickets() {
  const res = await fetch('/api/tickets', { credentials: 'include' })
  if (!res.ok) throw new Error('Failed to fetch tickets')
  const data = await res.json()
  return data.tickets as Array<{ id: string; title: string; status: string; kind: string; project: { name: string; slug: string } }>
}

async function fetchNotes() {
  const res = await fetch('/api/notes', { credentials: 'include' })
  if (!res.ok) throw new Error('Failed to fetch notes')
  const data = await res.json()
  return data.notes as Array<{ id: string; title: string; tag: string | null; content: string; project: { name: string } | null }>
}

async function fetchPolicies() {
  const res = await fetch('/api/policies', { credentials: 'include' })
  if (!res.ok) throw new Error('Failed to fetch policies')
  const data = await res.json()
  return data.policies as Array<{ id: string; title: string; category: string; effectiveAt: string }>
}

export function TrackingContent() {
  const projectsQuery = useQuery({ queryKey: ['tracking', 'projects'], queryFn: fetchProjects })
  const ticketsQuery = useQuery({ queryKey: ['tracking', 'tickets'], queryFn: fetchTickets })
  const notesQuery = useQuery({ queryKey: ['tracking', 'notes'], queryFn: fetchNotes })
  const policiesQuery = useQuery({ queryKey: ['tracking', 'policies'], queryFn: fetchPolicies })

  return (
    <Tabs defaultValue="projects" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="projects" className="flex items-center gap-2">
          <FolderKanban className="h-4 w-4" />
          Projects
        </TabsTrigger>
        <TabsTrigger value="tickets" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Tickets
        </TabsTrigger>
        <TabsTrigger value="notes" className="flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          Notes
        </TabsTrigger>
        <TabsTrigger value="policies" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Policies
        </TabsTrigger>
      </TabsList>

      <TabsContent value="projects" className="mt-4">
        {projectsQuery.isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : projectsQuery.error ? (
          <p className="text-sm text-destructive">Failed to load projects.</p>
        ) : !projectsQuery.data?.length ? (
          <p className="text-sm text-muted-foreground">No projects yet. Run the database seed or create one via API.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {projectsQuery.data.map((p) => (
              <Link key={p.id} href={`/dashboard/tracking/projects/${p.id}`} className="block rounded-xl border bg-card p-4 text-card-foreground shadow-sm transition-colors hover:bg-accent/50">
                <div className="space-y-2">
                  <h3 className="text-base font-semibold">{p.name}</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{p.status}</Badge>
                    <span className="text-xs text-muted-foreground">{p._count.tickets} tickets</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{p.description ?? p.whereHosted ?? '—'}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="tickets" className="mt-4">
        {ticketsQuery.isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : ticketsQuery.error ? (
          <p className="text-sm text-destructive">Failed to load tickets.</p>
        ) : !ticketsQuery.data?.length ? (
          <p className="text-sm text-muted-foreground">No tickets yet. Run the database seed or create one via API.</p>
        ) : (
          <div className="space-y-2">
            {ticketsQuery.data.map((t) => (
              <Link key={t.id} href={`/dashboard/tracking/tickets/${t.id}`} className="flex items-center justify-between rounded-xl border bg-card py-3 px-4 shadow-sm transition-colors hover:bg-accent/50">
                <div>
                  <p className="font-medium text-sm">{t.title}</p>
                  <p className="text-xs text-muted-foreground">{t.project.name} · {t.kind}</p>
                </div>
                <Badge variant={t.status === 'done' ? 'secondary' : 'default'}>{t.status}</Badge>
              </Link>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="notes" className="mt-4">
        {notesQuery.isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : notesQuery.error ? (
          <p className="text-sm text-destructive">Failed to load notes.</p>
        ) : !notesQuery.data?.length ? (
          <p className="text-sm text-muted-foreground">No notes yet. Run the database seed or create one via API.</p>
        ) : (
          <div className="space-y-2">
            {notesQuery.data.map((n) => (
              <Link key={n.id} href={`/dashboard/tracking/notes/${n.id}`} className="block rounded-xl border bg-card p-4 shadow-sm transition-colors hover:bg-accent/50">
                <p className="font-medium text-sm">{n.title}</p>
                <div className="mt-1 flex items-center gap-2">
                  {n.tag && <Badge variant="outline">{n.tag}</Badge>}
                  {n.project && <span className="text-xs text-muted-foreground">{n.project.name}</span>}
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{n.content}</p>
              </Link>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="policies" className="mt-4">
        {policiesQuery.isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : policiesQuery.error ? (
          <p className="text-sm text-destructive">Failed to load policies.</p>
        ) : !policiesQuery.data?.length ? (
          <p className="text-sm text-muted-foreground">No policies yet. Run the database seed or create one via API.</p>
        ) : (
          <div className="space-y-2">
            {policiesQuery.data.map((p) => (
              <Link key={p.id} href={`/dashboard/tracking/policies/${p.id}`} className="flex items-center justify-between rounded-xl border bg-card py-3 px-4 shadow-sm transition-colors hover:bg-accent/50">
                <p className="font-medium text-sm">{p.title}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{p.category}</Badge>
                  <span className="text-xs text-muted-foreground">
                    Effective {new Date(p.effectiveAt).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}
