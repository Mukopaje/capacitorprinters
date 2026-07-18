# START HERE — UZARA/ZPOS redesign handoff

Single entry point for any developer or coding agent implementing the redesign. Read this first, then the docs in the order below. **These docs are design + UX direction. Implement, don't invent — and preserve all existing functionality.**

---

## What to hand a developing agent

1. **This whole `UZARA-Redesign-Handoff/` folder** (the docs below + the interactive prototype).
2. **Access to the repo** `zpos-web-new` (web) and the till/mobile repos as relevant.
3. **The original screenshots** of the current screens (what exists today = what must be preserved).
4. This instruction: *"Follow the docs in `UZARA-Redesign-Handoff/`. Read `START-HERE.md` first."*

---

## The documents (read in this order — later rules never override earlier ones)

| # | Doc | What it governs | Precedence |
|---|---|---|---|
| 1 | **`uzara-brand-tokens.md`** | Colour, brand, theme. **Authoritative.** | **Highest — wins on all colour/brand.** |
| 2 | `zpos-redesign-spec.md` | Till/POS + all screen-level rules: ground rules, per-screen "Preserve" lists, component specs, form pattern, settings system, states. | Governs screens; colour tokens in it are **superseded by #1**. |
| 3 | `dashboards-redesign-system.md` | The three dashboards + ~45 sub-pages: shared primitives, page templates, cleanup, per-role specs, dashboards coding brief (§9). | Governs dashboards/admin/reseller. |
| 4 | `dashboards-ia-priorities.md` | Navigation IA, landing formula (Brief→Pulse→Queue→Explore), adaptive block registry, priority order, engineering pre-work. | Governs nav + landing content + build order. |
| 5 | `coding-agent-briefs.md` | Per-module briefs (appointments, products, orders, work periods, tickets, order details, review cart, forms, printer settings, settings, printing engine, subscription form, dashboards) — problem, changes, preserve, acceptance. | Per-screen implementation summary. |
| 6 | `email-templates.md` | UZARA email system: anatomy, email-safe build rules, desktop + mobile responsive, tokens, template variants, engineer checklist. | Governs all transactional/lifecycle/digest emails. |
| 7 | `category-pos-brief.md` | Bar/restaurant category order screen: 4-zone layout, the server-aware tab component + data model, exact hex/sizes, Preserve list, acceptance. | Governs the category POS + tabs. |
| 8 | `tables-floor-brief.md` | Tables/floor screen: tile spec + default sizing, server colour + aging-timer rules, grid + floor-plan views, Table data model, Preserve list, acceptance. | Governs the tables/floor screen. |
| 9 | `checkout-brief.md` | Payment screen + all checkout dialogs (change/receipt success modal, split, provisional, on-account, destructive confirms); shared modal pattern; instruction to align surrounding modules. | Governs checkout + transaction-tail dialogs. |
| 10 | `work-periods-brief.md` | Work-period screens: no-period modal, start shift, active shift + expected cash + close, colour-coded cash drawer, variance; data model; Preserve list. | Governs work periods / shifts / cash-up. |
| 11 | `staff-access-brief.md` | Staff login, main-menu icon system, waiter & staff management, roles & access, staff/waiter forms; dark-till tokens; the global teal→copper fix. | Governs people/access screens + till chrome. |
| 12 | `tenant-landing-build-spec.md` | Tenant dashboard landing — exact tokens, per-band component specs (Brief/Pulse/Queue/Explore), adaptive recipe, states, responsive, acceptance. | Governs the tenant landing build. |
| 13 | `products-module-brief.md` | Products & catalog: list/DataTable, quick-edit, quick-view slide-over, add/edit form, product detail; the blue/orange→copper fix; real stock states. | Governs the products module. |
| 14 | `inventory-module-brief.md` | Stock module: Stock on hand, Stock Take (count sheet), Shrinkage, Reorder inbox + Inventory landing/PO/suppliers consistency; all on shared DataTable/StatRow/PeekPanel/StockPill. | Governs the stock (inventory) module. |
| 14 | `reports-brief.md` | Till reports/analytics: two-pane (controls + report), KPIs shrunk to a summary, report as legible paper document, pinned print/export/email. | Governs the till reports module. |
| — | `zpos-redesign.html` | Interactive visual reference — open it, click the left nav to see every till screen. **Visual target, not a feature list.** | Reference only. |
| — | `ZPOS-BRAND-ONESHEET.md` | **Superseded** by `uzara-brand-tokens.md` (pre-rebrand ZPOS/teal). Keep for history; do not follow its colour. | Deprecated. |

---

## Where the instructions to agents actually live

- **Global ground rules** (branch, preserve functionality, ask-before-move, audit-first): `zpos-redesign-spec.md` §0. They apply to **every** surface, not just the till.
- **Per-screen "Preserve" lists** (what must not be removed on each screen): `zpos-redesign-spec.md` §2.
- **Exact component specs** (px, props, row types, form pattern, settings row types): `zpos-redesign-spec.md` §3–§5.
- **Dashboard coding brief** (copy-paste): `dashboards-redesign-system.md` §9.
- **Nav grammar + landing formula + adaptive registry + engineering pre-work**: `dashboards-ia-priorities.md` §2 and §4.
- **Brand migration + one-line theme change**: `uzara-brand-tokens.md` (bottom).

- **Per-module briefs** (appointments, products, orders, work periods, tickets, order details, review cart, forms, printer settings, settings, printing engine, subscription form, dashboards): `coding-agent-briefs.md`.

---

## The non-negotiable rules (every surface, every agent)

0. **Build ONE system, not page-by-page fixes.** These docs describe **shared patterns** — tokens, the card/StatCard/SectionCard/PageHeader/DataTable/EmptyState/modal/form/row primitives, the server-colour system, the Brief→Pulse→Queue→Explore landing, the settings row types. **Build each primitive once and reuse it everywhere; drive everything from the theme/token file.** Do **not** re-implement a card, button, modal, table, or colour per screen. A change to a shared component must propagate across the whole app. If two screens need the same thing, they use the same component. Screens differ only in *content/composition*, not in bespoke styling. The individual briefs are applications of the same system — not separate visual languages.

1. **UI/UX + brand only — preserve ALL functionality.** No button, field, filter, route, or setting is removed. The prototype/mockups are visual direction, **not** a feature inventory; a control missing from a mockup means "restyle it," never "delete it."
2. **Work on a branch off `main`** (e.g. `redesign/…`), small commits, PR, never commit to `main`.
3. **Audit each screen first** — list every existing interactive element, map each into the new design; anything unmapped is a flag to raise, never a silent removal.
4. **Ask before moving/merging/hiding** any control: state what, from where to where, why it's better, what the user gains.
5. **Brand = UZARA Copperbelt** (`uzara-brand-tokens.md`): accent **Copper `#C97D3E`**, Obsidian/Stone/Slate neutrals, Emerald success, Amber alerts. **Teal `#1A9B87` is Xana/AI only.** Light **and** dark via tokens; flat (no blur/animated shadow).
6. **No fabricated data** — remove fake sparklines, placeholder trends/dates, static health badges. Real data or "—".
7. **Every list/widget ships skeleton + compact empty + retry-on-error states.**

---

## Suggested build order (from `dashboards-ia-priorities.md` §3)

**Engineering pre-work first (no design needed):** set the theme file to UZARA tokens + scope teal to `--xana-*` and grep out swept teal; fix the 4 dead reseller routes; delete dead code (`Overview.tsx`, `RecentSales.tsx`, `DashboardLayout.tsx`); strip all fabricated data; wire the reseller statement/earnings endpoints; send date-range params from the landing.

**Then, in priority order:** P0 tenant nav grammar → P0 tenant landing (Brief/Pulse/Queue/Explore) + block registry → P0 reseller repair + money surfaces → P1 admin control tower → P1 the ~45 sub-page template rollout → P2 remaining theming/dark polish.
