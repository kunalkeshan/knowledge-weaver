```markdown
# Community Knowledge Weaver – Complete Technical Implementation Guide

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Technology Stack Rationale](#2-technology-stack-rationale)
3. [Database Design & Schema](#3-database-design--schema)
4. [Project Setup & Configuration](#4-project-setup--configuration)
5. [Authentication System](#5-authentication-system)
6. [Document Ingestion Pipeline](#6-document-ingestion-pipeline)
7. [Vector Search & Embeddings](#7-vector-search--embeddings)
8. [Multi-Agent System Architecture](#8-multi-agent-system-architecture)
9. [API Routes & Server Actions](#9-api-routes--server-actions)
10. [Frontend Components & UI](#10-frontend-components--ui)
11. [Connector Implementations](#11-connector-implementations)
12. [IBM watsonx Integration](#12-ibm-watsonx-integration)
13. [Error Handling & Observability](#13-error-handling--observability)
14. [Performance Optimization](#14-performance-optimization)
15. [Testing Strategy](#15-testing-strategy)
16. [Deployment & DevOps](#16-deployment--devops)

---

## 1. Architecture Overview

### 1.1 High-Level System Design
```

┌─────────────────────────────────────────────────────────────┐
│ Frontend Layer │
│ Next.js 15 App Router + React Server Components + Tailwind │
└────────────────────┬────────────────────────────────────────┘
│
┌────────────────────┴────────────────────────────────────────┐
│ API & Server Layer │
│ Next.js API Routes + Server Actions + Auth Middleware │
└────────────────────┬────────────────────────────────────────┘
│
┌────────────┴──────────────┐
│ │
┌───────▼────────┐ ┌────────▼──────────┐
│ Multi-Agent │ │ Data Pipeline │
│ Orchestrator │ │ (Ingestion) │
│ │ │ │
│ ┌────────────┐ │ │ ┌───────────────┐ │
│ │ Harvester │ │ │ │ Parsers │ │
│ │ Agent │ │ │ │ (PDF/DOCX) │ │
│ └────────────┘ │ │ └───────────────┘ │
│ │ │ │
│ ┌────────────┐ │ │ ┌───────────────┐ │
│ │Synthesizer │ │ │ │ Chunker │ │
│ │ Agent │ │ │ │ (Text Split) │ │
│ └────────────┘ │ │ └───────────────┘ │
│ │ │ │
│ ┌────────────┐ │ │ ┌───────────────┐ │
│ │Path Builder│ │ │ │ Embeddings │ │
│ │ Agent │ │ │ │ Generator │ │
│ └────────────┘ │ │ └───────────────┘ │
│ │ │ │
│ ┌────────────┐ │ └───────────────────┘
│ │ Verifier │ │
│ │ Agent │ │
│ └────────────┘ │
└────────┬───────┘
│
│ IBM watsonx.ai API
│ (Embeddings + Granite Models)
│
┌────────▼────────────────────────────────────────────────────┐
│ Data Storage Layer │
│ │
│ ┌──────────────────┐ ┌──────────────────┐ │
│ │ PostgreSQL │ │ pgvector │ │
│ │ (Supabase) │◄──────►│ Extension │ │
│ │ │ │ (Embeddings) │ │
│ └──────────────────┘ └──────────────────┘ │
│ │
│ ┌──────────────────┐ ┌──────────────────┐ │
│ │ Drizzle ORM │ │ Better Auth │ │
│ │ (Type Safety) │ │ (Sessions) │ │
│ └──────────────────┘ └──────────────────┘ │
└─────────────────────────────────────────────────────────────┘

```

### 1.2 Request Flow Examples

**Upload Document Flow:**

```

User uploads PDF
↓
POST /api/knowledge-base/upload
↓
Store metadata in documents table (status: processing)
↓
Parse PDF → Extract text
↓
Chunk text (800-1000 tokens, 100 overlap)
↓
Generate embeddings via watsonx.ai (batched)
↓
Store chunks + vectors in document_chunks
↓
Update documents.status = 'indexed'
↓
Return success response

```

**Query → Learning Path Flow:**

```

User submits query "Onboard frontend dev"
↓
POST /api/workflows/query
↓
executeMultiAgentWorkflow()
↓
┌────────────────────────────────────────┐
│ 1. Harvester Agent │
│ - Embed query │
│ - Vector search document_chunks │
│ - Return top 10-20 chunks │
└────────────┬───────────────────────────┘
↓
┌────────────▼───────────────────────────┐
│ 2. Synthesizer Agent │
│ - Build context from chunks │
│ - Call Granite chat model │
│ - Produce coherent summary │
└────────────┬───────────────────────────┘
↓
┌────────────▼───────────────────────────┐
│ 3. Path Builder Agent │
│ - Use synthesis + workflow type │
│ - Generate structured steps (JSON) │
│ - Parse and validate │
└────────────┬───────────────────────────┘
↓
┌────────────▼───────────────────────────┐
│ 4. Verifier Agent │
│ - Check steps against chunks │
│ - Calculate confidence │
│ - Flag unsupported claims │
└────────────┬───────────────────────────┘
↓
Persist to learning_paths table
↓
Return path + verification + sources

````

---

## 2. Technology Stack Rationale

### 2.1 Frontend: Next.js 15 + TypeScript

**Why Next.js 15?**

- **App Router**: Better performance with React Server Components, streaming, and suspense.
- **Server Actions**: Simplified data mutations without separate API route files.
- **Image Optimization**: Built-in image handling.
- **TypeScript**: Type safety across client and server.

**Why Not Alternatives?**

- **React SPA**: Worse SEO, more client-side bundle, harder auth.
- **Remix**: Good alternative but smaller ecosystem for this use case.
- **Vue/Nuxt**: Team familiarity and IBM ecosystem leans React.

### 2.2 Styling: Tailwind + shadcn/ui

**Why Tailwind?**

- Rapid prototyping for hackathon.
- Utility-first reduces context switching.
- Small bundle with purging.

**Why shadcn/ui?**

- Copy-paste components (no black-box library).
- Full customization.
- Built on Radix UI (accessible by default).
- Great defaults (buttons, forms, dialogs, tables).

### 2.3 Auth: Better Auth

**Why Better Auth?**

- Modern, type-safe auth for Next.js.
- Built-in multi-tenancy support (user → company relationships).
- Email/password + OAuth (Google) out of the box.
- Session management with database sessions (Supabase compatible).
- Better DX than NextAuth (simpler config, better TypeScript).

**Alternative Considered:**

- **Clerk**: Expensive for hackathon/MVP; overkill.
- **NextAuth (Auth.js)**: Verbose config, weaker TypeScript.

### 2.4 Database: Supabase (PostgreSQL + pgvector)

**Why Supabase?**

- Managed PostgreSQL with generous free tier.
- **pgvector extension** for native vector similarity search.
- Built-in auth compatible (if we want to switch from Better Auth later).
- Realtime subscriptions (future: live sync status).
- Client libraries with TypeScript support.

**Why PostgreSQL?**

- ACID compliance for critical operations.
- JSON support for flexible metadata.
- Mature ecosystem.
- pgvector performance is production-ready.

**Why pgvector?**

- Native extension, no separate vector DB.
- HNSW index support (faster similarity search).
- Simpler architecture than Pinecone/Weaviate/Qdrant for MVP.
- Lower latency (same database, no network hop).

### 2.5 ORM: Drizzle

**Why Drizzle?**

- **Type-safe SQL**: Full TypeScript inference.
- **Lightweight**: Minimal runtime overhead.
- **Migration support**: Version-controlled schema changes.
- **Supabase-friendly**: Works seamlessly with Supabase client.

**Why Not Prisma?**

- Drizzle is lighter and faster for our use case.
- Better edge runtime support (if we deploy to Vercel edge).
- More explicit SQL (easier to debug vector queries).

### 2.6 AI: IBM watsonx.ai

**Why watsonx.ai?**

- **Hackathon requirement**: IBM-sponsored event.
- **Granite models**: Optimized for enterprise, explainable, controllable.
- **Embeddings**: Granite-based embeddings (e.g., `ibm/slate-125m-english-rtrvr`).
- **Chat/Generation**: Granite chat models (`ibm/granite-13b-chat-v2`).
- **Enterprise story**: Governance, compliance, on-prem deployment options.

**Integration Approach:**

- REST API with bearer token auth.
- Custom SDK wrapper for embeddings and chat.

### 2.7 Document Parsing

**Libraries:**

- **pdf-parse**: Extract text from PDFs (simple, reliable).
- **mammoth**: Convert DOCX to HTML/text (better than raw XML parsing).
- **marked**: Parse Markdown to HTML (if needed for display).
- **gray-matter**: Extract frontmatter from Markdown docs.

**Future Consideration:**

- **Docling** (IBM): More advanced document understanding (tables, figures). Add post-hackathon if needed.

---

## 3. Database Design & Schema

### 3.1 Schema Principles

1. **Company isolation**: Every data table has `companyId` for multi-tenancy.
2. **Soft deletes**: Use `deletedAt` for audit trail (optional for hackathon).
3. **Metadata flexibility**: JSONB columns for extensibility without schema migrations.
4. **Indexing strategy**: Indexes on `companyId`, foreign keys, and vector columns.

### 3.2 Complete Schema (Drizzle Syntax)

```typescript
// schema/companies.ts
import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';

export const companies = pgTable('companies', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// schema/users.ts
import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  companyId: uuid('company_id')
    .notNull()
    .references(() => companies.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// schema/dataSources.ts
import { pgTable, uuid, text, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const dataSources = pgTable('data_sources', {
  id: uuid('id').defaultRandom().primaryKey(),
  companyId: uuid('company_id')
    .notNull()
    .references(() => companies.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // 'upload' | 'google_drive' | 'confluence'
  config: jsonb('config').notNull(), // { folderId, credentials, etc. }
  status: text('status').notNull().default('active'), // 'active' | 'error' | 'disabled'
  lastSyncAt: timestamp('last_sync_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// schema/documents.ts
import { pgTable, uuid, text, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const documents = pgTable('documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  companyId: uuid('company_id')
    .notNull()
    .references(() => companies.id, { onDelete: 'cascade' }),
  dataSourceId: uuid('data_source_id').references(() => dataSources.id, {
    onDelete: 'set null',
  }),
  title: text('title').notNull(),
  content: text('content'), // Full extracted text
  contentType: text('content_type'), // 'pdf', 'docx', 'markdown', 'txt'
  metadata: jsonb('metadata').notNull().default({}), // { author, date, tags, etc. }
  externalId: text('external_id'), // Google Drive file ID, Confluence page ID
  externalUrl: text('external_url'), // Link back to original
  status: text('status').notNull().default('processing'), // 'processing' | 'indexed' | 'failed'
  errorMessage: text('error_message'), // If status = 'failed'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// schema/documentChunks.ts
import { pgTable, uuid, text, integer, timestamp, jsonb, vector } from 'drizzle-orm/pg-core';

export const documentChunks = pgTable('document_chunks', {
  id: uuid('id').defaultRandom().primaryKey(),
  documentId: uuid('document_id')
    .notNull()
    .references(() => documents.id, { onDelete: 'cascade' }),
  companyId: uuid('company_id')
    .notNull()
    .references(() => companies.id, { onDelete: 'cascade' }),
  chunkIndex: integer('chunk_index').notNull(), // 0, 1, 2, ...
  content: text('content').notNull(), // Chunk text
  embedding: vector('embedding', { dimensions: 768 }), // Adjust dimensions based on model
  metadata: jsonb('metadata').notNull().default({}), // { startChar, endChar, section, etc. }
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Indexes
// CREATE INDEX idx_document_chunks_company ON document_chunks(company_id);
// CREATE INDEX idx_document_chunks_embedding ON document_chunks USING hnsw (embedding vector_cosine_ops);

// schema/learningPaths.ts
import { pgTable, uuid, text, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const learningPaths = pgTable('learning_paths', {
  id: uuid('id').defaultRandom().primaryKey(),
  companyId: uuid('company_id')
    .notNull()
    .references(() => companies.id, { onDelete: 'cascade' }),
  query: text('query').notNull(), // Original user query
  workflowType: text('workflow_type').notNull(), // 'onboarding' | 'process_guide' | 'troubleshooting' | 'general'
  title: text('title').notNull(),
  contentMarkdown: text('content_markdown').notNull(), // Full markdown representation
  stepsJson: jsonb('steps_json').notNull(), // [{ stepNumber, title, description, estimatedTime, resourceRefs }]
  verificationJson: jsonb('verification_json').notNull(), // { overallStatus, confidence, stepFindings }
  agentTracesJson: jsonb('agent_traces_json').notNull(), // { harvester: {...}, synthesizer: {...}, ... }
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
````

### 3.3 Migrations Setup

```bash
# Install Drizzle
pnpm add drizzle-orm drizzle-kit postgres

# Create drizzle.config.ts
```

```typescript
// drizzle.config.ts
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema/*',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

```bash
# Generate migration
pnpm drizzle-kit generate:pg

# Run migration
pnpm drizzle-kit push:pg
```

### 3.4 pgvector Setup

```sql
-- Enable pgvector extension in Supabase
CREATE EXTENSION IF NOT EXISTS vector;

-- Create HNSW index for fast similarity search
CREATE INDEX idx_document_chunks_embedding
ON document_chunks
USING hnsw (embedding vector_cosine_ops);

-- Function for cosine similarity search
CREATE OR REPLACE FUNCTION match_document_chunks(
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  filter_company_id uuid
)
RETURNS TABLE (
  id uuid,
  document_id uuid,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    id,
    document_id,
    content,
    metadata,
    1 - (embedding <=> query_embedding) AS similarity
  FROM document_chunks
  WHERE company_id = filter_company_id
    AND 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;
```

**Why this function?**

- Encapsulates similarity logic.
- Can be called via Drizzle or Supabase client.
- Operator `<=>` is cosine distance (pgvector).
- `1 - distance` gives similarity score.

---

## 4. Project Setup & Configuration

### 4.1 Initialize Next.js Project

```bash
# Create project
pnpm create next-app@latest community-knowledge-weaver \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*"

cd community-knowledge-weaver
```

### 4.2 Install Core Dependencies

```bash
# Database & ORM
pnpm add drizzle-orm postgres drizzle-kit

# Auth
pnpm add better-auth

# UI Components
pnpm add @radix-ui/react-dialog @radix-ui/react-dropdown-menu \
  @radix-ui/react-select @radix-ui/react-tabs \
  class-variance-authority clsx tailwind-merge lucide-react

# Document parsing
pnpm add pdf-parse mammoth marked gray-matter

# IBM watsonx SDK (or axios for REST)
pnpm add axios

# Utilities
pnpm add zod date-fns
```

### 4.3 Environment Variables

```bash
# .env.local
# Database
DATABASE_URL=postgresql://user:password@host:port/dbname
DIRECT_URL=postgresql://user:password@host:port/dbname

# Better Auth
AUTH_SECRET=<generate with: openssl rand -base64 32>
AUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# IBM watsonx.ai
WATSONX_API_KEY=
WATSONX_PROJECT_ID=
WATSONX_URL=https://us-south.ml.cloud.ibm.com

# Google Drive API (service account)
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY=

# Confluence
CONFLUENCE_DOMAIN=
CONFLUENCE_EMAIL=
CONFLUENCE_API_TOKEN=
```

### 4.4 Project Structure

```
community-knowledge-weaver/
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── (auth)/
│   │   │   ├── sign-in/
│   │   │   └── sign-up/
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── knowledge-base/
│   │   │   │   ├── workflows/
│   │   │   │   └── learning-paths/
│   │   │   └── layout.tsx        # Dashboard shell with nav
│   │   ├── api/
│   │   │   ├── auth/              # Better Auth routes
│   │   │   ├── knowledge-base/
│   │   │   ├── connectors/
│   │   │   └── workflows/
│   │   ├── layout.tsx
│   │   └── page.tsx               # Landing/marketing page
│   ├── components/
│   │   ├── ui/                    # shadcn components
│   │   ├── knowledge-base/
│   │   ├── workflows/
│   │   └── shared/
│   ├── lib/
│   │   ├── db/
│   │   │   ├── schema/            # Drizzle schemas
│   │   │   ├── queries/           # Reusable queries
│   │   │   └── index.ts
│   │   ├── auth/
│   │   │   └── config.ts          # Better Auth config
│   │   ├── agents/
│   │   │   ├── harvester.ts
│   │   │   ├── synthesizer.ts
│   │   │   ├── path-builder.ts
│   │   │   ├── verifier.ts
│   │   │   └── orchestrator.ts
│   │   ├── watsonx/
│   │   │   ├── client.ts
│   │   │   ├── embeddings.ts
│   │   │   └── chat.ts
│   │   ├── parsers/
│   │   │   ├── pdf.ts
│   │   │   ├── docx.ts
│   │   │   ├── markdown.ts
│   │   │   └── index.ts
│   │   ├── connectors/
│   │   │   ├── google-drive.ts
│   │   │   └── confluence.ts
│   │   └── utils/
│   │       ├── chunking.ts
│   │       ├── validation.ts
│   │       └── formatting.ts
│   └── types/
│       ├── agent.ts
│       ├── document.ts
│       └── learning-path.ts
├── drizzle/                       # Migration files
├── public/
├── .env.local
├── drizzle.config.ts
├── next.config.js
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

---

## 5. Authentication System

### 5.1 Better Auth Configuration

```typescript
// src/lib/auth/config.ts
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/lib/db';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // For hackathon; enable in production
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  user: {
    additionalFields: {
      companyId: {
        type: 'string',
        required: true,
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
```

### 5.2 Auth API Routes

```typescript
// src/app/api/auth/[...all]/route.ts
import { auth } from '@/lib/auth/config';

export const { GET, POST } = auth.handler;
```

### 5.3 Sign-Up Flow with Company Creation

```typescript
// src/app/(auth)/sign-up/actions.ts
'use server';

import { db } from '@/lib/db';
import { companies, users } from '@/lib/db/schema';
import { auth } from '@/lib/auth/config';
import { hashPassword } from 'better-auth/utils';

export async function signUp(data: {
  email: string;
  password: string;
  name: string;
  companyName: string;
}) {
  // 1. Create company
  const [company] = await db
    .insert(companies)
    .values({
      name: data.companyName,
      slug: data.companyName.toLowerCase().replace(/\s+/g, '-'),
    })
    .returning();

  // 2. Create user linked to company
  const hashedPassword = await hashPassword(data.password);

  const [user] = await db
    .insert(users)
    .values({
      email: data.email,
      name: data.name,
      companyId: company.id,
      password: hashedPassword,
    })
    .returning();

  // 3. Create session
  const session = await auth.api.signInEmail({
    body: {
      email: data.email,
      password: data.password,
    },
  });

  return { success: true, session };
}
```

### 5.4 Session Middleware

```typescript
// src/lib/auth/session.ts
import { auth } from './config';
import { cookies } from 'next/headers';

export async function getSession() {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get('better-auth.session_token')?.value;

  if (!sessionToken) {
    return null;
  }

  const session = await auth.api.getSession({
    headers: {
      cookie: `better-auth.session_token=${sessionToken}`,
    },
  });

  return session;
}

export async function requireSession() {
  const session = await getSession();

  if (!session) {
    throw new Error('Unauthorized');
  }

  return session;
}
```

### 5.5 Protected Route Wrapper

```typescript
// src/app/(dashboard)/layout.tsx
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import DashboardNav from '@/components/dashboard-nav';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/sign-in');
  }

  return (
    <div className="flex h-screen">
      <DashboardNav user={session.user} />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
```

---

## 6. Document Ingestion Pipeline

### 6.1 Document Parsing Architecture

**Goal**: Convert any supported document format to plain text.

**Strategy**:

- Centralized `parseDocument()` function.
- Format-specific parsers (PDF, DOCX, MD, TXT).
- Error handling per parser.
- Metadata extraction where possible.

### 6.2 Parser Implementations

```typescript
// src/lib/parsers/pdf.ts
import pdfParse from 'pdf-parse';

export async function parsePDF(buffer: Buffer): Promise<{
  content: string;
  metadata: Record<string, any>;
}> {
  try {
    const data = await pdfParse(buffer);

    return {
      content: data.text,
      metadata: {
        pages: data.numpages,
        info: data.info,
      },
    };
  } catch (error) {
    throw new Error(`PDF parsing failed: ${error.message}`);
  }
}
```

```typescript
// src/lib/parsers/docx.ts
import mammoth from 'mammoth';

export async function parseDOCX(buffer: Buffer): Promise<{
  content: string;
  metadata: Record<string, any>;
}> {
  try {
    const result = await mammoth.extractRawText({ buffer });

    return {
      content: result.value,
      metadata: {
        messages: result.messages, // Warnings/errors from mammoth
      },
    };
  } catch (error) {
    throw new Error(`DOCX parsing failed: ${error.message}`);
  }
}
```

```typescript
// src/lib/parsers/markdown.ts
import matter from 'gray-matter';

export function parseMarkdown(content: string): {
  content: string;
  metadata: Record<string, any>;
} {
  try {
    const { data, content: bodyContent } = matter(content);

    return {
      content: bodyContent,
      metadata: data, // Frontmatter becomes metadata
    };
  } catch (error) {
    throw new Error(`Markdown parsing failed: ${error.message}`);
  }
}
```

```typescript
// src/lib/parsers/index.ts
import { parsePDF } from './pdf';
import { parseDOCX } from './docx';
import { parseMarkdown } from './markdown';

export async function parseDocument(
  buffer: Buffer,
  filename: string
): Promise<{
  content: string;
  contentType: string;
  metadata: Record<string, any>;
}> {
  const extension = filename.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'pdf':
      const pdfData = await parsePDF(buffer);
      return { ...pdfData, contentType: 'pdf' };

    case 'docx':
      const docxData = await parseDOCX(buffer);
      return { ...docxData, contentType: 'docx' };

    case 'md':
    case 'markdown':
      const mdData = parseMarkdown(buffer.toString('utf-8'));
      return { ...mdData, contentType: 'markdown' };

    case 'txt':
      return {
        content: buffer.toString('utf-8'),
        contentType: 'txt',
        metadata: {},
      };

    default:
      throw new Error(`Unsupported file type: ${extension}`);
  }
}
```

### 6.3 Text Chunking

**Why chunking?**

- Embedding models have token limits (typically 512-1024 tokens).
- Smaller chunks → more precise retrieval.
- Overlap preserves context across boundaries.

**Strategy**:

- Chunk by token count (not characters).
- Use overlap (100-200 tokens).
- Preserve sentence boundaries when possible.

```typescript
// src/lib/utils/chunking.ts

/**
 * Simple token-based chunking with overlap.
 * For production, consider using tiktoken or a proper tokenizer.
 */
export function chunkText(
  text: string,
  options: {
    chunkSize?: number; // tokens
    chunkOverlap?: number; // tokens
  } = {}
): string[] {
  const { chunkSize = 800, chunkOverlap = 100 } = options;

  // Rough approximation: 1 token ≈ 4 characters
  const charChunkSize = chunkSize * 4;
  const charOverlap = chunkOverlap * 4;

  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = start + charChunkSize;
    let chunk = text.slice(start, end);

    // Try to end at sentence boundary
    if (end < text.length) {
      const lastPeriod = chunk.lastIndexOf('. ');
      const lastNewline = chunk.lastIndexOf('\n');
      const boundary = Math.max(lastPeriod, lastNewline);

      if (boundary > charChunkSize * 0.7) {
        // Only adjust if boundary is in latter 30% of chunk
        chunk = chunk.slice(0, boundary + 1);
      }
    }

    chunks.push(chunk.trim());
    start += charChunkSize - charOverlap;
  }

  return chunks.filter((c) => c.length > 50); // Filter very short chunks
}
```

**For production**: Use a proper tokenizer like `tiktoken` or the model's native tokenizer.

### 6.4 Upload Flow Implementation

```typescript
// src/app/api/knowledge-base/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { documents, documentChunks } from '@/lib/db/schema';
import { parseDocument } from '@/lib/parsers';
import { chunkText } from '@/lib/utils/chunking';
import { generateEmbeddings } from '@/lib/watsonx/embeddings';

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    const companyId = session.user.companyId;

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // 1. Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // 2. Parse document
    const { content, contentType, metadata } = await parseDocument(
      buffer,
      file.name
    );

    // 3. Create document record (status: processing)
    const [doc] = await db
      .insert(documents)
      .values({
        companyId,
        title: file.name,
        content,
        contentType,
        metadata,
        status: 'processing',
      })
      .returning();

    // 4. Process asynchronously (in background or await)
    // For hackathon, we'll await; in production, use a queue
    await processDocument(doc.id, content, companyId);

    return NextResponse.json({
      success: true,
      documentId: doc.id,
      message: 'Document uploaded and processing',
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}

async function processDocument(
  documentId: string,
  content: string,
  companyId: string
) {
  try {
    // 1. Chunk text
    const chunks = chunkText(content, {
      chunkSize: 800,
      chunkOverlap: 100,
    });

    // 2. Generate embeddings (batched)
    const embeddings = await generateEmbeddings(chunks);

    // 3. Insert chunks with embeddings
    const chunkRecords = chunks.map((chunk, index) => ({
      documentId,
      companyId,
      chunkIndex: index,
      content: chunk,
      embedding: embeddings[index],
      metadata: {
        characterStart: content.indexOf(chunk),
        characterEnd: content.indexOf(chunk) + chunk.length,
      },
    }));

    await db.insert(documentChunks).values(chunkRecords);

    // 4. Update document status
    await db
      .update(documents)
      .set({
        status: 'indexed',
        updatedAt: new Date(),
      })
      .where(eq(documents.id, documentId));

    console.log(`Document ${documentId} processed successfully`);
  } catch (error) {
    console.error(`Processing failed for document ${documentId}:`, error);

    // Mark as failed
    await db
      .update(documents)
      .set({
        status: 'failed',
        errorMessage: error.message,
        updatedAt: new Date(),
      })
      .where(eq(documents.id, documentId));
  }
}
```

**Key points**:

- We await processing for simplicity; in production, offload to a job queue (BullMQ, Inngest, etc.).
- Error handling: capture errors and update document status.
- Batch embedding calls to reduce API overhead.

---

## 7. Vector Search & Embeddings

### 7.1 IBM watsonx.ai Embeddings Client

```typescript
// src/lib/watsonx/client.ts
import axios, { AxiosInstance } from 'axios';

class WatsonXClient {
  private client: AxiosInstance;
  private projectId: string;

  constructor() {
    this.projectId = process.env.WATSONX_PROJECT_ID!;

    this.client = axios.create({
      baseURL: process.env.WATSONX_URL!,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.WATSONX_API_KEY!}`,
      },
    });
  }

  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      const response = await this.client.post('/ml/v1/text/embeddings', {
        model_id: 'ibm/slate-125m-english-rtrvr', // Or appropriate embedding model
        inputs: texts,
        project_id: this.projectId,
      });

      return response.data.results.map((r: any) => r.embedding);
    } catch (error) {
      console.error('Embedding generation failed:', error);
      throw new Error('Failed to generate embeddings');
    }
  }

  async chat(messages: Array<{ role: string; content: string }>, options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }): Promise<string> {
    try {
      const response = await this.client.post('/ml/v1/text/chat', {
        model_id: options?.model || 'ibm/granite-13b-chat-v2',
        messages,
        project_id: this.projectId,
        parameters: {
          temperature: options?.temperature || 0.7,
          max_new_tokens: options?.maxTokens || 1000,
        },
      });

      return response.data.results.generated_text;
    } catch (error) {
      console.error('Chat completion failed:', error);
      throw new Error('Failed to generate chat response');
    }
  }
}

export const watsonxClient = new WatsonXClient();
```

### 7.2 Embedding Generation with Batching

```typescript
// src/lib/watsonx/embeddings.ts
import { watsonxClient } from './client';

const BATCH_SIZE = 10; // Adjust based on API limits

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const allEmbeddings: number[][] = [];

  // Process in batches
  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    const embeddings = await watsonxClient.generateEmbeddings(batch);
    allEmbeddings.push(...embeddings);
  }

  return allEmbeddings;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const [embedding] = await generateEmbeddings([text]);
  return embedding;
}
```

### 7.3 Vector Similarity Search

```typescript
// src/lib/db/queries/vector-search.ts
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export async function searchDocumentChunks(params: {
  queryEmbedding: number[];
  companyId: string;
  threshold?: number;
  limit?: number;
}): Promise<
  Array<{
    id: string;
    documentId: string;
    content: string;
    metadata: any;
    similarity: number;
  }>
> {
  const { queryEmbedding, companyId, threshold = 0.7, limit = 20 } = params;

  // Call the pgvector function we created earlier
  const results = await db.execute(sql`
    SELECT * FROM match_document_chunks(
      ${JSON.stringify(queryEmbedding)}::vector(768),
      ${threshold},
      ${limit},
      ${companyId}::uuid
    )
  `);

  return results.rows as any[];
}
```

**Why this approach?**

- Uses the optimized pgvector function.
- Handles cosine similarity automatically.
- Filters by company for multi-tenancy.
- Returns top-k with similarity scores.

---

## 8. Multi-Agent System Architecture

### 8.1 Agent Design Principles

**Each agent**:

1. **Single Responsibility**: One clear task (retrieve, synthesize, build, verify).
2. **Composable**: Takes typed input, returns typed output.
3. **Traceable**: Returns execution metadata (timing, token usage, data sizes).
4. **Testable**: Pure functions where possible; mockable dependencies.

**Inter-agent communication**:

- Sequential pipeline (not parallel for MVP).
- Each agent receives output of previous + original query.
- Orchestrator manages the flow.

### 8.2 Agent Types & Interfaces

```typescript
// src/types/agent.ts

export interface AgentTrace {
  executionMs: number;
  tokenUsage?: {
    prompt: number;
    completion: number;
    total: number;
  };
  dataSize?: number;
  metadata?: Record<string, any>;
}

export interface HarvesterInput {
  query: string;
  companyId: string;
}

export interface HarvesterOutput {
  chunks: Array<{
    id: string;
    documentId: string;
    content: string;
    metadata: any;
    similarity: number;
  }>;
  trace: AgentTrace;
}

export interface SynthesizerInput {
  query: string;
  chunks: HarvesterOutput['chunks'];
}

export interface SynthesizerOutput {
  synthesis: string;
  trace: AgentTrace;
}

export interface PathBuilderInput {
  query: string;
  synthesis: string;
  workflowType: 'onboarding' | 'process_guide' | 'troubleshooting' | 'general';
}

export interface LearningPathStep {
  stepNumber: number;
  title: string;
  description: string;
  estimatedTime?: string;
  resourceRefs?: string[]; // Chunk IDs or doc IDs
}

export interface PathBuilderOutput {
  learningPath: {
    title: string;
    contentMarkdown: string;
    steps: LearningPathStep[];
  };
  trace: AgentTrace;
}

export interface VerifierInput {
  learningPath: PathBuilderOutput['learningPath'];
  chunks: HarvesterOutput['chunks'];
}

export interface VerifierOutput {
  verification: {
    overallStatus: 'verified' | 'needs_review' | 'unsupported';
    confidence: number; // 0-1
    stepFindings: Array<{
      stepNumber: number;
      status: 'supported' | 'partially_supported' | 'unsupported';
      supportingChunkIds: string[];
      issues?: string[];
    }>;
  };
  trace: AgentTrace;
}
```

### 8.3 Harvester Agent Implementation

```typescript
// src/lib/agents/harvester.ts
import { HarvesterInput, HarvesterOutput } from '@/types/agent';
import { generateEmbedding } from '@/lib/watsonx/embeddings';
import { searchDocumentChunks } from '@/lib/db/queries/vector-search';

export async function harvesterAgent(
  input: HarvesterInput
): Promise<HarvesterOutput> {
  const startTime = Date.now();

  // 1. Generate query embedding
  const queryEmbedding = await generateEmbedding(input.query);

  // 2. Search for relevant chunks
  const chunks = await searchDocumentChunks({
    queryEmbedding,
    companyId: input.companyId,
    threshold: 0.65, // Lower threshold for broader recall
    limit: 15, // More chunks for better context
  });

  const executionMs = Date.now() - startTime;

  return {
    chunks,
    trace: {
      executionMs,
      dataSize: chunks.length,
      metadata: {
        avgSimilarity:
          chunks.reduce((sum, c) => sum + c.similarity, 0) / chunks.length,
        minSimilarity: Math.min(...chunks.map((c) => c.similarity)),
        maxSimilarity: Math.max(...chunks.map((c) => c.similarity)),
      },
    },
  };
}
```

**Rationale**:

- Lower threshold (0.65) ensures we don't miss relevant content.
- Return 15 chunks (may reduce based on synthesizer token limits).
- Track similarity stats for quality monitoring.

### 8.4 Synthesizer Agent Implementation

```typescript
// src/lib/agents/synthesizer.ts
import { SynthesizerInput, SynthesizerOutput } from '@/types/agent';
import { watsonxClient } from '@/lib/watsonx/client';

const SYSTEM_PROMPT = `You are a knowledge synthesis expert. Your role is to:

1. Read multiple document fragments about a topic
2. Merge and synthesize the information into a coherent narrative
3. Remove duplication and contradictions
4. Preserve important details and context
5. DO NOT add information not present in the sources
6. If sources conflict, note the conflict

Output a clear, well-structured synthesis.`;

export async function synthesizerAgent(
  input: SynthesizerInput
): Promise<SynthesizerOutput> {
  const startTime = Date.now();

  // Build context from chunks
  const context = input.chunks
    .map(
      (chunk, idx) => `
--- Source ${idx + 1} (similarity: ${chunk.similarity.toFixed(2)}) ---
${chunk.content}
`
    )
    .join('\n\n');

  const userMessage = `Query: "${input.query}"

Available sources:
${context}

Synthesize the above information into a coherent narrative that addresses the query. Focus on actionable knowledge and key concepts.`;

  // Call Granite chat model
  const synthesis = await watsonxClient.chat(
    [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userMessage },
    ],
    {
      temperature: 0.4, // Lower for factual synthesis
      maxTokens: 1500,
    }
  );

  const executionMs = Date.now() - startTime;

  return {
    synthesis,
    trace: {
      executionMs,
      tokenUsage: {
        // Estimate; in production, get from API response
        prompt: Math.ceil((SYSTEM_PROMPT.length + userMessage.length) / 4),
        completion: Math.ceil(synthesis.length / 4),
        total: 0, // Will be computed
      },
      dataSize: synthesis.length,
      metadata: {
        sourceCount: input.chunks.length,
      },
    },
  };
}
```

**Key design choices**:

- Low temperature (0.4) for faithful synthesis.
- System prompt emphasizes grounding in sources.
- Include similarity scores to help model weigh sources.
- Token limit 1500 to keep synthesis focused.

### 8.5 Path Builder Agent Implementation

```typescript
// src/lib/agents/path-builder.ts
import { PathBuilderInput, PathBuilderOutput, LearningPathStep } from '@/types/agent';
import { watsonxClient } from '@/lib/watsonx/client';

const WORKFLOW_PROMPTS = {
  onboarding: `You are an onboarding path architect. Create a structured learning path for onboarding with:
- Prerequisites (what learner needs before starting)
- Day 1, Week 1, Month 1 milestones
- Clear learning objectives per phase
- Time estimates
- Checkpoints for validation`,

  process_guide: `You are a process documentation expert. Create a step-by-step guide with:
- Prerequisites and setup requirements
- Sequential steps with clear actions
- Decision points and variations
- Validation checkpoints
- Common pitfalls and solutions`,

  troubleshooting: `You are a troubleshooting guide creator. Structure the path with:
- Symptom identification
- Diagnostic steps
- Decision tree (if X then Y)
- Solution steps
- Verification procedures`,

  general: `You are a learning path designer. Create a structured path with:
- Learning objectives
- Recommended sequence
- Key concepts to master
- Practice opportunities
- Further reading`,
};

export async function pathBuilderAgent(
  input: PathBuilderInput
): Promise<PathBuilderOutput> {
  const startTime = Date.now();

  const systemPrompt = WORKFLOW_PROMPTS[input.workflowType];

  const userMessage = `Query: "${input.query}"

Synthesized knowledge:
${input.synthesis}

Create a structured learning path in the following JSON format:
{
  "title": "Clear, descriptive title",
  "steps": [
    {
      "stepNumber": 1,
      "title": "Step title",
      "description": "Detailed description with actions",
      "estimatedTime": "e.g., 30 minutes, 1 day",
      "resourceRefs": ["references to key concepts mentioned"]
    }
  ]
}

Generate 4-8 steps depending on complexity. Be specific and actionable.`;

  // Call Granite
  const response = await watsonxClient.chat(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    {
      temperature: 0.6, // Slightly higher for structured creativity
      maxTokens: 2000,
    }
  );

  // Parse JSON response
  const parsed = parsePathResponse(response);

  // Generate markdown representation
  const contentMarkdown = generateMarkdown(parsed);

  const executionMs = Date.now() - startTime;

  return {
    learningPath: {
      title: parsed.title,
      contentMarkdown,
      steps: parsed.steps,
    },
    trace: {
      executionMs,
      tokenUsage: {
        prompt: Math.ceil((systemPrompt.length + userMessage.length) / 4),
        completion: Math.ceil(response.length / 4),
        total: 0,
      },
      dataSize: response.length,
      metadata: {
        stepCount: parsed.steps.length,
        workflowType: input.workflowType,
      },
    },
  };
}

function parsePathResponse(response: string): {
  title: string;
  steps: LearningPathStep[];
} {
  try {
    // Extract JSON from response (may be wrapped in markdown code block)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch);

    // Validate structure
    if (!parsed.title || !Array.isArray(parsed.steps)) {
      throw new Error('Invalid path structure');
    }

    return parsed;
  } catch (error) {
    console.error('Failed to parse path response:', error);
    // Fallback: create a single-step path from the response
    return {
      title: 'Learning Path',
      steps: [
        {
          stepNumber: 1,
          title: 'Review Content',
          description: response,
          estimatedTime: 'Variable',
        },
      ],
    };
  }
}

function generateMarkdown(path: {
  title: string;
  steps: LearningPathStep[];
}): string {
  let md = `# ${path.title}\n\n`;

  path.steps.forEach((step) => {
    md += `## Step ${step.stepNumber}: ${step.title}\n\n`;
    md += `${step.description}\n\n`;

    if (step.estimatedTime) {
      md += `**Estimated time:** ${step.estimatedTime}\n\n`;
    }

    if (step.resourceRefs && step.resourceRefs.length > 0) {
      md += `**Key resources:**\n`;
      step.resourceRefs.forEach((ref) => {
        md += `- ${ref}\n`;
      });
      md += '\n';
    }
  });

  return md;
}
```

**Design rationale**:

- Different system prompts per workflow type.
- Structured JSON output for easy parsing and rendering.
- Fallback parsing for robustness.
- Generate both JSON (for UI) and markdown (for display/export).

### 8.6 Verifier Agent Implementation

```typescript
// src/lib/agents/verifier.ts
import { VerifierInput, VerifierOutput } from '@/types/agent';
import { watsonxClient } from '@/lib/watsonx/client';

const SYSTEM_PROMPT = `You are a fact-checking and verification expert. Your role is to:

1. Compare each step in a learning path against source documents
2. Determine if each step is supported by the sources
3. Flag unsupported claims or hallucinations
4. Identify which sources support each step

Classification:
- SUPPORTED: Step content directly backed by sources
- PARTIALLY_SUPPORTED: Step partially backed, some details missing
- UNSUPPORTED: Step not backed by sources (potential hallucination)

Be strict but fair. Explain your reasoning.`;

export async function verifierAgent(
  input: VerifierInput
): Promise<VerifierOutput> {
  const startTime = Date.now();

  // Build sources context
  const sourcesContext = input.chunks
    .map(
      (chunk, idx) => `
--- Source ${idx + 1} (ID: ${chunk.id}) ---
${chunk.content}
`
    )
    .join('\n\n');

  // Build steps summary
  const stepsSummary = input.learningPath.steps
    .map((step) => `Step ${step.stepNumber}: ${step.title}\n${step.description}`)
    .join('\n\n');

  const userMessage = `Sources:
${sourcesContext}

Learning Path Steps:
${stepsSummary}

For each step, determine if it is SUPPORTED, PARTIALLY_SUPPORTED, or UNSUPPORTED by the sources.

Respond in JSON format:
{
  "stepFindings": [
    {
      "stepNumber": 1,
      "status": "supported | partially_supported | unsupported",
      "supportingChunkIds": ["chunk-id-1", "chunk-id-2"],
      "issues": ["optional issue description"]
    }
  ],
  "overallConfidence": 0.0-1.0
}`;

  const response = await watsonxClient.chat(
    [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userMessage },
    ],
    {
      temperature: 0.2, // Very low for factual verification
      maxTokens: 1500,
    }
  );

  // Parse verification response
  const parsed = parseVerificationResponse(response);

  // Compute overall status
  const overallStatus = computeOverallStatus(parsed);

  const executionMs = Date.now() - startTime;

  return {
    verification: {
      overallStatus,
      confidence: parsed.overallConfidence || 0.5,
      stepFindings: parsed.stepFindings,
    },
    trace: {
      executionMs,
      tokenUsage: {
        prompt: Math.ceil((SYSTEM_PROMPT.length + userMessage.length) / 4),
        completion: Math.ceil(response.length / 4),
        total: 0,
      },
      metadata: {
        stepsVerified: parsed.stepFindings.length,
      },
    },
  };
}

function parseVerificationResponse(response: string): {
  stepFindings: VerifierOutput['verification']['stepFindings'];
  overallConfidence: number;
} {
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON in verification response');
    }

    const parsed = JSON.parse(jsonMatch);

    return {
      stepFindings: parsed.stepFindings || [],
      overallConfidence: parsed.overallConfidence || 0.5,
    };
  } catch (error) {
    console.error('Failed to parse verification response:', error);
    return {
      stepFindings: [],
      overallConfidence: 0.5,
    };
  }
}

function computeOverallStatus(verification: {
  stepFindings: VerifierOutput['verification']['stepFindings'];
}): 'verified' | 'needs_review' | 'unsupported' {
  const findings = verification.stepFindings;

  if (findings.length === 0) return 'needs_review';

  const supportedCount = findings.filter(
    (f) => f.status === 'supported'
  ).length;
  const unsupportedCount = findings.filter(
    (f) => f.status === 'unsupported'
  ).length;

  if (unsupportedCount > findings.length * 0.3) {
    return 'unsupported'; // >30% unsupported
  }

  if (supportedCount === findings.length) {
    return 'verified'; // All supported
  }

  return 'needs_review'; // Mixed
}
```

**Key aspects**:

- Very low temperature (0.2) for strict verification.
- Chunk IDs tracked for traceability.
- Overall confidence computed from step-level findings.
- Fallback handling if parsing fails.

### 8.7 Orchestrator Implementation

```typescript
// src/lib/agents/orchestrator.ts
import { harvesterAgent } from './harvester';
import { synthesizerAgent } from './synthesizer';
import { pathBuilderAgent } from './path-builder';
import { verifierAgent } from './verifier';

export interface OrchestratorInput {
  query: string;
  workflowType: 'onboarding' | 'process_guide' | 'troubleshooting' | 'general';
  companyId: string;
}

export interface OrchestratorOutput {
  learningPath: {
    title: string;
    contentMarkdown: string;
    steps: any[];
  };
  verification: {
    overallStatus: string;
    confidence: number;
    stepFindings: any[];
  };
  sources: Array<{
    id: string;
    documentId: string;
    content: string;
    similarity: number;
  }>;
  agentTraces: {
    harvester: any;
    synthesizer: any;
    pathBuilder: any;
    verifier: any;
  };
}

export async function executeMultiAgentWorkflow(
  input: OrchestratorInput
): Promise<OrchestratorOutput> {
  console.log(`[Orchestrator] Starting workflow for query: "${input.query}"`);

  // Step 1: Harvester
  console.log('[Orchestrator] Running Harvester Agent...');
  const harvesterOutput = await harvesterAgent({
    query: input.query,
    companyId: input.companyId,
  });
  console.log(
    `[Orchestrator] Harvester retrieved ${harvesterOutput.chunks.length} chunks`
  );

  // Step 2: Synthesizer
  console.log('[Orchestrator] Running Synthesizer Agent...');
  const synthesizerOutput = await synthesizerAgent({
    query: input.query,
    chunks: harvesterOutput.chunks,
  });
  console.log(
    `[Orchestrator] Synthesizer produced ${synthesizerOutput.synthesis.length} characters`
  );

  // Step 3: Path Builder
  console.log('[Orchestrator] Running Path Builder Agent...');
  const pathBuilderOutput = await pathBuilderAgent({
    query: input.query,
    synthesis: synthesizerOutput.synthesis,
    workflowType: input.workflowType,
  });
  console.log(
    `[Orchestrator] Path Builder created ${pathBuilderOutput.learningPath.steps.length} steps`
  );

  // Step 4: Verifier
  console.log('[Orchestrator] Running Verifier Agent...');
  const verifierOutput = await verifierAgent({
    learningPath: pathBuilderOutput.learningPath,
    chunks: harvesterOutput.chunks,
  });
  console.log(
    `[Orchestrator] Verifier status: ${verifierOutput.verification.overallStatus}, confidence: ${verifierOutput.verification.confidence}`
  );

  console.log('[Orchestrator] Workflow complete');

  return {
    learningPath: pathBuilderOutput.learningPath,
    verification: verifierOutput.verification,
    sources: harvesterOutput.chunks.map((c) => ({
      id: c.id,
      documentId: c.documentId,
      content: c.content.slice(0, 500), // Preview only
      similarity: c.similarity,
    })),
    agentTraces: {
      harvester: harvesterOutput.trace,
      synthesizer: synthesizerOutput.trace,
      pathBuilder: pathBuilderOutput.trace,
      verifier: verifierOutput.trace,
    },
  };
}
```

**Orchestration principles**:

- Sequential execution (no parallelization for MVP).
- Rich logging for debugging.
- Aggregate traces for observability.
- Return sources preview for UI display.

---

## 9. API Routes & Server Actions

### 9.1 Query → Learning Path Endpoint

```typescript
// src/app/api/workflows/query/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth/session';
import { executeMultiAgentWorkflow } from '@/lib/agents/orchestrator';
import { db } from '@/lib/db';
import { learningPaths } from '@/lib/db/schema';
import { z } from 'zod';

const QuerySchema = z.object({
  query: z.string().min(10).max(500),
  workflowType: z.enum(['onboarding', 'process_guide', 'troubleshooting', 'general']),
});

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    const companyId = session.user.companyId;

    const body = await req.json();
    const validation = QuerySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error },
        { status: 400 }
      );
    }

    const { query, workflowType } = validation.data;

    // Execute multi-agent workflow
    const result = await executeMultiAgentWorkflow({
      query,
      workflowType,
      companyId,
    });

    // Persist learning path
    const [savedPath] = await db
      .insert(learningPaths)
      .values({
        companyId,
        query,
        workflowType,
        title: result.learningPath.title,
        contentMarkdown: result.learningPath.contentMarkdown,
        stepsJson: result.learningPath.steps,
        verificationJson: result.verification,
        agentTracesJson: result.agentTraces,
      })
      .returning();

    return NextResponse.json({
      success: true,
      learningPathId: savedPath.id,
      learningPath: result.learningPath,
      verification: result.verification,
      sources: result.sources,
    });
  } catch (error) {
    console.error('Workflow execution error:', error);
    return NextResponse.json(
      { error: error.message || 'Workflow execution failed' },
      { status: 500 }
    );
  }
}
```

### 9.2 List Learning Paths

```typescript
// src/app/api/learning-paths/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { learningPaths } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const session = await requireSession();
    const companyId = session.user.companyId;

    const paths = await db
      .select({
        id: learningPaths.id,
        query: learningPaths.query,
        workflowType: learningPaths.workflowType,
        title: learningPaths.title,
        verificationJson: learningPaths.verificationJson,
        createdAt: learningPaths.createdAt,
      })
      .from(learningPaths)
      .where(eq(learningPaths.companyId, companyId))
      .orderBy(desc(learningPaths.createdAt))
      .limit(50);

    return NextResponse.json({ paths });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch learning paths' },
      { status: 500 }
    );
  }
}
```

### 9.3 Get Single Learning Path

```typescript
// src/app/api/learning-paths/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { learningPaths } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireSession();
    const companyId = session.user.companyId;

    const [path] = await db
      .select()
      .from(learningPaths)
      .where(
        and(
          eq(learningPaths.id, params.id),
          eq(learningPaths.companyId, companyId)
        )
      )
      .limit(1);

    if (!path) {
      return NextResponse.json({ error: 'Path not found' }, { status: 404 });
    }

    return NextResponse.json({ path });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch learning path' },
      { status: 500 }
    );
  }
}
```

---

## 10. Frontend Components & UI

### 10.1 Dashboard Overview Page

```typescript
// src/app/(dashboard)/dashboard/page.tsx
import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { documents, learningPaths } from '@/lib/db/schema';
import { eq, count } from 'drizzle-orm';
import Link from 'next/link';

export default async function DashboardPage() {
  const session = await getSession();
  const companyId = session!.user.companyId;

  // Fetch stats
  const [docCount] = await db
    .select({ count: count() })
    .from(documents)
    .where(eq(documents.companyId, companyId));

  const [pathCount] = await db
    .select({ count: count() })
    .from(learningPaths)
    .where(eq(learningPaths.companyId, companyId));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to Community Knowledge Weaver
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <StatCard
          title="Documents Indexed"
          value={docCount.count}
          icon="📄"
        />
        <StatCard
          title="Learning Paths"
          value={pathCount.count}
          icon="🗺️"
        />
        <StatCard
          title="Connectors"
          value="2 active"
          icon="🔗"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <CTACard
          title="Build Knowledge Base"
          description="Upload documents or connect your existing sources"
          href="/dashboard/knowledge-base"
          icon="📚"
        />
        <CTACard
          title="Generate Learning Path"
          description="Create guided workflows from your knowledge base"
          href="/dashboard/workflows"
          icon="✨"
        />
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: any) {
  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <span className="text-4xl">{icon}</span>
      </div>
    </div>
  );
}

function CTACard({ title, description, href, icon }: any) {
  return (
    <Link
      href={href}
      className="rounded-lg border bg-card p-6 transition-colors hover:bg-accent"
    >
      <div className="flex items-start gap-4">
        <span className="text-4xl">{icon}</span>
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </Link>
  );
}
```

### 10.2 Knowledge Base Upload UI

```typescript
// src/app/(dashboard)/dashboard/knowledge-base/page.tsx
'use client';

import { useState } from 'react';
import { Upload, FileText, CheckCircle, XCircle } from 'lucide-react';

export default function KnowledgeBasePage() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<Record<string, string>>({});

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    setUploading(true);

    for (const file of files) {
      try {
        setUploadStatus((prev) => ({ ...prev, [file.name]: 'uploading' }));

        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/knowledge-base/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          setUploadStatus((prev) => ({ ...prev, [file.name]: 'success' }));
        } else {
          setUploadStatus((prev) => ({ ...prev, [file.name]: 'error' }));
        }
      } catch (error) {
        setUploadStatus((prev) => ({ ...prev, [file.name]: 'error' }));
      }
    }

    setUploading(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Knowledge Base</h1>
        <p className="text-muted-foreground">
          Upload documents or connect external sources
        </p>
      </div>

      <div className="rounded-lg border-2 border-dashed border-muted p-12 text-center">
        <Upload className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="mb-2 font-semibold">Upload Documents</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Supported: PDF, DOCX, MD, TXT
        </p>
        <input
          type="file"
          multiple
          accept=".pdf,.docx,.md,.txt"
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Select Files
        </label>
      </div>

      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">
              Selected Files ({files.length})
            </h3>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload All'}
            </button>
          </div>

          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.name}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5" />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <div>
                  {uploadStatus[file.name] === 'success' && (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                  {uploadStatus[file.name] === 'error' && (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  {uploadStatus[file.name] === 'uploading' && (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

### 10.3 Workflow Query UI

```typescript
// src/app/(dashboard)/dashboard/workflows/page.tsx
'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';

export default function WorkflowsPage() {
  const [query, setQuery] = useState('');
  const [workflowType, setWorkflowType] = useState('onboarding');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/workflows/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, workflowType }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert('Failed to generate path');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Generate Learning Path</h1>
        <p className="text-muted-foreground">
          Describe what you want to learn or solve
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium">
            What would you like to learn or solve?
          </label>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., Onboard a new frontend developer to our React stack"
            rows={4}
            className="w-full rounded-md border border-input bg-background px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Workflow Type
          </label>
          <select
            value={workflowType}
            onChange={(e) => setWorkflowType(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2"
          >
            <option value="onboarding">Onboarding</option>
            <option value="process_guide">Process Guide</option>
            <option value="troubleshooting">Troubleshooting</option>
            <option value="general">General Learning Path</option>
          </select>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || query.length < 10}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          <Sparkles className="h-5 w-5" />
          {loading ? 'Generating...' : 'Generate Path'}
        </button>
      </div>

      {result && (
        <div className="space-y-6">
          <div className="rounded-lg border bg-card p-6">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  {result.learningPath.title}
                </h2>
                <p className="text-sm text-muted-foreground">{query}</p>
              </div>
              <VerificationBadge verification={result.verification} />
            </div>

            <div className="space-y-4">
              {result.learningPath.steps.map((step: any) => (
                <StepCard key={step.stepNumber} step={step} />
              ))}
            </div>
          </div>

          <SourcesSection sources={result.sources} />
        </div>
      )}
    </div>
  );
}

function VerificationBadge({ verification }: any) {
  const statusColor = {
    verified: 'bg-green-100 text-green-800',
    needs_review: 'bg-yellow-100 text-yellow-800',
    unsupported: 'bg-red-100 text-red-800',
  }[verification.overallStatus];

  return (
    <div className={`rounded-full px-3 py-1 text-xs font-medium ${statusColor}`}>
      {verification.overallStatus.replace('_', ' ').toUpperCase()} - {' '}
      {Math.round(verification.confidence * 100)}%
    </div>
  );
}

function StepCard({ step }: any) {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="mb-2 font-semibold">
        Step {step.stepNumber}: {step.title}
      </h3>
      <p className="text-sm text-muted-foreground">{step.description}</p>
      {step.estimatedTime && (
        <p className="mt-2 text-xs text-muted-foreground">
          ⏱️ {step.estimatedTime}
        </p>
      )}
    </div>
  );
}

function SourcesSection({ sources }: any) {
  return (
    <details className="rounded-lg border p-4">
      <summary className="cursor-pointer font-semibold">
        View Sources ({sources.length})
      </summary>
      <div className="mt-4 space-y-2">
        {sources.map((source: any) => (
          <div key={source.id} className="rounded border p-3 text-sm">
            <p className="mb-1 font-medium">
              Similarity: {(source.similarity * 100).toFixed(1)}%
            </p>
            <p className="text-muted-foreground">{source.content}...</p>
          </div>
        ))}
      </div>
    </details>
  );
}
```

---

## 11. Connector Implementations

### 11.1 Google Drive Connector

```typescript
// src/lib/connectors/google-drive.ts
import { google } from 'googleapis';
import { parseDocument } from '@/lib/parsers';
import { db } from '@/lib/db';
import { documents, documentChunks } from '@/lib/db/schema';
import { chunkText } from '@/lib/utils/chunking';
import { generateEmbeddings } from '@/lib/watsonx/embeddings';

export async function syncGoogleDrive(params: {
  folderId: string;
  companyId: string;
  dataSourceId: string;
}) {
  const { folderId, companyId, dataSourceId } = params;

  // Initialize Google Drive client
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });

  const drive = google.drive({ version: 'v3', auth });

  // List files in folder
  const response = await drive.files.list({
    q: `'${folderId}' in parents and trashed=false`,
    fields: 'files(id, name, mimeType, modifiedTime, webViewLink)',
    pageSize: 100,
  });

  const files = response.data.files || [];
  console.log(`Found ${files.length} files in Google Drive folder`);

  for (const file of files) {
    try {
      // Check if already indexed
      const existing = await db
        .select()
        .from(documents)
        .where(
          and(
            eq(documents.companyId, companyId),
            eq(documents.externalId, file.id!)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        console.log(`Skipping already indexed file: ${file.name}`);
        continue;
      }

      // Supported MIME types
      const supportedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'text/markdown',
      ];

      if (!supportedTypes.includes(file.mimeType!)) {
        console.log(`Skipping unsupported MIME type: ${file.mimeType}`);
        continue;
      }

      // Download file content
      const fileResponse = await drive.files.get(
        {
          fileId: file.id!,
          alt: 'media',
        },
        { responseType: 'arraybuffer' }
      );

      const buffer = Buffer.from(fileResponse.data as ArrayBuffer);

      // Parse document
      const { content, contentType, metadata } = await parseDocument(
        buffer,
        file.name!
      );

      // Create document record
      const [doc] = await db
        .insert(documents)
        .values({
          companyId,
          dataSourceId,
          title: file.name!,
          content,
          contentType,
          metadata: {
            ...metadata,
            modifiedTime: file.modifiedTime,
          },
          externalId: file.id!,
          externalUrl: file.webViewLink!,
          status: 'processing',
        })
        .returning();

      // Process (chunk + embed)
      await processDocument(doc.id, content, companyId);

      console.log(`Successfully indexed: ${file.name}`);
    } catch (error) {
      console.error(`Failed to process file ${file.name}:`, error);
    }
  }
}

async function processDocument(
  documentId: string,
  content: string,
  companyId: string
) {
  // Same as upload flow
  const chunks = chunkText(content, {
    chunkSize: 800,
    chunkOverlap: 100,
  });

  const embeddings = await generateEmbeddings(chunks);

  const chunkRecords = chunks.map((chunk, index) => ({
    documentId,
    companyId,
    chunkIndex: index,
    content: chunk,
    embedding: embeddings[index],
    metadata: {},
  }));

  await db.insert(documentChunks).values(chunkRecords);

  await db
    .update(documents)
    .set({ status: 'indexed', updatedAt: new Date() })
    .where(eq(documents.id, documentId));
}
```

### 11.2 Google Drive API Route

```typescript
// src/app/api/connectors/google-drive/sync/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth/session';
import { syncGoogleDrive } from '@/lib/connectors/google-drive';
import { db } from '@/lib/db';
import { dataSources } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    const companyId = session.user.companyId;

    const { dataSourceId } = await req.json();

    // Get data source config
    const [source] = await db
      .select()
      .from(dataSources)
      .where(eq(dataSources.id, dataSourceId))
      .limit(1);

    if (!source || source.type !== 'google_drive') {
      return NextResponse.json(
        { error: 'Invalid data source' },
        { status: 400 }
      );
    }

    const folderId = source.config.folderId;

    // Trigger sync
    await syncGoogleDrive({
      folderId,
      companyId,
      dataSourceId,
    });

    // Update last sync time
    await db
      .update(dataSources)
      .set({ lastSyncAt: new Date() })
      .where(eq(dataSources.id, dataSourceId));

    return NextResponse.json({
      success: true,
      message: 'Sync completed',
    });
  } catch (error) {
    console.error('Google Drive sync error:', error);
    return NextResponse.json(
      { error: error.message || 'Sync failed' },
      { status: 500 }
    );
  }
}
```

---

## 12. IBM watsonx Integration

### 12.1 Complete watsonx Client

```typescript
// src/lib/watsonx/client.ts (complete version)
import axios, { AxiosInstance, AxiosError } from 'axios';

interface EmbeddingRequest {
  model_id: string;
  inputs: string[];
  project_id: string;
  parameters?: {
    truncate_input_tokens?: number;
  };
}

interface EmbeddingResponse {
  model_id: string;
  results: Array<{
    embedding: number[];
    input_token_count: number;
  }>;
}

interface ChatRequest {
  model_id: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  project_id: string;
  parameters?: {
    temperature?: number;
    max_new_tokens?: number;
    top_p?: number;
    top_k?: number;
  };
}

interface ChatResponse {
  model_id: string;
  created_at: string;
  results: Array<{
    generated_text: string;
    generated_token_count: number;
    input_token_count: number;
    stop_reason: string;
  }>;
}

class WatsonXClient {
  private client: AxiosInstance;
  private projectId: string;
  private embeddingModel: string;
  private chatModel: string;

  constructor() {
    const apiKey = process.env.WATSONX_API_KEY;
    const url = process.env.WATSONX_URL;
    this.projectId = process.env.WATSONX_PROJECT_ID!;

    if (!apiKey || !url || !this.projectId) {
      throw new Error('Missing watsonx.ai configuration');
    }

    this.client = axios.create({
      baseURL: url,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      timeout: 60000, // 60s timeout
    });

    // Model IDs (adjust based on actual available models)
    this.embeddingModel = 'ibm/slate-125m-english-rtrvr';
    this.chatModel = 'ibm/granite-13b-chat-v2';
  }

  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      const request: EmbeddingRequest = {
        model_id: this.embeddingModel,
        inputs: texts,
        project_id: this.projectId,
        parameters: {
          truncate_input_tokens: 512, // Model limit
        },
      };

      const response = await this.client.post<EmbeddingResponse>(
        '/ml/v1/text/embeddings',
        request
      );

      return response.data.results.map((r) => r.embedding);
    } catch (error) {
      this.handleError('Embedding generation', error);
      throw error;
    }
  }

  async chat(
    messages: Array<{ role: string; content: string }>,
    options?: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<string> {
    try {
      const request: ChatRequest = {
        model_id: options?.model || this.chatModel,
        messages: messages as any,
        project_id: this.projectId,
        parameters: {
          temperature: options?.temperature ?? 0.7,
          max_new_tokens: options?.maxTokens ?? 1000,
          top_p: 0.95,
          top_k: 50,
        },
      };

      const response = await this.client.post<ChatResponse>(
        '/ml/v1/text/chat',
        request
      );

      if (!response.data.results || response.data.results.length === 0) {
        throw new Error('No results returned from chat API');
      }

      return response.data.results.generated_text;
    } catch (error) {
      this.handleError('Chat completion', error);
      throw error;
    }
  }

  private handleError(operation: string, error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      console.error(`[WatsonX] ${operation} failed:`, {
        status: axiosError.response?.status,
        data: axiosError.response?.data,
        message: axiosError.message,
      });

      if (axiosError.response?.status === 401) {
        throw new Error('watsonx.ai authentication failed - check API key');
      }

      if (axiosError.response?.status === 429) {
        throw new Error('watsonx.ai rate limit exceeded');
      }
    } else {
      console.error(`[WatsonX] ${operation} failed:`, error);
    }
  }
}

export const watsonxClient = new WatsonXClient();
```

### 12.2 Rate Limiting & Retry Logic

```typescript
// src/lib/watsonx/rate-limiter.ts
import pRetry from 'p-retry';

export async function withRetry<T>(
  fn: () => Promise<T>,
  options?: {
    retries?: number;
    minTimeout?: number;
  }
): Promise<T> {
  return pRetry(fn, {
    retries: options?.retries ?? 3,
    minTimeout: options?.minTimeout ?? 1000,
    onFailedAttempt: (error) => {
      console.log(
        `Attempt ${error.attemptNumber} failed. ${error.retriesLeft} retries left.`
      );
    },
  });
}

// Usage in agents:
// const synthesis = await withRetry(() => watsonxClient.chat(...));
```

---

## 13. Error Handling & Observability

### 13.1 Structured Logging

```typescript
// src/lib/utils/logger.ts
type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  userId?: string;
  companyId?: string;
  documentId?: string;
  agentName?: string;
  [key: string]: any;
}

export function log(
  level: LogLevel,
  message: string,
  context?: LogContext
) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...context,
  };

  // For production, send to logging service (Datadog, Sentry, etc.)
  console.log(JSON.stringify(logEntry));
}

export const logger = {
  info: (message: string, context?: LogContext) =>
    log('info', message, context),
  warn: (message: string, context?: LogContext) =>
    log('warn', message, context),
  error: (message: string, context?: LogContext) =>
    log('error', message, context),
  debug: (message: string, context?: LogContext) =>
    log('debug', message, context),
};
```

### 13.2 Error Boundaries

```typescript
// src/components/error-boundary.tsx
'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    // Send to error tracking service
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-8 text-center">
            <h2 className="text-xl font-bold text-red-600">
              Something went wrong
            </h2>
            <p className="mt-2 text-muted-foreground">
              {this.state.error?.message}
            </p>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
```

---

## 14. Performance Optimization

### 14.1 Database Indexing

```sql
-- Indexes for common queries
CREATE INDEX idx_documents_company_status ON documents(company_id, status);
CREATE INDEX idx_document_chunks_document ON document_chunks(document_id);
CREATE INDEX idx_learning_paths_company_created ON learning_paths(company_id, created_at DESC);

-- pgvector HNSW index (already covered)
CREATE INDEX idx_document_chunks_embedding ON document_chunks USING hnsw (embedding vector_cosine_ops);
```

### 14.2 Batch Processing

```typescript
// Already implemented in embedding generation
// For uploads, consider background job queue for large batches

// src/lib/queues/document-processor.ts (conceptual - not implemented for hackathon)
import { Queue } from 'bullmq';

export const documentQueue = new Queue('document-processing', {
  connection: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
});

// Add job:
// await documentQueue.add('process', { documentId, content, companyId });
```

### 14.3 Caching Strategy

```typescript
// For frequently accessed data (e.g., company settings, user profiles)
// Use Redis or in-memory cache

// src/lib/cache/redis.ts (conceptual)
import { createClient } from 'redis';

const redis = createClient({
  url: process.env.REDIS_URL,
});

export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 3600
): Promise<T> {
  const cached = await redis.get(key);

  if (cached) {
    return JSON.parse(cached);
  }

  const data = await fetcher();
  await redis.setEx(key, ttl, JSON.stringify(data));
  return data;
}
```

---

## 15. Testing Strategy

### 15.1 Unit Tests (Example)

```typescript
// src/lib/utils/chunking.test.ts
import { chunkText } from './chunking';

describe('chunkText', () => {
  it('should chunk text into specified size', () => {
    const text = 'a'.repeat(5000);
    const chunks = chunkText(text, { chunkSize: 500, chunkOverlap: 50 });

    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.length).toBeLessThanOrEqual(500 * 4); // Approx
  });

  it('should handle overlap correctly', () => {
    const text = 'Hello world. This is a test. More text here.';
    const chunks = chunkText(text, { chunkSize: 5, chunkOverlap: 2 });

    // Verify chunks overlap
    expect(chunks.length).toBeGreaterThan(1);
  });
});
```

### 15.2 Integration Tests

```typescript
// src/lib/agents/harvester.test.ts
import { harvesterAgent } from './harvester';
import { db } from '@/lib/db';

describe('harvesterAgent', () => {
  beforeAll(async () => {
    // Seed test database with sample data
  });

  it('should retrieve relevant chunks', async () => {
    const result = await harvesterAgent({
      query: 'React hooks',
      companyId: 'test-company-id',
    });

    expect(result.chunks.length).toBeGreaterThan(0);
    expect(result.chunks.similarity).toBeGreaterThan(0.5);
  });

  afterAll(async () => {
    // Clean up test data
  });
});
```

---

## 16. Deployment & DevOps

### 16.1 Deployment Platform: Vercel

```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy
vercel --prod
```

**Environment variables**: Set in Vercel dashboard.

### 16.2 Database Migrations

```bash
# Generate migration
pnpm drizzle-kit generate:pg

# Apply to production (via Supabase dashboard or CLI)
# Or run migration script in CI/CD
```

### 16.3 CI/CD Pipeline (GitHub Actions Example)

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: pnpm install

      - name: Run tests
        run: pnpm test

      - name: Deploy to Vercel
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
        run: vercel --prod --token=$VERCEL_TOKEN
```

---

## Summary

This technical guide provides a **complete, production-ready blueprint** for building Community Knowledge Weaver. Every architectural decision is explained with reasoning:

- **Why Next.js 15**: App Router performance, server actions, TypeScript.
- **Why Supabase + pgvector**: Native vector search, no separate DB, cost-effective.
- **Why Drizzle**: Type-safe, lightweight, SQL-friendly.
- **Why Better Auth**: Modern, multi-tenant, better DX.
- **Why multi-agent pattern**: Modular, testable, explainable, extensible.
- **Why IBM watsonx**: Hackathon requirement + enterprise positioning.

**Use this document as your single source of truth** for implementation. Each section can be built incrementally, tested independently, and integrated into the final system.

**Next steps:**

1. Set up project skeleton (Phase 0).
2. Implement document upload + chunking + embedding (Phase 1).
3. Build harvester + synthesizer agents (Phase 2).
4. Complete path builder + verifier + orchestrator (Phase 3).
5. Polish UI and add Google Drive connector (Phase 4).
6. Test end-to-end, prepare demo (Phase 5).

**You now have everything you need to build this system from scratch.**

```

```
