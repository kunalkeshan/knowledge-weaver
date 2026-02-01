import { cn } from '@/lib/utils'
import type { UIMessage } from '@tanstack/ai-react'
import ReactMarkdown from 'react-markdown'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'

/** Collapse 3+ newlines to 2 so AI output doesn't create huge vertical gaps */
function normalizeMarkdownSpacing(content: string): string {
  return content.replace(/\n{3,}/g, '\n\n').trim()
}

const assistantProseClass = cn(
  'prose prose-sm max-w-none dark:prose-invert',
  // Tighter vertical spacing for chat
  '[&>*:first-child]:mt-0 [&>*:last-child]:mb-0',
  '[&_p]:my-1.5 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0',
  '[&_ul]:my-1.5 [&_ol]:my-1.5 [&_ul]:pl-5 [&_ol]:pl-5',
  '[&_li]:my-0.5 [&_li>:first-child]:mt-0 [&_li>:last-child]:mb-0',
  '[&_h1]:mt-3 [&_h1]:mb-1.5 [&_h1]:text-lg',
  '[&_h2]:mt-2.5 [&_h2]:mb-1 [&_h2]:text-base',
  '[&_h3]:mt-2 [&_h3]:mb-1 [&_h3]:text-sm',
  '[&_pre]:my-1.5 [&_pre]:rounded-md [&_pre]:text-xs',
  '[&_hr]:my-2 [&_blockquote]:my-1.5 [&_blockquote]:border-l-2 [&_blockquote]:pl-3',
  '[&_table]:my-1.5 [&_th]:py-1 [&_td]:py-1'
)

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
        <div className={cn('text-sm', !isUser && assistantProseClass)}>
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
              const normalized = normalizeMarkdownSpacing(part.content)
              return (
                <div key={idx} className="[&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug]}>
                    {normalized}
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
