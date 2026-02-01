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

/** A single source/citation from the knowledge base (e.g. document name or reference). */
export interface WatsonStreamSource {
  title?: string
  name?: string
  id?: string
  file_name?: string
  url?: string
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
    /** Citation/source entries from knowledge base (format may vary by Watson version) */
    citations?: Array<Record<string, unknown> | WatsonStreamSource>
    sources?: Array<Record<string, unknown> | WatsonStreamSource>
    references?: Array<Record<string, unknown> | WatsonStreamSource>
    document_ids?: string[]
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

/** Document metadata from Watson Orchestrate /knowledge-bases/{id}/status */
export interface WatsonKnowledgeBaseDocumentMetadata {
  file_size?: number
  original_file_name?: string
  created_on?: string
  /** URL source (when set in Watson UI) — citations can link out to this */
  url?: string
  source_url?: string
}

/** Document in a Knowledge Base (from /status API: id + metadata) */
export interface WatsonKnowledgeBaseDocument {
  id?: string
  name?: string
  size?: number
  type?: string
  status?: WatsonKnowledgeBaseStatus
  /** From /status API */
  metadata?: WatsonKnowledgeBaseDocumentMetadata
}

/** Response from GET /knowledge-bases/{id}/status (includes documents list) */
export interface WatsonKnowledgeBaseStatusResponse {
  id: string
  name?: string
  description?: string
  prioritize_built_in_index?: boolean
  ready?: boolean
  built_in_index_status?: WatsonKnowledgeBaseStatus
  built_in_index_status_msg?: string
  documents?: WatsonKnowledgeBaseDocument[]
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

/**
 * Request body for POST /v1/orchestrate/agents (Create agent — official API).
 * Schema: name, display_name, description, instructions, tools, llm, style, knowledge_base, hidden, tags.
 * Optional in full spec: collaborators, supported_apps, glossary, guidelines, structured_output, chat_with_docs, etc.
 */
export interface WatsonAgentCreateBody {
  description: string
  style?: 'default' | 'react' | 'planner' | 'react_intrinsic'
  name?: string | null
  display_name?: string | null
  instructions?: string | null
  knowledge_base?: string[] | null
  tools?: string[] | null
  llm?: string | null
  hidden?: boolean
  tags?: string[] | null
}
