/**
 * GET /api/mcp/tools — list MCP tool names (for verification / Watson registration).
 */
import { MCP_TOOL_NAMES } from '@/lib/mcp-server'
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json(
    { tools: [...MCP_TOOL_NAMES], count: MCP_TOOL_NAMES.length },
    { headers: { 'Content-Type': 'application/json' } },
  )
}
