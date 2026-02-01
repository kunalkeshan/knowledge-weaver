'use client'

import { AddDocumentsDialog } from '@/components/knowledge-base/add-documents-dialog'
import { AddKnowledgeBaseDialog } from '@/components/knowledge-base/add-knowledge-base-dialog'
import { KnowledgeBaseList } from '@/components/knowledge-base/knowledge-base-list'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAgentKnowledgeBases } from '@/hooks/use-knowledge-bases'
import { Plus } from 'lucide-react'
import { useState } from 'react'

interface AgentKnowledgeBaseSidebarProps {
  agentId: string
}

export function AgentKnowledgeBaseSidebar({ agentId }: AgentKnowledgeBaseSidebarProps) {
  const [addKbDialogOpen, setAddKbDialogOpen] = useState(false)
  const [addDocsDialogOpen, setAddDocsDialogOpen] = useState(false)
  const [selectedKbId, setSelectedKbId] = useState<string | null>(null)

  const { data } = useAgentKnowledgeBases(agentId)

  const handleAddDocuments = (kbId: string) => {
    setSelectedKbId(kbId)
    setAddDocsDialogOpen(true)
  }

  const selectedKb = data?.knowledgeBases.find((kb) => kb.id === selectedKbId)

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <div className="flex shrink-0 items-center justify-between border-b px-4 py-3">
        <h3 className="truncate text-sm font-semibold">Knowledge Bases</h3>
      </div>

      <ScrollArea className="min-h-0 min-w-0 flex-1 overflow-x-hidden">
        <div className="w-full min-w-0 max-w-full overflow-x-hidden">
          <KnowledgeBaseList
            agentId={agentId}
            onAddDocuments={handleAddDocuments}
          />
        </div>
      </ScrollArea>

      <div className="shrink-0 border-t p-2">
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={() => setAddKbDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Add Knowledge Base
        </Button>
      </div>

      <AddKnowledgeBaseDialog
        agentId={agentId}
        open={addKbDialogOpen}
        onOpenChange={setAddKbDialogOpen}
      />

      {selectedKb && (
        <AddDocumentsDialog
          kbId={selectedKb.id}
          kbName={selectedKb.name}
          open={addDocsDialogOpen}
          onOpenChange={(open) => {
            setAddDocsDialogOpen(open)
            if (!open) setSelectedKbId(null)
          }}
        />
      )}
    </div>
  )
}
