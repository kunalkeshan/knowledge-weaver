import { env, isWatsonConfigured } from '@/lib/config'
import type {
  IAMTokenResponse,
  WatsonAgent,
  WatsonAgentApi,
  WatsonAgentCreateBody,
  WatsonAgentFull,
  WatsonKnowledgeBase,
  WatsonKnowledgeBaseStatusResponse,
  WatsonRunsRequestBody,
  WatsonRunsStreamChunk,
  WatsonStreamSource,
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
  const rawList = Array.isArray(data) ? data : (data.agents ?? [])
  const agents: WatsonAgent[] = rawList.map((item) => ({
    agent_id: item.id,
    name: item.display_name ?? item.name,
    description: item.description,
  }))
  console.log(
    '[Watson] listWatsonAgents: got',
    agents.length,
    'agents',
    agents.map((a) => ({ agent_id: a.agent_id, name: a.name })),
  )
  return agents
}

export async function getWatsonAgent(agentId: string): Promise<WatsonAgent | null> {
  const agents = await listWatsonAgents()
  return agents.find((a) => a.agent_id === agentId) ?? null
}

/** Orchestrator (AskOrchestrate) agent ID for the Ask page. Uses env WATSON_ORCHESTRATOR_AGENT_ID if set, else resolves by display name "AskOrchestrate". */
export async function getOrchestratorAgentId(): Promise<string | null> {
  if (env.WATSON_ORCHESTRATOR_AGENT_ID) return env.WATSON_ORCHESTRATOR_AGENT_ID
  if (!isWatsonConfigured()) return null
  const agents = await listWatsonAgents()
  const orchestrator = agents.find((a) => (a.name as string) === 'AskOrchestrate')
  return orchestrator?.agent_id ?? null
}

/**
 * Create agent — POST /v1/orchestrate/agents (official API).
 * Registers a new agent. Applies to: AWS, IBM Cloud, On-premises.
 * SaaS URL: https://api.{hostname}/instances/{tenant_id}/v1/orchestrate/agents
 * Security: Bearer token. Headers: Content-Type application/json, Accept application/json.
 * Request model: name, display_name, description, instructions, tools, llm, style, knowledge_base, hidden, tags (and optional fields per spec).
 * @see https://developer.ibm.com/apis/catalog/watsonorchestrate--custom-assistants/api/API--watsonorchestrate--agentic-experience#Register_a_new_agent__v1_orchestrate_agents_post
 */
export async function createWatsonAgent(params: WatsonAgentCreateBody): Promise<WatsonAgentFull> {
  const baseUrl = env.WATSON_INSTANCE_API_URL?.replace(/\/$/, '')
  if (!baseUrl) throw new Error('WATSON_INSTANCE_API_URL is not set')
  const url = `${baseUrl}/v1/orchestrate/agents`
  console.log('[Watson] createWatsonAgent: POST', url, { name: params.name, display_name: params.display_name })
  const headers = await getWatsonAuthHeaders()
  headers['Content-Type'] = 'application/json'
  headers['Accept'] = 'application/json'
  const llm = await getDefaultLlm(params.llm)
  const body: Record<string, unknown> = {
    name: params.name ?? null,
    display_name: params.display_name ?? null,
    description: params.description,
    instructions: params.instructions ?? null,
    tools: params.tools ?? [],
    llm,
    style: params.style ?? 'default',
    knowledge_base: params.knowledge_base ?? [],
    hidden: params.hidden ?? false,
    tags: params.tags ?? [],
  }
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text()
    console.error('[Watson] createWatsonAgent failed', res.status, text)
    throw new Error(`Create agent failed: ${res.status} ${text}`)
  }
  const data = (await res.json()) as WatsonAgentApi
  const full: WatsonAgentFull = {
    agent_id: data.id,
    name: data.display_name ?? data.name,
    description: data.description,
    knowledge_base: data.knowledge_base ?? [],
    tenant_id: data.tenant_id,
    instructions: data.instructions,
    tools: data.tools,
    llm: data.llm,
    created_on: data.created_on,
    updated_at: data.updated_at,
  }
  console.log('[Watson] createWatsonAgent: created', full.agent_id, full.name)
  return full
}

/**
 * Get full agent details including knowledge_base array
 */
export async function getWatsonAgentFull(agentId: string): Promise<WatsonAgentFull | null> {
  const baseUrl = env.WATSON_INSTANCE_API_URL?.replace(/\/$/, '')
  if (!baseUrl) throw new Error('WATSON_INSTANCE_API_URL is not set')
  const url = `${baseUrl}/v1/orchestrate/agents/${agentId}`
  console.log('[Watson] getWatsonAgentFull: GET', url)
  const headers = await getWatsonAuthHeaders()
  const res = await fetch(url, { headers })
  if (!res.ok) {
    if (res.status === 404) return null
    const text = await res.text()
    console.error('[Watson] getWatsonAgentFull failed', res.status, text)
    throw new Error(`Get agent failed: ${res.status} ${text}`)
  }
  const data = (await res.json()) as WatsonAgentApi
  return {
    agent_id: data.id,
    name: data.display_name ?? data.name,
    description: data.description,
    knowledge_base: data.knowledge_base ?? [],
    tenant_id: data.tenant_id,
    instructions: data.instructions,
    tools: data.tools,
    llm: data.llm,
    created_on: data.created_on,
    updated_at: data.updated_at,
  }
}

/**
 * Update agent (e.g., to modify knowledge_base array)
 */
export async function updateWatsonAgent(
  agentId: string,
  data: { knowledge_base?: string[]; name?: string; description?: string; instructions?: string },
): Promise<WatsonAgentFull> {
  const baseUrl = env.WATSON_INSTANCE_API_URL?.replace(/\/$/, '')
  if (!baseUrl) throw new Error('WATSON_INSTANCE_API_URL is not set')
  const url = `${baseUrl}/v1/orchestrate/agents/${agentId}`
  console.log('[Watson] updateWatsonAgent: PATCH', url, data)
  const headers = await getWatsonAuthHeaders()
  headers['Content-Type'] = 'application/json'
  const res = await fetch(url, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const text = await res.text()
    console.error('[Watson] updateWatsonAgent failed', res.status, text)
    throw new Error(`Update agent failed: ${res.status} ${text}`)
  }
  const text = await res.text()
  if (text && text.trim()) {
    try {
      const result = JSON.parse(text) as WatsonAgentApi
      return {
        agent_id: result.id,
        name: result.display_name ?? result.name,
        description: result.description,
        knowledge_base: result.knowledge_base ?? [],
        tenant_id: result.tenant_id,
        instructions: result.instructions,
        tools: result.tools,
        llm: result.llm,
        created_on: result.created_on,
        updated_at: result.updated_at,
      }
    } catch {
      // fall through to re-fetch
    }
  }
  // PATCH succeeded but body empty or not JSON (e.g. 204 No Content) — re-fetch agent
  const full = await getWatsonAgentFull(agentId)
  if (!full) throw new Error(`Update agent succeeded but re-fetch failed for agent ${agentId}`)
  return full
}

/**
 * List all knowledge bases
 */
export async function listWatsonKnowledgeBases(): Promise<WatsonKnowledgeBase[]> {
  const baseUrl = env.WATSON_INSTANCE_API_URL?.replace(/\/$/, '')
  if (!baseUrl) throw new Error('WATSON_INSTANCE_API_URL is not set')
  const url = `${baseUrl}/v1/orchestrate/knowledge-bases`
  console.log('[Watson] listWatsonKnowledgeBases: GET', url)
  const headers = await getWatsonAuthHeaders()
  const res = await fetch(url, { headers })
  if (!res.ok) {
    const text = await res.text()
    console.error('[Watson] listWatsonKnowledgeBases failed', res.status, text)
    throw new Error(`List knowledge bases failed: ${res.status} ${text}`)
  }
  const data = (await res.json()) as WatsonKnowledgeBase[] | { knowledge_bases?: WatsonKnowledgeBase[] }
  return Array.isArray(data) ? data : (data.knowledge_bases ?? [])
}

/** Model from GET /v1/orchestrate/models (or list-models API) */
export interface WatsonModel {
  id: string
  label?: string
  type?: string
  [key: string]: unknown
}

/**
 * List available LLM models for the instance (used to pick default llm when creating agents).
 * @see https://developer.watson-orchestrate.ibm.com/apis/models/list-models
 */
export async function listWatsonModels(): Promise<WatsonModel[]> {
  const baseUrl = env.WATSON_INSTANCE_API_URL?.replace(/\/$/, '')
  if (!baseUrl) throw new Error('WATSON_INSTANCE_API_URL is not set')
  const headers = await getWatsonAuthHeaders()
  const urlsToTry = [`${baseUrl}/v1/orchestrate/models`, `${baseUrl}/api/v1/models/list`]
  for (const url of urlsToTry) {
    console.log('[Watson] listWatsonModels: GET', url)
    const res = await fetch(url, { headers })
    if (!res.ok) {
      console.log('[Watson] listWatsonModels:', res.status, url)
      continue
    }
    const data = (await res.json()) as WatsonModel[] | { resources?: WatsonModel[] }
    const list = Array.isArray(data) ? data : (data.resources ?? [])
    console.log(
      '[Watson] listWatsonModels: got',
      list.length,
      'model(s)',
      list.slice(0, 3).map((m) => m.id),
    )
    return list
  }
  console.error('[Watson] listWatsonModels: all paths failed')
  throw new Error('List models failed. Tried /v1/orchestrate/models and /api/v1/models/list.')
}

let cachedDefaultLlm: string | null = null
let cachedModelsEmpty = false

/** Fallback when list-models returns empty (e.g. Watson UI default: GPT-OSS 120B via Groq). Override with WATSON_AGENT_LLM. */
const FALLBACK_LLM_ID = 'groq/openai/gpt-oss-120b'

const NO_LLM_MESSAGE =
  'No LLM models found and fallback failed. Set WATSON_AGENT_LLM in .env to a model ID from Watson UI → Profile → AI Model (e.g. groq/openai/gpt-oss-120b).'

/**
 * Get a default LLM id for agent creation: params.llm ?? env.WATSON_AGENT_LLM ?? first model from list-models API ?? fallback (groq/openai/gpt-oss-120b).
 */
async function getDefaultLlm(paramsLlm: string | null | undefined): Promise<string> {
  if (paramsLlm != null && paramsLlm !== '') return paramsLlm
  if (env.WATSON_AGENT_LLM != null && env.WATSON_AGENT_LLM !== '') return env.WATSON_AGENT_LLM
  if (cachedDefaultLlm) return cachedDefaultLlm
  if (cachedModelsEmpty) {
    console.log('[Watson] using fallback llm:', FALLBACK_LLM_ID)
    return FALLBACK_LLM_ID
  }
  const models = await listWatsonModels()
  const first = models[0]
  if (first?.id) {
    cachedDefaultLlm = first.id
    console.log('[Watson] using default llm from API:', first.id)
    return first.id
  }
  cachedModelsEmpty = true
  console.log('[Watson] list-models returned 0; using fallback llm:', FALLBACK_LLM_ID)
  return FALLBACK_LLM_ID
}

/**
 * Get single knowledge base details
 */
export async function getWatsonKnowledgeBase(kbId: string): Promise<WatsonKnowledgeBase | null> {
  const baseUrl = env.WATSON_INSTANCE_API_URL?.replace(/\/$/, '')
  if (!baseUrl) throw new Error('WATSON_INSTANCE_API_URL is not set')
  const url = `${baseUrl}/v1/orchestrate/knowledge-bases/${kbId}`
  console.log('[Watson] getWatsonKnowledgeBase: GET', url)
  const headers = await getWatsonAuthHeaders()
  const res = await fetch(url, { headers })
  if (!res.ok) {
    if (res.status === 404) return null
    const text = await res.text()
    console.error('[Watson] getWatsonKnowledgeBase failed', res.status, text)
    throw new Error(`Get knowledge base failed: ${res.status} ${text}`)
  }
  return (await res.json()) as WatsonKnowledgeBase
}

/**
 * Get knowledge base status (full response including documents from /status API)
 */
export async function getWatsonKnowledgeBaseStatus(kbId: string): Promise<WatsonKnowledgeBaseStatusResponse | null> {
  const baseUrl = env.WATSON_INSTANCE_API_URL?.replace(/\/$/, '')
  if (!baseUrl) throw new Error('WATSON_INSTANCE_API_URL is not set')
  const url = `${baseUrl}/v1/orchestrate/knowledge-bases/${kbId}/status`
  console.log('[Watson] getWatsonKnowledgeBaseStatus: GET', url)
  const headers = await getWatsonAuthHeaders()
  const res = await fetch(url, { headers })
  if (!res.ok) {
    if (res.status === 404) return null
    const text = await res.text()
    console.error('[Watson] getWatsonKnowledgeBaseStatus failed', res.status, text)
    throw new Error(`Get knowledge base status failed: ${res.status} ${text}`)
  }
  return (await res.json()) as WatsonKnowledgeBaseStatusResponse
}

/**
 * Get knowledge base with documents merged from /status API (so documents list is populated).
 */
export async function getWatsonKnowledgeBaseWithDocuments(kbId: string): Promise<WatsonKnowledgeBase | null> {
  const kb = await getWatsonKnowledgeBase(kbId)
  if (!kb) return null
  const status = await getWatsonKnowledgeBaseStatus(kbId)
  if (!status) return kb
  return {
    ...kb,
    documents: status.documents ?? kb.documents ?? [],
    vector_index:
      kb.vector_index ??
      (status.built_in_index_status && {
        status: status.built_in_index_status,
        status_msg: status.built_in_index_status_msg,
      }),
  }
}

/** Resolved display info for a document (from /status API, same as right sidebar). */
export interface DocumentDisplayInfo {
  displayName: string
  url?: string
}

/**
 * Build a map of document ID → display name (and optional URL) for all documents
 * in an agent's linked knowledge bases. Uses the same /status API as the right sidebar,
 * so names match what users see in Watson UI (e.g. file names like sync-db-...-IT-Support.txt).
 * If you add "URL source" to documents in Watson, citations can show as clickable links.
 */
export async function getAgentDocumentDisplayMap(kbIds: string[]): Promise<Map<string, DocumentDisplayInfo>> {
  const map = new Map<string, DocumentDisplayInfo>()
  await Promise.all(
    kbIds.map(async (kbId) => {
      const status = await getWatsonKnowledgeBaseStatus(kbId).catch(() => null)
      if (!status?.documents) return
      for (const doc of status.documents) {
        const id = doc.id
        if (!id) continue
        const displayName = doc.metadata?.original_file_name ?? doc.name ?? id
        const url = doc.metadata?.url ?? doc.metadata?.source_url
        map.set(id, { displayName, url })
      }
    }),
  )
  return map
}

/** File-like value: either a Web API File or buffer + metadata (for Node when re-forwarding uploads). */
export type FileLike = File | { buffer: ArrayBuffer; name: string; type: string }

/**
 * Create knowledge base. Tries (1) POST JSON to /knowledge-bases, then (2) POST multipart to /knowledge-bases/documents.
 * Then adds documents via PUT if any.
 * @see https://developer.watson-orchestrate.ibm.com/apis/knowledge-bases/create-a-knowledge-base-by-uploading-documents-or-providing-a-external-vector-index
 */
export async function createWatsonKnowledgeBase(
  name: string,
  files: FileLike[],
  description?: string,
): Promise<WatsonKnowledgeBase> {
  const baseUrl = env.WATSON_INSTANCE_API_URL?.replace(/\/$/, '')
  if (!baseUrl) throw new Error('WATSON_INSTANCE_API_URL is not set')
  const headers = await getWatsonAuthHeaders()

  const knowledgeBasePayload = { name, ...(description ? { description } : {}) }
  let kb: WatsonKnowledgeBase | null = null

  // Try 1: POST JSON to /knowledge-bases (some deployments support create without /documents)
  const urlJson = `${baseUrl}/v1/orchestrate/knowledge-bases`
  console.log('[Watson] createWatsonKnowledgeBase: try POST (JSON)', urlJson, { name })
  const resJson = await fetch(urlJson, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: headers['Authorization'],
      ...(headers['IAM-API_KEY'] ? { 'IAM-API_KEY': headers['IAM-API_KEY'] } : {}),
    },
    body: JSON.stringify(knowledgeBasePayload),
  })
  if (resJson.ok) {
    kb = (await resJson.json()) as WatsonKnowledgeBase
    console.log('[Watson] createWatsonKnowledgeBase: created via JSON, kbId=%s', kb?.id)
  } else {
    const textJson = await resJson.text()
    console.log('[Watson] createWatsonKnowledgeBase: JSON create returned', resJson.status, textJson?.slice(0, 200))

    // Try 2: POST multipart to /knowledge-bases/documents (empty KB)
    const urlDoc = `${baseUrl}/v1/orchestrate/knowledge-bases/documents`
    const formData = new FormData()
    formData.append('knowledge_base', JSON.stringify(knowledgeBasePayload))
    console.log('[Watson] createWatsonKnowledgeBase: try POST (multipart empty)', urlDoc, { name })
    const resDoc = await fetch(urlDoc, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: headers['Authorization'],
        ...(headers['IAM-API_KEY'] ? { 'IAM-API_KEY': headers['IAM-API_KEY'] } : {}),
      },
      body: formData,
    })
    if (!resDoc.ok) {
      const textDoc = await resDoc.text()
      console.error('[Watson] createWatsonKnowledgeBase failed:', {
        status: resDoc.status,
        responseBody: textDoc,
        url: urlDoc,
        name,
      })
      throw new Error(
        `Create knowledge base failed: ${resDoc.status} ${textDoc}. ` +
          'If this persists, the Knowledge Base create API may be unavailable for your Watson Orchestrate instance (e.g. entitlement or region). Try creating a knowledge base in the IBM watsonx Orchestrate UI, or contact IBM support.',
      )
    }
    const docJson = (await resDoc.json()) as Record<string, unknown>
    // Multipart API may return { knowledge_base: { id, name, ... } } or { id, name, ... }
    kb = (docJson.knowledge_base as unknown as WatsonKnowledgeBase) ?? (docJson as unknown as WatsonKnowledgeBase)
    if (!kb?.id && typeof (docJson as { id?: string }).id === 'string') {
      kb = { ...kb, id: (docJson as { id: string }).id } as WatsonKnowledgeBase
    }
    console.log('[Watson] createWatsonKnowledgeBase: created via multipart, kbId=%s', kb?.id)
  }

  if (!kb?.id) throw new Error('Create knowledge base did not return an ID')

  // Add documents if any
  if (files.length > 0) {
    await addDocumentsToKnowledgeBase(kb.id, files)
  }
  return kb
}

/**
 * Add documents to existing knowledge base (supports File or buffer+name+type for Node).
 * Uses PUT first (Ingest additional documents) so new files are added without replacing existing ones.
 * Falls back to PATCH only if PUT is not supported on the instance.
 * @see https://developer.watson-orchestrate.ibm.com/apis/knowledge-bases/ingest-additional-documents-into-a-knowledge-base
 * @see https://developer.watson-orchestrate.ibm.com/apis/knowledge-bases/patch-a-knowledge-base-by-uploading-documents-or-providing-a-external-vector-index
 */
export async function addDocumentsToKnowledgeBase(kbId: string, files: FileLike[]): Promise<WatsonKnowledgeBase> {
  const baseUrl = env.WATSON_INSTANCE_API_URL?.replace(/\/$/, '')
  if (!baseUrl) throw new Error('WATSON_INSTANCE_API_URL is not set')
  const url = `${baseUrl}/v1/orchestrate/knowledge-bases/${kbId}/documents`
  const fileInfos = files.map((f) =>
    f instanceof File
      ? { name: f.name, type: f.type, size: f.size }
      : { name: f.name, type: f.type, size: (f.buffer as ArrayBuffer).byteLength },
  )
  const headers = await getWatsonAuthHeaders()
  const authHeaders = {
    Accept: 'application/json',
    Authorization: headers['Authorization'],
    ...(headers['IAM-API_KEY'] ? { 'IAM-API_KEY': headers['IAM-API_KEY'] } : {}),
  }

  /** PUT Ingest additional documents: multipart with files only (kb id in path). */
  function buildFormDataPUT(): FormData {
    const formData = new FormData()
    for (const file of files) {
      if (file instanceof File) {
        formData.append('files', file, file.name || 'document')
      } else {
        const blob = new Blob([file.buffer], { type: file.type || 'application/octet-stream' })
        formData.append('files', blob, file.name || 'document')
      }
    }
    return formData
  }

  /** PATCH: multipart with knowledge_base JSON + files. */
  function buildFormDataPATCH(): FormData {
    const formData = new FormData()
    formData.append('knowledge_base', JSON.stringify({ id: kbId }))
    for (const file of files) {
      if (file instanceof File) {
        formData.append('files', file, file.name || 'document')
      } else {
        const blob = new Blob([file.buffer], { type: file.type || 'application/octet-stream' })
        formData.append('files', blob, file.name || 'document')
      }
    }
    return formData
  }

  const logFailure = (method: string, status: number, text: string) => {
    console.error('[Watson] addDocumentsToKnowledgeBase failed:', {
      method,
      status,
      body: text,
      kbId,
      fileCount: files.length,
      fileNames: fileInfos.map((f) => f.name),
      fileTypes: fileInfos.map((f) => f.type),
    })
  }

  const makeHelpfulMessage = (status: number, text: string) =>
    `Add documents failed: ${status} ${text.includes('detail') ? text : status}. ` +
    'Watson may reject some file types or fail on large/PDF files. Try a smaller or text-based file, or create/upload via the IBM watsonx Orchestrate UI; if it persists, contact IBM support.'

  // Prefer PUT (Ingest additional documents) so we add files without replacing existing ones
  console.log('[Watson] addDocumentsToKnowledgeBase: PUT (ingest)', url, { fileCount: files.length, files: fileInfos })
  let res = await fetch(url, {
    method: 'PUT',
    headers: authHeaders,
    body: buildFormDataPUT(),
  })
  if (res.ok) return (await res.json()) as WatsonKnowledgeBase
  const textPut = await res.text()
  logFailure('PUT', res.status, textPut)
  let lastStatus = res.status
  let lastText = textPut

  // Fallback: PATCH (if PUT not supported on this instance)
  console.log('[Watson] addDocumentsToKnowledgeBase: fallback PATCH', url)
  res = await fetch(url, {
    method: 'PATCH',
    headers: authHeaders,
    body: buildFormDataPATCH(),
  })
  if (res.ok) return (await res.json()) as WatsonKnowledgeBase
  lastStatus = res.status
  lastText = await res.text()
  logFailure('PATCH', lastStatus, lastText)

  throw new Error(makeHelpfulMessage(lastStatus, lastText))
}

/**
 * Delete knowledge base
 */
export async function deleteWatsonKnowledgeBase(kbId: string): Promise<void> {
  const baseUrl = env.WATSON_INSTANCE_API_URL?.replace(/\/$/, '')
  if (!baseUrl) throw new Error('WATSON_INSTANCE_API_URL is not set')
  const url = `${baseUrl}/v1/orchestrate/knowledge-bases/${kbId}`
  console.log('[Watson] deleteWatsonKnowledgeBase: DELETE', url)
  const headers = await getWatsonAuthHeaders()
  const res = await fetch(url, { method: 'DELETE', headers })
  if (!res.ok) {
    const text = await res.text()
    console.error('[Watson] deleteWatsonKnowledgeBase failed', res.status, text)
    throw new Error(`Delete knowledge base failed: ${res.status} ${text}`)
  }
}

/**
 * Delete specific documents from knowledge base
 */
export async function deleteKnowledgeBaseDocuments(kbId: string, documentNames: string[]): Promise<void> {
  const baseUrl = env.WATSON_INSTANCE_API_URL?.replace(/\/$/, '')
  if (!baseUrl) throw new Error('WATSON_INSTANCE_API_URL is not set')
  const url = `${baseUrl}/v1/orchestrate/knowledge-bases/${kbId}/documents`
  console.log('[Watson] deleteKnowledgeBaseDocuments: DELETE', url, { documentNames })
  const headers = await getWatsonAuthHeaders()
  headers['Content-Type'] = 'application/json'
  const res = await fetch(url, {
    method: 'DELETE',
    headers,
    body: JSON.stringify({ documents: documentNames }),
  })
  if (!res.ok) {
    const text = await res.text()
    console.error('[Watson] deleteKnowledgeBaseDocuments failed', res.status, text)
    throw new Error(`Delete documents failed: ${res.status} ${text}`)
  }
}

/** Normalize stream chunk data into a list of source references for citations. */
function extractSourcesFromChunkData(data: WatsonRunsStreamChunk['data']): WatsonStreamSource[] {
  if (!data || typeof data !== 'object') return []
  const out: WatsonStreamSource[] = []
  const push = (arr: unknown[] | undefined, keyTitle: string, keyName: string) => {
    if (!Array.isArray(arr)) return
    for (const item of arr) {
      if (item && typeof item === 'object') {
        const o = item as Record<string, unknown>
        out.push({
          title: (o.title ?? o[keyTitle]) as string | undefined,
          name: (o.name ?? o[keyName]) as string | undefined,
          id: o.id as string | undefined,
          file_name: o.file_name as string | undefined,
          url: o.url as string | undefined,
        })
      }
    }
  }
  push(data.citations as unknown[] | undefined, 'title', 'name')
  push(data.sources as unknown[] | undefined, 'title', 'name')
  push(data.references as unknown[] | undefined, 'title', 'name')
  const docIds = data.document_ids
  if (Array.isArray(docIds)) {
    for (const id of docIds) {
      if (typeof id === 'string') out.push({ id })
    }
  }
  return out
}

/**
 * Stream a chat run from Watson Orchestrate and yield TanStack AI–compatible SSE content chunks.
 * Yields { type: 'content', content: string } for text, { type: 'sources', sources } when KB citations are present, and { type: 'done' } at end.
 */
export async function* streamWatsonChat(
  body: WatsonRunsRequestBody,
): AsyncGenerator<
  | { type: 'content'; content: string }
  | { type: 'sources'; sources: WatsonStreamSource[] }
  | { type: 'done'; threadId?: string }
> {
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
        console.log(
          '[Watson] streamWatsonChat: stream ended. totalBytes=',
          totalBytes,
          'buffer length=',
          buffer.length,
          'buffer sample=',
          JSON.stringify(buffer.slice(0, 400)),
        )
        break
      }
      readCount++
      const chunk = decoder.decode(value, { stream: true })
      totalBytes += value.length
      buffer += chunk
      if (readCount <= 2) {
        console.log(
          '[Watson] streamWatsonChat read',
          readCount,
          'bytes=',
          value.length,
          'sample=',
          JSON.stringify(chunk.slice(0, 300)),
        )
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
              console.log(
                '[Watson] message.delta data.delta type=',
                typeof data.delta,
                'value=',
                JSON.stringify(data.delta)?.slice(0, 120),
              )
            if (delta) yield { type: 'content', content: delta }
          } else if (event === 'message.completed' && data) {
            const content = extractText(data.content) || extractText(data.text)
            if (content) yield { type: 'content', content }
            const sources = extractSourcesFromChunkData(data)
            if (sources.length > 0) yield { type: 'sources', sources }
          }
          // Also check run.step.completed for tool/KB citations
          if ((event === 'run.step.completed' || event === 'run.completed') && data) {
            const sources = extractSourcesFromChunkData(data)
            if (sources.length > 0) yield { type: 'sources', sources }
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
