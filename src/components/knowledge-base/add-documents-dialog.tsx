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
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAddDocumentsToKnowledgeBase } from '@/hooks/use-knowledge-bases'
import { FileUp, Loader2, X } from 'lucide-react'
import { useCallback, useState } from 'react'

interface AddDocumentsDialogProps {
  kbId: string
  kbName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

const MAX_FILES = 20
const MAX_TOTAL_SIZE = 30 * 1024 * 1024 // 30MB
const ALLOWED_EXTENSIONS = ['.pdf', '.txt', '.docx', '.md', '.csv', '.json']

export function AddDocumentsDialog({
  kbId,
  kbName,
  open,
  onOpenChange,
}: AddDocumentsDialogProps) {
  const [files, setFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const addDocuments = useAddDocumentsToKnowledgeBase()

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = Array.from(e.target.files ?? [])
      setError(null)

      if (selected.length > MAX_FILES) {
        setError(`Maximum ${MAX_FILES} files allowed`)
        return
      }

      for (const file of selected) {
        const ext = '.' + file.name.split('.').pop()?.toLowerCase()
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
          setError(`Invalid file type: ${file.name}. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`)
          return
        }
      }

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

  const handleUpload = async () => {
    if (files.length === 0) return
    setError(null)
    setUploadProgress(20)

    try {
      setUploadProgress(50)
      await addDocuments.mutateAsync({ kbId, files })
      setUploadProgress(100)

      onOpenChange(false)
      resetState()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add documents')
      setUploadProgress(0)
    }
  }

  const resetState = () => {
    setFiles([])
    setUploadProgress(0)
    setError(null)
  }

  const totalFileSize = files.reduce((acc, f) => acc + f.size, 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Documents</DialogTitle>
          <DialogDescription>
            Add documents to <span className="font-medium">{kbName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div
            className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer"
            onClick={() => document.getElementById('doc-upload')?.click()}
          >
            <FileUp className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              Click to select files or drag and drop
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {ALLOWED_EXTENSIONS.join(', ')} (max {MAX_FILES} files, 30MB total)
            </p>
            <input
              id="doc-upload"
              type="file"
              multiple
              accept={ALLOWED_EXTENSIONS.join(',')}
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {files.length > 0 && (
            <ScrollArea className="h-[150px] rounded-md border">
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={files.length === 0 || addDocuments.isPending}
          >
            {addDocuments.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Documents
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
