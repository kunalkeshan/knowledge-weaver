# IBM Dev Day — Video Script & Orchestrate Description

**Community Knowledge Weaver**

---

## 1. Video narration script (3–5 min)

Use large fonts and pre-filled data so judges can read. Prefer a smooth pre-recorded flow over risky live click-throughs.

---

### Part 1: Problem (30–45 s)

**[Show: slide or simple graphic — “The problem”]**

> “Modern teams are drowning in information but starved of actionable knowledge. Project leads, developers, and managers all feel this. Know-how lives everywhere—Drive, Confluence, Slack, wikis, tickets—so people keep asking the same questions even when answers exist somewhere.
>
> Finding out where a project lives, what’s in it, or adding a task often means jumping between tools. People spend time on ‘where is project X hosted?’ and ‘add a task to project Y’—and internal knowledge bases often become static graveyards that nobody maintains.
>
> One example: someone asks, ‘Where is project Alpha hosted and what are the open tasks? I need to add a task to it.’ Today they have to hunt across tools, ping colleagues, or open outdated wikis—slow, inconsistent, and error-prone.”

---

### Part 2: Solution overview (45–60 s)

**[Show: app Dashboard — Tracking, Knowledge Base, Ask]**

> “We built Community Knowledge Weaver—an agentic AI assistant that turns scattered organizational knowledge into one place to ask questions and get grounded, actionable answers, using IBM watsonx Orchestrate.
>
> What you see is a web app: a Dashboard with Tracking—projects, tickets, policies—a Knowledge Base we sync into our AI agents, and Ask, a single chat where you type a question and get a coordinated response. You can also open any specialist agent directly. When you ask to create a ticket or a note, the outcome shows up right here in Tracking.
>
> Under the hood: the front end talks to watsonx Orchestrate via the Custom Assistants API. An orchestrator agent, AskOrchestrate, receives every message, picks the right specialist, and returns that agent’s response. Specialists use linked knowledge bases in Watson—filled by syncing our app’s projects, tickets, notes, and policies—plus MCP tools we expose so they can read and write live data. So answers are grounded in real content and agents can create or update records when you ask.”

---

### Part 3: Agentic AI + watsonx Orchestrate (60–90 s)

**[Show: optional architecture slide — Orchestrator → Specialists; list of agents and tools]**

> “We use AskOrchestrate as the main orchestrator and nine specialist agents: Onboarding, Project and Hosting, IT Support and Access, HR Policy, Process and How-To, Security and Compliance, Incident and Troubleshooting, Manager and Team Lead, and Knowledge and Learning. A tenth agent, Response Verifier, is only used to verify another agent’s answer—not as a chat target.
>
> Each specialist has clear instructions and a curated set of MCP tools—like list_projects, get_project, get_ticket, create_ticket, create_note. We limit which tools each agent can use by role. For project and task questions, Project and Hosting handles both: it can list projects, get project details, list tickets, and create tickets or notes.
>
> How Orchestrate coordinates: the user talks only to the orchestrator. For each message, the orchestrator picks one specialist by intent—for example ‘where is project Alpha hosted?’ or ‘add a task to project Alpha’ both go to Project and Hosting—invokes that agent, and returns its response. The specialist uses its knowledge base and MCP tools in one flow: fetch live project and ticket data, or create a ticket, all in the same turn. We also sync app data into Watson knowledge bases so answers stay grounded in current content. That’s how we keep humans in the loop: answers and actions are tied to real projects and tickets in our app.”

---

### Part 4: Live demo walkthrough (1.5–2 min)

**[Show: Ask chat; use one clean end-to-end scenario. Pre-fill or use a scripted example.]**

**A. Starting input**

> “I’ll show one clean flow. Here’s the Ask chat.”

**[First: ask about the project.]**  
*“Where is project Alpha hosted and what are the open tickets?”*

**[Then: add a task to the project.]**  
*“Add a task to project Alpha titled ‘Update login docs’.”*

**B. Trigger**

> “I submit the request.”

**[Click Submit / Send.]**

**C. While the agent runs**

> “Orchestrate receives the message. The orchestrator chooses Project and Hosting for both—questions about the project and adding a task. The specialist uses its knowledge base and calls our MCP tools: list_projects and get_project to answer where Alpha is hosted, list_tickets for open tickets, and create_ticket when we ask to add a task. So you see: Orchestrate calls the right skill, that skill fetches project and ticket data or creates the ticket, then returns the response.”

**D. Visible outcome**

> “Here’s the response—project details and open tickets. And when we asked to add a task, we go to Tracking → Tickets and see the new ticket for project Alpha right here. That’s the full loop: ask about the project, add a task, real outcome in the app.”

---

### Part 5: Close with impact (20–30 s)

**[Show: Dashboard or summary slide.]**

> “So: one place to ask and act—faster onboarding, fewer repeated questions, answers and actions tied to real projects, tickets, and policies. Non-technical users can ask in natural language; agents both answer and, when appropriate, create or update records. We didn’t just build a model—we deployed a usable workflow, from idea to deployment. If we extend this beyond the hackathon, we’d add more connectors—Slack, GitHub—scheduled sync, and feedback loops to keep answers accurate. Thanks.”

---

## 2. Description: How you used agentic AI and IBM watsonx Orchestrate

**Copy-paste ready for submission.**

---

We used **agentic AI** and **IBM watsonx Orchestrate** as follows:

**Orchestration:** Users interact with a single chat in our web app (Ask). Every message is sent to **watsonx Orchestrate** via the Custom Assistants API. Our **orchestrator agent (AskOrchestrate)** runs in Watson: for each user message it selects the single best-matching specialist agent by intent (e.g. questions about a project, adding a task/ticket to a project, incidents, security, etc.) and invokes that agent. The specialist’s response is returned to the user through our app. So **watsonx Orchestrate coordinates** the routing, invocation, and response flow between the user and multiple specialized agents.

**Agents and skills:** We defined **one orchestrator** and **nine specialist agents** in Watson (Onboarding Assistant, Project & Hosting Assistant, IT Support & Access, HR Policy Assistant, Process & How-To Assistant, Security & Compliance, Incident & Troubleshooting, Manager & Team Lead, Knowledge & Learning), plus a **Response Verifier** used only to verify another agent’s answer (e.g. security/compliance), not as a chat target. Each specialist has its own instructions and a **curated set of MCP tools** exposed by our app (e.g. list_projects, get_ticket, create_ticket, list_policies, create_note). We limit which tools each agent can use by role so that only the right agents can create or update records.

**Knowledge and tools:** Specialist agents use (1) **knowledge bases** in Watson that we fill by syncing our app’s projects, tickets, notes, and policies, and (2) **MCP (Model Context Protocol) tools** that our app exposes over HTTP, giving agents live read/write access to the same data. So Orchestrate coordinates not only which agent answers but also how that agent gets grounded, up-to-date information and can perform actions (e.g. create a ticket or note) that appear in our app.

**Design choices:** We use a single orchestrator so users have one entry point; we restrict tools per agent to avoid misuse; we keep the Response Verifier out of direct chat and use it only for verification; and we sync app data into Watson so answers stay grounded in the organization’s current content. Together, this shows **agentic AI** (multiple agents with distinct roles and tools) and **watsonx Orchestrate** (orchestrator coordinating steps, tools, and hand-offs) delivering a single, usable workflow from idea to deployment.

---

*Use the script above for your video narration and the “How you used agentic AI and IBM watsonx Orchestrate” section as the written description for the submission form.*
