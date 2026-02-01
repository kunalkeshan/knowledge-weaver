import { listWatsonAgents } from '@/lib/watson'

export interface TriageResult {
  agentId: string
  agentName?: string
  isHighRisk?: boolean
}

/** Response Verifier is never a chat destination; it runs at Watson X (or in-app) to verify other agents' answers. */
const RESPONSE_VERIFIER_DISPLAY_NAME = 'Response Verifier'

/** Keyword rules: phrase (lower) -> { agentDisplayName, isHighRisk? }. Order = priority. Never route to Response Verifier. */
const TRIAGE_RULES: { keywords: string[]; agentName: string; isHighRisk?: boolean }[] = [
  { keywords: ['security', 'compliance', 'pii', 'production access', 'audit'], agentName: 'Security & Compliance', isHighRisk: true },
  { keywords: ['incident', 'outage', 'down', 'troubleshoot', 'runbook'], agentName: 'Incident & Troubleshooting' },
  {
    keywords: [
      'onboard',
      'onboarding',
      'new hire',
      'new here',
      'just joined',
      'new employee',
      'first week',
      'day 1',
      'what do i need to know',
      'getting started',
      'i am new',
    ],
    agentName: 'Onboarding Assistant',
  },
  { keywords: ['vpn', 'access', 'repo', 'it support', 'laptop', 'device'], agentName: 'IT Support & Access' },
  { keywords: ['policy', 'hr', 'pto', 'leave', 'remote work', 'code of conduct'], agentName: 'HR Policy Assistant' },
  { keywords: ['project', 'hosted', 'repo', 'where is', 'staging', 'deploy'], agentName: 'Project & Hosting Assistant' },
  { keywords: ['how do i', 'process', 'how to', 'procedure', 'escalat'], agentName: 'Process & How-To Assistant' },
  { keywords: ['manager', 'team lead', 'contractor', 'approval'], agentName: 'Manager & Team Lead' },
  { keywords: ['learn', 'documentation', 'learning path', 'overview'], agentName: 'Knowledge & Learning' },
]

export async function triageMessage(message: string): Promise<TriageResult | null> {
  const agents = await listWatsonAgents()
  const chatAgents = agents.filter((a) => (a.name as string) !== RESPONSE_VERIFIER_DISPLAY_NAME)
  if (!chatAgents.length) return null

  const lower = message.toLowerCase().trim()
  for (const rule of TRIAGE_RULES) {
    const match = rule.keywords.some((k) => lower.includes(k))
    if (!match) continue
    const agent = chatAgents.find((a) => (a.name as string) === rule.agentName)
    if (agent) {
      return {
        agentId: agent.agent_id,
        agentName: agent.name as string,
        isHighRisk: rule.isHighRisk,
      }
    }
  }

  const first = chatAgents[0]
  return {
    agentId: first.agent_id,
    agentName: first.name as string,
  }
}
