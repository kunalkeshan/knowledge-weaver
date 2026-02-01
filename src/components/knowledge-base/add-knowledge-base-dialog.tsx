'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  useAgentKnowledgeBases,
  useCreateKnowledgeBase,
  useKnowledgeBases,
  useLinkKnowledgeBase,
} from '@/hooks/use-knowledge-bases'
import type { WatsonKnowledgeBase } from '@/types/watson'
import { BookOpen, Check, FileUp, Loader2, Search, Upload, X } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'

interface AddKnowledgeBaseDialogProps {
  agentId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

const MAX_FILES = 20
const MAX_TOTAL_SIZE = 30 * 1024 * 1024 // 30MB
const ALLOWED_TYPES = [
  'application/pdf',
  'text/plain',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/markdown',
  'text/csv',
  'application/json',
]
const ALLOWED_EXTENSIONS = ['.pdf', '.txt', '.docx', '.md', '.csv', '.json']

export function AddKnowledgeBaseDialog({
  agentId,
  open,
  onOpenChange,
}: AddKnowledgeBaseDialogProps) {
  const [activeTab, setActiveTab] = useState<'select' | 'upload'>('select')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedKbId, setSelectedKbId] = useState<string | null>(null)

  // Upload state
  const [name, setName] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const { data: allKnowledgeBases, isLoading: isLoadingAll } = useKnowledgeBases()
  const { data: agentKbs } = useAgentKnowledgeBases(agentId)
  const linkKb = useLinkKnowledgeBase()
  const createKb = useCreateKnowledgeBase()

  // Filter out already linked KBs
  const availableKbs = useMemo(() => {
    if (!allKnowledgeBases || !agentKbs) return []
    const linkedIds = new Set(agentKbs.knowledgeBaseIds)
    return allKnowledgeBases.filter((kb) => !linkedIds.has(kb.id))
  }, [allKnowledgeBases, agentKbs])

  // Filter by search
  const filteredKbs = useMemo(() => {
    if (!searchQuery.trim()) return availableKbs
    const query = searchQuery.toLowerCase()
    return availableKbs.filter(
      (kb) =>
        kb.name.toLowerCase().includes(query) ||
        kb.description?.toLowerCase().includes(query)
    )
  }, [availableKbs, searchQuery])

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = Array.from(e.target.files ?? [])
      setError(null)

      // Validate file count
      if (selected.length > MAX_FILES) {
        setError(`Maximum ${MAX_FILES} files allowed`)
        return
      }

      // Validate file types
      for (const file of selected) {
        const ext = '.' + file.name.split('.').pop()?.toLowerCase()
        if (!ALLOWED_TYPES.includes(file.type) && !ALLOWED_EXTENSIONS.includes(ext)) {
          setError(`Invalid file type: ${file.name}. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`)
          return
        }
      }

      // Validate total size
      const totalSize = selected.reduce((acc, f) => acc + f.size, 0)
      if (totalSize > MAX_TOTAL_SIZE) {
        setError(`Total file size exceeds 30MB limit`)
        return
      }

      setFiles(selected)
    },
    []
  )

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handleLinkExisting = async () => {
    if (!selectedKbId) return
    try {
      await linkKb.mutateAsync({ agentId, knowledgeBaseId: selectedKbId })
      onOpenChange(false)
      resetState()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to link knowledge base')
    }
  }

  const handleUploadNew = async () => {
    if (!name.trim() || files.length === 0) return
    setError(null)
    setUploadProgress(10)

    try {
      // Create KB with files
      setUploadProgress(30)
      const kb = await createKb.mutateAsync({ name: name.trim(), files })
      setUploadProgress(80)

      // Link to agent
      await linkKb.mutateAsync({ agentId, knowledgeBaseId: kb.id })
      setUploadProgress(100)

      onOpenChange(false)
      resetState()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create knowledge base')
      setUploadProgress(0)
    }
  }

  const resetState = () => {
    setActiveTab('select')
    setSearchQuery('')
    setSelectedKbId(null)
    setName('')
    setFiles([])
    setUploadProgress(0)
    setError(null)
  }

  const isLoading = linkKb.isPending || createKb.isPending
  const totalFileSize = files.reduce((acc, f) => acc + f.size, 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Knowledge Base</DialogTitle>
          <DialogDescription>
            Select an existing knowledge base or upload new files.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'select' | 'upload')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="select">
              <BookOpen className="mr-2 h-4 w-4" />
              Select Existing
            </TabsTrigger>
            <TabsTrigger value="upload">
              <Upload className="mr-2 h-4 w-4" />
              Upload New
            </TabsTrigger>
          </TabsList>

          <TabsContent value="select" className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search knowledge bases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>

            <ScrollArea className="h-[200px] rounded-md border">
              {isLoadingAll ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredKbs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <BookOpen className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {availableKbs.length === 0
                      ? 'All knowledge bases are already linked'
                      : 'No knowledge bases found'}
                  </p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {filteredKbs.map((kb) => (
                    <KnowledgeBaseSelectItem
                      key={kb.id}
                      knowledgeBase={kb}
                      selected={selectedKbId === kb.id}
                      onSelect={() => setSelectedKbId(kb.id)}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleLinkExisting}
                disabled={!selectedKbId || isLoading}
              >
                {linkKb.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Link Knowledge Base
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="kb-name">Name</Label>
              <Input
                id="kb-name"
                placeholder="My Knowledge Base"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Files</Label>
              <div
                className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <FileUp className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Click to select files or drag and drop
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {ALLOWED_EXTENSIONS.join(', ')} (max {MAX_FILES} files, 30MB total)
                </p>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  accept={ALLOWED_EXTENSIONS.join(',')}
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>

            {files.length > 0 && (
              <ScrollArea className="h-[100px] rounded-md border">
                <div className="p-2 space-y-1">
                  {files.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="flex items-center justify-between gap-2 rounded px-2 py-1 text-sm hover:bg-muted"
                    >
                      <span className="truncate">{file.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}

            {files.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {files.length} file{files.length !== 1 ? 's' : ''} selected (
                {(totalFileSize / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}

            {uploadProgress > 0 && uploadProgress < 100 && (
              <Progress value={uploadProgress} className="h-2" />
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleUploadNew}
                disabled={!name.trim() || files.length === 0 || isLoading}
              >
                {createKb.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create & Link
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

function KnowledgeBaseSelectItem({
  knowledgeBase,
  selected,
  onSelect,
}: {
  knowledgeBase: WatsonKnowledgeBase
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full flex items-start gap-3 rounded-md p-2 text-left transition-colors ${
        selected ? 'bg-primary/10 ring-1 ring-primary' : 'hover:bg-muted'
      }`}
    >
      <div
        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
          selected ? 'bg-primary border-primary' : 'border-muted-foreground'
        }`}
      >
        {selected && <Check className="h-3 w-3 text-primary-foreground" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{knowledgeBase.name}</p>
        {knowledgeBase.description && (
          <p className="text-xs text-muted-foreground line-clamp-1">
            {knowledgeBase.description}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          {knowledgeBase.documents?.length ?? 0} documents
        </p>
      </div>
    </button>
  )
}
