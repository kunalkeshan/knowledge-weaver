# Community Knowledge Weaver

> **IBM Dev Day AI Demystified Hackathon 2026** — *AI Demystified: From idea to deployment*

An agentic AI assistant that turns scattered organizational knowledge into one place to ask questions and get grounded, actionable answers — powered by **IBM watsonx Orchestrate**.

---

## Problem

Modern teams are drowning in information but starved of structured, actionable knowledge.

- **Who has the problem:** Project leads, developers, and managers in tech companies and growing organizations.
- **Context:** Important know-how lives in scattered places — Google Drive, Confluence, Slack, wikis, ticket systems — so people repeatedly ask the same questions even when answers exist somewhere.
- **Why the current process is slow and error-prone:** Finding out where a project lives, what's in it, or adding a task often means jumping between tools; knowledge bases become static graveyards that nobody maintains.

**Example scenario:** Someone asks *"Where is project Alpha hosted and what are the open tasks? I need to add a task to it."* Today, they must hunt across multiple tools, ask colleagues, or open outdated wikis — slow, inconsistent, and prone to wrong or missing information.

---

## Solution

**Community Knowledge Weaver** is a web app with a unified AI chat interface that:

1. **Tracks organizational data** — Projects, Tickets, Policies, and Notes in one dashboard
2. **Syncs content into AI agents** — Knowledge bases in watsonx Orchestrate stay up-to-date
3. **Routes questions to specialists** — An orchestrator picks the right expert agent for each query
4. **Takes action** — Agents can read *and write* data (create tickets, add notes) via MCP tools

### What the User Sees

| Section | Description |
|---------|-------------|
| **Dashboard** | Overview of projects, recent tickets, and quick actions |
| **Tracking** | Projects, Tickets, and Policies tabs — manage organizational data |
| **Ask** | Single chat interface — type a question, get a coordinated response from the right specialist |
| **Agents** | Direct access to any specialist agent for focused conversations |

When you ask to create a ticket or note, the outcome shows up right in Tracking — the full loop from question to action.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Web App (Next.js)                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐                     │
│  │Dashboard │  │ Tracking │  │   Ask    │  │  Agents  │                     │
│  └──────────┘  └──────────┘  └────┬─────┘  └──────────┘                     │
│                                   │                                         │
└───────────────────────────────────┼─────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         IBM watsonx Orchestrate                             │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                      AskOrchestrate (Router)                        │   │
│   │  Receives every message → picks the best specialist → returns      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│            ┌───────────────────────┼───────────────────────┐                │
│            ▼                       ▼                       ▼                │
│   ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐          │
│   │   Onboarding    │   │ Project&Hosting │   │  IT Support &   │          │
│   │   Assistant     │   │   Assistant     │   │     Access      │          │
│   └─────────────────┘   └─────────────────┘   └─────────────────┘          │
│   ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐          │
│   │   HR Policy     │   │ Process&How-To  │   │ Security &      │          │
│   │   Assistant     │   │   Assistant     │   │  Compliance     │          │
│   └─────────────────┘   └─────────────────┘   └─────────────────┘          │
│   ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐          │
│   │  Incident &     │   │ Manager & Team  │   │ Knowledge &     │          │
│   │ Troubleshooting │   │     Lead        │   │   Learning      │          │
│   └─────────────────┘   └─────────────────┘   └─────────────────┘          │
│                                                                             │
│   ┌─────────────────┐                                                       │
│   │    Response     │  ← Verifies high-risk answers (security/compliance)  │
│   │    Verifier     │                                                       │
│   └─────────────────┘                                                       │
│                                                                             │
│   Each specialist has:                                                      │
│   • Linked knowledge bases (synced from app data)                          │
│   • MCP tools (live read/write to projects, tickets, notes, policies)      │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            MCP Server (/api/mcp)                            │
│  Exposes 20 tools over Streamable HTTP:                                     │
│  • Projects: list, get, create, update, delete                              │
│  • Tickets:  list, get, create, update, delete                              │
│  • Notes:    list, get, create, update, delete                              │
│  • Policies: list, get, create, update, delete                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Supabase (PostgreSQL)                              │
│  Tables: Project, Ticket, Note, Policy, User, Session, Account, etc.       │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Agentic AI & IBM watsonx Orchestrate

### Orchestration Flow

1. User types a question in the **Ask** chat
2. Message is sent to **watsonx Orchestrate** via the Custom Assistants API
3. **AskOrchestrate** (orchestrator agent) selects the best-matching specialist by intent
4. Specialist uses its **knowledge base** + **MCP tools** to answer
5. Response is returned through the app

### Agents Defined

| Agent | Role |
|-------|------|
| **AskOrchestrate** | Main orchestrator — routes to specialists, never answers directly |
| **Onboarding Assistant** | New hire setup, Day-1/Week-1 topics, accounts, access |
| **Project & Hosting Assistant** | Where projects are hosted, tickets, notes, can create tickets/notes |
| **IT Support & Access** | VPN, repo access, dev environment issues |
| **HR Policy Assistant** | PTO, leave, benefits, company policies |
| **Process & How-To Assistant** | Step-by-step procedures, deployment, escalation |
| **Security & Compliance** | PII handling, production access, audit topics |
| **Incident & Troubleshooting** | Outages, runbooks, postmortems, escalation paths |
| **Manager & Team Lead** | Contractor onboarding, approvals, team procedures |
| **Knowledge & Learning** | Learning paths, documentation, project overviews |
| **Response Verifier** | Verifies high-risk answers (not a chat target) |

### MCP Tools Integration

Specialist agents have curated access to live database tools:

| Tool | Description |
|------|-------------|
| `list_projects`, `get_project` | Query project data |
| `list_tickets`, `get_ticket`, `create_ticket`, `update_ticket` | Manage tickets |
| `list_notes`, `get_note`, `create_note`, `update_note` | Manage notes (scoped to projects) |
| `list_policies`, `get_policy` | Query policies by category (hr, it, security) |

Tools are restricted per agent by role — only Project & Hosting Assistant can create tickets/notes, preventing misuse.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui |
| **Backend** | Next.js API Routes, Prisma ORM |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Better Auth (email + OAuth providers) |
| **AI Orchestration** | IBM watsonx Orchestrate (Custom Assistants API) |
| **Agent Tools** | MCP Server (Model Context Protocol) over Streamable HTTP |
| **State Management** | TanStack Query, TanStack AI |

---

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 10+
- Supabase project (PostgreSQL)
- IBM watsonx Orchestrate account

### Environment Variables

Create a `.env.local` file:

```bash
# Database
DATABASE_URL="postgresql://..."

# Better Auth
BETTER_AUTH_SECRET="..."
BETTER_AUTH_URL="http://localhost:3000"

# OAuth (optional)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."

# IBM watsonx Orchestrate
WATSON_API_KEY="..."
WATSON_SERVICE_URL="https://api.us-south.assistant.watson.cloud.ibm.com"
WATSON_INSTANCE_ID="..."
WATSON_ORCHESTRATOR_AGENT_ID="..." # Optional: auto-discovers AskOrchestrate
```

### Installation

```bash
# Install dependencies
pnpm install

# Generate Prisma client
pnpm prisma:generate

# Push database schema
pnpm prisma db push

# Start development server
pnpm dev
```

### Setup watsonx Orchestrate

1. **Seed Watson agents:**
   ```bash
   curl -X POST http://localhost:3000/api/admin/seed-watson-agents
   ```

2. **Seed sample data:**
   ```bash
   curl -X POST http://localhost:3000/api/admin/seed-db
   ```

3. **Sync knowledge to Watson:**
   ```bash
   curl -X POST http://localhost:3000/api/admin/sync-to-watson
   ```

4. **Register MCP tools** in Watson Orchestrate (ADK CLI):
   ```bash
   orchestrate toolkits add \
     --kind mcp \
     --name knowledge-weaver \
     --url "https://YOUR_DOMAIN/api/mcp" \
     --transport streamable_http \
     --tools "list_projects,get_project,list_tickets,get_ticket,create_ticket,list_notes,get_note,create_note,list_policies,get_policy"
   ```

---

## Demo Flow

1. **Show the Dashboard** — Overview of tracked projects, tickets, policies
2. **Navigate to Tracking** — Add a project, create some tickets and notes
3. **Open Ask** — Type: *"Where is project Alpha hosted and what are the open tickets?"*
4. **Watch orchestration** — AskOrchestrate routes to Project & Hosting Assistant
5. **Ask to create** — Type: *"Add a task to project Alpha titled 'Update login docs'"*
6. **See the outcome** — New ticket appears in Tracking → Tickets

**Key demo point:** The agent both answered questions AND created a real ticket in the app — grounded in live data, not hallucinated.

---

## Impact

- **One place to ask and act** — Faster onboarding, fewer repeated "where/how" requests
- **Answers tied to real data** — Projects, tickets, and policies from your organization
- **Non-technical friendly** — Natural language queries; agents handle the complexity
- **End-to-end workflow** — From question to action (e.g., create ticket) in one conversation

---

## Future Work

- **More connectors** — Slack, GitHub, Confluence integration
- **Scheduled sync** — Automatic knowledge base updates
- **Feedback loops** — User ratings to improve agent responses
- **Expanded verification** — More high-risk domains verified automatically

---

## Project Structure

```
knowledge-weaver/
├── src/
│   ├── app/
│   │   ├── (auth)/           # Login, register pages
│   │   ├── (static)/         # Landing, about, pricing pages
│   │   ├── dashboard/        # Main app pages
│   │   │   ├── ask/          # Unified chat interface
│   │   │   ├── agents/       # Direct agent chat
│   │   │   └── tracking/     # Projects, tickets, policies
│   │   └── api/
│   │       ├── mcp/          # MCP server endpoint
│   │       ├── agents/       # Watson agent management
│   │       ├── chat/         # Chat threads and messages
│   │       └── admin/        # Seeding and sync endpoints
│   ├── components/           # React components
│   ├── lib/                  # Utilities, Watson client, auth
│   └── server/               # Server-side logic, Prisma
├── prisma/                   # Database schema
├── mcp-server/               # Standalone MCP server (alternative)
└── docs/                     # Documentation
```

---

## Documentation

- [`docs/ibm-devday-problem-solution.md`](docs/ibm-devday-problem-solution.md) — Hackathon submission writeup
- [`docs/ibm-devday-video-and-orchestrate-description.md`](docs/ibm-devday-video-and-orchestrate-description.md) — Video script and Orchestrate description
- [`docs/agent-system-instructions.md`](docs/agent-system-instructions.md) — System prompts for each agent
- [`docs/askorchestrate-instructions-and-connections.md`](docs/askorchestrate-instructions-and-connections.md) — Orchestrator setup guide
- [`docs/mcp-supabase-tools.md`](docs/mcp-supabase-tools.md) — MCP tools reference
- [`docs/business-technical-plan.md`](docs/business-technical-plan.md) — Full business and technical plan

---

## Team

Built for the **IBM Dev Day AI Demystified Hackathon 2026**.

---

## License

MIT
