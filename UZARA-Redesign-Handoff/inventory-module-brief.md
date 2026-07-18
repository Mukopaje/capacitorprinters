# Inventory (Stock) module — build brief (doc #14)

Redesign of the **new stock-control pages**: **Stock on hand, Stock Take, Shrinkage,
Reorder inbox** — plus the Inventory landing and the existing Purchase Orders / Suppliers /
Batches / Transfers so the whole Stock area feels like one module. **UI/UX + brand only —
preserve all functionality.** Branch off `main`, PR, never `main`. Brand =
`uzara-brand-tokens.md`. Web dashboard = light (Stone).

**These are shared primitives, not bespoke screens** (`START-HERE.md` rule 0): every table
is the shared `DataTable`; every KPI strip is `StatRow`; cards are `StatCard`; the count
sheet, filters, empty/loading states, chips, and side-peek are shared components. Build once,
reuse. The pages were shipped functional (RM-561/563/565/567/569/573); this brief brings them
to the standard the Products module (#13) now sets.

## Products vs Inventory (the IA — see also the plan doc)
**Products = catalog** (what you sell). **Inventory/Stock = quantities** (how many, where,
movement). The nav "Inventory" group splits into **Catalog** (Products, Categories, Menus,
Price Books, Recipes) and **Stock** (Stock Levels, Stock Take, Shrinkage, Reorder, Purchase
Orders, Suppliers, Transfers, Locations, Expiry). This brief owns the **Stock** sub-group.

## Brand corrections (apply throughout)
- **Copper `#C97D3E`** is the only primary. No blue/orange as UI accent (logo excepted).
- **Teal `#1A9B87` only for Xana.** (An "Ask Xana about this" affordance may appear on
  reports — teal-marked.)
- Warm **Stone** neutrals; real **StockPill** states (in/low/out) everywhere a quantity shows.
- Numbers right-aligned **tabular**; loss = `#B4231F`, found/positive = `#1A6B55`.

---

## Components

### 1. Stock levels — Stock on hand (`/dashboard/inventory/stock`)
The portfolio grid. `StatRow` summary (Lines · Stock value · Low · Out) → filter row
(Location select · Category select · **Low-stock-only** copper chip · Export) → **DataTable**
(Product w/ SKU, Location, Category, On-hand as **StockPill**, Reorder-at, Value). Row click →
**product side-peek** (reuse the Products `PeekPanel`). Sort on value/qty. Density: 32–36px
rows. Keep CSV export. Empty state: "No stock in this scope — receive via a PO or clear
filters."

### 2. Stock Take (`/dashboard/inventory/stock-take`) — the headline, give it care
Two views in one page (list ↔ count sheet).
- **List:** dense rows of past/open counts (status chip: counting/review/**posted**/cancelled,
  location, counted N/total, variance value). "New count" (copper) opens a compact scope
  form (Location · Everything/Category/Low-stock · optional name).
- **Count sheet:** `StatRow` (Lines · Counted x/y · Variance value, red when negative) →
  the **count grid**: a dense editable `DataTable` variant — Product | System (muted) |
  **Counted** (inline number input, copper focus) | **Variance** (green at 0, red when off,
  `+`/`−` signed). Sticky footer bar: "**Post count** — correct N item(s)" (copper) + "Uncounted
  lines are left untouched." Posted state = read-only + emerald "Posted — stock corrected."
  *Design ask:* make the counted-input column feel fast (big tap target, auto-advance on Enter,
  optional scan-to-jump on the till parity). This is the daily-driver screen.

### 3. Shrinkage report (`/dashboard/inventory/shrinkage`)
Period segment (7/30/90d) + Location filter. `StatRow` (Lost `#B4231F` · Found · Net ·
Movements). Two panels: **By reason** and **By category** — horizontal share bars (loss red,
found emerald), value right-aligned. Consider a small **trend** (net shrinkage per week) as an
`AreaPanel` if it earns the space. Empty: "No shrinkage this period — fills in as you post
counts and reasoned adjustments." Add an **"Ask Xana: why did we lose stock?"** teal chip.

### 4. Reorder inbox (`/dashboard/inventory/reorder`) — Advanced Inventory
Addon-gated (403 → the **upsell card**: keep it, polish to the StatCard/empty-state pattern,
copper "Activate"). Active: `StatRow` (To review/Approved · Est. cost) → status tabs
(pending/approved) → **DataTable** (Product, Location, On-hand red, **Buy** bold, Est. cost,
Supplier, row-hover approve/dismiss). Approved tab: **Raise purchase order** (copper) →
result toast + link. Row → product peek. Empty (pending): sparkles + "Nothing to reorder."
Footnote about velocity + reorder-point tuning stays.

### 5. Inventory landing (`/dashboard/inventory`)
Today it's a thin overview. Reframe as a **Stock hub**: `StatRow` (stock value, low, out,
open POs) + a Queue of stock actions (low-stock count, expiring batches, pending reorders,
open counts) + Explore tiles linking the Stock sub-pages. Same Brief→Pulse→Queue→Explore
grammar as the tenant landing, scoped to stock.

### 6. Consistency pass — Purchase Orders / Suppliers / Batches / Transfers
No re-imagining — adopt the shared shell: `PageHeader`, `DataTable`, `StatCard`, copper
primaries, StockPill where stock shows, warm Stone. So the whole Stock area reads as one module.

---

## Relevancy (optional, in-scope)
Product side-peek on stock-on-hand + reorder rows; a shrinkage trend chart; scan-to-jump on
the count sheet (dashboard parity with the till); "Ask Xana" affordances on the reports.

## PRESERVE
All filters (location/category/low-stock/period), CSV export, the count open→count→post flow
and partial-count semantics, approve/dismiss/scan/convert-to-PO, the addon gate + upsell,
multi-location, dark mode, every existing PO/supplier/batch/transfer capability.

## Acceptance
- No blue/orange as UI accent; copper primaries; teal only on Xana affordances.
- Tables = shared `DataTable`; KPI strips = `StatRow`; peek = shared `PeekPanel`; StockPill
  states real everywhere — no per-screen restyling.
- Count sheet is fast and unmistakable (system vs counted vs variance); post corrects in bulk.
- Shrinkage loss/found colours correct; reorder upsell polished; empty + loading + posted
  states designed. Warm Stone; light + dark; flat. QA against the comps before merge.
