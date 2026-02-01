# Programmatic Agent Creation (Plan Addendum)

Agents are created **from code only** (script or one-time API), not via the app UI. This keeps setup repeatable and avoids manual creation in the Watson UI.

**API reference:** [Register A New Agent (POST)](https://developer.watson-orchestrate.ibm.com/apis/agents/register-a-new-agent)

---

## 1. Watson API: POST Register a new agent

- **URL:** `POST {WATSON_INSTANCE_API_URL}/v1/orchestrate/agents`  
  (Same base as existing `listWatsonAgents` in [src/lib/watson.ts](src/lib/watson.ts).)

- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`  
  (Use existing `getWatsonAuthHeaders()`.)

- **Body (application/json):**

| Field            | Type             | Required | Notes                                                         |
| ---------------- | ---------------- | -------- | ------------------------------------------------------------- |
| `description`    | string           | **Yes**  | What the agent does                                           |
| `style`          | enum             | **Yes**  | `default` \| `react` \| `planner` \| `react_intrinsic`        |
| `name`           | string \| null   | No       | Internal name                                                 |
| `display_name`   | string \| null   | No       | User-facing name                                              |
| `instructions`   | string \| null   | No       | System instructions for the agent                             |
| `knowledge_base` | string[] \| null | No       | **List of KB IDs** — each agent has its own KB(s), not shared |
| `tools`          | string[] \| null | No       | Tool names                                                    |
| `llm`            | string \| null   | No       | LLM identifier                                                |
| `hidden`         | boolean          | No       | Default `false`                                               |
| `tags`           | string[] \| null | No       | Tags                                                          |

Other optional fields (guidelines, collaborators, additional_properties, chat_with_docs, etc.) can be omitted for a minimal create.

- **Response:** 200 with the created agent object (same shape as GET agent; includes `id`).

**Important:** Each agent is tied to **its own** knowledge base(s). There is no single shared KB for all agents. Flow: create one KB per agent (or per domain), then create the agent with `knowledge_base: [kbId]` (or multiple IDs if needed).

---

## 2. Implementation in code

### 2.1 Add `createWatsonAgent()` in [src/lib/watson.ts](src/lib/watson.ts)

- **Signature:**  
  `createWatsonAgent(params: CreateWatsonAgentParams): Promise<WatsonAgentFull>`

- **Params:** At least: `description`, `style` (`'default'` if unsure), optional `name`, `display_name`, `instructions`, `knowledge_base` (string[]).

- **Implementation:**
  - Use same `baseUrl` and `getWatsonAuthHeaders()` as existing agents API.
  - `POST` to `${baseUrl}/v1/orchestrate/agents` with JSON body.
  - Parse response and return in the same normalized shape as `getWatsonAgentFull` (e.g. `agent_id`, `name`, `knowledge_base`, etc.).
  - Add a type for the POST body (e.g. `WatsonAgentCreateBody` or `CreateWatsonAgentParams`) aligned with the API schema above.

### 2.2 Seed script / one-time route (no UI)

- **Option A – Node script:**  
  e.g. `scripts/seed-watson-agents.ts` (or `.js`) run with `ts-node` or `pnpm exec tsx`.
  - Load env (e.g. `WATSON_INSTANCE_API_URL`, `WATSON_CLOUD_API_KEY`).
  - For each agent in the list below:
    1. Create a Watson knowledge base (e.g. `createWatsonKnowledgeBase(name, [], description)` for an empty KB).
    2. Call `createWatsonAgent({ description, style: 'default', name, display_name, instructions, knowledge_base: [kb.id] })`.
  - Log created agent IDs and KB IDs (for config or env).

- **Option B – One-time API route:**  
  e.g. `POST /api/admin/seed-watson-agents` (protected; e.g. admin-only or disabled in production).
  - Same logic as the script: create KB per agent, then create agent with `knowledge_base: [kbId]`.
  - Return created agents and KBs.

Do **not** expose agent creation in the normal app UI; this is for setup only.

---

## 3. Agents to create (with instructions)

Each row is one agent. Each agent has **its own** knowledge base: create one KB, then pass `knowledge_base: [thatKbId]` when creating the agent. Names/IDs below are suggestions; you can align `name` / `display_name` with your app labels.

| #   | Use case                      | `name` (internal)                    | `display_name`              | `description`                                                                                                                    | `instructions` (summary)                                                                                                                                                                                                                      |
| --- | ----------------------------- | ------------------------------------ | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Onboarding (HR + IT)          | `onboarding-assistant`               | Onboarding Assistant        | Helps new hires with first-week setup, HR and IT onboarding steps, and where to find resources.                                  | You are an onboarding assistant. Answer only from the linked knowledge base. Cover Day-1 / Week-1 / Month-1 topics: accounts, access, tools, team intro, and company resources. Be concise and point to specific docs or steps.               |
| 2   | Project & where-things-are    | `project-hosting-assistant`          | Project & Hosting Assistant | Answers where projects and services are hosted, and summarizes project and ticket context.                                       | You are a project and hosting assistant. Use only the linked knowledge base (projects, tickets, notes). Answer where repos, apps, and docs are hosted; summarize project status and recent tickets. Cite sources when possible.               |
| 3   | IT support & access           | `it-support-access`                  | IT Support & Access         | Handles IT questions, access requests, VPN, repos, and dev environment issues.                                                   | You are an IT support assistant. Use only the linked knowledge base. Answer how to get VPN, repo access, and fix common dev environment issues. Follow runbooks and escalation steps. Do not grant access; direct users to the right process. |
| 4   | HR policies & regulations     | `hr-policy-assistant`                | HR Policy Assistant         | Answers company HR policies, regulations, and leave/benefits questions.                                                          | You are an HR policy assistant. Use only the linked knowledge base. Answer policy and regulation questions accurately. If unsure, say so and point to the right contact. Do not make up policies.                                             |
| 5   | Internal processes / how-do-I | `process-howto-assistant`            | Process & How-To Assistant  | Answers “how do I” questions: deployment, access requests, escalation, and internal processes.                                   | You are a process and how-to assistant. Use only the linked knowledge base. Give step-by-step, grounded answers with citations. Do not invent steps.                                                                                          |
| 6   | Security & compliance         | `security-compliance-assistant`      | Security & Compliance       | Handles security and compliance questions (PII, approvals, production access). High-risk: answers are verified by another agent. | You are a security and compliance assistant. Use only the linked knowledge base. Answer PII handling, approval requirements, and production access rules. Be precise; when in doubt, direct to security or compliance team.                   |
| 7   | Incident & troubleshooting    | `incident-troubleshooting-assistant` | Incident & Troubleshooting  | Helps with incidents, runbooks, postmortems, and escalation.                                                                     | You are an incident and troubleshooting assistant. Use only the linked knowledge base. Provide runbook steps, escalation paths, and past postmortem context. Urgent queries: prioritize clarity and next steps.                               |
| 8   | Manager & team lead           | `manager-team-lead-assistant`        | Manager & Team Lead         | Supports managers: contractor onboarding, new hire access, repo admin, and team procedures.                                      | You are a manager and team lead assistant. Use only the linked knowledge base. Answer onboarding checklists, access approval steps, and repo/admin procedures. Emphasize governance and approval flows.                                       |
| 9   | Knowledge & learning          | `knowledge-learning-assistant`       | Knowledge & Learning        | Learning paths, docs, and project overviews for juniors and cross-functional teams.                                              | You are a knowledge and learning assistant. Use only the linked knowledge base. Provide structured learning paths and doc overviews. Tailor depth to the question (overview vs detail).                                                       |
| 10  | Response verification         | `response-verifier`                  | Response Verifier           | Reviews another agent’s answer for accuracy and compliance (used automatically for high-risk intents).                           | You are a response verifier. You will be given: (1) the user’s question, (2) another agent’s answer. Respond with VERIFIED if the answer is accurate and compliant, or with a short correction/summary if not. Be concise.                    |

- **Style:** Use `style: 'default'` for all unless you have a reason to use `react` / `planner` / `react_intrinsic`.
- **Triage agent (optional):** If you want a dedicated triage agent that only classifies intent and returns an agent ID, add an 11th agent with instructions like: “You only classify the user’s intent and return a single agent name from: onboarding-assistant, project-hosting-assistant, it-support-access, hr-policy-assistant, process-howto-assistant, security-compliance-assistant, incident-troubleshooting-assistant, manager-team-lead-assistant, knowledge-learning-assistant. Respond with only that name and nothing else.” This agent may not need a KB or can have a small KB of intent examples.

---

## 4. Knowledge base per agent

- **Create one KB per agent** (or one per “domain” and assign that KB to the single agent for that domain).
- **Naming:** e.g. `KB - Onboarding`, `KB - Projects & Tickets`, `KB - IT Support`, … so it’s clear which agent they belong to.
- **Linking:** When calling `createWatsonAgent`, pass `knowledge_base: [kbId]` (array of IDs). Each agent’s `knowledge_base` is independent; there is no shared “common” KB for all agents.
- **Sync:** Later, your DB → Watson sync job will push Projects, Tickets, Notes, and Policies into the appropriate KBs (e.g. project/ticket data into Project & Hosting and possibly Incident; HR policies into HR Policy; etc.).

---

## 5. Order of operations in the seed script

1. Create all knowledge bases (empty or with minimal placeholder doc).
2. Create all agents, each with `knowledge_base: [itsKbId]` (or the list of KB IDs for that agent).
3. (Optional) Store created `agent_id` and `kb_id` in config or env for the app (e.g. triage mapping, verification agent ID).

---

## 6. Open points / questions

- **API path:** The IBM doc sometimes shows `/api/v1/orchestrate/agents`. Your app uses `baseUrl` + `v1/orchestrate/agents`. Confirm whether `WATSON_INSTANCE_API_URL` already includes `/api` or not; if not, the path above is correct.
- **LLM:** If the API requires `llm` for creation, you may need to pass a valid LLM id from your instance; the doc shows it as optional.
- **Idempotency:** If you re-run the script, decide: skip if an agent with the same `name` already exists, or create new and optionally archive old.
- **Triage agent:** Implemented as a separate Watson agent (as above) or as a separate LLM call in your backend—your choice; the plan’s “Ask” flow can use either.

If you have the exact Watson API doc link for the request/response schema (e.g. for `guidelines` or `additional_properties`), it can be added here for full parity with the API.

---

## 7. Related: database seeding

For seeding the app database (Projects, Tickets, Notes, Policies) with realistic, market-style data, see [database-seeding.md](database-seeding.md). That doc defines volumes (e.g. 6–12 projects, 30–80 tickets, 15–30 notes, 8–18 policies), content guidelines, example records, and implementation via Prisma seed. Run DB seed after migrations when setting up dev/demo; later, the “Sync to Watson” job will push this data into the per-agent knowledge bases.
