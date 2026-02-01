/** Raw agent object from Watson Orchestrate GET /v1/orchestrate/agents (array response) */
export interface WatsonAgentApi {
  id: string
  name?: string
  display_name?: string
  description?: string
  tenant_id?: string
  instructions?: string
  tools?: unknown[]
  knowledge_base?: string[]
  llm?: string
  created_on?: string
  updated_at?: string
  [key: string]: unknown
}

/** Normalized agent for app use (id → agent_id, display_name/name → name) */
export interface WatsonAgent {
  agent_id: string
  name?: string
  description?: string
  [key: string]: unknown
}

export interface WatsonRunsMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface WatsonRunsRequestBody {
  message: WatsonRunsMessage
  agent_id: string
  thread_id?: string
}

export interface WatsonRunsStreamChunk {
  /** Event-based stream: run.started | message.delta | message.completed | run.step.intermediate | ... */
  event?: string
  id?: string
  data?: {
    content?: Array<{ type?: string; text?: string; content?: string }> | string
    delta?: string | { type?: string; text?: string; content?: string }
    text?: string
    message?: string | Array<{ type?: string; text?: string; content?: string }>
    thread_id?: string
    [key: string]: unknown
  }
  /** Legacy / alternate: content array or thread_id at top level */
  type?: string
  content?: Array<{ type?: string; text?: string; content?: string }>
  thread_id?: string
  [key: string]: unknown
}

export interface IAMTokenResponse {
  access_token: string
  refresh_token?: string
  token_type: string
  expires_in: number
  expiration?: number
}

/** Knowledge Base status from Watson Orchestrate */
export type WatsonKnowledgeBaseStatus = 'ready' | 'not_ready' | 'processing' | 'error'

/** Vector index info from Knowledge Base */
export interface WatsonVectorIndex {
  status: WatsonKnowledgeBaseStatus
  status_msg?: string
  document_count?: number
  embedding_model?: string
}

/** Document in a Knowledge Base */
export interface WatsonKnowledgeBaseDocument {
  name: string
  size?: number
  type?: string
  status?: WatsonKnowledgeBaseStatus
}

/** Knowledge Base from Watson Orchestrate */
export interface WatsonKnowledgeBase {
  id: string
  tenant_id: string
  name: string
  description?: string
  vector_index?: WatsonVectorIndex
  documents?: WatsonKnowledgeBaseDocument[]
  created_on?: string
  updated_at?: string
}

/** Full agent schema with knowledge_base array */
export interface WatsonAgentFull extends WatsonAgent {
  knowledge_base: string[]
  tenant_id?: string
  instructions?: string
  tools?: unknown[]
  llm?: string
  created_on?: string
  updated_at?: string
}
