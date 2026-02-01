# MCP tool suggestions to make Knowledge Weaver stand out

This doc suggests **additional MCP tools** you can add to the same MCP server. They use your existing DB (and optional future integrations) so agents can do more than list/get/create—search, update, assign, and surface analytics. That makes the assistant feel integrated and “enterprise-grade.”

---

## Tier 1 – Same database, high impact (add next)

These use your current Prisma schema and no new infra. They give agents **search**, **updates**, **people lookup**, and **counts** so answers are actionable.

| Tool                     | Purpose                                                                                                | Agents that benefit                                | Why it stands out                                                                           |
| ------------------------ | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| **search_notes**         | Full-text or keyword search in note `title` + `content` (e.g. `q` param). Optional `projectId`, `tag`. | Process & How-To, IT Support, Onboarding, Incident | “Find anything about VPN” → one call instead of list + filter.                              |
| **search_policies**      | Search in policy `title` + `content` by keyword. Optional `category`.                                  | HR Policy, Security & Compliance, Onboarding       | “What does policy say about PTO?” → direct answer from live policies.                       |
| **update_ticket**        | Update a ticket: `status`, `assigneeId`, optionally `title`/`description`.                             | Project & Hosting, Manager & Team Lead, Incident   | “Mark ticket X done” / “Assign to John” without leaving chat.                               |
| **update_note**          | Update a note: `title`, `content`, `tag`, `projectId` (all optional).                                  | Manager & Team Lead, Process & How-To              | “Update that runbook with the new step” from conversation.                                  |
| **list_users**           | List users (id, name, email). Optional filter by name/email substring.                                 | Manager & Team Lead, IT Support, Project & Hosting | “Who can I assign this to?” / “Who is on project X?” (if you add project membership later). |
| **get_user**             | Get one user by id or email.                                                                           | Same as above                                      | “What’s John’s email?” / resolve assignee.                                                  |
| **get_dashboard_counts** | Aggregates: open ticket count per project, total open tickets, maybe notes-by-tag counts.              | Project & Hosting, Manager & Team Lead, Incident   | “You have 5 open tickets; 3 in Project Alpha” without listing everything.                   |

**Implementation notes (Tier 1):**

- **search_notes / search_policies:** Use Prisma `where: { OR: [{ title: { contains: q, mode: 'insensitive' } }, { content: { contains: q, mode: 'insensitive' } }] }` (PostgreSQL). Add `take: 20` and optional `projectId`/`tag`/`category`.
- **update_ticket / update_note:** Same pattern as `create_*` but `prisma.ticket.update` / `prisma.note.update` with `where: { id }` and partial `data`. Validate required fields; allow only safe updates (e.g. no changing `projectId` on ticket if that breaks invariants—your choice).
- **list_users / get_user:** `prisma.user.findMany` with `select: { id: true, name: true, email: true }`. No passwords or sessions. If you need “only assignable users,” you could add a role field later or filter by “has ever been assignee.”
- **get_dashboard_counts:** One or two Prisma `groupBy` or `findMany` + count: e.g. tickets by `projectId` where `status === 'open'`, then total open. Return JSON like `{ openTicketsByProject: [{ projectId, projectName, count }], totalOpenTickets }`.

---

## Tier 2 – Differentiators (chat context, verification)

These use your **chat** data or **verification** flow so the assistant feels context-aware and compliant.

| Tool                        | Purpose                                                                                                                      | Agents that benefit                                 | Why it stands out                                                     |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | --------------------------------------------------------------------- |
| **list_my_threads**         | List chat threads for the current user (e.g. by `userId`). Return thread id, agent, first message or title, date.            | Any agent (if you pass user context)                | “Here are your recent conversations” / “Last time you asked about X.” |
| **get_thread_messages**     | Get messages for a thread (role, content, createdAt).                                                                        | Same                                                | “In your last chat we decided Y” / summarize prior context.           |
| **verify_answer_citations** | Input: `answerText`, `policyIds[]` or `noteIds[]`. Check whether answer references or contradicts given policy/note content. | Response Verifier (or a dedicated compliance agent) | “Does this answer cite the correct policy?” → VERIFIED / CORRECTION.  |

**Implementation notes (Tier 2):**

- **list_my_threads / get_thread_messages:** MCP server currently has no auth; requests are server-to-server from Watson. So there is no “current user” unless you pass `userId` (or `threadId`) as a tool argument. Options: (1) Add optional `userId` param to tools and document “only use when acting on behalf of user X”; (2) When your app calls Watson, inject a “user context” tool that Watson can call with thread id, and your MCP server resolves thread → userId and then lists that user’s threads. So Tier 2 chat tools are doable but require a clear contract (e.g. “threadId required” or “userId from orchestrator”).
- **verify_answer_citations:** Implement as a pure function: fetch policy/note content by id, then check if `answerText` contains key phrases or contradicts the doc (e.g. simple keyword presence or an LLM call inside the tool). Return structured result for Response Verifier.

---

## Tier 3 – Integrations (future)

Once you plug in external systems, exposing them as MCP tools makes Knowledge Weaver the single place to “ask and act.”

| Tool                                         | Purpose                                                                   | Why it stands out                                             |
| -------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------- |
| **search_slack**                             | Search Slack channels/messages by keyword (Slack API).                    | “What did we say in #engineering about the outage?”           |
| **post_to_slack**                            | Post a message to a channel or user (with approval).                      | “I’ve posted the summary to #incidents.”                      |
| **get_jira_issue** / **link_ticket_to_jira** | Read Jira issue; optionally link a Knowledge Weaver ticket to a Jira key. | “Ticket X is linked to Jira PROJ-123; status is In Progress.” |
| **list_calendar_events**                     | Read calendar (Google/Microsoft) for today or date range.                 | “You have 3 meetings today; next one in 30 min.”              |
| **create_calendar_event**                    | Create meeting (with approval).                                           | “I’ve scheduled a follow-up for tomorrow 2pm.”                |

These require OAuth and env config (e.g. Slack bot token, Jira API key, calendar credentials). Implement when you add those integrations to the app; the MCP server can call the same backend services or HTTP clients.

---

## Using ClickUp’s official MCP server (no custom tools)

You **don’t need to define** ClickUp tools yourself. Use **ClickUp’s hosted MCP server** so agents get all [supported ClickUp MCP tools](https://developer.clickup.com/docs/mcp-tools) (Search Workspace, Create/Get/Update Task, bulk tasks, comments, time tracking, hierarchy, members, Chat, Docs) without any code in your app.

### Add ClickUp as a second MCP connection

- **Your Knowledge Weaver MCP** = your server at `https://YOUR_MCP_SERVER_URL/mcp` (projects, tickets, notes, policies).
- **ClickUp MCP** = ClickUp’s server at **`https://mcp.clickup.com/mcp`**.

Register both in Watson (two toolkits) or in Cursor (two entries in `.mcp.json`). Agents that need both can have both toolkits attached.

### Cursor / local IDE

In `.mcp.json` we added:

```json
"clickup": {
  "command": "npx",
  "args": ["-y", "mcp-remote", "https://mcp.clickup.com/mcp"]
}
```

If ClickUp’s [MCP Server Setup Instructions](https://developer.clickup.com/docs/mcp-tools) require env vars (e.g. API token), add an `"env"` object for the `clickup` server with the needed variables.

### Watson Orchestrate

Add a **second** MCP toolkit:

- **URL:** `https://mcp.clickup.com/mcp`
- **Transport:** whatever ClickUp supports (e.g. `streamable_http`); see ClickUp’s setup docs.
- **Tools:** use `"*"` or the explicit list from [Supported Tools](https://developer.clickup.com/docs/mcp-tools).

Then attach this ClickUp toolkit (or a subset of tools) to the agents that should use ClickUp (e.g. Project & Hosting Assistant, Manager & Team Lead). Update those agents’ system instructions in `docs/agent-system-instructions.md` to mention ClickUp tools (e.g. “You have ClickUp tools: search workspace, create/update task, get task comments, time tracking; use them when the user asks about ClickUp tasks or workspace.”).

#### If Watson shows “Gateway creation failed: 503 Unable to connect to gateway”

Watson’s gateway (IBM’s proxy that reaches remote MCP URLs) often **cannot** connect to third‑party hosts like `mcp.clickup.com` (egress rules, firewalls, or ClickUp requiring auth). So adding ClickUp’s URL directly in Watson may always fail with 503.

**Workaround: expose ClickUp via your own MCP server.** Watson already connects to **your** MCP server (Knowledge Weaver). Add **ClickUp tools inside your server**: your server calls the [ClickUp REST API](https://developer.clickup.com/docs) with `CLICKUP_API_TOKEN` and exposes tools such as `list_clickup_tasks`, `get_clickup_task`, `create_clickup_task` in `mcp-server/index.ts`. Watson then only talks to your MCP URL (no gateway to ClickUp). Your server does the ClickUp API calls server‑side. See the implementation sketch in the earlier “Connecting ClickUp (same pattern as your current MCP tools)” section (or the Tier 3 table) for tool names and API endpoints; implement a small `clickUpApi()` helper and register those tools when `CLICKUP_API_TOKEN` is set.

**Summary:** Use ClickUp’s official MCP in Cursor (works locally). For Watson, add ClickUp as **tools on your Knowledge Weaver MCP server** so Watson never has to connect to `mcp.clickup.com`.

**Minimal Watson workaround implementation:** In `mcp-server/index.ts`, if `process.env.CLICKUP_API_TOKEN` is set, add a helper `async function clickUpApi(path: string, opts?: RequestInit)` that `fetch`es `https://api.clickup.com/api/v2${path}` with header `Authorization: process.env.CLICKUP_API_TOKEN`. Then register e.g. `list_clickup_tasks` (GET `/list/{listId}/task`), `get_clickup_task` (GET `/task/{taskId}`), `create_clickup_task` (POST `/list/{listId}/task` with body `{ name, description?, assignees?, status?, ... }`). See [ClickUp API](https://developer.clickup.com/docs) for exact request/response shapes. Add these tool names to your Watson toolkit registration and to the agents that need ClickUp.

### Reference

- [ClickUp – Supported Tools](https://developer.clickup.com/docs/mcp-tools) – full list of tools and example prompts.
- ClickUp’s **MCP Server Setup Instructions** (same docs) for auth and Watson/Cursor setup.

---

**Note:** ClickUp has been removed from the MCP server; only database tools (Project, Ticket, Note, Policy) are exposed. The suggestions below are for other tools you could add.

## Suggested order of implementation

1. **Tier 1 (same DB):**
   - **search_notes** + **search_policies** (big UX win for “find anything about X”).
   - **update_ticket** + **update_note** (agents can change state, not only read/create).
   - **list_users** + **get_user** (needed for assignee resolution and “who is …?”).
   - **get_dashboard_counts** (one call for “how many open tickets?” / “per project?”).

2. **Tier 2:**
   - **verify_answer_citations** for Response Verifier.
   - **list_my_threads** / **get_thread_messages** once you have a clear way to pass user/thread context (e.g. from orchestrator or app).

3. **Tier 3:**
   - Per integration (Slack, Jira, calendar) as you add them.

---

## Where to implement

- **Same MCP server:** Add new `server.registerTool(...)` calls in `mcp-server/index.ts` for Tier 1 and Tier 2. Keep using the same Prisma client and `/mcp` endpoint; register Watson with the new tool names (explicit list or re-discover).
- **Agent instructions:** Update `docs/agent-system-instructions.md` for any agent that gets new tools (e.g. “You have search_notes and search_policies; use them when the user asks to find something in notes or policies”).
- **Tool → agent mapping:** Extend the table in `docs/mcp-supabase-tools.md` (§4) with the new tools and which agents should receive them (e.g. update_ticket → Project & Hosting, Manager & Team Lead; search_policies → HR, Security & Compliance).

If you want, next step can be concrete function signatures and Prisma snippets for **search_notes**, **search_policies**, **update_ticket**, and **get_dashboard_counts** in `mcp-server/index.ts`.
