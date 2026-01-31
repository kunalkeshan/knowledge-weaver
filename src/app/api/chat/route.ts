import { auth } from '@/lib/auth'
import { isWatsonConfigured } from '@/lib/config'
import { prisma } from '@/lib/prisma'
import { streamWatsonChat } from '@/lib/watson'
import type { WatsonRunsRequestBody } from '@/types/watson'
import { NextResponse } from 'next/server'

// AG-UI protocol: TanStack AI expects these event types and fields (see @tanstack/ai types)
const MESSAGE_ID = 'watson-assistant'
const RUN_ID = 'watson-run'

function sseLine(data: object | string): string {
  const payload = typeof data === 'string' ? data : JSON.stringify(data)
  return `data: ${payload}\n\n`
}

function ts(): number {
  return Date.now()
}

export async function POST(request: Request) {
  console.log('[Chat] POST /api/chat received')

  const session = await auth.api.getSession({
    headers: request.headers,
  })
  if (!session?.user) {
    console.log('[Chat] 401 Unauthorized – no session')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!isWatsonConfigured()) {
    console.log('[Chat] 503 Watson not configured')
    return NextResponse.json(
      { error: 'Watson not configured' },
      { status: 503 }
    )
  }

  let body: {
    messages?: Array<{ role: string; content: string }>
    agentId?: string
    threadId?: string
    agentName?: string
    data?: { agentId?: string; threadId?: string; agentName?: string }
  }
  try {
    body = await request.json()
    console.log('[Chat] body keys:', Object.keys(body))
    console.log('[Chat] body:', {
      messagesLength: Array.isArray(body.messages) ? body.messages.length : 'not array',
      agentId: body.agentId ?? body.data?.agentId ?? '(missing)',
      threadId: body.threadId ?? body.data?.threadId ?? '(missing)',
      agentName: body.agentName ?? body.data?.agentName ?? '(missing)',
    })
  } catch (e) {
    console.error('[Chat] 400 Invalid JSON body', e)
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    )
  }

  const agentId = body.agentId ?? body.data?.agentId
  const dbThreadId = body.threadId ?? body.data?.threadId
  const agentName = body.agentName ?? body.data?.agentName
  const messages = body.messages ?? []

  if (!agentId) {
    console.log('[Chat] 400 Missing agentId. body keys:', Object.keys(body))
    return NextResponse.json(
      { error: 'Missing agentId' },
      { status: 400 }
    )
  }
  if (!Array.isArray(messages)) {
    console.log('[Chat] 400 messages is not array:', typeof messages)
    return NextResponse.json(
      { error: 'messages must be an array' },
      { status: 400 }
    )
  }
  if (messages.length === 0) {
    console.log('[Chat] 400 messages array empty')
    return NextResponse.json(
      { error: 'Missing or empty messages' },
      { status: 400 }
    )
  }

  const lastUser = [...messages].reverse().find((m) => m.role === 'user')
  if (!lastUser) {
    console.log('[Chat] 400 No user message in messages. messages count:', messages.length, 'roles:', messages.map((m) => m.role))
    return NextResponse.json(
      { error: 'No user message in messages' },
      { status: 400 }
    )
  }

  const rawContent = lastUser.content
  let userContent: string
  if (typeof rawContent === 'string') {
    userContent = rawContent
  } else if (Array.isArray(rawContent)) {
    userContent = (rawContent as Array<{ type?: string; text?: string; content?: string }>)
      .map((p) => (p.type === 'text' ? p.text ?? p.content : '') ?? '')
      .filter(Boolean)
      .join('')
  } else {
    userContent = ''
  }

  if (!userContent.trim()) {
    console.log('[Chat] 400 No user message content. lastUser.content type:', typeof rawContent, 'sample:', JSON.stringify(rawContent)?.slice(0, 200))
    return NextResponse.json(
      { error: 'No user message content' },
      { status: 400 }
    )
  }

  console.log('[Chat] validated: agentId=', agentId, 'threadId=', dbThreadId ?? 'new', 'userContent length=', userContent.length)

  // Our thread id (DB) is used in URLs and API; Watson returns its own thread_id in run.started — we store that as watsonThreadId and send it on follow-up requests.
  let thread = dbThreadId
    ? await prisma.chatThread.findFirst({
        where: { id: dbThreadId, userId: session.user.id },
      })
    : null
  let watsonThreadId: string | undefined = thread?.watsonThreadId ?? undefined

  if (!thread && dbThreadId) {
    return NextResponse.json({ error: 'Thread not found' }, { status: 404 })
  }

  const watsonBody: WatsonRunsRequestBody = {
    message: { role: 'user', content: userContent },
    agent_id: agentId,
    ...(watsonThreadId ? { thread_id: watsonThreadId } : {}),
  }
  console.log('[Chat] watsonBody:', { agent_id: watsonBody.agent_id, thread_id: watsonBody.thread_id, messageLength: userContent.length })

  const encoder = new TextEncoder()
  let fullAssistantContent = ''

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // AG-UI: start run and message so client creates assistant message
        controller.enqueue(
          encoder.encode(
            sseLine({
              type: 'RUN_STARTED',
              runId: RUN_ID,
              timestamp: ts(),
            })
          )
        )
        controller.enqueue(
          encoder.encode(
            sseLine({
              type: 'TEXT_MESSAGE_START',
              messageId: MESSAGE_ID,
              role: 'assistant',
              timestamp: ts(),
            })
          )
        )

        for await (const chunk of streamWatsonChat(watsonBody)) {
          if (chunk.type === 'content' && chunk.content) {
            fullAssistantContent += chunk.content
            controller.enqueue(
              encoder.encode(
                sseLine({
                  type: 'TEXT_MESSAGE_CONTENT',
                  messageId: MESSAGE_ID,
                  delta: chunk.content,
                  content: fullAssistantContent,
                  timestamp: ts(),
                })
              )
            )
          } else if (chunk.type === 'done') {
            if (chunk.threadId) watsonThreadId = chunk.threadId
          }
        }

        // AG-UI: end message and run
        controller.enqueue(
          encoder.encode(
            sseLine({
              type: 'TEXT_MESSAGE_END',
              messageId: MESSAGE_ID,
              timestamp: ts(),
            })
          )
        )
        controller.enqueue(
          encoder.encode(
            sseLine({
              type: 'RUN_FINISHED',
              runId: RUN_ID,
              finishReason: 'stop',
              timestamp: ts(),
            })
          )
        )
        let resolvedThread = thread
        if (!resolvedThread) {
          resolvedThread = await prisma.chatThread.create({
            data: {
              userId: session.user.id,
              agentId,
              agentName: agentName ?? null,
              watsonThreadId: watsonThreadId ?? null,
            },
          })
        } else if (watsonThreadId && !resolvedThread.watsonThreadId) {
          await prisma.chatThread.update({
            where: { id: resolvedThread.id },
            data: { watsonThreadId },
          })
        }
        await prisma.chatMessage.create({
          data: { threadId: resolvedThread.id, role: 'user', content: userContent },
        })
        if (fullAssistantContent) {
          await prisma.chatMessage.create({
            data: {
              threadId: resolvedThread.id,
              role: 'assistant',
              content: fullAssistantContent,
            },
          })
        }
        controller.enqueue(
          encoder.encode(
            sseLine({ type: 'metadata', threadId: resolvedThread.id })
          )
        )
        console.log('[Chat] stream done, persisted thread', resolvedThread.id, 'messages:', fullAssistantContent.length, 'chars')
        controller.enqueue(encoder.encode(sseLine('[DONE]')))
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Stream failed'
        console.error('[Chat] stream error', e)
        controller.enqueue(
          encoder.encode(sseLine({ type: 'error', error: { message } }))
        )
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
