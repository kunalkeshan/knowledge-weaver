# MCP tools for Supabase (Knowledge Weaver tables)

This doc describes the **MCP server** that exposes your Supabase/Postgres tables (Project, Ticket, Note, Policy) as tools for Watson Orchestrate agents. You can attach these tools to specific agents so they can query live data in addition to the synced knowledge base.

---

## 1. What’s included

- **MCP endpoint** at **`/api/mcp`** (inside the Next.js app): uses the same database as the app (via `DATABASE_URL` / Prisma) and exposes **20 tools** (full CRUD for Project, Ticket, Note, Policy) over **Streamable HTTP** (Watson remote MCP supports this).
- **Project:** list_projects, get_project, create_project, update_project, delete_project
- **Ticket:** list_tickets, get_ticket, create_ticket, update_ticket, delete_ticket
- **Note:** list_notes, get_note, create_note, update_note, delete_note
- **Policy:** list_policies, get_policy, create_policy, update_policy, delete_policy

---

## 2. Running the MCP endpoint

**Requirements:** `DATABASE_URL` in `.env` (same as the app). The MCP server runs **inside the Next.js API**; no separate process is required.

- **Start the app:** `pnpm dev` (or `pnpm build && pnpm start`).
- **MCP URL:** `https://yourdomain.com/api/mcp` (or `http://localhost:3000/api/mcp` in development).
- **POST** to `/api/mcp` is the Streamable HTTP endpoint; Watson connects with transport **streamable_http**.
- **GET** `/api/mcp/tools` returns the list of tool names (for verification).

For production, protect `/api/mcp` (e.g. API key, internal-only, or VPN) if needed.

---

## 3. Registering with Watson Orchestrate

You have two options: **ADK CLI (Developer Edition)** or **Custom Assistants API (SaaS)**.

### Option A: ADK CLI (Developer Edition)

If you use Watson Orchestrate **Developer Edition** and the ADK CLI:

```bash
orchestrate toolkits add \
  --kind mcp \
  --name knowledge-weaver \
  --description "Projects, tickets, notes, policies from Knowledge Weaver (Supabase)" \
  --url "https://YOUR_DOMAIN/api/mcp" \
  --transport streamable_http \
  --tools "list_projects,get_project,create_project,update_project,delete_project,list_tickets,get_ticket,create_ticket,update_ticket,delete_ticket,list_notes,get_note,create_note,update_note,delete_note,list_policies,get_policy,create_policy,update_policy,delete_policy"
```

Replace `YOUR_DOMAIN` with your app’s host (e.g. `https://yourdomain.com` or `https://yourapp.vercel.app`). Use the **20-tool list** above; if you use `--tools "*"` and only see 8 tools in Watson, switch to this explicit list.

Then attach the **toolkit** (or individual tools from it) to the agents you want (e.g. Project & Hosting Assistant, HR Policy Assistant) in the Watson UI or via API.

### Option B: Custom Assistants API (SaaS)

If you use **watsonx Orchestrate SaaS** (Custom Assistants), check whether your instance supports **creating a tool** with **binding type MCP** (e.g. `binding.mcp` with `server_url`, `transport`). If it does:

1. Call **POST /v1/orchestrate/tools** with a body that describes the MCP server (name, description, input_schema, binding type MCP, server URL, transport).
2. Use the returned **tool ID(s)** when creating or updating agents: send `tools: [toolId]` in the agent create/update payload.

Our app already sends `tools` on agent create (`src/lib/watson.ts`); you’d add a step that creates the MCP tool(s) and passes their IDs into the seed or into `updateWatsonAgent` (once we support `tools` on update).

---

## 4. Which agents should get which tools

Suggested mapping (same idea as `AGENT_SYNC_MAP`):

| Agent                             | Suggested tools                                                                     | Reason                                                                        |
| --------------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| **Project & Hosting Assistant**   | list_projects, get_project, list_tickets, get_ticket, list_notes, get_note          | Answer “where is X hosted”, project/ticket/note context                       |
| **IT Support & Access**           | list_notes, list_policies (category it)                                             | Runbooks, IT policies                                                         |
| **HR Policy Assistant**           | list_policies (category hr), get_policy                                             | HR policies, leave, PTO                                                       |
| **Process & How-To Assistant**    | list_notes                                                                          | How-to notes                                                                  |
| **Security & Compliance**         | list_policies (category security, compliance), get_policy                           | Security/compliance policies                                                  |
| **Incident & Troubleshooting**    | list_tickets (kind/status), list_notes                                              | Incidents, runbooks                                                           |
| **Manager & Team Lead**           | list_projects, list_tickets, list_notes, list_policies (hr, it)                     | Team context, approvals                                                       |
| **Knowledge & Learning**          | list_projects, list_notes                                                           | Learning content, overviews                                                   |
| **Onboarding Assistant**          | list_notes, list_policies (hr, it)                                                  | Onboarding notes and policies                                                 |
| **AskOrchestrate (orchestrator)** | Optional: attach the full toolkit so it can call tools when delegating or answering | Depends on whether you want orchestrator to call DB tools or only specialists |

You can attach **all 20 tools** to one toolkit and then assign that toolkit (or a subset of tools) per agent. Give **write tools** (create*note, create_ticket) only to agents that should be able to create data. Use update*_ and delete\__ tools only for agents that should change or remove data (e.g. Manager & Team Lead, Project & Hosting Assistant).

**After attaching tools**, update each agent’s system instructions in Watson X so the agent knows when and how to use them. Use the instructions in **`agent-system-instructions.md`**; each section there includes MCP tool guidance (tool names, when to use, and input requirements). The Response Verifier does not receive MCP tools and needs no tool instructions.

---

## 5. I only see 8 MCP tools (missing create_note and create_ticket)

The server exposes **20 base tools** (full CRUD). If your client (e.g. Watson) shows fewer:

1. **Re-register with an explicit tool list** so the two write tools are included. When adding the toolkit, use:
   the full 20-tool list (see §3 Option A above).
   instead of `--tools "*"`.
2. **Check for a read-only filter** in the Watson UI when attaching the toolkit to an agent (e.g. “Query tools only” or “Read-only tools”). Disable it so `create_note` and `create_ticket` are available.
3. **Confirm the server exposes all tools:** with the app running, open:
   `http://localhost:3000/api/mcp/tools` (or `https://YOUR_DOMAIN/api/mcp/tools`). You should see `{"tools": ["list_projects", ... , "create_ticket"], "count": 20}`. If you see 10 there but not in Watson, the limitation is in Watson’s registration or UI.

---

## 6. Troubleshooting: Agent says “ticket created” but nothing in DB / no POST in terminal

If the Watson agent (e.g. Project & Hosting Assistant) replies with something like “Ticket created successfully!” but **no ticket appears in the app (Dashboard → Tracking)** and you see **no POST in your Next.js terminal**, the tool is almost certainly **not** being executed. Common causes:

1. **Watson cannot reach your MCP endpoint**
   - The MCP endpoint is at **`/api/mcp`** (same app as the web UI). If Watson runs in the cloud, it **cannot** reach `http://localhost:3000`. You must use a **publicly reachable URL** (e.g. your deployed app `https://yourdomain.com/api/mcp`, or ngrok: `ngrok http 3000`, then register `https://YOUR_NGROK_URL/api/mcp` in Watson).
   - **Check:** With the app running, try the same “create a ticket” prompt. If Watson is hitting your app, you may see a **POST /api/mcp** in the Next.js terminal (or your server logs). If you see nothing, Watson is not reaching your URL.

2. **Tool calls hit `/api/mcp`, not `/api/tickets`**
   - When the agent creates a ticket via MCP, the request goes to **POST /api/mcp** (MCP protocol). The route handler uses Prisma and writes to the database directly. You will **not** see a separate POST to `/api/tickets` when the agent creates a ticket via MCP.

3. **Agent has no write tools or isn’t calling them**
   - In Watson, ensure the **Project & Hosting Assistant** (or the agent you’re using) has **create_ticket** attached (and that the toolkit is registered with the full 20-tool list including write tools). If the agent only has read tools, it cannot create tickets.
   - Some setups can also cause the LLM to **simulate** a success message without invoking the tool. If you see no POST /api/mcp when you ask to create a ticket, the agent is answering without calling the tool. Fix connectivity (above) and tool attachment, and retry.

4. **Quick diagnostic**
   - Run the app: `pnpm dev`. Open `http://localhost:3000/api/mcp/tools`; you should see the tool list.
   - In Watson, register the toolkit with **`https://YOUR_PUBLIC_URL/api/mcp`** (not localhost). Trigger the same “add a ticket to Customer Portal” prompt.
   - Check your **server logs** for POST /api/mcp. If the tool ran, the new ticket appears in **Dashboard → Tracking**.

---

## 7. Security and auth

- The MCP endpoint uses **your app’s `DATABASE_URL`** and has **full read/write access** to Project, Ticket, Note, Policy. Do not expose it publicly without access control.
- Recommended: protect `/api/mcp` (e.g. API key header, internal-only network, or VPN). Watson “Connections” (key-value) can hold credentials. For a **remote** MCP URL, Watson only needs the URL; auth is between Watson and your app (e.g. API key in header).
- Today the endpoint has **no auth**; add middleware (e.g. API key or JWT) in the route if you expose it beyond localhost.

---

## 8. How to verify it’s working

1. **App running:** `pnpm dev` (or `pnpm start`). MCP is at `http://localhost:3000/api/mcp`.
2. **Tools list:** Open `http://localhost:3000/api/mcp/tools`; you should see `{"tools": [...], "count": 20}`.
3. **Watson connected:** In Watson, add the MCP server with URL `https://YOUR_DOMAIN/api/mcp` (Streamable HTTP), click Connect; the tools list should show (e.g. list_projects, create_note, …).
4. **Agent has tools:** Attach the MCP toolkit (or selected tools) to an agent (e.g. Project & Hosting Assistant).
5. **Chat test:** In Watson chat with that agent, ask something that needs live data or a write:
   - **Read:** e.g. “List all projects” or “What open tickets are there?” → agent should call list_projects / list_tickets and show live data.
   - **Write:** e.g. “Create a note titled Test with content Hello” or “Create a ticket in project X titled New task” → agent should call create_note / create_ticket and confirm creation.
6. **App/Tracking:** In your app, open **Dashboard → Tracking** (and project notes) and confirm the new note or ticket appears.

If the agent answers without calling the tool or says it can’t access data, check that the MCP URL (`https://YOUR_DOMAIN/api/mcp`) is reachable from Watson and that the agent has the right tools attached.

---

## 9. Summary

- **MCP endpoint**: **`/api/mcp`** (inside the Next.js app). Exposes 20 tools (full CRUD: project, ticket, note, policy) over Streamable HTTP. No separate MCP process; start the app with `pnpm dev` or `pnpm start`. Register Watson with **`https://YOUR_DOMAIN/api/mcp`**.
- **Watson**: Register the MCP URL as a **remote toolkit**, then attach the toolkit/tools to the agents listed above. Restrict update/delete tools to agents that should change or remove data.
- **Tables**: Same Supabase/Postgres tables as the app (Project, Ticket, Note, Policy); tools use Prisma with the same schema.
