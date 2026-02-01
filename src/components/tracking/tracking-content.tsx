'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FileText, FolderKanban, Plus, Shield } from 'lucide-react'
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { AddProjectDialog } from '@/components/tracking/add-project-dialog'
import { AddTicketDialog } from '@/components/tracking/add-ticket-dialog'
import { AddPolicyDialog } from '@/components/tracking/add-policy-dialog'

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

async function fetchPolicies() {
  const res = await fetch('/api/policies', { credentials: 'include' })
  if (!res.ok) throw new Error('Failed to fetch policies')
  const data = await res.json()
  return data.policies as Array<{ id: string; title: string; category: string; effectiveAt: string }>
}

export function TrackingContent() {
  const [addProjectOpen, setAddProjectOpen] = useState(false)
  const [addTicketOpen, setAddTicketOpen] = useState(false)
  const [addPolicyOpen, setAddPolicyOpen] = useState(false)

  const projectsQuery = useQuery({ queryKey: ['tracking', 'projects'], queryFn: fetchProjects })
  const ticketsQuery = useQuery({ queryKey: ['tracking', 'tickets'], queryFn: fetchTickets })
  const policiesQuery = useQuery({ queryKey: ['tracking', 'policies'], queryFn: fetchPolicies })

  const projects = projectsQuery.data ?? []

  return (
    <Tabs defaultValue="projects" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="projects" className="flex items-center gap-2">
          <FolderKanban className="h-4 w-4" />
          Projects
        </TabsTrigger>
        <TabsTrigger value="tickets" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Tickets
        </TabsTrigger>
        <TabsTrigger value="policies" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Policies
        </TabsTrigger>
      </TabsList>

      <TabsContent value="projects" className="mt-4">
        <div className="mb-4 flex justify-end">
          <Button variant="outline" size="sm" onClick={() => setAddProjectOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add project
          </Button>
        </div>
        {projectsQuery.isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : projectsQuery.error ? (
          <p className="text-sm text-destructive">Failed to load projects.</p>
        ) : !projectsQuery.data?.length ? (
          <p className="text-sm text-muted-foreground">No projects yet. Add one above.</p>
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
        <div className="mb-4 flex justify-end">
          <Button variant="outline" size="sm" onClick={() => setAddTicketOpen(true)} disabled={!projects.length}>
            <Plus className="mr-2 h-4 w-4" />
            Add ticket
          </Button>
        </div>
        {ticketsQuery.isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : ticketsQuery.error ? (
          <p className="text-sm text-destructive">Failed to load tickets.</p>
        ) : !ticketsQuery.data?.length ? (
          <p className="text-sm text-muted-foreground">No tickets yet. Add a project first, then add a ticket above.</p>
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

      <TabsContent value="policies" className="mt-4">
        <div className="mb-4 flex justify-end">
          <Button variant="outline" size="sm" onClick={() => setAddPolicyOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add policy
          </Button>
        </div>
        {policiesQuery.isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : policiesQuery.error ? (
          <p className="text-sm text-destructive">Failed to load policies.</p>
        ) : !policiesQuery.data?.length ? (
          <p className="text-sm text-muted-foreground">No policies yet. Add one above.</p>
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

      <AddProjectDialog open={addProjectOpen} onOpenChange={setAddProjectOpen} />
      <AddTicketDialog open={addTicketOpen} onOpenChange={setAddTicketOpen} projects={projects} />
      <AddPolicyDialog open={addPolicyOpen} onOpenChange={setAddPolicyOpen} />
    </Tabs>
  )
}
