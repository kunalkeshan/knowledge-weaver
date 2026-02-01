/**
 * MCP endpoint: POST for Streamable HTTP protocol, GET returns 405.
 * Register Watson with: https://yourdomain.com/api/mcp (Streamable HTTP).
 */
import { createMcpServer } from '@/lib/mcp-server'
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { jsonrpc: '2.0', error: { code: -32603, message: 'MCP server not configured (DATABASE_URL)' }, id: null },
      { status: 503 },
    )
  }
  try {
    const server = createMcpServer()
    const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined })
    await server.connect(transport)
    const response = await transport.handleRequest(request)
    return response
  } catch (error) {
    console.error('[MCP] Error handling request:', error)
    return NextResponse.json(
      { jsonrpc: '2.0', error: { code: -32603, message: 'Internal server error' }, id: null },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { jsonrpc: '2.0', error: { code: -32000, message: 'Method not allowed. Use POST for MCP.' }, id: null },
    { status: 405 },
  )
}
