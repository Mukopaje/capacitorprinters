# ZRA UAT Walkthrough

> Companion to `ZRA_INTEGRATION_BLUEPRINT.md` (architecture) and
> `ZRA_INTEGRATION_TEST_PLAN.md` (91 test cases). This is the
> presenter's runbook for the live UAT session.

---

## What changed (2026-06-17 — verified live vs the sandbox)

All 6 sign-off criteria were dry-run against the real Tomcat sandbox with
`ZRA_DISABLE_MOCK=true` (real FDNs `SDC0010002119-41..45` generated):

- **Mixed tax** — products carry a tax category (A / C3 / D), set in the
  dashboard (Inventory → Products → Tax Category). Each sale line is taxed on
  its own `vatCatCd`; a cart of A + C3 fiscalized correctly.
- **B2B** — attach a customer TPIN (customer record or ad-hoc buyer TPIN at
  checkout) → it prints as `custTpin` on the fiscal invoice.
- **Item registration** — items auto-register on first sale (UNSPSC class
  `50202301`, `orgnNatCd=ZM`, `pkgUnitCd=NT`; the old default `5020230101`
  was rejected by VSDC).
- **Credit notes** — inherit the original line tax category + registered code,
  reference the original FDN (`orgSdcId` derived from it), and use valid
  cdCls-32 refund reason codes.
- **Mock gate** — `ZRA_DISABLE_MOCK=true` turns off the sandbox fallbacks so a
  real VSDC rejection (e.g. a malformed TPIN) surfaces instead of a fake OK.
- **Till fixes** — fiscalization falls back to the synced ZRA TPIN if the
  local Settings TPIN was wiped; the bound terminal is restored after a POS
  reload / PIN re-login.

---

## Pre-flight (do these 24 hours before the session)

> **Demoing locally from one machine?** The sandbox VSDC is the ZRA Tomcat
> WAR running at `http://localhost:8085`. Cloud Run can't reach it, so the
> demo runs against a **local backend**, not production. Set on the local
> backend:
> ```
> ZRA_SANDBOX_MODE=true
> ZRA_SANDBOX_API_URL=http://localhost:8085   # the Tomcat sandbox WAR
> ZRA_DISABLE_MOCK=true                        # surface REAL VSDC responses (no fake fallbacks)
> ```
> Then point the **till's server URL at this machine's LAN IP** (Settings →
> server URL), NOT production — production points at live ZRA and will
> reject the sandbox TPIN.

1. **Start the sandbox + local backend.** Confirm the Tomcat WAR answers:
   `curl -s -X POST http://localhost:8085/code/selectCodes -H 'Content-Type: application/json' -d '{"tpin":"<TPIN>","bhfId":"000","lastReqDt":"20200101000000"}'`
   should return `resultCd:"000"`.
2. **Test credentials (sandbox-registered).** These are live in the
   `mukopaje@gmail.com` tenant:
   | TPIN | Device serial | SDC ID | Scheme |
   |---|---|---|---|
   | `1003853359` | `C02F90XTMD6W` | `SDC0010002119` | VAT (16%) |
   Activation returns `902 "already installed"` (the device is already
   activated) — that's expected and handled.
3. **Tenant.** Country = Zambia so the wizard surfaces Fiscal Compliance.
4. **Pre-seed the catalog with mixed tax categories** (set per product under
   Inventory → Products → *Tax Category*). The real VSDC codes:
   - **A** — Standard-rated (16%) — most goods
   - **C3** — Zero-rated by nature (0%) — e.g. bread/basic foodstuffs
   - **D** — Exempt (0%) — e.g. an exempt service
   - (**B** is *Minimum Taxable Value / MTV-16%*, **not** zero-rated — don't use it for zero-rated.)
   A cart mixing A + C3 (+ D) is what the evaluators probe.
5. **Pre-warm the queue cron** (every 5 min) so any backlog drains.
6. **Snapshot `fiscal_invoices` row count** — your "before" number.
7. **Have the curl probe set open** (below).

---

## The 30-minute demo

> Total budget: ~28 minutes of demo + 2 min buffer. Each section
> below has a recovery move for the most likely failure.

### 1. Activation (3 min) ← *most likely to fumble; rehearse twice*

**Show:** New tenant lands on `/dashboard/setup`. Fifth step
"Fiscal Compliance" is highlighted in blue (auto-focused because
it's the first pending step after they entered their TPIN earlier).

**Say:** "Tenants in Zambia see this step because we have a live
integration. Other countries skip it entirely — we only show
activation copy when we can actually deliver."

**Do:** Click *Yes — activate now* → enter TPIN → enter the device
serial → click Activate.

**Expected:** Toast "Activated — your sales will now be reported in
real time." Wizard auto-advances; the Fiscal Compliance step shows
a green check. Backend logs a `Updated tenant ... name to <name>
and country to Zambia via TPIN auto-config` line — point at it if
ZRA wants to see the validation actually hit their endpoint.

**Recovery:** If activation 422s (VSDC sandbox flaky), demo the
*Not yet — I'm just exploring* path instead, then activate from
the fiscal dashboard's CTA later. Same backend call; same outcome.

### 2. First B2C sale (3 min)

**Show:** Till at `/till` (or the Capacitor app on a device).
Ring up 2 alcoholic drinks + 1 food item. Mixed-tax cart on
purpose — this is what evaluators probe first.

**Say:** "The till calls `/api/zra/fiscalize` synchronously during
sale-create at `orders.service.ts:584`. If VSDC is reachable, the
receipt gets stamped immediately. If not, the sale still completes
and the fiscal invoice goes to a retry queue."

**Do:** Complete the sale → receipt modal appears.

**Expected:** Receipt shows:
- FDN (fiscal invoice number)
- Signature
- QR code (verifiable on ZRA portal)
- TPIN
- Verification URL

**Recovery:** If the receipt shows "Fiscal: PENDING", the sandbox
is down. Move to section 5 (queue drain) and come back.

### 3. B2B sale with customer TPIN (3 min)

**Show:** Add a customer to the till with TPIN set. Ring up the
same cart.

**Say:** "B2B sales send the customer's TPIN to VSDC in addition to
ours. The receipt and the ZRA portal entry will show both."

**Do:** Complete → check receipt → open the verification URL in a
new tab.

**Expected:** Customer TPIN + business name appear on the receipt
and on the ZRA portal record.

### 4. Refund → credit note (3 min)

**Show:** Open the recent B2C sale → click Refund → confirm.

**Say:** "Refunds raise a credit note (salesTyCd=R, rcptTyCd=R)
with `orgInvcNo` linking back to the original. The dashboard's
Fiscal Compliance page lists credit notes separately so the
auditor can reconcile."

**Do:** Refund → go to `/dashboard/fiscal` → click *Credit Notes*
tab → show the credit note tied to the original FDN.

**Expected:** New credit note with a fresh FDN, original FDN
referenced, status `fiscalized`.

### 5. Offline → online queue drain (5 min) ← *rehearse twice*

**Show:** Disconnect the till's WiFi (or stop the backend's
outbound to VSDC — set `ZRA_VSDC_API_URL` to a bogus port).

**Say:** "If VSDC is down for any reason — sandbox maintenance,
network blip, Cloud Run autoscale — the sale doesn't fail. The
till submits, the server queues the fiscal invoice with retry
backoff (5, 10, 20, 40, 80 minutes). Background cron drains the
queue every 5 minutes when the authority is reachable again."

**Do:**
1. Ring up 2 sales while offline → both complete with PENDING
   status on the receipt.
2. Restore the connection.
3. Either wait for the 5-min cron OR manually trigger:
   ```bash
   curl -X POST $API/zra/sync -H "Authorization: Bearer $TOKEN"
   ```
4. Refresh `/dashboard/fiscal` — both pending invoices flip to
   `fiscalized` with FDNs.

**Recovery:** Have a single failing TPIN handy. If the queue won't
drain (rare), point at the audit log:
```bash
curl $API/zra/sync-history -H "Authorization: Bearer $TOKEN"
```
The history records every cron run.

### 6. Mixed-tax cart math (3 min)

**Show:** Ring up VAT-A 16% + zero-rated VAT-B + (if the tenant is
TOT) one TOT item.

**Say:** "VSDC requires the header totals to equal the EXACT sum of
the line items to 4 decimal places. We round each line with
`Math.round(n * 10000) / 10000` and accumulate — never independently
round the header total. Tests at `vsdc-api.service.spec.ts:RM-343c`
cover the historical drift cases (33.33 @ 16%, mixed buckets, TOT)."

**Do:** Pop open the network tab in DevTools → show the VSDC
request body for the latest sale. Walk through `taxblAmtA` =
sum of line `vatTaxblAmt` where `vatCatCd='A'`, then `taxAmtA` =
sum of line `vatAmt`. They match.

### 7. Compliance Features card (2 min)

**Show:** `/dashboard/fiscal` → scroll to the *Compliance Features*
card.

**Say:** "Business type drives which features are available. Retail
gets sales + credit notes; wholesale and manufacturing also get
stock sync + purchases. Tenants toggle these themselves — no DB
fiddling required."

**Do:** Flip Business Type to Wholesale → check Stock Sync +
Purchase Tracking → Save. Refresh the page → both checkboxes are
sticky.

### 8. Q&A buffer (6 min)

Reserve. Most ZRA reviewers will probe one of:
- "Show me the device init response payload"
- "Run a sale with a quantity-as-decimal (0.5kg)"
- "What does your KPI dashboard look like 30 days in?"

The curl probes below handle all three.

---

## Curl probe set (hand to ZRA before the session)

```bash
# Variables — fill in before sending
export API=https://staging.zpos.example.com/api
export TOKEN=<demo-tenant-bearer>

# Status — does this tenant have ZRA configured?
curl $API/zra/status -H "Authorization: Bearer $TOKEN"

# Business type + features (RM-343d)
curl $API/zra/business-type -H "Authorization: Bearer $TOKEN"

# Activate (RM-343a) — same endpoint used by setup wizard + dashboard CTA
curl -X POST $API/setup/steps/fiscal_compliance/activate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tpin":"1000000000","serialNumber":"VSDC-001"}'

# List fiscal invoices (limit 50)
curl "$API/zra/invoices?limit=50" -H "Authorization: Bearer $TOKEN"

# Retry a specific invoice (e.g. one stuck in 'failed' status)
curl -X POST $API/zra/invoices/<id>/retry -H "Authorization: Bearer $TOKEN"

# Drain the queue right now (instead of waiting for the 5-min cron)
curl -X POST $API/zra/sync -H "Authorization: Bearer $TOKEN"

# Background sync history (every cron run is recorded)
curl $API/zra/sync-history -H "Authorization: Bearer $TOKEN"

# Credit notes for a sale
curl $API/zra/invoices/<sale-id>/credit-notes -H "Authorization: Bearer $TOKEN"

# Tax categories the device returned during init (A, B, E or TOT)
curl $API/zra/tax-categories -H "Authorization: Bearer $TOKEN"
```

---

## Common ZRA reviewer questions — and where to point them

| Question | Where to find the answer |
|---|---|
| "Where is your device init response stored?" | `zra_configurations.vsdc_init_data` jsonb column. Set by `ZraService.autoConfigure` at `zra.service.ts:143-149`. |
| "What happens if VSDC is down for 6 hours?" | Queue holds the invoice, cron retries with backoff 5→10→20→40→80 min; tests at `fiscalization.service.spec.ts:RM-343c`. |
| "How is the API password stored?" | AES-256-CBC. `zra_configurations.api_password_encrypted`. Key from `ZRA_ENCRYPTION_KEY` env var. `encryption.util.ts`. |
| "How do you handle two terminals minting the same INV number offline?" | RM-237: each terminal mints with its own prefix; collision check at sync-time throws if the same number maps to a different UUID. |
| "Show me your tax rounding logic." | `vsdc-api.service.ts:1009` (`round4`). Tests at `vsdc-api.service.spec.ts:RM-343c` cover the drift cases. |
| "What's your stockSync mapping?" | `stock-sync.service.ts` — SAR type codes mapped from internal stock movement types. Wholesale + manufacturing only. |
| "Can a tenant turn off purchase tracking?" | Yes — `/dashboard/fiscal` → Compliance Features card. PUT `/zra/business-type`. RM-343d. |
| "How do you isolate one tenant's data from another?" | Every query filters on `tenant_id`. TPIN is unique per-tenant (not globally). Migration `1736380800000-CreateZraTables`. |
| "Where's the receipt template?" | Printing engine v2 default receipt template (`up-zpos/src/app/core/printing/data/default-templates.ts`) — `?{FDN}`, `{FISCAL SIGNATURE}`, `{ZRA QR}` (a real ESC/POS QR), `{FISCAL URL}`, `{TPIN}` render when the sale is fiscalized. Fed by `orders.service.ts` fiscalize (`~661`) → `checkout-printing.emitter.ts` → engine. The on-screen receipt modal mirrors the same fields. |
| "Show me a fiscalized receipt printed." | Demo path: ring up sale → in receipt modal click *Print*. Plug a thermal printer in beforehand. |

---

## Sign-off criteria

The session passes if all of:

1. ✅ Activation completes end-to-end with a TPIN response from VSDC.
2. ✅ One B2C and one B2B sale both fiscalize live (receipt shows FDN + QR + signature).
3. ✅ A refund creates a credit note with the original FDN referenced.
4. ✅ Queue drain demo: ≥2 pending invoices flip to `fiscalized` after reconnection without manual intervention.
5. ✅ Mixed-tax cart math passes ZRA's verification on the portal.
6. ✅ Reviewer accepts the storage / encryption / multi-tenant model.

If any one fails, capture the request + response body + `audit_logs` row and ship a same-day follow-up. Do not promise a fix mid-session unless it's a config toggle.

---

## Post-UAT housekeeping

- Capture the session's audit log entries (`SELECT * FROM audit_logs WHERE created_at > <start> AND action LIKE 'ZRA_%' OR action LIKE 'SALE_%'`) — attach to the UAT report.
- File any reviewer asks as roadmap_items rows with `audience='internal'` so they're tracked.
- Switch the tenant's `ZRA_SANDBOX_MODE` back to whatever production needs once they sign off.
