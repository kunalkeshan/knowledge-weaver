# Agents ↔ Knowledge Base Connection & Integration Plan

## 1. How agents connect to knowledge bases

### One agent → one KB (today)

- **Seed** (`POST /api/admin/seed-watson-agents`): Each agent is created with **one** knowledge base linked (`knowledge_base: [kbId]`).
- **KB per agent**: Each agent definition has a `kbName` (e.g. "KB - Onboarding", "KB - Projects & Tickets"). We match existing KBs by name or create them; that KB’s ID is sent in the Create Agent API.
- **Watson API**: The Create Agent body has `knowledge_base: [id1, id2, ...]`. We currently send a single ID per agent. The API allows multiple KBs per agent if you want one agent to search across several KBs.

### Summary

| What | Where | How |
|------|--------|-----|
| Agent ↔ KB link | Watson (agent’s `knowledge_base` array) | Set at creation (seed); can be updated later via PATCH agent. |
| Which content goes into which KB | App: `src/lib/sync-to-watson.ts` → `AGENT_SYNC_MAP` | By agent **display name** (e.g. "Onboarding Assistant"). |
| Pushing content into KBs | "Sync to Watson" (Tracking page) | For each agent in the map, build text from DB (projects/tickets/notes/policies), delete old `sync-db-*` docs, upload new doc to that agent’s first KB. |

So: **each agent is connected to one KB**. What that KB contains is decided by **AGENT_SYNC_MAP** (which entity types and policy categories to include for that agent).

---

## 2. How much to link: current mapping

**AGENT_SYNC_MAP** (in `src/lib/sync-to-watson.ts`) defines **what** is synced into each agent’s KB:

| Agent | Projects | Tickets | Notes | Policies (categories) |
|-------|----------|---------|-------|------------------------|
| Onboarding Assistant | — | — | ✓ | hr, it |
| Project & Hosting Assistant | ✓ | ✓ | ✓ | — |
| IT Support & Access | — | — | ✓ | it |
| HR Policy Assistant | — | — | — | hr |
| Process & How-To Assistant | — | — | ✓ | — |
| Security & Compliance | — | — | — | security, compliance |
| Incident & Troubleshooting | — | ✓ | ✓ | — |
| Manager & Team Lead | — | — | ✓ | hr, it |
| Knowledge & Learning | ✓ | — | ✓ | — |
| Response Verifier | — | — | — | security, compliance |

- **Projects**: name, slug, status, description, whereHosted, ticket count.
- **Tickets**: title, project, status, kind, description.
- **Notes**: title, tag, project, content.
- **Policies**: filtered by `category` (e.g. hr, it, security, compliance); title, category, effectiveAt, content.

You can change “how much” by:

1. **Editing AGENT_SYNC_MAP**: add/remove `projects`, `tickets`, `notes`, or `policies` (and policy categories) per agent.
2. **Linking more KBs to one agent**: when creating/updating the agent, pass `knowledge_base: [id1, id2, ...]`. Sync currently fills only the **first** KB per agent; you’d need to extend sync logic to push different content to different KBs if you use multiple KBs per agent.
3. **Keeping one KB per agent**: simplest. “How much” is then entirely controlled by what we put into that single KB via AGENT_SYNC_MAP.

---

## 3. Next plan of actions to integrate with the app

### Done today

- Agents created on Watson X (seed with valid `name`, `llm`, one KB per agent).
- Each agent linked to one KB (by name at seed time).
- Sync mapping: AGENT_SYNC_MAP defines what (projects/tickets/notes/policies) goes into each agent’s KB.
- Response Verifier added to AGENT_SYNC_MAP with policy context.

### Recommended next steps (in order)

1. **Run Sync to Watson**
   - Go to **Dashboard → Tracking** and click **“Sync to Watson”**.
   - This fills each agent’s KB with the content defined in AGENT_SYNC_MAP (from your DB: projects, tickets, notes, policies).
   - After this, agents can answer from up-to-date internal data.

2. **Verify Ask → Agent flow**
   - Use **Dashboard → Ask**, type a question (e.g. “How do I get VPN access?”, “Where is project X hosted?”).
   - Confirm triage routes to the right agent and the chat opens with that agent.
   - Confirm answers reflect synced content (and that the right KB is linked to each agent).

3. **Optional: Re-run seed only when needed**
   - Seed creates agents and links KBs; it does not need to run every time.
   - Re-run seed only when you add new agent definitions or need to recreate agents. Prefer **Sync to Watson** for keeping knowledge up to date.

4. **Optional: Scheduled or manual “Sync to Watson”**
   - Add a cron or background job that calls `runSyncToWatson()` on a schedule (e.g. daily), or keep the manual button and use it after big content changes.
   - Ensures agent knowledge stays in sync with projects/tickets/notes/policies.

5. **Optional: Multiple KBs per agent**
   - If you want one agent to use several KBs (e.g. “HR Policy” + “IT Policy”), extend seed/update to set `knowledge_base: [id1, id2, ...]` and extend sync to push to multiple KBs per agent according to a small “KB role” map.

6. **Optional: Tune triage**
   - Today: keyword-based triage in `src/lib/triage.ts` (TRIAGE_RULES).
   - Later: replace or augment with an LLM-based or Watson-based classifier if you need better routing.

7. **Optional: Last-synced indicator**
   - Store last sync timestamp (DB or env) and show “Last synced: …” on the Tracking page so users know how fresh the agents’ knowledge is.

8. **Security / auth**
   - Re-enable auth on `POST /api/admin/seed-watson-agents` and `POST /api/admin/sync-to-watson` when moving out of temporary setup (e.g. require admin or service role).

---

## 4. Quick reference

- **Agent ↔ KB link**: 1:1 today; set at agent creation (seed), stored in Watson on the agent’s `knowledge_base` array.
- **How much each KB gets**: Controlled by **AGENT_SYNC_MAP** in `src/lib/sync-to-watson.ts` (by agent display name).
- **When to run what**:
  - **Seed**: When you add new agents or need to recreate them (and when KBs exist or can be created).
  - **Sync to Watson**: Whenever you want agent answers to reflect latest projects/tickets/notes/policies (recommended after big content changes or on a schedule).

---

## 5. Response Verifier: never a chat destination; how to connect at Watson X

### In this app

- **Response Verifier is never a chat target.** Triage excludes it: user questions are never routed to "Response Verifier". Only the 9 primary agents (Onboarding, IT Support, HR, Project & Hosting, etc.) are valid destinations.
- **When we use the Verifier:** For high-risk intents (e.g. Security & Compliance), after the primary agent streams its answer we call the Verifier in code with (user question + primary answer) and append its verification to the response. So the connection is: **Primary agent → (in-app) → Response Verifier**.

### Connecting agents at Watson X (if you do it in the UI)

Watson X may let you connect agents so that one agent's output goes to another (e.g. a "review" or "verify" step). If you set that up in the Watson UI:

- **What to connect:** Each **primary agent** (Onboarding Assistant, IT Support & Access, HR Policy Assistant, Project & Hosting Assistant, Process & How-To Assistant, Security & Compliance, Incident & Troubleshooting, Manager & Team Lead, Knowledge & Learning) → **Response Verifier**.
- **Direction:** Primary agent responds first; then **Response Verifier** receives (user question + primary agent's response) and outputs verification (e.g. VERIFIED or a short correction). So Verifier is **downstream** of the primary agents.
- **If Watson X has a single "review step":** Configure that step to call the Response Verifier agent with the previous agent's output. If it only supports one global review agent, point it to Response Verifier.

We don't create these agent-to-agent links in code; the app only invokes the Verifier after high-risk primary responses. Any wiring inside Watson X (e.g. Verifier as sub-agent or post-step) is done in the Watson UI.

If you tell me your preferred “how much” per agent (e.g. “Security should also get tickets”), we can adjust AGENT_SYNC_MAP and, if needed, the sync logic (e.g. multiple KBs per agent) in code.

---

## 5. KB status API and document IDs (right sidebar / citations)

- The app uses the same **Watson KB status API** (`GET /v1/orchestrate/knowledge-bases/{id}/status`) that the Watson UI uses. That returns document IDs and metadata for each KB; we use it for the **right sidebar** (agent knowledge bases) and to **resolve citations** in chat (document ID → display name and optional URL).
- If a document in Watson has a **URL source** set (in Watson UI: KB → Files → URL source column), our chat already renders that citation as a clickable link. Sync currently uploads plain text only and does not set URL source via API; if the ingest API adds support for URL per document, we could set source URLs (e.g. link to the note/policy/ticket in our app) during sync so citations link back to the app.
