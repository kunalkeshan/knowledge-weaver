import { z } from 'zod'

const envSchema = z.object({
  IBM_CLOUD_API_KEY: z.string().optional(),
  WATSON_CLOUD_API_KEY: z.string().optional(),
  WATSON_INSTANCE_API_URL: z.string().url().optional(),
  /** Optional: override default LLM for agents. If unset, first model from list-models API is used. */
  WATSON_AGENT_LLM: z.string().optional(),
  /** Optional: AskOrchestrate (orchestrator) agent ID. If set, Ask page sends users to this agent. If unset, resolved by display name "AskOrchestrate" when possible. */
  WATSON_ORCHESTRATOR_AGENT_ID: z.string().optional(),
})

export type Env = z.infer<typeof envSchema>

function validateEnv(): Env {
  const parsed = envSchema.safeParse({
    IBM_CLOUD_API_KEY: process.env.IBM_CLOUD_API_KEY,
    WATSON_CLOUD_API_KEY: process.env.WATSON_CLOUD_API_KEY,
    WATSON_INSTANCE_API_URL: process.env.WATSON_INSTANCE_API_URL,
    WATSON_AGENT_LLM: process.env.WATSON_AGENT_LLM,
    WATSON_ORCHESTRATOR_AGENT_ID: process.env.WATSON_ORCHESTRATOR_AGENT_ID,
  })
  if (!parsed.success) {
    console.warn('Watson env validation:', parsed.error.flatten())
  }
  return (parsed.success ? parsed.data : {}) as Env
}

export const env = validateEnv()

function maskKey(key: string | undefined): string {
  if (!key) return '(not set)'
  if (key.length <= 8) return '***'
  return `${key.slice(0, 4)}...${key.slice(-4)}`
}

export function isWatsonConfigured(): boolean {
  return Boolean(
    (env.IBM_CLOUD_API_KEY || env.WATSON_CLOUD_API_KEY) &&
      env.WATSON_INSTANCE_API_URL
  )
}

if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'test') {
  console.log('[Watson config]', {
    IBM_CLOUD_API_KEY: maskKey(env.IBM_CLOUD_API_KEY),
    WATSON_CLOUD_API_KEY: maskKey(env.WATSON_CLOUD_API_KEY),
    WATSON_INSTANCE_API_URL: env.WATSON_INSTANCE_API_URL ?? '(not set)',
    isWatsonConfigured: isWatsonConfigured(),
  })
}
