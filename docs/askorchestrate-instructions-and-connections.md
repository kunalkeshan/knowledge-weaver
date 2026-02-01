# AskOrchestrate: Instructions & Watson X Agent Connections

Use your **existing AskOrchestrate** agent as the main orchestrator. Do **not** create a new agent—only update its **Instructions** and add **connections** to the specialists in the Watson X chat/agent UI.

---

## 1. AskOrchestrate instructions (paste into Watson X)

In Watson X: open **AskOrchestrate** → **Profile** (or **Instructions**). Paste the block below so it handles all specialist agents correctly.

```
You are the main orchestrator. The user talks to you. Your job is to delegate each question to the right specialist agent and return that agent's response. Do not answer specialist topics yourself—always invoke the matching specialist by name and return their answer.

You have these specialist agents (use their exact names when delegating):

- **Onboarding Assistant** — New here, onboarding, new hire, first week, Day 1, getting started, "what do I need to know", accounts, access, tools, team intro, company resources.
- **IT Support & Access** — VPN, access, repo access, IT support, laptop, device, dev environment.
- **HR Policy Assistant** — HR policy, PTO, leave, remote work, code of conduct, benefits, regulations.
- **Project & Hosting Assistant** — Where is a project hosted, repos, apps, docs, project status, tickets, staging, deploy.
- **Process & How-To Assistant** — How do I, process, procedure, escalation, step-by-step.
- **Security & Compliance** — Security, compliance, PII, production access, audit.
- **Incident & Troubleshooting** — Incident, outage, down, troubleshoot, runbook, postmortem, escalation.
- **Manager & Team Lead** — Manager, team lead, contractor onboarding, approval, repo admin, team procedures.
- **Knowledge & Learning** — Learn, documentation, learning path, overview.

Rules:
1. For each user message, choose the single best-matching specialist from the list above and invoke that agent. Return that agent's response to the user.
2. If the question fits more than one agent, pick the one that best matches the primary intent.
3. If the question is general or unclear, use the most relevant specialist (e.g. Knowledge & Learning for broad "how does X work" questions).
4. Do NOT delegate to "Response Verifier" as a chat target. Response Verifier is only used to verify another agent's answer (e.g. after Security & Compliance); the platform or you may call it separately when needed.
```

---

## 2. Watson X connections: what to connect with what

Do this **manually in the Watson X UI** (e.g. Agent chat / Manage agents → connections or agent linking).

**In the chat, connect:**

- **AskOrchestrate →** each of these 9 specialists (so it can delegate to them):  
  Onboarding Assistant, IT Support & Access, HR Policy Assistant, Project & Hosting Assistant, Process & How-To Assistant, Security & Compliance, Incident & Troubleshooting, Manager & Team Lead, Knowledge & Learning.
- **Response Verifier:** either **Security & Compliance → Response Verifier** (to verify security answers), or **AskOrchestrate → Response Verifier** (to verify after the orchestrator gets a specialist’s response). Do **not** connect the user directly to Response Verifier as a chat target.

### AskOrchestrate (orchestrator)

**Connect AskOrchestrate TO these agents** (so it can delegate to them):

| Specialist agent              | Purpose |
|-------------------------------|--------|
| Onboarding Assistant          | New hires, getting started, Day 1 |
| IT Support & Access           | VPN, access, devices |
| HR Policy Assistant           | HR policy, PTO, leave |
| Project & Hosting Assistant    | Projects, hosting, tickets |
| Process & How-To Assistant     | How-to, procedures |
| Security & Compliance         | Security, PII, compliance |
| Incident & Troubleshooting    | Incidents, runbooks |
| Manager & Team Lead           | Manager/team lead topics |
| Knowledge & Learning          | Learning, docs, overviews |

So: **AskOrchestrate → Onboarding Assistant**, **AskOrchestrate → IT Support & Access**, … (all 9 specialists). That way the orchestrator can invoke the right specialist for each question.

**Do not** connect the user directly to Response Verifier as a chat target. Response Verifier is only for verifying another agent’s answer.

### Response Verifier (verification only)

**Option A — Verify Security & Compliance (and other high-risk) answers**

- Connect **Security & Compliance → Response Verifier** so that when Security & Compliance responds, Response Verifier can verify that answer.
- Optionally connect **other high-risk agents → Response Verifier** the same way if Watson X supports it.

**Option B — Single verification step after orchestrator**

- Connect **AskOrchestrate → Response Verifier** so that after the orchestrator gets the specialist’s response, it can send that response to Response Verifier for verification before returning to the user (e.g. for security/compliance questions).

Use whichever pattern your Watson X UI supports (per-specialist verification vs one post-orchestrator step).

---

## 3. Summary

| From              | To                    | Purpose |
|-------------------|------------------------|--------|
| AskOrchestrate    | Onboarding Assistant   | Orchestrator delegates to specialist |
| AskOrchestrate    | IT Support & Access    | Same |
| AskOrchestrate    | HR Policy Assistant    | Same |
| AskOrchestrate    | Project & Hosting Assistant | Same |
| AskOrchestrate    | Process & How-To Assistant  | Same |
| AskOrchestrate    | Security & Compliance  | Same |
| AskOrchestrate    | Incident & Troubleshooting | Same |
| AskOrchestrate    | Manager & Team Lead    | Same |
| AskOrchestrate    | Knowledge & Learning   | Same |
| Security & Compliance (or AskOrchestrate) | Response Verifier | Verify answer before returning to user |

After you update AskOrchestrate’s instructions and create these connections in Watson X, the main chat should use AskOrchestrate, which will delegate to the right agent and return that response.

---

## 4. Next steps (after agents and instructions are set)

1. **Orchestrator agent ID (optional)**  
   In this app, the **Ask** page sends the user to the orchestrator when it can resolve it. You can set `WATSON_ORCHESTRATOR_AGENT_ID` in `.env` to your AskOrchestrate agent ID (from Watson X → agent → copy ID). If you leave it unset, the app tries to find an agent with display name **"AskOrchestrate"** from the Watson API.

2. **Sync knowledge to Watson**  
   So specialist agents have up-to-date content: go to **Dashboard → Tracking** and click **Sync to Watson**, or call `POST /api/admin/sync-to-watson`. This syncs projects, tickets, notes, and policies into each agent's knowledge base per `AGENT_SYNC_MAP`.

3. **Test the flow**  
   Open **Dashboard → Ask**, type a question (e.g. "How do I get VPN access?"), and submit. You should land in the AskOrchestrate chat; the orchestrator will delegate to the right specialist and return their response. You can also open any agent from **Dashboard → Agents** for direct chat.
