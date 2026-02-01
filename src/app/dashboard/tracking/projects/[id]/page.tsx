import { headers } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SidebarLeft } from '@/components/dashboard/sidebar-left'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Badge } from '@/components/ui/badge'
import { ProjectNotesSection } from '@/components/tracking/project-notes-section'
import Link from 'next/link'

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/login')

  const { id } = await params
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      _count: { select: { tickets: true } },
      tickets: { orderBy: { updatedAt: 'desc' }, take: 50 },
    },
  })
  if (!project) notFound()

  return (
    <SidebarProvider>
      <SidebarLeft />
      <SidebarInset>
        <header className="sticky top-0 flex h-14 shrink-0 items-center gap-2 bg-background">
          <div className="flex flex-1 items-center gap-2 px-3">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/dashboard/tracking">Tracking</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{project.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">{project.name}</h1>
              <Badge variant="secondary">{project.status}</Badge>
            </div>
            <p className="text-muted-foreground">{project.slug}</p>
          </div>

          {(project.description || project.whereHosted) && (
            <div className="space-y-2 rounded-xl border bg-card p-4">
              <h2 className="text-sm font-semibold">Details</h2>
              {project.description && (
                <p className="text-sm text-muted-foreground">{project.description}</p>
              )}
              {project.whereHosted && (
                <div className="mt-2">
                  <span className="text-xs font-medium text-muted-foreground">Where hosted</span>
                  <p className="mt-0.5 whitespace-pre-wrap text-sm">{project.whereHosted}</p>
                </div>
              )}
            </div>
          )}

          <div className="rounded-xl border bg-card p-4 max-w-xs">
            <h2 className="text-sm font-semibold">Tickets</h2>
            <p className="mt-1 text-2xl font-semibold">{project._count.tickets}</p>
            <Link
              href={`/dashboard/tracking?tab=tickets&projectId=${project.id}`}
              className="mt-2 text-sm text-primary hover:underline"
            >
              View all
            </Link>
          </div>

          {project.tickets.length > 0 && (
            <div className="space-y-2 rounded-xl border bg-card p-4">
              <h2 className="text-sm font-semibold">Recent tickets</h2>
              <ul className="space-y-2">
                {project.tickets.map((t) => (
                  <li key={t.id}>
                    <Link
                      href={`/dashboard/tracking/tickets/${t.id}`}
                      className="flex items-center justify-between rounded-lg border bg-background px-3 py-2 text-sm hover:bg-muted/50"
                    >
                      <span className="font-medium">{t.title}</span>
                      <Badge variant={t.status === 'done' ? 'secondary' : 'default'}>{t.status}</Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <ProjectNotesSection projectId={project.id} projectName={project.name} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
