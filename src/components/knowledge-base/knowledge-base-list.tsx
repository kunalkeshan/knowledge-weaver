'use client'

import { KnowledgeBaseItem } from '@/components/knowledge-base/knowledge-base-item'
import { Skeleton } from '@/components/ui/skeleton'
import { useAgentKnowledgeBases } from '@/hooks/use-knowledge-bases'
import { AlertCircle, BookOpen } from 'lucide-react'

interface KnowledgeBaseListProps {
  agentId: string
  onAddDocuments?: (kbId: string) => void
}

export function KnowledgeBaseList({ agentId, onAddDocuments }: KnowledgeBaseListProps) {
  const { data, isLoading, error } = useAgentKnowledgeBases(agentId)

  if (isLoading) {
    return (
      <div className="space-y-3 p-2">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-2 p-4 text-center text-sm text-destructive">
        <AlertCircle className="h-8 w-8" />
        <p>Failed to load knowledge bases</p>
        <p className="text-xs text-muted-foreground">{error.message}</p>
      </div>
    )
  }

  if (!data?.knowledgeBases?.length) {
    return (
      <div className="flex flex-col items-center gap-2 p-4 text-center">
        <BookOpen className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-medium">No knowledge bases linked</p>
        <p className="text-xs text-muted-foreground">
          Add a knowledge base to give this agent access to documents.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3 p-2">
      {data.knowledgeBases.map((kb) => (
        <KnowledgeBaseItem
          key={kb.id}
          agentId={agentId}
          knowledgeBase={kb}
          onAddDocuments={onAddDocuments}
        />
      ))}
    </div>
  )
}
