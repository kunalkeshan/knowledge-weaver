# Community Knowledge Weaver – Business & Technical Plan (IBM watsonx)

## 1. One‑Line Pitch

**Community Knowledge Weaver** turns scattered organizational and community knowledge (docs, forums, repos, wikis) into **actionable learning paths and guided workflows** using **agentic AI on IBM watsonx**.

---

## 2. Business Perspective

### 2.1 Problem

Modern teams are drowning in information but starved of structured, actionable knowledge:

- Onboarding new employees takes **weeks** because important know‑how is spread across Google Drive, Confluence, Slack, GitHub, and internal wikis.
- People repeatedly ask the **same questions**, even though answers exist somewhere in docs or past tickets.
- Knowledge bases become **graveyards**: static pages that no one reads, no paths, no guidance.
- Building and maintaining internal “academy” or “playbook” sites is **manual and expensive**.

This leads to:

- Slow onboarding and ramp‑up
- Lost productivity answering the same questions
- Hidden “tribal knowledge” locked in individuals
- Inconsistent understanding of processes and best practices

### 2.2 Solution Overview

Community Knowledge Weaver is a **multi‑agent AI system** that:

1. **Ingests knowledge** from:
   - File uploads (PDF, DOCX, MD, TXT)
   - Google Drive
   - Confluence (and later GitHub, Notion, Slack)
2. **Vectorizes and indexes** content using **IBM watsonx.ai embeddings** + pgvector.
3. **Weaves** relevant fragments into:
   - Guided learning paths (step‑by‑step)
   - Troubleshooting guides
   - Onboarding journeys
4. **Verifies** accuracy using a dedicated verifier agent.
5. **Exposes** this as:
   - A simple web app (Next.js)
   - A future Slack bot / chat entry point

You query topics like:

- “Onboard a new frontend dev to our stack”
- “How do we deploy a new service?”
- “How do we set up local dev for project X?”

You get:

- A structured path with **steps, time estimates, resources**
- Links back to source docs
- Confidence indicators & verification status

### 2.3 Target Users & Use Cases

**Primary target:**

- Tech companies (startups → mid‑size) with:
  - Growing engineering/product teams
  - Fragmented documentation
  - Slow onboarding

**Key workflows:**

1. **Onboarding New Joiners**
   - Role‑specific learning paths (e.g., “Frontend dev in team Alpha”).
   - Day‑1, Week‑1, Month‑1 plans.
   - Links to code, docs, and tools.

2. **Internal Process Guides**
   - “How do I deploy a new version?”
   - “What’s our incident management process?”
   - “How do we request production access?”

3. **Troubleshooting / How‑to**
   - “Page load is slow on mobile – what have we tried before?”
   - “How do I debug auth issues in service X?”

### 2.4 Why This Is Valuable

- **Reduces onboarding time** from weeks to days.
- **De‑risks knowledge loss** when senior people leave.
- Turns existing documents into **structured, reusable assets**.
- Works on **top of existing tools** (Drive, Confluence) – no rip‑and‑replace.

### 2.5 Why IBM watsonx (Business Lens)

- **watsonx.ai Granite models**: enterprise‑grade, explainable, controllable.
- **Orchestrated, agentic workflows** align with IBM’s narrative around **composable AI services** and governance.
- Strong story for **enterprise adoption**: security, governance, IBM ecosystem, and the ability to deploy in regulated environments.
- Opens path to **enterprise integrations** (e.g., IBM automation products, observability, ITSM) in future versions.

### 2.6 Hackathon Fit

- Theme: **“AI Demystified — From idea to deployment”**.
- Our angle: **Demystify knowledge bases** – companies describe their documentation sources, and the system builds an AI‑powered, guided knowledge experience.
- Clear story:
  - Input: messy, siloed docs.
  - Output: ready‑to‑use learning paths & workflows.
- Demonstrates:
  - RAG + embeddings.
  - Multi‑agent reasoning.
  - Integration with IBM watsonx.ai.
  - Clear, visual demo that non‑technical judges can understand.

---

## 3. Technical Architecture (High‑Level)

### 3.1 Stack Overview

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind, shadcn/ui.
- **Auth:** Better Auth (email + Google).
- **Backend:** Next.js API routes (server actions where helpful).
- **Database:** Supabase PostgreSQL.
- **ORM:** Drizzle ORM.
- **Vector Search:** pgvector extension in Supabase.
- **AI:**
  - IBM watsonx.ai **Granite embeddings** (e.g., `ibm/slate-125m-english-rtrvr` or equivalent).
  - IBM watsonx.ai **Granite chat/generation** (e.g., `ibm/granite-13b-chat-v2`).
- **Document Processing:** `pdf-parse`, `mammoth`, `marked` (Docling optionally later).
- **Connectors:**
  - Google Drive API.
  - Confluence REST API.

> For the hackathon, we implement **our own agents in code** (harvester, synthesizer, path builder, verifier) that call watsonx.ai, rather than relying on a full external workflow engine.

### 3.2 Core Data Model (Drizzle + Supabase)

- `companies`
  - `id`, `name`, `slug`, `createdAt`, `updatedAt`
- `users`
  - `id`, `email`, `name`, `companyId`, `createdAt`, `updatedAt`
- `data_sources`
  - `id`, `companyId`, `type` (`'upload' | 'google_drive' | 'confluence'`), `config` JSONB, `status`, `lastSyncAt`
- `documents`
  - `id`, `companyId`, `dataSourceId`, `title`, `content`, `contentType`, `metadata` JSONB, `externalId`, `externalUrl`, `status`, timestamps
- `document_chunks`
  - `id`, `documentId`, `companyId`, `chunkIndex`, `content`, `embedding` (vector), `metadata` JSONB, `createdAt`
- `learning_paths`
  - `id`, `companyId`, `query`, `workflowType`, `title`, `contentMarkdown`, `stepsJson`, `verificationJson`, `agentTracesJson`, timestamps

---

## 4. Agents & Orchestration (Technical View)

We implement a **logical multi‑agent system** inside our backend. Each “agent” is just a well‑structured service using watsonx.ai with a focused role.

### 4.1 Harvester Agent

**Responsibility:** Retrieve the most relevant knowledge chunks for a query.

- **Input:** `{ query, companyId }`.
- **Steps:**
  1. Compute query embedding using Granite embeddings model.
  2. Perform pgvector similarity search on `document_chunks` filtered by `companyId`.
  3. Return top‑k chunks with metadata and similarity scores.

- **Output:**
  - `chunks: Array<{ id, documentId, content, metadata, similarity }>`
  - `trace: { retrievedCount, avgSimilarity, executionMs }`

### 4.2 Synthesizer Agent

**Responsibility:** Merge relevant chunks into a coherent knowledge summary.

- **Input:** `{ query, chunks }`.
- **Steps:**
  1. Build prompt with:
     - System role: “You are a knowledge synthesis expert…”
     - User content: query + ~N most relevant chunks, with doc titles and context.
  2. Call Granite chat model.
  3. Enforce style: no hallucinated tools, keep references to sources.

- **Output:**
  - `synthesis: string`
  - `trace: { tokenUsage, chunkCount, executionMs }`

### 4.3 Path Builder Agent

**Responsibility:** Convert synthesis into a structured learning/workflow path.

- **Input:** `{ query, synthesis, workflowType }`.
- **Steps:**
  1. Prompt engineer for specific workflow types:
     - `onboarding`: Day‑1/Week‑1/Month‑1, prerequisites, checkpoints.
     - `process_guide`: prerequisites, main steps, validation, risk points.
     - `troubleshooting`: symptoms, checks, decision points.
     - `general`: overview, suggested reading order, practice tasks.
  2. Ask Granite to output **strict JSON** (or markdown + JSON) with:
     - `title`
     - `steps: [{ stepNumber, title, description, estimatedTime, resourceRefs }]`
  3. Parse response and validate schema.

- **Output:**
  - `learningPath = { title, contentMarkdown, steps }`
  - `trace: { tokenUsage, stepCount, executionMs }`

### 4.4 Verifier Agent

**Responsibility:** Check path accuracy and grounding.

- **Input:** `{ learningPath, chunks }`.
- **Steps:**
  1. Provide Granite with:
     - The generated path (steps).
     - The original chunks used.
  2. Ask it to tag each step as:
     - `supported`, `partially_supported`, or `unsupported`.
     - Provide reasons and list of supporting chunk IDs.
  3. Compute overall confidence score (e.g., 0–1).

- **Output:**
  - `verification = { overallStatus, confidence, stepFindings: [...] }`
  - `trace: { tokenUsage, verificationMs }`

### 4.5 Orchestrator Function

**Function:** `executeMultiAgentWorkflow(query, workflowType, companyId)`

**Pipeline:**

1. Harvester → get `chunks`.
2. Synthesizer → get `synthesis`.
3. Path Builder → get `learningPath`.
4. Verifier → get `verification`.
5. Persist `learning_paths` record with:
   - `query`, `workflowType`, `title`, `contentMarkdown`, `stepsJson`, `verificationJson`, `agentTracesJson`.
6. Return `learningPath`, `verification`, and `sources` (chunk preview) to frontend.

---

## 5. Detailed Implementation Plan

### 5.1 Phase 0 – Environment & Auth

**Goal:** Secure, company‑scoped app.

1. **Initialize Next.js 15 project**
   - `create-next-app@latest` with TypeScript and App Router.
2. **Configure Supabase & pgvector**
   - Enable pgvector extension.
   - Set up project connection (env vars).
3. **Drizzle ORM**
   - Define schemas for `companies`, `users`, `data_sources`, `documents`, `document_chunks`, `learning_paths`.
   - Run migrations.
4. **Better Auth**
   - Email/password + Google.
   - On sign‑up: create `company` if needed and link user.

**Screens:**

- `/sign-in`, `/sign-up`
- `/dashboard` (post‑login)
  - Summary: docs indexed, last sync, recent learning paths.
  - CTA cards for:
    - “Build knowledge base”
    - “Generate a learning path”

---

### 5.2 Phase 1 – Knowledge Base & Upload Flow

#### 5.2.1 UI: Knowledge Base

Route: `/dashboard/knowledge-base`

Sections (tabs or cards):

1. **Upload Documents**
2. **Connectors**
3. **All Documents**

**Upload Documents**

- Drag‑and‑drop area + “Browse files”.
- Supported: `.pdf`, `.docx`, `.md`, `.txt`.
- Show:
  - File name
  - Size
  - Status (Pending / Uploading / Processing / Indexed / Failed)
- Button: “Upload All”.

**All Documents**

- Table:
  - Title
  - Source (Upload / Google Drive / Confluence)
  - Status
  - Last updated
  - Link: “View source” (if externalUrl)

#### 5.2.2 Backend: Upload Pipeline

**Endpoint:** `POST /api/knowledge-base/upload`

Steps:

1. Validate user session → `companyId`.
2. Parse `multipart/form-data`.
3. For each file:
   - Store metadata in `documents` (status `processing`).
   - Store file in object storage or temp (optional; for hackathon we can process in memory).
4. Process file:
   - `parseDocument(buffer, filename)`:
     - PDF: `pdf-parse`
     - DOCX: `mammoth`
     - MD/TXT: basic parsers.
   - Chunk text: `chunkText(content, { chunkSize: ~800–1000 tokens, overlap: ~100 tokens })`.
   - Call watsonx.ai embedding model for each chunk (batched).
   - Insert chunks to `document_chunks` with embeddings and metadata.
   - Update `documents.status = 'indexed'`.

**Error handling:**

- On parser error or embedding API error:
  - Mark document `status = 'failed'` with error message.

---

### 5.3 Phase 2 – Google Drive Connector

**Goal:** Pull documents from a Drive folder and index them.

#### 5.3.1 UI

In **Connectors** tab:

- **Google Drive connector card**:
  - Input: Google Drive folder URL or ID.
  - Button: “Connect & Sync”.
  - Status: Connected / Not connected.
  - Last sync time.

Future (post‑hackathon): additional parameters like MIME type filters.

#### 5.3.2 Backend Flow

1. Configure a Google service account and share the target folder with it.
2. **Connect endpoint:** `POST /api/connectors/google-drive/connect`
   - Save folderId + service account config (reference) in `data_sources.config`.
3. **Sync endpoint:** `POST /api/connectors/google-drive/sync`
   - List files in the folder using the Drive API.
   - For each supported file:
     - Check if `externalId` already in `documents`.
     - If new / updated:
       - Download content.
       - Reuse `parseDocument` + chunk + embeddings + `document_chunks` logic.
   - Update `data_sources.lastSyncAt` and status.

---

### 5.4 Phase 3 – Query → Learning Path Experience

#### 5.4.1 UI: Workflow Query

Route: `/dashboard/workflows`

**Components:**

- Textarea:
  - Placeholder: “Describe what you want to learn or solve (e.g., ‘Onboard a new frontend dev to Project X’)”.
- Select:
  - `workflowType` options:
    - **Onboarding**
    - **Process Guide**
    - **Troubleshooting**
    - **General Learning Path**
- Button: “Generate Path”.

**Result View:**

- Card with:
  - Path title.
  - Subtitle: query.
- Steps rendered as vertical cards:
  - **Step N — Title**
  - Description.
  - Estimated time (if present).
  - “View sources” → modal listing snippets, doc titles, links.
- Verification banner:
  - Status pill: “Verified” / “Needs review”.
  - Confidence percentage.
  - Tooltip: short verifier explanation.
- “Save to library” and “Share link” buttons (Share can be a simple `learning_paths/:id` permalink).

#### 5.4.2 Backend: Orchestration Endpoint

Endpoint: `POST /api/workflows/query`

Parameters:

- `query: string`
- `workflowType: 'onboarding' | 'process_guide' | 'troubleshooting' | 'general'`

Steps:

1. Authenticate and get `companyId`.
2. Call `executeMultiAgentWorkflow(query, workflowType, companyId)`.
3. Persist `learning_paths` row.
4. Return serialized `learningPath` + `verification` + `sources`.

---

### 5.5 Phase 4 – Learning Path Library

**Goal:** Allow users to revisit and share paths.

Route: `/dashboard/learning-paths`

- Table:
  - Title.
  - Workflow type.
  - Created at.
  - Verification status.
- Row click → `/dashboard/learning-paths/:id`:
  - Show path details (same layout as “Result View”).
  - Show the original query.
  - Show verification info and agent traces (optional for transparency).

Public‑ish share (post‑hackathon):

- `/share/:slug` – read‑only view of the path (no editing, no internal agent traces).

---

## 6. IBM watsonx Integration – Technical Details

### 6.1 Authentication & Client

- Store IBM Cloud API key and endpoint in environment variables.
- Create a simple SDK wrapper for:
  - `generateEmbeddings(texts: string[])`
  - `chatCompletion(messages, options)` for Granite.

### 6.2 Embeddings

- Model: Granite‑based embedding model (e.g., `ibm/slate-125m-english-rtrvr` or recommended equivalent).
- Strategy:
  - Batch texts to stay within token limits.
  - Store normalized vectors in pgvector.
- Query embedding:
  - Single call per user query.
  - Use `cosine_similarity` or inner product for matching.

### 6.3 Chat / Generation

- Model: `ibm/granite-13b-chat-v2` (or equivalent).
- Use **system prompts** for each agent:
  - Harvester doesn’t need chat.
  - Synthesizer, PathBuilder, Verifier each have their own system instructions and user content.
- Key configuration:
  - Temperature low‑medium for Synthesizer & Verifier.
  - Slightly higher for PathBuilder to get more helpful explanations.

### 6.4 Governance & Guardrails

- Constrain prompts to:
  - Only use the provided context chunks.
  - Explicitly state if information is not available in sources.
- Log:
  - Prompt + model + outputs.
  - Model version for traceability.

---

## 7. Business & Product Narrative

### 7.1 Story for Judges / Stakeholders

1. **“You already have knowledge; it’s just scattered.”**
2. **“Community Knowledge Weaver connects your docs and tools.”**
3. **“Agents then harvest, synthesize, and weave learning paths for real workflows: onboarding, process guides, troubleshooting.”**
4. **“Everything is grounded in your actual docs, with verification and links to the original sources.”**
5. **“This is built on IBM watsonx, so it’s enterprise‑ready, governed, and explainable.”**

### 7.2 Differentiation

- Not “yet another chatbot” – it’s a **path builder** and **workflow explainer**.
- Multi‑agent reasoning adds:
  - Modular responsibilities.
  - Easier iteration and extension.
- IBM watsonx base makes it:
  - Suitable for enterprises worried about data privacy and governance.
  - Extensible to other IBM products later.

### 7.3 Future Extensions

- Slack / Teams bot:
  - “/weave onboarding frontend dev” → returns link to path.
- GitHub / GitLab integration:
  - Include READMEs, ADRs, PRs in knowledge base.
- Feedback loop:
  - Users mark steps as helpful / not helpful → retrain prompts or adjust ranking.
- Analytics:
  - Which paths are used most.
  - Where people drop off in onboarding.

---

## 8. Hackathon Execution Plan

### Day 1

- Finalize scope & flows.
- Set up:
  - Next.js + Supabase + Drizzle + Better Auth.
  - Basic `companies` and `users` model.
- Implement upload → parse → chunk → embed → store for **local uploads**.

### Day 2

- Implement Google Drive connector (MVP).
- Implement Harvester + Synthesizer agents.
- Implement `/dashboard/knowledge-base` UI.
- Implement `/dashboard/workflows` basic query → one agent chain.

### Day 3

- Implement Path Builder and Verifier agents.
- Build Learning Path UI and Library.
- Polish:
  - Loading states.
  - Error messages.
  - Basic theming.

### Demo Flow

1. Show uploading a few internal docs and connecting Google Drive folder.
2. Run a query:
   - “Onboard a new frontend engineer to our React stack.”
3. Show:
   - Path generation (live).
   - Steps and source links.
   - Verification status.
4. Close with:
   - “Same system can generate process guides and troubleshooting paths.”
   - “All built on IBM watsonx, ready for enterprise docs.”

---
