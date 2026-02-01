import 'dotenv/config'
import { PrismaClient } from '../generated/prisma/client'

const prisma = new PrismaClient()

const PROJECTS = [
  { name: 'Customer Portal', slug: 'customer-portal', description: 'Public-facing customer account and billing.', whereHosted: 'GitHub org/customer-portal, staging https://portal.staging.example.com, docs .../wiki', status: 'active' },
  { name: 'Data Pipeline', slug: 'data-pipeline', description: 'ETL and analytics pipelines.', whereHosted: 'GitHub org/data-pipeline, Airflow https://airflow.internal.example.com', status: 'active' },
  { name: 'Mobile App (iOS/Android)', slug: 'mobile-app', description: 'Native mobile apps.', whereHosted: 'GitHub org/mobile-app, TestFlight / Play Internal', status: 'active' },
  { name: 'Internal API Gateway', slug: 'api-gateway', description: 'Auth and routing for internal services.', whereHosted: 'GitHub org/api-gateway, Kubernetes api-gateway.default.svc', status: 'active' },
  { name: 'Admin Dashboard', slug: 'admin-dashboard', description: 'Internal ops and support dashboard.', whereHosted: 'GitHub org/admin-dashboard, https://admin.internal.example.com', status: 'active' },
  { name: 'Notification Service', slug: 'notification-service', description: 'Email and push notifications.', whereHosted: 'GitHub org/notifications, AWS SQS + Lambda', status: 'active' },
  { name: 'Auth Service', slug: 'auth-service', description: 'SSO and identity provider.', whereHosted: 'GitHub org/auth-service, Kubernetes auth-service.default.svc', status: 'active' },
  { name: 'Analytics Backend', slug: 'analytics-backend', description: 'Event ingestion and reporting.', whereHosted: 'GitHub org/analytics-backend, BigQuery + dbt', status: 'active' },
]

const TICKET_TEMPLATES: { title: string; kind: string; status: string }[] = [
  { title: 'Login timeout on slow networks', kind: 'bug', status: 'done' },
  { title: 'Stale cache after deploy', kind: 'bug', status: 'open' },
  { title: 'Wrong redirect after password reset', kind: 'bug', status: 'done' },
  { title: 'Add API rate limiting', kind: 'task', status: 'in_progress' },
  { title: 'Document deployment runbook', kind: 'task', status: 'open' },
  { title: 'Upgrade Node to LTS', kind: 'task', status: 'done' },
  { title: 'SSO for enterprise', kind: 'feature', status: 'open' },
  { title: 'Export to CSV', kind: 'feature', status: 'done' },
  { title: 'Dark mode', kind: 'feature', status: 'in_progress' },
  { title: 'Outage 2024-01-15 database', kind: 'incident', status: 'done' },
  { title: 'High error rate API gateway', kind: 'incident', status: 'done' },
  { title: 'Fix memory leak in worker', kind: 'bug', status: 'open' },
  { title: 'Add health check endpoint', kind: 'task', status: 'done' },
  { title: 'Multi-region deployment', kind: 'feature', status: 'open' },
  { title: 'Improve login UX', kind: 'feature', status: 'open' },
  { title: 'Setup monitoring alerts', kind: 'task', status: 'in_progress' },
  { title: 'Update dependencies', kind: 'task', status: 'open' },
  { title: 'Document API contracts', kind: 'task', status: 'done' },
]

const NOTES = [
  { title: 'Deploy to staging', content: '1. Run build. 2. Run tests. 3. Deploy to staging. 4. Smoke test. 5. Notify team.', tag: 'runbook' },
  { title: 'Incident escalation', content: 'When to page on-call: P1/P2. Who to notify: eng-oncall@. War room: #incidents.', tag: 'runbook' },
  { title: 'New hire dev setup', content: 'Install IDE, clone repos, run ./scripts/setup, request access to Slack and Jira.', tag: 'onboarding' },
  { title: 'Request production access', content: 'Submit form, manager approval, security review. Access granted within 48h.', tag: 'how-to' },
  { title: 'Release checklist', content: 'Tag release, update changelog, deploy to staging, run E2E, deploy to prod, announce.', tag: 'runbook' },
  { title: 'Database migration', content: 'Create migration, test on staging, run during maintenance window, verify rollback plan.', tag: 'how-to' },
  { title: 'On-call handoff', content: 'Review open incidents, update runbooks, hand off to next on-call in #eng-oncall.', tag: 'runbook' },
  { title: 'Request VPN access', content: 'Submit IT form with manager approval. VPN client and instructions sent within 24h.', tag: 'how-to' },
  { title: 'Code review guidelines', content: 'Small PRs, describe context, run tests, at least one approval before merge.', tag: 'how-to' },
  { title: 'Sprint planning', content: 'Backlog refinement, capacity check, commit to sprint scope, kickoff meeting.', tag: 'meeting' },
  { title: 'Postmortem template', content: 'Impact, timeline, root cause, action items, follow-up review in 2 weeks.', tag: 'runbook' },
  { title: 'New repo setup', content: 'Create repo, add CI, set branch protection, add README and CONTRIBUTING.', tag: 'how-to' },
  { title: 'Customer Portal runbook', content: 'Staging: portal.staging.example.com. Rollback: revert last deploy, run smoke tests.', tag: 'runbook' },
  { title: 'Data Pipeline runbook', content: 'Airflow at airflow.internal.example.com. Restart DAG from UI. Check logs for failures.', tag: 'runbook' },
  { title: 'API Gateway runbook', content: 'Kubernetes rollout restart. Check pod logs. Circuit breakers in service mesh.', tag: 'runbook' },
  { title: 'Mobile app release', content: 'Build with Fastlane, upload to TestFlight/Play Internal, submit for review.', tag: 'how-to' },
  { title: 'Security incident response', content: 'Contain, notify security team, preserve logs, postmortem within 48h.', tag: 'runbook' },
  { title: 'Quarterly planning', content: 'OKR review, roadmap alignment, capacity planning, stakeholder sync.', tag: 'meeting' },
]

const POLICIES = [
  { title: 'PTO policy', category: 'hr', content: 'Full-time employees accrue 15 days PTO per year. Request via HR system with manager approval. Unused PTO may roll over up to 5 days per policy. Blackout periods may apply during release cycles.\n\nExtended leave (parental, medical) is handled separately; contact HR for documentation and approval.' },
  { title: 'Code of conduct', category: 'hr', content: 'We expect respect, inclusivity, and professionalism. Harassment, discrimination, or retaliation are not tolerated. Report concerns to HR or through the anonymous hotline. Violations may result in discipline up to termination.\n\nThis policy applies to all company events, communication channels, and external representation.' },
  { title: 'Remote work policy', category: 'hr', content: 'Remote work is permitted with manager approval. Core hours 10am–3pm local for overlap. Use VPN for internal systems. Home workspace should meet security and ergonomics guidelines.\n\nEquipment may be provided; see IT for laptop and peripherals. Travel for key meetings may be required.' },
  { title: 'Parental leave', category: 'hr', content: 'Primary caregivers: 16 weeks paid. Secondary: 4 weeks paid. Additional unpaid leave per local law. Coordinate with HR and manager at least 4 weeks before start. Return-to-work arrangements are flexible where possible.' },
  { title: 'VPN and remote access', category: 'it', content: 'VPN is required for access to internal networks and production systems. Use company-approved VPN client; do not use personal or third-party VPNs for work. MFA is required for VPN and critical systems.\n\nReport lost devices or suspected compromise to IT immediately. Access is revoked upon offboarding.' },
  { title: 'Laptop and device policy', category: 'it', content: 'Company-issued laptops are standard. Devices must be encrypted and enrolled in MDM. Personal devices may not be used for access to production or sensitive data unless approved and secured.\n\nReturn equipment on departure. Lost or stolen devices must be reported within 24 hours.' },
  { title: 'Software approval', category: 'it', content: 'New software or SaaS must go through security and legal review. Submit request via IT portal. Approved tools are listed in the internal catalog. Do not install unapproved software on company devices or use unapproved cloud services for work data.' },
  { title: 'PII handling', category: 'security', content: 'Personally identifiable information (PII) must be minimized, encrypted in transit and at rest, and accessed only on a need-to-know basis. Do not log PII in plaintext. Use approved data stores and follow retention schedules.\n\nBreaches or exposure must be reported to security and compliance within 24 hours.' },
  { title: 'Production access', category: 'security', content: 'Production access requires manager approval, security training, and need-to-know. Use least-privilege and break-glass procedures only for incidents. All access is logged and audited.\n\nCredentials must not be shared. Use SSO and short-lived tokens where available.' },
  { title: 'Incident response', category: 'security', content: 'P1/P2 incidents: page on-call, create war room, notify stakeholders. Preserve logs and state. Postmortem within 48 hours with root cause and action items. Security incidents: additionally notify security and compliance; follow breach playbook if data exposure.' },
  { title: 'Data retention', category: 'compliance', content: 'Retention periods vary by data type and jurisdiction. Default: 90 days for logs, 7 years for financial and legal. Deletion requests (e.g. GDPR) must be processed within 30 days. See data classification matrix for details.' },
  { title: 'Audit and logging', category: 'compliance', content: 'Access to production and sensitive systems is logged. Logs are retained per data retention policy and may be used for audit and incident investigation. Do not disable or alter audit logs. Compliance may request access for audits.' },
  { title: 'Third-party data sharing', category: 'compliance', content: 'Sharing data with third parties requires DPA and legal review. Do not export customer or PII data to unapproved tools or regions. Use approved integrations and document data flows in the registry.' },
]

async function main() {
  console.log('Seeding database...')

  const projectIds: string[] = []

  for (const p of PROJECTS) {
    const project = await prisma.project.upsert({
      where: { slug: p.slug },
      create: { name: p.name, slug: p.slug, description: p.description, whereHosted: p.whereHosted, status: p.status },
      update: { name: p.name, description: p.description, whereHosted: p.whereHosted, status: p.status },
    })
    projectIds.push(project.id)
  }
  console.log('Created/updated', projectIds.length, 'projects')

  await prisma.ticket.deleteMany({})
  let ticketCount = 0
  for (let i = 0; i < 40; i++) {
    const t = TICKET_TEMPLATES[i % TICKET_TEMPLATES.length]
    const projectId = projectIds[i % projectIds.length]
    await prisma.ticket.create({
      data: {
        projectId,
        title: t.title + (i > TICKET_TEMPLATES.length - 1 ? ` (${i})` : ''),
        kind: t.kind,
        status: t.status,
        description: `Description for ${t.title}.`,
      },
    })
    ticketCount++
  }
  console.log('Created', ticketCount, 'tickets')

  await prisma.note.deleteMany({})
  for (const n of NOTES) {
    const projectIndex = NOTES.indexOf(n) % projectIds.length
    await prisma.note.create({
      data: {
        title: n.title,
        content: n.content,
        tag: n.tag,
        projectId: projectIndex < 6 ? projectIds[projectIndex] : null,
      },
    })
  }
  console.log('Created', NOTES.length, 'notes')

  await prisma.policy.deleteMany({})
  const effectiveAt = new Date('2024-01-01')
  for (const p of POLICIES) {
    await prisma.policy.create({
      data: {
        title: p.title,
        content: p.content,
        category: p.category,
        effectiveAt,
      },
    })
  }
  console.log('Created', POLICIES.length, 'policies')

  console.log('Seed completed.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
