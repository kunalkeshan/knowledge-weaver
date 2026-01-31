import { env, isWatsonConfigured } from '@/lib/config'
import type {
  IAMTokenResponse,
  WatsonAgent,
  WatsonAgentApi,
  WatsonRunsRequestBody,
  WatsonRunsStreamChunk,
} from '@/types/watson'

// watsonx Orchestrate SaaS (Profile → Settings → API Details): use this for api.dl.watson-orchestrate.ibm.com
const WATSON_SAAS_TOKEN_URL = 'https://iam.platform.saas.ibm.com/siusermgr/api/1.0/apikeys/token'
// IBM Cloud: use only for instances on IBM Cloud
const IBM_CLOUD_IAM_TOKEN_URL = 'https://iam.cloud.ibm.com/identity/token'
const TOKEN_BUFFER_SECONDS = 5 * 60 // 5 min buffer before expiry

let cachedToken: { value: string; expiresAt: number } | null = null

/** SaaS token response (access_token field) */
interface WatsonSaasTokenResponse {
  access_token?: string
  token?: string
  expires_in?: number
}

async function getWatsonSaasToken(): Promise<string> {
  const apikey = env.WATSON_CLOUD_API_KEY
  if (!apikey) throw new Error('WATSON_CLOUD_API_KEY is required for watsonx Orchestrate SaaS')

  console.log('[Watson] Fetching SaaS token from', WATSON_SAAS_TOKEN_URL)
  const res = await fetch(WATSON_SAAS_TOKEN_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ apikey }),
  })

  if (!res.ok) {
    const text = await res.text()
    console.error('[Watson] SaaS token failed', res.status, text)
    throw new Error(`Watson SaaS token failed: ${res.status} ${text}`)
  }

  const data = (await res.json()) as WatsonSaasTokenResponse
  const token = data.access_token ?? data.token
  if (!token) {
    console.error('[Watson] SaaS token response missing access_token', data)
    throw new Error('Watson SaaS token response missing access_token')
  }
  const expiresIn = data.expires_in ?? 3600
  const now = Math.floor(Date.now() / 1000)
  cachedToken = { value: token, expiresAt: now + expiresIn }
  console.log('[Watson] SaaS token obtained, expires in', expiresIn, 's')
  return token
}

async function getIbmCloudToken(): Promise<string> {
  const apikey = env.IBM_CLOUD_API_KEY
  if (!apikey) throw new Error('IBM_CLOUD_API_KEY is required for IBM Cloud IAM')

  console.log('[Watson] Fetching IBM Cloud IAM token from', IBM_CLOUD_IAM_TOKEN_URL)
  const body = new URLSearchParams({
    grant_type: 'urn:ibm:params:oauth:grant-type:apikey',
    apikey,
  })

  const res = await fetch(IBM_CLOUD_IAM_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })

  if (!res.ok) {
    const text = await res.text()
    console.error('[Watson] IBM Cloud IAM token failed', res.status, text)
    throw new Error(`IBM Cloud IAM token failed: ${res.status} ${text}`)
  }

  const data = (await res.json()) as IAMTokenResponse
  const expiresIn = data.expires_in ?? 3600
  const now = Math.floor(Date.now() / 1000)
  cachedToken = { value: data.access_token, expiresAt: now + expiresIn }
  console.log('[Watson] IBM Cloud IAM token obtained, expires in', expiresIn, 's')
  return data.access_token
}

async function getIAMToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  if (cachedToken && cachedToken.expiresAt > now + TOKEN_BUFFER_SECONDS) {
    console.log('[Watson] Using cached token, expires at', new Date(cachedToken.expiresAt * 1000).toISOString())
    return cachedToken.value
  }

  const instanceUrl = env.WATSON_INSTANCE_API_URL ?? ''
  const isSaasInstance =
    instanceUrl.includes('dl.watson-orchestrate.ibm.com') || instanceUrl.includes('watson-orchestrate.ibm.com')

  console.log('[Watson] getIAMToken: instanceUrl=', instanceUrl, 'isSaasInstance=', isSaasInstance)

  if (isSaasInstance && env.WATSON_CLOUD_API_KEY) {
    console.log('[Watson] Using Watson SaaS token path')
    return getWatsonSaasToken()
  }
  if (env.IBM_CLOUD_API_KEY) {
    console.log('[Watson] Using IBM Cloud IAM token path')
    return getIbmCloudToken()
  }
  if (env.WATSON_CLOUD_API_KEY) {
    console.log('[Watson] Using Watson SaaS token path (fallback)')
    return getWatsonSaasToken()
  }
  console.error('[Watson] No API key configured for token')
  throw new Error(
    'Set WATSON_CLOUD_API_KEY (for watsonx Orchestrate SaaS) or IBM_CLOUD_API_KEY (for IBM Cloud instance). See Profile → Settings → API Details for the API key.',
  )
}

export async function getWatsonAuthHeaders(): Promise<Record<string, string>> {
  if (!isWatsonConfigured()) {
    console.error('[Watson] getWatsonAuthHeaders: not configured')
    throw new Error('Watson is not configured (missing API key or instance URL)')
  }
  const token = await getIAMToken()
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
  }
  const watsonKey = env.WATSON_CLOUD_API_KEY
  if (watsonKey) {
    headers['IAM-API_KEY'] = watsonKey
  }
  console.log('[Watson] Auth headers ready (Bearer +', watsonKey ? 'IAM-API_KEY' : 'no IAM-API_KEY', ')')
  return headers
}

export async function listWatsonAgents(): Promise<WatsonAgent[]> {
  const baseUrl = env.WATSON_INSTANCE_API_URL?.replace(/\/$/, '')
  if (!baseUrl) throw new Error('WATSON_INSTANCE_API_URL is not set')
  const url = `${baseUrl}/v1/orchestrate/agents`
  console.log('[Watson] listWatsonAgents: GET', url)
  const headers = await getWatsonAuthHeaders()
  const res = await fetch(url, { headers })
  if (!res.ok) {
    const text = await res.text()
    console.error('[Watson] listWatsonAgents failed', res.status, text)
    throw new Error(`List agents failed: ${res.status} ${text}`)
  }
  const data = (await res.json()) as WatsonAgentApi[] | { agents?: WatsonAgentApi[] }
  const rawList = Array.isArray(data) ? data : data.agents ?? []
  const agents: WatsonAgent[] = rawList.map((item) => ({
    agent_id: item.id,
    name: item.display_name ?? item.name,
    description: item.description,
  }))
  console.log(
    '[Watson] listWatsonAgents: got',
    agents.length,
    'agents',
    agents.map((a) => ({ agent_id: a.agent_id, name: a.name }))
  )
  return agents
}

export async function getWatsonAgent(agentId: string): Promise<WatsonAgent | null> {
  const agents = await listWatsonAgents()
  return agents.find((a) => a.agent_id === agentId) ?? null
}

/**
 * Stream a chat run from Watson Orchestrate and yield TanStack AI–compatible SSE content chunks.
 * Yields { type: 'content', content: string } for each text delta and { type: 'done' } at end.
 */
export async function* streamWatsonChat(
  body: WatsonRunsRequestBody,
): AsyncGenerator<{ type: 'content'; content: string } | { type: 'done'; threadId?: string }> {
  const baseUrl = env.WATSON_INSTANCE_API_URL?.replace(/\/$/, '')
  if (!baseUrl) throw new Error('WATSON_INSTANCE_API_URL is not set')
  const url = `${baseUrl}/v1/orchestrate/runs?stream=true&stream_timeout=120000&multiple_content=true`
  console.log('[Watson] streamWatsonChat: POST', url, { agent_id: body.agent_id, thread_id: body.thread_id })
  const headers = await getWatsonAuthHeaders()
  headers['Content-Type'] = 'application/json'

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text()
    console.error('[Watson] streamWatsonChat failed', res.status, text)
    throw new Error(`Watson runs failed: ${res.status} ${text}`)
  }
  console.log('[Watson] streamWatsonChat: stream started', res.status)

  const reader = res.body?.getReader()
  if (!reader) throw new Error('No response body')

  const decoder = new TextDecoder()
  let buffer = ''
  let threadId: string | undefined
  let chunkCount = 0
  const DEBUG_CHUNKS = 5
  let readCount = 0
  let totalBytes = 0

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        console.log('[Watson] streamWatsonChat: stream ended. totalBytes=', totalBytes, 'buffer length=', buffer.length, 'buffer sample=', JSON.stringify(buffer.slice(0, 400)))
        break
      }
      readCount++
      const chunk = decoder.decode(value, { stream: true })
      totalBytes += value.length
      buffer += chunk
      if (readCount <= 2) {
        console.log('[Watson] streamWatsonChat read', readCount, 'bytes=', value.length, 'sample=', JSON.stringify(chunk.slice(0, 300)))
      }
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''
      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed) continue
        if (chunkCount < 2 && !line.startsWith('data: ')) {
          console.log('[Watson] streamWatsonChat non-data line:', JSON.stringify(line.slice(0, 120)))
        }
        const raw = line.startsWith('data: ') ? line.slice(6).trim() : trimmed.startsWith('{') ? trimmed : ''
        if (!raw || raw === '[DONE]') continue
        try {
          const chunk = JSON.parse(raw) as WatsonRunsStreamChunk
            chunkCount++
            if (chunkCount <= DEBUG_CHUNKS) {
              console.log('[Watson] streamWatsonChat chunk', chunkCount, {
                event: chunk.event,
                dataKeys: chunk.data ? Object.keys(chunk.data) : [],
                hasContent: !!chunk.content,
                thread_id: chunk.thread_id ?? chunk.data?.thread_id,
              })
            }

            threadId = chunk.thread_id ?? chunk.data?.thread_id ?? threadId

            const event = chunk.event
            const data = chunk.data

            function extractText(value: unknown): string {
              if (typeof value === 'string') return value
              if (value == null) return ''
              if (Array.isArray(value)) {
                return (value as Array<{ type?: string; response_type?: string; text?: string; content?: string }>)
                  .map((p) => {
                    if (!p) return ''
                    const isText = p.type === 'text' || p.response_type === 'text'
                    return isText ? (p.text ?? p.content ?? '') : ''
                  })
                  .join('')
              }
              if (typeof value === 'object') {
                const o = value as Record<string, unknown>
                if ('text' in o && typeof o.text === 'string') return o.text
                if ('content' in o) return extractText(o.content)
                if ('delta' in o) return extractText(o.delta)
              }
              return ''
            }

            // Only forward actual assistant message content (message.delta / message.completed).
            // run.step.intermediate and run.step.thinking are not forwarded so the UI can show
            // a thinking animation instead of "The agent is processing your request…" text.
            if (event === 'message.delta' && data) {
              const delta = extractText(data.delta) || extractText(data.content) || extractText(data.text)
              if (chunkCount <= DEBUG_CHUNKS && 'delta' in data)
                console.log('[Watson] message.delta data.delta type=', typeof data.delta, 'value=', JSON.stringify(data.delta)?.slice(0, 120))
              if (delta) yield { type: 'content', content: delta }
            } else if (event === 'message.completed' && data) {
              const content = extractText(data.content) || extractText(data.text)
              if (content) yield { type: 'content', content }
            }
            // run.step.delta, run.step.intermediate, run.step.thinking: not yielded as content

            const content = chunk.content
            if (Array.isArray(content)) {
              for (const part of content) {
                if (part?.type === 'text') {
                  const text = part.text ?? part.content
                  if (typeof text === 'string') yield { type: 'content', content: text }
                }
              }
            } else if (data && !event) {
              const dataContent =
                typeof data.content === 'string'
                  ? data.content
                  : typeof data.delta === 'string'
                    ? data.delta
                    : typeof data.text === 'string'
                      ? data.text
                      : ''
              if (dataContent) yield { type: 'content', content: dataContent }
            }
          } catch (parseErr) {
            if (chunkCount <= DEBUG_CHUNKS) {
              console.warn('[Watson] streamWatsonChat parse error', raw?.slice(0, 100), parseErr)
            }
          }
      }
    }
  } finally {
    reader.releaseLock()
  }

  console.log('[Watson] streamWatsonChat: done', chunkCount, 'chunks', threadId ? { threadId } : '')
  yield { type: 'done', threadId }
}
