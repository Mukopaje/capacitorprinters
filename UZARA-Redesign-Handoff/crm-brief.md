# UZARA CRM — advanced, AI-native sales CRM (proposal & end-to-end plan)

Replaces the generic `leads` table with a proper CRM where **Xana is a working teammate**:
she summarizes each lead, drafts replies, recommends the right bundle + price, schedules demos on
Google Calendar, and keeps the pipeline clean — so a rep closes in seconds, not sessions.

_Status: PROPOSAL for review. Nothing built yet beyond RM-514 (lead alerts)._

---

## 1. Where we are today (the gap)

- `leads` table only: business_name, contact_name, email, phone, status (new/contacted/demo/trial/
  won/lost), source, metadata jsonb, notes. Written by Xana (`capture_lead` / `book_demo`) and
  resellers. **No CRM UI, no pipeline, no activity timeline, no email, no tasks, no calendar.**
- A lead lands in the table and is effectively invisible — RM-514 now at least emails the team, but
  there's nowhere to *work* the lead.
- We have: `MailService` (outbound email), `WhatsappService` (WhatsApp Connect), the full Xana agent
  framework, and the dashboard design system (copper/obsidian). We do NOT yet have Google Calendar
  OAuth or inbound-email threading — both are net-new for this.

## 2. What the best CRMs have (and which we adopt)

Benchmarked against HubSpot, Pipedrive, Close, Attio, Salesforce (SMB tier):

| Capability | Why it matters | We adopt |
|---|---|---|
| Contacts ↔ Companies (separate) | One venue, many people (owner, manager) | ✅ core |
| Visual pipeline (kanban deals) | See the money, drag stages | ✅ core |
| Activity timeline (every touch) | The single source of truth per lead | ✅ core |
| Two-way email in-app (send + receive + thread) | Reply without leaving the CRM | ✅ phase 3 |
| Tasks & reminders | Nothing falls through | ✅ core |
| Lead scoring / qualification | Focus on hot leads | ✅ (Xana-driven) |
| Scheduling + calendar sync | Book demos, no back-and-forth | ✅ phase 4 (Google) |
| Sequences / cadences | Automated multi-step follow-up | ✅ phase 5 |
| Reporting (pipeline, conversion, source ROI, velocity) | Manage the funnel | ✅ phase 6 |
| Templates, tags, custom fields, notes/@mentions | Speed + flexibility | ✅ spread across phases |
| Lead routing / assignment | Right rep gets the lead | ✅ core |

**What makes OURS different — Xana as the operator, not a chatbot bolted on:**
1. **Continuity** — the same Xana that chatted with the prospect on the website hands the full
   conversation straight into the CRM. No re-typing; the context is already there.
2. **Auto-summary + scoring** — every lead arrives with a one-line "what they want," an intent score,
   and a recommended addon bundle + monthly price (computed from the real pricing engine).
3. **Draft-and-send in seconds** — Xana drafts a tailored email/WhatsApp reply from the lead's
   context; the rep edits and sends; it's logged to the timeline.
4. **Next-best-action** — "Hotel + restaurant + activities → Hotel+Hospitality+Appointments = ZMW
   1,150/mo; price-sensitive, offer annual; follow up in 2 days."
5. **Schedule by intent** — "book a demo Tuesday 2pm" → Xana creates the Google Calendar event,
   emails the invite, sets a reminder task, logs the activity.
6. **Pipeline hygiene** — Xana flags cold deals and offers to draft re-engagement.

## 3. Data model (new `crm_*` tables; migrate `leads` in)

- **crm_companies** — id, tenant/platform scope, name, business_type/industry, size (locations,
  seats), country, city, website, owner_user_id, source, tags[], custom jsonb, timestamps.
- **crm_contacts** — id, company_id, first/last, email, phone, whatsapp, role/title, is_primary,
  source, owner_user_id, unsubscribe flags, timestamps.
- **crm_deals** (opportunities) — id, company_id, title, pipeline_id, stage, value_mrr,
  recommended_plan, recommended_addons[], probability, expected_close_at, owner_user_id, status
  (open/won/lost), lost_reason, xana_score, xana_summary, timestamps.
- **crm_activities** (timeline) — id, deal_id/contact_id, type (email|whatsapp|call|note|demo|
  xana_chat|task|stage_change|meeting), direction (in/out), actor (user_id or 'xana'), subject,
  body, occurred_at, metadata jsonb, source_conversation_id (links the Xana web chat).
- **crm_tasks** — id, deal_id, title, due_at, assignee_user_id, status (open/done), reminder_at.
- **crm_email_threads / crm_email_messages** — thread_id, deal_id, message_id, in_reply_to,
  direction, from, to[], subject, body_html, opened_at, sent_by. Inbound routed via a per-deal
  reply-to (`deal-<id>@leads.uzara.tech`).
- **crm_pipelines / crm_stages** — configurable stages (default: New → Qualified → Demo →
  Trial → Proposal → Won/Lost), order, probability, colour.
- **crm_calendar_accounts / crm_meetings** — per-user Google OAuth tokens; meetings with
  google_event_id, start/end, attendees, deal_id.
- **Migration:** each `leads` row → a company + primary contact + an open deal in the matching
  stage, with a seed `xana_chat`/`note` activity carrying the old notes. `leads` kept read-only as
  a legacy view during transition.

## 4. Backend (`CrmModule`)

- CRUD + services for companies, contacts, deals (with stage transitions + won/lost), activities,
  tasks, pipelines. Super-admin/sales-staff gated (is_zpos_staff) — this is the PLATFORM sales CRM.
  (A tenant-facing customer CRM is a later, separate track.)
- **Ingestion:** Xana `capture_lead`/`book_demo`/`book_demo`/`start_signup` create/attach
  company+contact+deal+activity (replacing the bare `leads.save`), keep the RM-514 alert.
- **Email service:** send via MailService, log as `email` activity + thread; **inbound** via a
  catch-all `deal-<id>@leads.uzara.tech` (Mailgun/SES inbound webhook, or IMAP poll on a shared
  mailbox) → append to the thread + timeline + notify. Open tracking via pixel.
- **Google Calendar service:** OAuth 2.0 per staff user (Calendar scope), create/patch events,
  send invites; tokens in `crm_calendar_accounts`. (Outlook/Microsoft Graph later.)
- **Xana CRM agent** (`xana_crm`, super-admin/sales): tools — `summarize_lead`, `score_lead`,
  `suggest_next_action`, `draft_reply` (email/WhatsApp), `send_email` (confirm), `send_whatsapp`
  (confirm), `schedule_demo` (Google Calendar + invite + task), `create_task`, `move_stage`,
  `log_activity`, `list_pipeline`, `find_deal`, `recommend_bundle` (uses the real pricing engine).
  Reads are free; writes confirm. Reuses the orchestrator, quota, and confirmation machinery.

## 5. Dashboard UI (great, intuitive — copper/obsidian design system)

- **Pipeline board** (default): kanban columns per stage, deal cards (company, value_mrr, owner
  avatar, Xana score chip, days-in-stage), drag-drop to move stages, column totals, quick filters
  (owner, source, hot). "Add deal" + inline create.
- **Deal detail** (the workhorse — 3 panes):
  - Left: **activity timeline** (emails, WhatsApp, calls, notes, demos, Xana chats, stage changes)
    — the full story, newest first.
  - Middle: **composer** — reply by email/WhatsApp/note with a **"Draft with Xana"** button (fills
    a tailored draft you edit + send in seconds); schedule-a-demo button.
  - Right: **company/contact + deal fields** + a **Xana panel**: one-line summary, intent score,
    recommended bundle + price, suggested next action, and cold-lead nudge.
- **Inbox**: all email/WhatsApp threads with leads, unified, reply with Xana.
- **Today**: my open tasks, due follow-ups, new + hot leads assigned to me.
- **Reports**: pipeline value by stage, conversion + velocity, win/loss reasons, source ROI, rep
  leaderboard.
- Lives under `/admin/crm` (super-admin), added to the admin nav. Reuses `@/components/dash`
  (StatCard, BarPanel, AreaPanel, DataTable) + the copper theme; charts via recharts.

## 6. Integrations & communication channels

Communication is **channel-unified** — email and WhatsApp are equal first-class channels behind one
composer and one timeline. Every phase that touches messaging (composer, Xana `draft_reply`,
templates, sequences, inbound threading, activity logging) is built for **both from day one**;
WhatsApp simply stays **dormant until WhatsApp Connect is switched on** (same build-ready,
flag-on-later pattern as topic-scoping). No rework needed when it goes live.

- **Email** — outbound (MailService today) + inbound threading via reply-to routing (new). Open
  tracking, templates.
- **WhatsApp (built-ready, switch-on)** — a full first-class channel: two-way lead conversations,
  Xana-drafted WhatsApp replies, WhatsApp templates (for the 24-hour-window rules), and inbound
  messages threaded onto the same deal timeline as email. Wired through the existing
  `WhatsappService` / WhatsApp Connect addon; the CRM detects when it's enabled and lights up the
  WhatsApp option in the composer + Xana's channel choice. Until then the UI shows it as available
  ("connect WhatsApp") without breaking. Sequences and templates support a WhatsApp step from v1 of
  the automation phase, disabled-but-present until connected.
- **Google Calendar** — OAuth per staff; Xana `schedule_demo` books the event + emails the invite
  (and can send a WhatsApp confirmation once WhatsApp is on).
- **Xana web chat** — website conversations feed context + transcript into the deal automatically.

Design rule: the composer, templates, sequences, and Xana's `draft_reply`/`send_*` tools take a
`channel` ('email' | 'whatsapp') everywhere, so turning WhatsApp on is a capability flip, not a
feature build.

## 7. Phased plan

1. **Foundation** — `crm_*` schema, migrate `leads`, pipeline board + deal detail + timeline,
   Xana ingestion creates deals, tasks. (The CRM becomes usable.)
2. **Xana assist** — `xana_crm` agent: summarize, score, suggest next action, recommend bundle;
   the Xana panel in deal detail.
3. **Email two-way** — send-from-CRM + logged, inbound reply-to threading, templates, open tracking.
4. **Scheduling** — Google Calendar OAuth + `schedule_demo` + booking links + reminder tasks.
5. **Automation** — sequences/cadences, lead routing/assignment rules, cold-lead auto-nudges.
6. **Reporting** — pipeline/conversion/source/rep dashboards.

Each phase ships independently with roadmap + KB (per policy), on branches/PRs given the size.

## 8. What it will be capable of (headline)

- Every lead (Xana web chat, dashboard, reseller) becomes a **company + contact + deal** with the
  **entire Xana conversation on its timeline** — nothing re-typed, nobody missed.
- A visual **pipeline** the sales team drags deals through; totals and hot-lead flags at a glance.
- Open a lead and Xana has **already summarized what they want, scored them, and drafted a reply**
  plus the **right addon bundle + monthly price** from the live pricing engine.
- **Reply by email or WhatsApp in seconds** — Xana drafts, you edit, send; logged automatically.
- **"Book a demo Tuesday 2pm"** → Xana creates the **Google Calendar** event, emails the invite,
  sets a reminder, logs it.
- **Cold deals surface themselves**; Xana offers re-engagement drafts.
- **Reports** on pipeline value, conversion, velocity, win/loss, and which sources actually convert.

## 9. Open decisions for the owner

- **Scope first:** platform sales CRM (UZARA selling to merchants) — confirmed primary. A
  tenant-facing CRM (merchants managing THEIR customers) is a separate later track — in scope or not?
- **Inbound email:** provider for inbound routing (Mailgun/SES inbound, or IMAP on a shared
  mailbox)? Determines the reply-to domain setup.
- **Calendar:** Google first (confirmed); Outlook later?
- **Interface depth for v1:** ship the pipeline + deal-detail + Xana assist first, or wait for
  email two-way to land together?
