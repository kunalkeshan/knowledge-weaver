/**
 * Seed Watson agents via Watson X Orchestrate API only (no Prisma/database).
 * Uses: POST /v1/orchestrate/agents (Register a new agent)
 * @see https://developer.ibm.com/apis/catalog/watsonorchestrate--custom-assistants/api/API--watsonorchestrate--agentic-experience#Register_a_new_agent__v1_orchestrate_agents_post
 * @see https://developer.watson-orchestrate.ibm.com/apis/agents/register-a-new-agent
 */
import { isWatsonConfigured } from '@/lib/config'
import { createWatsonAgent, createWatsonKnowledgeBase, listWatsonKnowledgeBases } from '@/lib/watson'
import { NextResponse } from 'next/server'

/** Watson API requires name: start with a letter, only alphanumeric and underscores (no hyphens). */
const AGENT_DEFINITIONS = [
  {
    name: 'onboarding_assistant',
    displayName: 'Onboarding Assistant',
    kbName: 'KB - Onboarding',
    description: 'Helps new hires with first-week setup, HR and IT onboarding steps, and where to find resources.',
    instructions:
      'You are an onboarding assistant. Answer only from the linked knowledge base. Cover Day-1 / Week-1 / Month-1 topics: accounts, access, tools, team intro, and company resources. Be concise and point to specific docs or steps.',
  },
  {
    name: 'project_hosting_assistant',
    displayName: 'Project & Hosting Assistant',
    kbName: 'KB - Projects & Tickets',
    description: 'Answers where projects and services are hosted, and summarizes project and ticket context.',
    instructions:
      'You are a project and hosting assistant. Use only the linked knowledge base (projects, tickets, notes). Answer where repos, apps, and docs are hosted; summarize project status and recent tickets. Cite sources when possible.',
  },
  {
    name: 'it_support_access',
    displayName: 'IT Support & Access',
    kbName: 'KB - IT Support',
    description: 'Handles IT questions, access requests, VPN, repos, and dev environment issues.',
    instructions:
      'You are an IT support assistant. Use only the linked knowledge base. Answer how to get VPN, repo access, and fix common dev environment issues. Follow runbooks and escalation steps. Do not grant access; direct users to the right process.',
  },
  {
    name: 'hr_policy_assistant',
    displayName: 'HR Policy Assistant',
    kbName: 'KB - HR Policy',
    description: 'Answers company HR policies, regulations, and leave/benefits questions.',
    instructions:
      'You are an HR policy assistant. Use only the linked knowledge base. Answer policy and regulation questions accurately. If unsure, say so and point to the right contact. Do not make up policies.',
  },
  {
    name: 'process_howto_assistant',
    displayName: 'Process & How-To Assistant',
    kbName: 'KB - Process How-To',
    description: 'Answers "how do I" questions: deployment, access requests, escalation, and internal processes.',
    instructions:
      'You are a process and how-to assistant. Use only the linked knowledge base. Give step-by-step, grounded answers with citations. Do not invent steps.',
  },
  {
    name: 'security_compliance_assistant',
    displayName: 'Security & Compliance',
    kbName: 'KB - Security & Compliance',
    description:
      'Handles security and compliance questions (PII, approvals, production access). High-risk: answers are verified by another agent.',
    instructions:
      'You are a security and compliance assistant. Use only the linked knowledge base. Answer PII handling, approval requirements, and production access rules. Be precise; when in doubt, direct to security or compliance team.',
  },
  {
    name: 'incident_troubleshooting_assistant',
    displayName: 'Incident & Troubleshooting',
    kbName: 'KB - Incident & Troubleshooting',
    description: 'Helps with incidents, runbooks, postmortems, and escalation.',
    instructions:
      'You are an incident and troubleshooting assistant. Use only the linked knowledge base. Provide runbook steps, escalation paths, and past postmortem context. Urgent queries: prioritize clarity and next steps.',
  },
  {
    name: 'manager_team_lead_assistant',
    displayName: 'Manager & Team Lead',
    kbName: 'KB - Manager & Team Lead',
    description: 'Supports managers: contractor onboarding, new hire access, repo admin, and team procedures.',
    instructions:
      'You are a manager and team lead assistant. Use only the linked knowledge base. Answer onboarding checklists, access approval steps, and repo/admin procedures. Emphasize governance and approval flows.',
  },
  {
    name: 'knowledge_learning_assistant',
    displayName: 'Knowledge & Learning',
    kbName: 'KB - Knowledge & Learning',
    description: 'Learning paths, docs, and project overviews for juniors and cross-functional teams.',
    instructions:
      'You are a knowledge and learning assistant. Use only the linked knowledge base. Provide structured learning paths and doc overviews. Tailor depth to the question (overview vs detail).',
  },
  {
    name: 'response_verifier',
    displayName: 'Response Verifier',
    kbName: 'KB - Response Verifier',
    description:
      "Reviews another agent's answer for accuracy and compliance (used automatically for high-risk intents).",
    instructions:
      "You are a response verifier. You will be given: (1) the user's question, (2) another agent's answer. Respond with VERIFIED if the answer is accurate and compliant, or with a short correction/summary if not. Be concise.",
  },
]

async function runSeed() {
  const results: { agent_id: string; name?: string; kb_id?: string; kb_name: string }[] = []
  const errors: { name: string; error: string }[] = []

  // List existing KBs so we can link by name when KB create is forbidden (403) or fails
  let existingKBs: { id: string; name: string }[] = []
  try {
    const list = await listWatsonKnowledgeBases()
    existingKBs = list.map((k) => ({ id: k.id, name: k.name }))
  } catch {
    // ignore; we'll try to create KBs or create agents with empty knowledge_base
  }

  for (const def of AGENT_DEFINITIONS) {
    try {
      let kbId: string | undefined = existingKBs.find((k) => k.name === def.kbName)?.id
      if (!kbId) {
        try {
          const kb = await createWatsonKnowledgeBase(def.kbName, [], def.description)
          kbId = kb.id
        } catch (kbErr) {
          // KB create may be 403 Forbidden on this instance; create agent without KB
          console.warn('[seed-watson-agents] KB create failed for', def.kbName, kbErr)
        }
      }
      const agent = await createWatsonAgent({
        description: def.description,
        style: 'default',
        name: def.name,
        display_name: def.displayName,
        instructions: def.instructions,
        knowledge_base: kbId ? [kbId] : [],
      })
      results.push({
        agent_id: agent.agent_id,
        name: agent.name,
        kb_id: kbId,
        kb_name: def.kbName,
      })
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e)
      errors.push({ name: def.name, error: message })
      console.error('[seed-watson-agents] Failed for', def.name, e)
    }
  }

  return NextResponse.json({
    created: results.length,
    errors: errors.length,
    agents: results,
    errorDetails: errors,
  })
}

/** GET and POST both run the seed (temporary: so opening the URL in browser works). */
export async function GET() {
  if (!isWatsonConfigured()) {
    return NextResponse.json({ error: 'Watson not configured' }, { status: 503 })
  }
  return runSeed()
}

export async function POST() {
  if (!isWatsonConfigured()) {
    return NextResponse.json({ error: 'Watson not configured' }, { status: 503 })
  }
  return runSeed()
}
