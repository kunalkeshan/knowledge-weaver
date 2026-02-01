import { prisma } from '@/lib/prisma'
import type { FileLike } from '@/lib/watson'
import {
  addDocumentsToKnowledgeBase,
  deleteKnowledgeBaseDocuments,
  getWatsonAgentFull,
  getWatsonKnowledgeBaseStatus,
  listWatsonAgents,
} from '@/lib/watson'

/**
 * Which DB entities to sync to each agent's knowledge base (by display name).
 * Each agent has one KB; this controls what content (projects, tickets, notes, policies) is pushed into it.
 * Policies use category filter: 'hr' | 'it' | 'security' | 'compliance' etc.
 */
const AGENT_SYNC_MAP: Record<string, { projects?: boolean; tickets?: boolean; notes?: boolean; policies?: string[] }> =
  {
    'Onboarding Assistant': { notes: true, policies: ['hr', 'it'] },
    'Project & Hosting Assistant': { projects: true, tickets: true, notes: true },
    'IT Support & Access': { notes: true, policies: ['it'] },
    'HR Policy Assistant': { policies: ['hr'] },
    'Process & How-To Assistant': { notes: true },
    'Security & Compliance': { policies: ['security', 'compliance'] },
    'Incident & Troubleshooting': { notes: true, tickets: true },
    'Manager & Team Lead': { notes: true, policies: ['hr', 'it'] },
    'Knowledge & Learning': { projects: true, notes: true },
    // Response Verifier: optional context; it mainly reviews other agents' answers
    'Response Verifier': { policies: ['security', 'compliance'] },
  }

const SYNC_DOC_PREFIX = 'sync-db-'

function textToFileLike(text: string, name: string): FileLike {
  const buffer = new TextEncoder().encode(text)
  return {
    buffer: buffer.buffer,
    name,
    type: 'text/plain',
  }
}

export async function buildSyncDocForAgent(config: {
  projects?: boolean
  tickets?: boolean
  notes?: boolean
  policies?: string[]
}): Promise<string> {
  const parts: string[] = []

  if (config.projects) {
    const projects = await prisma.project.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { tickets: true } } },
    })
    for (const p of projects) {
      parts.push(
        `## Project: ${p.name}\nSlug: ${p.slug}\nStatus: ${p.status}\nDescription: ${p.description ?? '—'}\nWhere hosted: ${p.whereHosted ?? '—'}\nTickets: ${p._count.tickets}\n`,
      )
    }
  }

  if (config.tickets) {
    const tickets = await prisma.ticket.findMany({
      orderBy: { updatedAt: 'desc' },
      include: { project: { select: { name: true } } },
    })
    for (const t of tickets) {
      parts.push(
        `## Ticket: ${t.title}\nProject: ${t.project.name}\nStatus: ${t.status}\nKind: ${t.kind}\nDescription: ${t.description ?? '—'}\n`,
      )
    }
  }

  if (config.notes) {
    const notes = await prisma.note.findMany({
      orderBy: { updatedAt: 'desc' },
      include: { project: { select: { name: true } } },
    })
    for (const n of notes) {
      parts.push(
        `## Note: ${n.title}\nTag: ${n.tag ?? '—'}\nProject: ${n.project?.name ?? '—'}\nContent:\n${n.content}\n`,
      )
    }
  }

  if (config.policies?.length) {
    const policies = await prisma.policy.findMany({
      where: { category: { in: config.policies } },
      orderBy: { effectiveAt: 'desc' },
    })
    for (const p of policies) {
      parts.push(
        `## Policy: ${p.title}\nCategory: ${p.category}\nEffective: ${p.effectiveAt}\nContent:\n${p.content}\n`,
      )
    }
  }

  return parts.length ? parts.join('\n---\n\n') : ''
}

export interface SyncToWatsonResult {
  ok: boolean
  synced: { agentName: string; kbId: string; docName: string }[]
  errors: { agentName?: string; error: string }[]
}

export async function runSyncToWatson(): Promise<SyncToWatsonResult> {
  const synced: SyncToWatsonResult['synced'] = []
  const errors: SyncToWatsonResult['errors'] = []
  const agents = await listWatsonAgents()

  for (const agent of agents) {
    const name = (agent.name as string) ?? ''
    const config = AGENT_SYNC_MAP[name]
    if (!config) continue

    const full = await getWatsonAgentFull(agent.agent_id)
    if (!full?.knowledge_base?.length) {
      errors.push({ agentName: name, error: 'No knowledge base linked' })
      continue
    }
    const kbId = full.knowledge_base[0]

    try {
      const text = await buildSyncDocForAgent(config)
      if (!text.trim()) continue

      const docName = `${SYNC_DOC_PREFIX}${Date.now()}-${name.replace(/\s+/g, '-')}.txt`
      const file = textToFileLike(text, docName)

      const status = await getWatsonKnowledgeBaseStatus(kbId)
      const toDelete = (status?.documents ?? [])
        .map((d) => d.name ?? d.id)
        .filter((n): n is string => typeof n === 'string' && n.startsWith(SYNC_DOC_PREFIX))
      if (toDelete.length > 0) {
        await deleteKnowledgeBaseDocuments(kbId, toDelete)
      }

      await addDocumentsToKnowledgeBase(kbId, [file])
      synced.push({ agentName: name, kbId, docName })
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e)
      errors.push({ agentName: name, error: message })
    }
  }

  return { ok: errors.length === 0, synced, errors }
}
