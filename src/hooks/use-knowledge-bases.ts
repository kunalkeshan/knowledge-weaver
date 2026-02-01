import type { WatsonKnowledgeBase, WatsonKnowledgeBaseStatusResponse } from '@/types/watson'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// ==================== Queries ====================

async function fetchKnowledgeBases(): Promise<WatsonKnowledgeBase[]> {
  const res = await fetch('/api/knowledge-bases', { credentials: 'include' })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error ?? `Failed to fetch knowledge bases: ${res.status}`)
  }
  const data = await res.json()
  return data.knowledgeBases ?? []
}

export function useKnowledgeBases() {
  return useQuery({
    queryKey: ['knowledge-bases'],
    queryFn: fetchKnowledgeBases,
  })
}

async function fetchKnowledgeBase(kbId: string): Promise<WatsonKnowledgeBase | null> {
  const res = await fetch(`/api/knowledge-bases/${kbId}`, { credentials: 'include' })
  if (res.status === 404) return null
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error ?? `Failed to fetch knowledge base: ${res.status}`)
  }
  const data = await res.json()
  return data.knowledgeBase ?? null
}

export function useKnowledgeBase(kbId: string | null) {
  return useQuery({
    queryKey: ['knowledge-base', kbId],
    queryFn: () => fetchKnowledgeBase(kbId!),
    enabled: !!kbId,
  })
}

async function fetchKnowledgeBaseStatus(kbId: string): Promise<WatsonKnowledgeBaseStatusResponse | null> {
  const res = await fetch(`/api/knowledge-bases/${kbId}/status`, { credentials: 'include' })
  if (res.status === 404) return null
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error ?? `Failed to fetch status: ${res.status}`)
  }
  return res.json()
}

export function useKnowledgeBaseStatus(kbId: string | null, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['knowledge-base-status', kbId],
    queryFn: () => fetchKnowledgeBaseStatus(kbId!),
    enabled: !!kbId && options?.enabled !== false,
    refetchInterval: (query) => {
      const status = (query.state.data as WatsonKnowledgeBaseStatusResponse | undefined)?.built_in_index_status
      return status === 'processing' || status === 'not_ready' ? 5000 : false
    },
  })
}

async function fetchAgentKnowledgeBases(
  agentId: string,
): Promise<{ knowledgeBases: WatsonKnowledgeBase[]; knowledgeBaseIds: string[] }> {
  const res = await fetch(`/api/agents/${agentId}/knowledge-bases`, { credentials: 'include' })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error ?? `Failed to fetch agent knowledge bases: ${res.status}`)
  }
  const data = await res.json()
  return {
    knowledgeBases: data.knowledgeBases ?? [],
    knowledgeBaseIds: data.knowledgeBaseIds ?? [],
  }
}

export function useAgentKnowledgeBases(agentId: string | null) {
  return useQuery({
    queryKey: ['agent-knowledge-bases', agentId],
    queryFn: () => fetchAgentKnowledgeBases(agentId!),
    enabled: !!agentId,
  })
}

// ==================== Mutations ====================

interface CreateKnowledgeBaseParams {
  name: string
  description?: string
  files: File[]
}

async function createKnowledgeBase(params: CreateKnowledgeBaseParams): Promise<WatsonKnowledgeBase> {
  const formData = new FormData()
  formData.append('name', params.name)
  if (params.description) formData.append('description', params.description)
  for (const file of params.files) {
    formData.append('files', file)
  }

  const res = await fetch('/api/knowledge-bases', {
    method: 'POST',
    credentials: 'include',
    body: formData,
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error ?? `Failed to create knowledge base: ${res.status}`)
  }
  const data = await res.json()
  return data.knowledgeBase
}

export function useCreateKnowledgeBase() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createKnowledgeBase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-bases'] })
      queryClient.invalidateQueries({ queryKey: ['agent-knowledge-bases'] })
    },
  })
}

async function deleteKnowledgeBase(kbId: string): Promise<void> {
  const res = await fetch(`/api/knowledge-bases/${kbId}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error ?? `Failed to delete knowledge base: ${res.status}`)
  }
}

export function useDeleteKnowledgeBase() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteKnowledgeBase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-bases'] })
      queryClient.invalidateQueries({ queryKey: ['agent-knowledge-bases'] })
    },
  })
}

interface AddDocumentsParams {
  kbId: string
  files: File[]
}

async function addDocuments(params: AddDocumentsParams): Promise<WatsonKnowledgeBase> {
  const formData = new FormData()
  for (const file of params.files) {
    formData.append('files', file)
  }

  const res = await fetch(`/api/knowledge-bases/${params.kbId}/documents`, {
    method: 'PUT',
    credentials: 'include',
    body: formData,
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error ?? `Failed to add documents: ${res.status}`)
  }
  const data = await res.json()
  return data.knowledgeBase
}

export function useAddDocumentsToKnowledgeBase() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: addDocuments,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-bases'] })
      queryClient.invalidateQueries({ queryKey: ['knowledge-base', variables.kbId] })
      queryClient.invalidateQueries({ queryKey: ['knowledge-base-status', variables.kbId] })
      queryClient.invalidateQueries({ queryKey: ['agent-knowledge-bases'] })
    },
  })
}

interface DeleteDocumentsParams {
  kbId: string
  documentNames: string[]
}

async function deleteDocuments(params: DeleteDocumentsParams): Promise<void> {
  const res = await fetch(`/api/knowledge-bases/${params.kbId}/documents`, {
    method: 'DELETE',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ documents: params.documentNames }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error ?? `Failed to delete documents: ${res.status}`)
  }
}

export function useDeleteDocumentsFromKnowledgeBase() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteDocuments,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-bases'] })
      queryClient.invalidateQueries({ queryKey: ['knowledge-base', variables.kbId] })
      queryClient.invalidateQueries({ queryKey: ['knowledge-base-status', variables.kbId] })
      queryClient.invalidateQueries({ queryKey: ['agent-knowledge-bases'] })
    },
  })
}

interface LinkKnowledgeBaseParams {
  agentId: string
  knowledgeBaseId: string
}

async function linkKnowledgeBase(params: LinkKnowledgeBaseParams): Promise<void> {
  const res = await fetch(`/api/agents/${params.agentId}/knowledge-bases`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'link', knowledgeBaseId: params.knowledgeBaseId }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error ?? `Failed to link knowledge base: ${res.status}`)
  }
}

export function useLinkKnowledgeBase() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: linkKnowledgeBase,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['agent-knowledge-bases', variables.agentId] })
    },
  })
}

async function unlinkKnowledgeBase(params: LinkKnowledgeBaseParams): Promise<void> {
  const res = await fetch(`/api/agents/${params.agentId}/knowledge-bases`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'unlink', knowledgeBaseId: params.knowledgeBaseId }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error ?? `Failed to unlink knowledge base: ${res.status}`)
  }
}

export function useUnlinkKnowledgeBase() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: unlinkKnowledgeBase,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['agent-knowledge-bases', variables.agentId] })
    },
  })
}
