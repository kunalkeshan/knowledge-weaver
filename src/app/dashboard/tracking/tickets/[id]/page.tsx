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
import Link from 'next/link'

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/login')

  const { id } = await params
  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: { project: true },
  })
  if (!ticket) notFound()

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
                  <BreadcrumbPage>{ticket.title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">{ticket.title}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{ticket.status}</Badge>
              <Badge variant="outline">{ticket.kind}</Badge>
              <Link
                href={`/dashboard/tracking/projects/${ticket.projectId}`}
                className="text-sm text-primary hover:underline"
              >
                {ticket.project.name}
              </Link>
            </div>
          </div>

          {ticket.description && (
            <div className="space-y-2 rounded-xl border bg-card p-4">
              <h2 className="text-sm font-semibold">Description</h2>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">{ticket.description}</p>
            </div>
          )}

          <div className="rounded-xl border bg-card p-4">
            <h2 className="text-sm font-semibold">Details</h2>
            <dl className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Created</dt>
                <dd>{new Date(ticket.createdAt).toLocaleString()}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Updated</dt>
                <dd>{new Date(ticket.updatedAt).toLocaleString()}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Project</dt>
                <dd>
                  <Link href={`/dashboard/tracking/projects/${ticket.projectId}`} className="text-primary hover:underline">
                    {ticket.project.name}
                  </Link>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
