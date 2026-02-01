/**
 * MCP server factory for Knowledge Weaver: projects, tickets, notes, policies.
 * Used by the Next.js API route at /api/mcp. Uses app Prisma (same DB as web app).
 */
import { prisma } from '@/lib/prisma'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp'
import * as z from 'zod'

export const MCP_TOOL_NAMES = [
  'list_projects',
  'get_project',
  'create_project',
  'update_project',
  'delete_project',
  'list_tickets',
  'get_ticket',
  'create_ticket',
  'update_ticket',
  'delete_ticket',
  'list_notes',
  'get_note',
  'create_note',
  'update_note',
  'delete_note',
  'list_policies',
  'get_policy',
  'create_policy',
  'update_policy',
  'delete_policy',
] as const

export function createMcpServer(): McpServer {
  const server = new McpServer(
    {
      name: 'knowledge-weaver-mcp',
      version: '1.0.0',
      description: 'MCP tools for Knowledge Weaver: projects, tickets, notes, policies (Supabase/Postgres)',
    },
    { capabilities: { logging: {} } },
  )

  // --- Projects ---
  server.registerTool(
    'list_projects',
    {
      title: 'List projects',
      description: 'List all projects (id, name, slug, status, whereHosted). Use for project/hosting questions.',
      inputSchema: {},
    },
    async () => {
      const projects = await prisma.project.findMany({
        orderBy: { name: 'asc' },
        select: { id: true, name: true, slug: true, status: true, whereHosted: true, description: true },
      })
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(projects, null, 2) }],
      }
    },
  )

  server.registerTool(
    'get_project',
    {
      title: 'Get project by ID',
      description: 'Get one project by id. Use when you need details for a specific project.',
      inputSchema: { id: z.string().describe('Project ID (cuid)') },
    },
    async ({ id }) => {
      const project = await prisma.project.findUnique({
        where: { id },
        include: { _count: { select: { tickets: true } } },
      })
      if (!project)
        return { content: [{ type: 'text' as const, text: JSON.stringify({ error: 'Project not found', id }) }] }
      return { content: [{ type: 'text' as const, text: JSON.stringify(project, null, 2) }] }
    },
  )

  server.registerTool(
    'create_project',
    {
      title: 'Create a project',
      description: 'Create a new project. Required: name, slug. Optional: description, whereHosted, status.',
      inputSchema: {
        name: z.string().describe('Project name'),
        slug: z.string().describe('URL-friendly slug (unique)'),
        description: z.string().optional().describe('Project description'),
        whereHosted: z.string().optional().describe('Where the project is hosted'),
        status: z.string().optional().describe('Status (default: active)'),
      },
    },
    async ({ name, slug, description, whereHosted, status }) => {
      try {
        const project = await prisma.project.create({
          data: {
            name,
            slug,
            description: description ?? null,
            whereHosted: whereHosted ?? null,
            status: status ?? 'active',
          },
        })
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ created: true, id: project.id, name: project.name, slug: project.slug }, null, 2),
            },
          ],
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        return { content: [{ type: 'text' as const, text: JSON.stringify({ error: msg }, null, 2) }] }
      }
    },
  )

  server.registerTool(
    'update_project',
    {
      title: 'Update a project',
      description: 'Update an existing project. Pass id and any of: name, slug, description, whereHosted, status.',
      inputSchema: {
        id: z.string().describe('Project ID (cuid)'),
        name: z.string().optional().describe('New name'),
        slug: z.string().optional().describe('New slug (unique)'),
        description: z.string().optional().describe('New description'),
        whereHosted: z.string().optional().describe('New whereHosted'),
        status: z.string().optional().describe('New status'),
      },
    },
    async (args) => {
      const { id, ...data } = args
      const clean = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined)) as Record<
        string,
        unknown
      >
      if (Object.keys(clean).length === 0)
        return {
          content: [
            { type: 'text' as const, text: JSON.stringify({ error: 'Provide at least one field to update' }, null, 2) },
          ],
        }
      try {
        const project = await prisma.project.update({
          where: { id },
          data: {
            ...(clean.name !== undefined && { name: clean.name as string }),
            ...(clean.slug !== undefined && { slug: clean.slug as string }),
            ...(clean.description !== undefined && { description: clean.description as string | null }),
            ...(clean.whereHosted !== undefined && { whereHosted: clean.whereHosted as string | null }),
            ...(clean.status !== undefined && { status: clean.status as string }),
          },
        })
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ updated: true, id: project.id, name: project.name }, null, 2),
            },
          ],
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        return { content: [{ type: 'text' as const, text: JSON.stringify({ error: msg }, null, 2) }] }
      }
    },
  )

  server.registerTool(
    'delete_project',
    {
      title: 'Delete a project',
      description: 'Delete a project by id. Tickets and notes in this project are cascade-deleted. Cannot be undone.',
      inputSchema: { id: z.string().describe('Project ID (cuid)') },
    },
    async ({ id }) => {
      try {
        await prisma.project.delete({ where: { id } })
        return { content: [{ type: 'text' as const, text: JSON.stringify({ deleted: true, id }, null, 2) }] }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        return { content: [{ type: 'text' as const, text: JSON.stringify({ error: msg }, null, 2) }] }
      }
    },
  )

  // --- Tickets ---
  server.registerTool(
    'list_tickets',
    {
      title: 'List tickets',
      description: 'List tickets, optionally filtered by projectId or status.',
      inputSchema: {
        projectId: z.string().optional().describe('Filter by project ID'),
        status: z.string().optional().describe('Filter by status (e.g. open, done)'),
      },
    },
    async (args) => {
      const tickets = await prisma.ticket.findMany({
        where: {
          ...(args.projectId ? { projectId: args.projectId } : {}),
          ...(args.status ? { status: args.status } : {}),
        },
        orderBy: { updatedAt: 'desc' },
        take: 50,
        include: { project: { select: { name: true, slug: true } } },
      })
      return { content: [{ type: 'text' as const, text: JSON.stringify(tickets, null, 2) }] }
    },
  )

  server.registerTool(
    'get_ticket',
    {
      title: 'Get ticket by ID',
      description: 'Get one ticket by id with project info.',
      inputSchema: { id: z.string().describe('Ticket ID (cuid)') },
    },
    async ({ id }) => {
      const ticket = await prisma.ticket.findUnique({
        where: { id },
        include: { project: { select: { name: true, slug: true, whereHosted: true } } },
      })
      if (!ticket)
        return { content: [{ type: 'text' as const, text: JSON.stringify({ error: 'Ticket not found', id }) }] }
      return { content: [{ type: 'text' as const, text: JSON.stringify(ticket, null, 2) }] }
    },
  )

  server.registerTool(
    'create_ticket',
    {
      title: 'Create a ticket',
      description: 'Create a new ticket in a project. Required: projectId, title. Optional: description, status, kind.',
      inputSchema: {
        projectId: z.string().describe('Project ID (cuid)'),
        title: z.string().describe('Ticket title'),
        description: z.string().optional().describe('Optional description'),
        status: z.string().optional().describe('Optional status (default: open)'),
        kind: z.string().optional().describe('Optional kind: task, bug, feature, incident (default: task)'),
      },
    },
    async ({ projectId, title, description, status, kind }) => {
      const ticket = await prisma.ticket.create({
        data: {
          projectId,
          title,
          description: description ?? null,
          status: status ?? 'open',
          kind: kind ?? 'task',
        },
      })
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({ created: true, id: ticket.id, title: ticket.title, projectId }, null, 2),
          },
        ],
      }
    },
  )

  server.registerTool(
    'update_ticket',
    {
      title: 'Update a ticket',
      description: 'Update an existing ticket. Pass id and any of: title, description, status, kind, assigneeId.',
      inputSchema: {
        id: z.string().describe('Ticket ID (cuid)'),
        title: z.string().optional().describe('New title'),
        description: z.string().optional().describe('New description'),
        status: z.string().optional().describe('New status (e.g. open, done)'),
        kind: z.string().optional().describe('New kind: task, bug, feature, incident'),
        assigneeId: z.string().optional().describe('User ID to assign (or empty to unassign)'),
      },
    },
    async (args) => {
      const { id, ...data } = args
      const clean = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined)) as Record<
        string,
        unknown
      >
      if (Object.keys(clean).length === 0)
        return {
          content: [
            { type: 'text' as const, text: JSON.stringify({ error: 'Provide at least one field to update' }, null, 2) },
          ],
        }
      try {
        const ticket = await prisma.ticket.update({
          where: { id },
          data: {
            ...(clean.title !== undefined && { title: clean.title as string }),
            ...(clean.description !== undefined && { description: clean.description as string | null }),
            ...(clean.status !== undefined && { status: clean.status as string }),
            ...(clean.kind !== undefined && { kind: clean.kind as string }),
            ...(clean.assigneeId !== undefined && { assigneeId: (clean.assigneeId as string) || null }),
          },
        })
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ updated: true, id: ticket.id, title: ticket.title }, null, 2),
            },
          ],
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        return { content: [{ type: 'text' as const, text: JSON.stringify({ error: msg }, null, 2) }] }
      }
    },
  )

  server.registerTool(
    'delete_ticket',
    {
      title: 'Delete a ticket',
      description: 'Delete a ticket by id. This cannot be undone.',
      inputSchema: { id: z.string().describe('Ticket ID (cuid)') },
    },
    async ({ id }) => {
      try {
        await prisma.ticket.delete({ where: { id } })
        return { content: [{ type: 'text' as const, text: JSON.stringify({ deleted: true, id }, null, 2) }] }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        return { content: [{ type: 'text' as const, text: JSON.stringify({ error: msg }, null, 2) }] }
      }
    },
  )

  // --- Notes ---
  server.registerTool(
    'list_notes',
    {
      title: 'List notes',
      description: 'List notes, optionally filtered by projectId or tag.',
      inputSchema: {
        projectId: z.string().optional().describe('Filter by project ID'),
        tag: z.string().optional().describe('Filter by tag'),
      },
    },
    async (args) => {
      const notes = await prisma.note.findMany({
        where: {
          ...(args.projectId ? { projectId: args.projectId } : {}),
          ...(args.tag ? { tag: args.tag } : {}),
        },
        orderBy: { updatedAt: 'desc' },
        take: 50,
        select: { id: true, title: true, tag: true, content: true, projectId: true },
      })
      return { content: [{ type: 'text' as const, text: JSON.stringify(notes, null, 2) }] }
    },
  )

  server.registerTool(
    'get_note',
    {
      title: 'Get note by ID',
      description: 'Get one note by id.',
      inputSchema: { id: z.string().describe('Note ID (cuid)') },
    },
    async ({ id }) => {
      const note = await prisma.note.findUnique({
        where: { id },
        include: { project: { select: { name: true, slug: true } } },
      })
      if (!note) return { content: [{ type: 'text' as const, text: JSON.stringify({ error: 'Note not found', id }) }] }
      return { content: [{ type: 'text' as const, text: JSON.stringify(note, null, 2) }] }
    },
  )

  server.registerTool(
    'create_note',
    {
      title: 'Create a note',
      description: 'Create a new note (title and content required). Optional: tag, projectId.',
      inputSchema: {
        title: z.string().describe('Note title'),
        content: z.string().describe('Note content'),
        tag: z.string().optional().describe('Optional tag'),
        projectId: z.string().optional().describe('Optional project ID (cuid)'),
      },
    },
    async ({ title, content, tag, projectId }) => {
      const note = await prisma.note.create({
        data: { title, content, tag: tag ?? null, projectId: projectId ?? null },
      })
      return {
        content: [
          { type: 'text' as const, text: JSON.stringify({ created: true, id: note.id, title: note.title }, null, 2) },
        ],
      }
    },
  )

  server.registerTool(
    'update_note',
    {
      title: 'Update a note',
      description: 'Update an existing note. Pass id and any of: title, content, tag, projectId.',
      inputSchema: {
        id: z.string().describe('Note ID (cuid)'),
        title: z.string().optional().describe('New title'),
        content: z.string().optional().describe('New content'),
        tag: z.string().optional().describe('New tag'),
        projectId: z.string().optional().describe('New project ID (cuid) or empty to unlink'),
      },
    },
    async (args) => {
      const { id, ...data } = args
      const clean = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined)) as Record<
        string,
        unknown
      >
      if (Object.keys(clean).length === 0)
        return {
          content: [
            { type: 'text' as const, text: JSON.stringify({ error: 'Provide at least one field to update' }, null, 2) },
          ],
        }
      try {
        const note = await prisma.note.update({
          where: { id },
          data: {
            ...(clean.title !== undefined && { title: clean.title as string }),
            ...(clean.content !== undefined && { content: clean.content as string }),
            ...(clean.tag !== undefined && { tag: clean.tag as string | null }),
            ...(clean.projectId !== undefined && { projectId: (clean.projectId as string) || null }),
          },
        })
        return {
          content: [
            { type: 'text' as const, text: JSON.stringify({ updated: true, id: note.id, title: note.title }, null, 2) },
          ],
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        return { content: [{ type: 'text' as const, text: JSON.stringify({ error: msg }, null, 2) }] }
      }
    },
  )

  server.registerTool(
    'delete_note',
    {
      title: 'Delete a note',
      description: 'Delete a note by id. This cannot be undone.',
      inputSchema: { id: z.string().describe('Note ID (cuid)') },
    },
    async ({ id }) => {
      try {
        await prisma.note.delete({ where: { id } })
        return { content: [{ type: 'text' as const, text: JSON.stringify({ deleted: true, id }, null, 2) }] }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        return { content: [{ type: 'text' as const, text: JSON.stringify({ error: msg }, null, 2) }] }
      }
    },
  )

  // --- Policies ---
  server.registerTool(
    'list_policies',
    {
      title: 'List policies',
      description: 'List policies, optionally filtered by category (hr, it, security, compliance).',
      inputSchema: {
        category: z.string().optional().describe('Filter by category: hr, it, security, compliance'),
      },
    },
    async (args) => {
      const policies = await prisma.policy.findMany({
        where: args.category ? { category: args.category } : {},
        orderBy: { effectiveAt: 'desc' },
        take: 50,
        select: { id: true, title: true, category: true, effectiveAt: true, content: true },
      })
      return { content: [{ type: 'text' as const, text: JSON.stringify(policies, null, 2) }] }
    },
  )

  server.registerTool(
    'get_policy',
    {
      title: 'Get policy by ID',
      description: 'Get one policy by id.',
      inputSchema: { id: z.string().describe('Policy ID (cuid)') },
    },
    async ({ id }) => {
      const policy = await prisma.policy.findUnique({ where: { id } })
      if (!policy)
        return { content: [{ type: 'text' as const, text: JSON.stringify({ error: 'Policy not found', id }) }] }
      return { content: [{ type: 'text' as const, text: JSON.stringify(policy, null, 2) }] }
    },
  )

  server.registerTool(
    'create_policy',
    {
      title: 'Create a policy',
      description: 'Create a new policy. Required: title, content, category (hr, it, security, compliance).',
      inputSchema: {
        title: z.string().describe('Policy title'),
        content: z.string().describe('Policy content'),
        category: z.string().describe('Category: hr, it, security, compliance'),
      },
    },
    async ({ title, content, category }) => {
      try {
        const policy = await prisma.policy.create({ data: { title, content, category } })
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(
                { created: true, id: policy.id, title: policy.title, category: policy.category },
                null,
                2,
              ),
            },
          ],
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        return { content: [{ type: 'text' as const, text: JSON.stringify({ error: msg }, null, 2) }] }
      }
    },
  )

  server.registerTool(
    'update_policy',
    {
      title: 'Update a policy',
      description: 'Update an existing policy. Pass id and any of: title, content, category.',
      inputSchema: {
        id: z.string().describe('Policy ID (cuid)'),
        title: z.string().optional().describe('New title'),
        content: z.string().optional().describe('New content'),
        category: z.string().optional().describe('New category: hr, it, security, compliance'),
      },
    },
    async (args) => {
      const { id, ...data } = args
      const clean = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined)) as Record<
        string,
        unknown
      >
      if (Object.keys(clean).length === 0)
        return {
          content: [
            { type: 'text' as const, text: JSON.stringify({ error: 'Provide at least one field to update' }, null, 2) },
          ],
        }
      try {
        const policy = await prisma.policy.update({
          where: { id },
          data: {
            ...(clean.title !== undefined && { title: clean.title as string }),
            ...(clean.content !== undefined && { content: clean.content as string }),
            ...(clean.category !== undefined && { category: clean.category as string }),
          },
        })
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ updated: true, id: policy.id, title: policy.title }, null, 2),
            },
          ],
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        return { content: [{ type: 'text' as const, text: JSON.stringify({ error: msg }, null, 2) }] }
      }
    },
  )

  server.registerTool(
    'delete_policy',
    {
      title: 'Delete a policy',
      description: 'Delete a policy by id. This cannot be undone.',
      inputSchema: { id: z.string().describe('Policy ID (cuid)') },
    },
    async ({ id }) => {
      try {
        await prisma.policy.delete({ where: { id } })
        return { content: [{ type: 'text' as const, text: JSON.stringify({ deleted: true, id }, null, 2) }] }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        return { content: [{ type: 'text' as const, text: JSON.stringify({ error: msg }, null, 2) }] }
      }
    },
  )

  return server
}
