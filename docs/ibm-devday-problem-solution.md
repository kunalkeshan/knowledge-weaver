# IBM Dev Day — AI Demystified: Problem & Solution Statement

**Community Knowledge Weaver** — Written submission (≤ 500 words)

---

## Problem

Modern teams are drowning in information but starved of structured, actionable knowledge. **Who has the problem:** Project leads, developers, and managers in tech companies and growing organizations. **Context:** Important know-how lives in scattered places—Google Drive, Confluence, Slack, wikis, ticket systems—so people repeatedly ask the same questions even when answers exist somewhere.

**Why the current process is slow and error-prone:** Finding out where a project lives, what’s in it, or adding a task often means jumping between tools; knowledge bases become static graveyards that nobody maintains. Building and maintaining internal playbooks is manual and expensive. One concrete example: someone asks “Where is project Alpha hosted and what are the open tasks? I need to add a task to it.” Today, they must hunt across multiple tools, ask colleagues, or open outdated wikis—slow, inconsistent, and prone to wrong or missing information.

---

## Solution Overview

**We built Community Knowledge Weaver, an agentic AI assistant that turns scattered organizational knowledge into one place to ask questions and get grounded, actionable answers—using IBM watsonx Orchestrate.**

**What the user sees:** A web app (Next.js) with a **Dashboard** that includes: **Tracking** (Projects, Tickets, Policies), a **Knowledge Base** (documents synced into AI agents), and **Ask**—a single chat where the user types a question and receives a coordinated response. Users can also open any specialist agent directly from **Agents**. Outcomes are visible in the same app: e.g. “Create a ticket for project Y” results in a new ticket in Tracking.

**High-level architecture:** The front end sends each user message to **watsonx Orchestrate** via the Custom Assistants API. An **orchestrator agent (AskOrchestrate)** receives the message, chooses the single best-matching specialist, and invokes that agent; the specialist’s response is returned to the user. Specialist agents use (1) **linked knowledge bases** in Watson, filled by syncing the app’s projects, tickets, notes, and policies, and (2) **MCP tools** exposed by our app—live read/write over projects, tickets, notes, and policies—so answers are grounded in real data and agents can create or update records when the user asks.

---

## Agentic AI and watsonx Orchestrate

**Agents and skills we defined:** We use **AskOrchestrate** as the main orchestrator and **nine specialist agents**: Onboarding Assistant, Project & Hosting Assistant, IT Support & Access, HR Policy Assistant, Process & How-To Assistant, Security & Compliance, Incident & Troubleshooting, Manager & Team Lead, and Knowledge & Learning. A tenth agent, **Response Verifier**, is used only to verify another agent’s answer (e.g. security/compliance), not as a chat target. Each specialist has clear instructions and a curated set of **MCP tools** (e.g. list_projects, get_ticket, create_ticket, list_policies, create_note)—so we limit which tools each agent can use by role.

**How watsonx Orchestrate coordinates the workflow:** The user talks only to the orchestrator. For each message, the orchestrator selects one specialist by intent (e.g. “where is project Alpha hosted?” or “add a task to project Alpha” → Project & Hosting Assistant), invokes that agent, and returns its response. The specialist uses its knowledge base and MCP tools in one flow: e.g. fetch live projects and tickets, or create a ticket—all within the same turn. **Design choices:** We restrict tools per agent (e.g. only Project & Hosting can create tickets/notes) to avoid misuse; we keep Response Verifier out of direct chat and use it only for verification; and we sync app data into Watson knowledge bases so answers stay grounded in the organization’s current content.

---

## Impact and Next Steps

**Impact:** Users get one place to ask questions and take action—faster onboarding, fewer repeated “where/how” requests, and answers tied to real projects, tickets, and policies. Non-technical users can ask in natural language; agents both answer and, when appropriate, create or update records (e.g. tickets, notes) so the workflow is usable end-to-end.

**Future work:** Extending to more connectors (e.g. Slack, GitHub), scheduled sync and feedback loops to improve answers, and optional verification for more high-risk domains.

---

*Word count: ~490*
