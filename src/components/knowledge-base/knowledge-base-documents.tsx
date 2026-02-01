'use client'

import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { useDeleteDocumentsFromKnowledgeBase } from '@/hooks/use-knowledge-bases'
import type { WatsonKnowledgeBaseDocument } from '@/types/watson'
import { ChevronDown, ChevronRight, FileText, Loader2, Trash2 } from 'lucide-react'
import { useState } from 'react'

interface KnowledgeBaseDocumentsProps {
  kbId: string
  documents: WatsonKnowledgeBaseDocument[]
  onAddDocuments?: () => void
}

export function KnowledgeBaseDocuments({
  kbId,
  documents,
  onAddDocuments,
}: KnowledgeBaseDocumentsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [deletingDoc, setDeletingDoc] = useState<string | null>(null)
  const deleteDocuments = useDeleteDocumentsFromKnowledgeBase()

  const handleDeleteDocument = async (docIdOrName: string) => {
    setDeletingDoc(docIdOrName)
    try {
      await deleteDocuments.mutateAsync({ kbId, documentNames: [docIdOrName] })
    } finally {
      setDeletingDoc(null)
    }
  }

  const docDisplayName = (doc: WatsonKnowledgeBaseDocument) =>
    doc.metadata?.original_file_name ?? doc.name ?? doc.id ?? 'Document'
  const docIdForDelete = (doc: WatsonKnowledgeBaseDocument) => doc.id ?? doc.name ?? ''

  if (documents.length === 0) {
    return (
      <div className="px-2 py-1 text-xs text-muted-foreground">
        No documents
        {onAddDocuments && (
          <Button
            variant="link"
            size="sm"
            className="ml-1 h-auto p-0 text-xs"
            onClick={onAddDocuments}
          >
            Add some
          </Button>
        )}
      </div>
    )
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-full justify-start gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
        >
          {isOpen ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
          {documents.length} document{documents.length !== 1 ? 's' : ''}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-0.5 pl-4">
        {documents.map((doc) => {
          const id = doc.id ?? doc.name ?? ''
          const displayName = docDisplayName(doc)
          return (
            <div
              key={id}
              className="group flex items-center gap-1.5 rounded-sm py-0.5 pl-2 pr-1 text-xs hover:bg-muted"
            >
              <FileText className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
              <span className="flex-1 truncate" title={displayName}>
                {displayName}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100"
                onClick={() => handleDeleteDocument(docIdForDelete(doc))}
                disabled={deletingDoc === id}
              >
                {deletingDoc === id ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                )}
              </Button>
            </div>
          )
        })}
        {onAddDocuments && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-full justify-start gap-1 pl-2 text-xs text-muted-foreground hover:text-foreground"
            onClick={onAddDocuments}
          >
            + Add documents
          </Button>
        )}
      </CollapsibleContent>
    </Collapsible>
  )
}
