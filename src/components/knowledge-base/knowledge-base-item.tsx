'use client'

import { KnowledgeBaseDocuments } from '@/components/knowledge-base/knowledge-base-documents'
import { KnowledgeBaseStatusBadge } from '@/components/knowledge-base/knowledge-base-status-badge'
import { Button } from '@/components/ui/button'
import { useKnowledgeBaseStatus, useUnlinkKnowledgeBase } from '@/hooks/use-knowledge-bases'
import type { WatsonKnowledgeBase } from '@/types/watson'
import { BookOpen, Loader2, Unlink } from 'lucide-react'
import { useState } from 'react'

interface KnowledgeBaseItemProps {
  agentId: string
  knowledgeBase: WatsonKnowledgeBase
  onAddDocuments?: (kbId: string) => void
}

export function KnowledgeBaseItem({
  agentId,
  knowledgeBase,
  onAddDocuments,
}: KnowledgeBaseItemProps) {
  const [isUnlinking, setIsUnlinking] = useState(false)
  const unlink = useUnlinkKnowledgeBase()

  // Poll status if processing
  const { data: statusData } = useKnowledgeBaseStatus(knowledgeBase.id, {
    enabled: knowledgeBase.vector_index?.status === 'processing' ||
      knowledgeBase.vector_index?.status === 'not_ready',
  })

  const status = statusData?.status ?? knowledgeBase.vector_index?.status ?? 'not_ready'
  const statusMsg = statusData?.status_msg ?? knowledgeBase.vector_index?.status_msg

  const handleUnlink = async () => {
    setIsUnlinking(true)
    try {
      await unlink.mutateAsync({ agentId, knowledgeBaseId: knowledgeBase.id })
    } finally {
      setIsUnlinking(false)
    }
  }

  return (
    <div className="rounded-lg border bg-card p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 overflow-hidden">
          <BookOpen className="h-4 w-4 flex-shrink-0 text-primary" />
          <span className="truncate font-medium text-sm" title={knowledgeBase.name}>
            {knowledgeBase.name}
          </span>
        </div>
        <KnowledgeBaseStatusBadge status={status} statusMsg={statusMsg} />
      </div>

      {knowledgeBase.description && (
        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
          {knowledgeBase.description}
        </p>
      )}

      <div className="mt-2">
        <KnowledgeBaseDocuments
          kbId={knowledgeBase.id}
          documents={knowledgeBase.documents ?? []}
          onAddDocuments={onAddDocuments ? () => onAddDocuments(knowledgeBase.id) : undefined}
        />
      </div>

      <div className="mt-2 flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-muted-foreground hover:text-destructive"
          onClick={handleUnlink}
          disabled={isUnlinking}
        >
          {isUnlinking ? (
            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
          ) : (
            <Unlink className="mr-1 h-3 w-3" />
          )}
          Unlink
        </Button>
      </div>
    </div>
  )
}
