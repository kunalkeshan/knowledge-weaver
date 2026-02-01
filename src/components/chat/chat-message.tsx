import { cn } from '@/lib/utils'
import type { UIMessage } from '@tanstack/ai-react'
import ReactMarkdown from 'react-markdown'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'

interface ChatMessageProps {
  message: UIMessage
  className?: string
  /** Show thinking dots when this is the streaming assistant message with no content yet */
  showThinkingDots?: boolean
}

export function ChatMessage({ message, className, showThinkingDots }: ChatMessageProps) {
  const isUser = message.role === 'user'

  return (
    <div className={cn('flex w-full gap-3 rounded-lg px-3 py-2', isUser ? 'bg-muted/50' : 'bg-background', className)}>
      <div className="flex flex-1 flex-col gap-1 wrap-break-word">
        <span className="text-xs font-medium text-muted-foreground">
          {message.role === 'user' ? 'You' : 'Assistant'}
        </span>
        <div className={cn('text-sm', !isUser && 'prose prose-sm max-w-none dark:prose-invert')}>
          {showThinkingDots && (
            <div className="flex items-center gap-1.5 py-1" aria-label="Thinking">
              <span className="thinking-dot" />
              <span className="thinking-dot" />
              <span className="thinking-dot" />
            </div>
          )}
          {message.parts?.map((part, idx) => {
            if (part.type === 'text') {
              if (isUser) {
                return (
                  <span key={idx} className="whitespace-pre-wrap">
                    {part.content}
                  </span>
                )
              }
              return (
                <div key={idx} className="whitespace-pre-wrap [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug]}>
                    {part.content}
                  </ReactMarkdown>
                </div>
              )
            }
            if (part.type === 'thinking') {
              return (
                <div
                  key={idx}
                  className="my-1 rounded border border-dashed border-muted-foreground/30 bg-muted/30 px-2 py-1 text-xs text-muted-foreground italic"
                >
                  {part.content}
                </div>
              )
            }
            return null
          })}
        </div>
      </div>
    </div>
  )
}
