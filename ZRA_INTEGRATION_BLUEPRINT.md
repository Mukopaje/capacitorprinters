# ZRA Smart Invoice Integration — Technical Blueprint

**Version:** 1.0 | **Standard:** ZRA VSDC API v1.0.8 | **Country:** Zambia
**Stack:** NestJS (Node.js), TypeORM, PostgreSQL

> This document is a complete technical reference. An engineer with NestJS experience should be able to implement this integration from scratch using this guide alone.

---

## Table of Contents
1. [Overview & Architecture](#1-overview--architecture)
2. [Environment Setup](#2-environment-setup)
3. [Database Schema](#3-database-schema)
4. [Device Initialization](#4-device-initialization)
5. [Sales Fiscalization](#5-sales-fiscalization)
6. [Credit Notes (Refunds)](#6-credit-notes-refunds)
7. [Debit Notes (Adjustments)](#7-debit-notes-adjustments)
8. [Purchase Fiscalization](#8-purchase-fiscalization)
9. [Stock / Inventory Sync](#9-stock--inventory-sync)
10. [Item Registration](#10-item-registration)
11. [Tax Calculation Rules](#11-tax-calculation-rules)
12. [Payment Method Codes](#12-payment-method-codes-spec-69)
13. [Queue & Retry System](#13-queue--retry-system)
14. [Encryption & Security](#14-encryption--security)
15. [Multi-Tenant Architecture](#15-multi-tenant-architecture)
16. [API Reference](#16-api-reference)
17. [VSDC Response Codes](#17-vsdc-response-codes)

---

## 1. Overview & Architecture

### What is ZRA Smart Invoice?
ZRA (Zambia Revenue Authority) Smart Invoice is a fiscal system that requires all registered businesses to submit every sales transaction, purchase, credit note, debit note, and stock movement to ZRA's VSDC (Virtual Sales Data Controller) in real-time. The system validates and signs each transaction, returning a fiscal receipt number and cryptographic signature printed on customer receipts.

### System Flow
```
POS App (Mobile)
      │ POST /api/zra/fiscalize
      ▼
NestJS Backend (FiscalizationService)
      │
      ├── Try immediate VSDC call ──────────────────────────► ZRA VSDC Server
      │         │                                               │
      │         │ success                                       │ resultCd: "000"
      │         ▼                                               ▼
      │   Save fiscal_invoice                           Returns: rcptNo, intrlData,
      │   status = 'fiscalized'                         rcptSign, sdcId, mrcNo
      │
      └── On failure → Queue → Background Cron (every 1 min) → Retry with backoff
```

### Module Structure
```
src/zra/
├── zra.module.ts                    # NestJS module, imports all providers
├── zra.controller.ts                # HTTP endpoints
├── zra.service.ts                   # Facade/orchestration layer
├── entities/
│   ├── zra-configuration.entity.ts  # Tenant ZRA setup
│   ├── fiscal-invoice.entity.ts     # Fiscalized sales
│   ├── fiscal-credit-note.entity.ts # Refunds
│   ├── fiscal-debit-note.entity.ts  # Adjustments
│   ├── fiscal-purchase.entity.ts    # Purchases
│   ├── fiscal-invoice-queue.entity.ts # Retry queue
│   ├── zra-registered-item.entity.ts  # Product catalog
│   ├── zra-stock-movement.entity.ts   # Stock SAR records
│   ├── zra-sync-log.entity.ts         # Audit logs
│   └── zra-tax-rate-cache.entity.ts   # Tax rate config
├── services/
│   ├── vsdc-api.service.ts          # All VSDC HTTP calls
│   ├── fiscalization.service.ts     # Invoice lifecycle + queue
│   ├── tpin-validation.service.ts   # TPIN + config management
│   ├── credit-note.service.ts       # Credit note fiscalization
│   ├── debit-note.service.ts        # Debit note fiscalization
│   ├── purchase-fiscalization.service.ts
│   ├── stock-sync.service.ts
│   └── item-registration.service.ts
├── dto/
│   ├── fiscalize-invoice.dto.ts
│   ├── credit-note.dto.ts
│   ├── debit-note.dto.ts
│   ├── purchase.dto.ts
│   └── register-item.dto.ts
└── utils/
    ├── encryption.util.ts           # AES-256-CBC for credential storage
    └── signature.util.ts            # SHA256 signature verification, QR generation
```

---

## 2. Environment Setup

### Required Environment Variables
```bash
# ZRA / VSDC
ZRA_ENABLED=true
ZRA_VSDC_API_URL=http://localhost:8085           # Local VSDC Java app (same URL for sandbox & production)
ZRA_API_TIMEOUT=30000                           # 30 seconds
ZRA_ENCRYPTION_KEY=zra-<64-char-hex-string>     # For AES-256 credential encryption

# ⚠️  VSDC is a locally-installed Java/Tomcat WAR file — it is NOT a remote cloud API.
# Sandbox vs Production is determined by WHICH WAR installer ZRA provides, not by URL.
# Download the correct installer from https://sandboxportal.zra.org.zm (sandbox)
# or request production credentials from smartinvoice@zra.org.zm (production).
# Both run on the same local port (default 8085). Endpoints are at root level:
# e.g. http://localhost:8085/trnsSales/saveSales  (no /api/v1 prefix)
```

### NestJS Module Registration
```typescript
// zra.module.ts
@Module({
  imports: [
    TypeOrmModule.forFeature([
      ZraConfiguration, FiscalInvoice, FiscalCreditNote, FiscalDebitNote,
      FiscalPurchase, FiscalInvoiceQueue, ZraRegisteredItem,
      ZraStockMovement, ZraSyncLog, ZraTaxRateCache,
    ]),
    HttpModule.register({ timeout: 30000 }),
    ConfigModule,
    ScheduleModule.forRoot(),   // Required for @Cron decorators
  ],
  controllers: [ZraController],
  providers: [
    ZraService, VsdcApiService, FiscalizationService,
    TpinValidationService, CreditNoteService, DebitNoteService,
    PurchaseFiscalizationService, StockSyncService, ItemRegistrationService,
    EncryptionUtil, SignatureUtil,
  ],
  exports: [ZraService, FiscalizationService, TpinValidationService],
})
export class ZraModule {}
```

### Required npm Packages
```bash
npm install @nestjs/axios @nestjs/schedule @nestjs/config
npm install rxjs typeorm @nestjs/typeorm
# All others (crypto) are Node.js built-ins
```

---

## 3. Database Schema

### ZRA Configuration Table
Stores one record per tenant. This is the master config.

```typescript
@Entity('zra_configurations')
export class ZraConfiguration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  tenant_id: string;           // Foreign key to tenants table

  @Column({ length: 10 })
  tpin: string;                // 10-digit Zambia TPIN

  @Column({ nullable: true })
  business_name: string;       // From VSDC validation response

  @Column({ nullable: true })
  trading_name: string;

  @Column({ nullable: true })
  tax_office: string;

  @Column('simple-array', { nullable: true })
  tax_categories: string[];   // ['A', 'B', 'E'] — categories registered with ZRA

  @Column('jsonb', { nullable: true })
  tax_rates: Record<string, number>;  // { 'A': 16, 'B': 0, 'E': 0 }

  @Column({ nullable: true })
  vsdc_serial_number: string;  // Physical device serial number (MAC address on desktop)

  @Column({ nullable: true })
  vsdc_device_id: string;      // SDC ID returned by VSDC after initializeDevice

  @Column({ nullable: true })
  api_username: string;

  @Column({ nullable: true })
  api_password_encrypted: string;  // AES-256-CBC encrypted

  @Column({ default: 'sandbox' })
  vsdc_mode: 'sandbox' | 'production';

  @Column({ default: false })
  vsdc_enabled: boolean;

  @Column({ default: 'pending' })
  status: 'pending' | 'active' | 'error' | 'expired';

  @Column({ nullable: true })
  validation_error: string;

  @Column({ default: 'retail' })
  business_type: 'retail' | 'wholesale' | 'service' | 'manufacturing';

  @Column({ default: false })
  stock_sync_enabled: boolean;

  @Column({ default: false })
  purchase_tracking_enabled: boolean;

  @Column({ default: true })
  item_registration_required: boolean;

  @Column('jsonb', { nullable: true })
  vsdc_init_data: any;         // Full init response from VSDC (includes mrcNo, lastSaleInvcNo, etc.)

  @Column({ nullable: true })
  last_validated_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
```

### Fiscal Invoice Table
```typescript
@Entity('fiscal_invoices')
export class FiscalInvoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenant_id: string;

  @Column('uuid', { nullable: true, unique: true })
  sale_id: string;             // Link to sales table (nullable — may not exist at fiscalization time)

  @Column({ length: 100, nullable: true })
  local_invoice_number: string;  // e.g. "INV-0001" — your internal reference

  @Column({ length: 100, nullable: true })
  fiscal_invoice_number: string; // Returned by VSDC: rcptNo

  @Column({ length: 500, nullable: true })
  fiscal_signature: string;    // intrlData from VSDC

  @Column({ length: 100, nullable: true })
  verification_code: string;   // rcptSign from VSDC

  @Column({ length: 500, nullable: true })
  verification_url: string;    // https://siportal.zra.org.zm/verify/...

  @Column({ default: 'pending' })
  fiscalization_status: 'pending' | 'fiscalized' | 'failed' | 'queued';

  @Column({ type: 'decimal', precision: 15, scale: 4, nullable: true })
  total_amount: number;

  @Column({ type: 'decimal', precision: 15, scale: 4, nullable: true })
  tax_amount: number;

  @Column('jsonb', { nullable: true })
  items: any[];               // Line items snapshot

  @Column('jsonb', { nullable: true })
  vsdc_request: any;          // Full request sent to VSDC (for replay/audit)

  @Column('jsonb', { nullable: true })
  vsdc_response: any;         // Full response from VSDC (for audit)

  @Column({ default: 0 })
  retry_count: number;

  @Column({ nullable: true })
  fiscalization_attempted_at: Date;

  @Column({ nullable: true })
  fiscalization_completed_at: Date;

  @Column({ type: 'text', nullable: true })
  error_message: string;
}
```

### Queue Table
```typescript
@Entity('fiscal_invoice_queue')
export class FiscalInvoiceQueue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fiscal_invoice_id: string;

  @Column({ default: 'queued' })
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'retry';

  @Column({ default: 0 })
  retry_count: number;

  @Column({ default: 5 })
  max_retries: number;

  @Column({ nullable: true })
  next_retry_at: Date;

  @Column({ default: 1 })
  priority: number;            // Higher = processed first

  @Column({ nullable: true })
  last_error: string;
}
```

---

## 4. Device Initialization

### What It Does
Registers your physical device (identified by serial number) with ZRA and obtains:
- **SDC ID** (`sdcId`) — permanent device identifier used in all VSDC submissions
- **MRC No** (`mrcNo`) — fiscal device registration number
- Last invoice counters for continuity

### VSDC Endpoint
```
POST /initializer/selectInitInfo
Content-Type: application/json

{
  "tpin": "1003853359",
  "bhfId": "000",          // Branch ID — "000" for HQ
  "dvcSrlNo": "C02F90XTMD6W"  // Device serial number
}
```

### VSDC Response Structure
```json
{
  "resultCd": "000",
  "resultMsg": "It is succeeded",
  "resultDt": "20260327120000",
  "data": {
    "info": {
      "tpin": "1003853359",
      "bhfId": "000",
      "sdcId": "SDC0010002119",
      "mrcNo": "WIS00003041",
      "taxprNm": "ZPOS MOBILE LIMITED",
      "bhfNm": "Headquarter",
      "lastSaleInvcNo": 26,
      "lastPchsInvcNo": 0,
      "lastSaleRcptNo": 26,
      "bhfOpenDt": "20241122",
      "prvncNm": "LUSAKA PROVINCE",
      "locDesc": "6569, MUMANA ROAD, Olympia Extension"
    }
  }
}
```

> ⚠️ **Critical:** ZRA nests init data under `data.info`, NOT directly under `data`. Always unwrap:
> ```typescript
> const rawData = response.data as any;
> const initInfo = rawData?.info ?? rawData;
> ```

### Implementation
```typescript
// vsdc-api.service.ts
async initializeDevice(tpin: string, bhfId = '000', dvcSrlNo: string): Promise<VsdcInitInfo> {
  const response = await firstValueFrom(
    this.httpService.post<VsdcResponse>(
      `${this.baseUrl}/initializer/selectInitInfo`,
      { tpin, bhfId, dvcSrlNo },
      { headers: { 'Content-Type': 'application/json' }, timeout: this.timeout }
    )
  );

  const result = response.data;

  if (result.resultCd !== '000') {
    // Handle result 902 = "Device already initialized" (sandbox only)
    if (this.sandboxMode && result.resultCd === '902') {
      return this.getSandboxFallbackInitData(tpin, dvcSrlNo);
    }
    throw new HttpException(`VSDC init failed: ${result.resultMsg}`, HttpStatus.BAD_REQUEST);
  }

  // ⚠️ Unwrap nested .info
  const rawData = result.data as any;
  return rawData?.info ?? rawData;
}
```

### Auto-Configure Flow (Full Setup)
```typescript
// zra.service.ts
async autoConfigure(tenantId: string, dto: { tpin: string, serialNumber: string }) {
  // Step 1: Validate TPIN with ZRA
  const validation = await this.vsdcApiService.validateTpin(dto.tpin);
  if (!validation.valid) throw new BadRequestException('Invalid TPIN');

  // Step 2: Update tenant country to Zambia
  await this.tenantRepo.update(tenantId, {
    business_name: validation.businessName,
    country: 'Zambia'
  });

  // Step 3: Create ZRA configuration
  let config = await this.tpinValidationService.validateAndRegisterTpin(
    tenantId, dto.tpin, validation
  );

  // Step 4: Initialize device with serial number
  if (dto.serialNumber) {
    const initData = await this.vsdcApiService.initializeDevice(
      dto.tpin, '000', dto.serialNumber
    );
    config = await this.tpinValidationService.updateConfiguration(tenantId, {
      vsdc_serial_number: dto.serialNumber,
      vsdc_device_id: initData.sdcId,   // e.g. "SDC0010002119"
      vsdc_init_data: initData,
      vsdc_enabled: true,
      status: 'active'
    });
  }

  return config;
}
```

---

## 5. Sales Fiscalization

### What It Does
Submits every sale to ZRA VSDC and receives a fiscal receipt number + cryptographic signature that must be printed on the customer's receipt.

### VSDC Endpoint
```
POST /trnsSales/saveSales
```

### Request Structure (VsdcSalesRequest)
```typescript
interface VsdcSalesRequest {
  tpin: string;           // Taxpayer's 10-digit TPIN
  bhfId: string;          // Branch ID ("000")
  cisInvcNo: string;      // YOUR internal invoice number (e.g. "INV-0001")
  orgInvcNo: number;      // 0 for new sales; original rcptNo for credit/debit notes
  orgSdcId?: string;      // Original SDC ID — REQUIRED for credit/debit notes (VARCHAR 13)
  salesTyCd: string;      // 'N'=Normal, 'C'=Copy (see spec 6.7 Transaction Type)
  rcptTyCd: string;       // 'S'=Sale, 'R'=Reversal/Credit Note, 'D'=Debit Note (spec 6.8)
  pmtTyCd: string;        // '01'=Cash,'02'=Credit,'03'=Cash/Credit,'04'=Bank Check,
                          // '05'=Card,'06'=Mobile Money,'07'=Other,'08'=Bank Transfer
  salesSttsCd: string;    // '02'=Approved, '05'=Refunded (spec 6.10)
  cfmDt: string;          // Confirmation datetime: "YYYYMMDDHHmmss"
  salesDt: string;        // Sale date: "YYYYMMDD"
  stockRlsDt: string | null;    // Stock release datetime (null for services)
  cnclReqDt: string | null;     // Cancellation request date (null when not cancelling)
  cnclDt: string | null;        // Cancellation date (null when not cancelling)
  rfdDt: string | null;         // Refund date (null for normal sales)
  rfdRsnCd: string | null;      // Refund reason code (null for normal sales, see spec 6.15)
  currencyTyCd: string;   // 'ZMW' for Zambian Kwacha
  exchangeRt: number;     // 1 for ZMW (number, not string)
  saleCtyCd: string;      // Sales category code — always pass "1" (REQUIRED)
  lpoNumber: string | null;     // LPO number (null when not applicable)
  dbtRsnCd: string | null;      // Debit note reason code (null for normal sales, see spec 6.18)
  invcAdjustReason: string | null; // Invoice adjustment reason
  destnCountryCd: string | null;   // Destination country (exports only, else null)
  cashDcRt: number;       // Cash discount rate (0 if not applicable)
  cashDcAmt: number;      // Cash discount amount (0 if not applicable)

  // Customer details (optional, required for B2B)
  custTpin?: string;
  custNm?: string;

  // Per-category TAX-EXCLUSIVE amounts (pass 0.0 for unused categories)
  totItemCnt: number;
  taxblAmtA: number;      // Standard Rated 16% VAT
  taxblAmtB: number;      // MTV — Minimum Taxable Value 16% (manufacturer retail price)
  taxblAmtC1: number;     // Exports 0%
  taxblAmtC2: number;     // Zero-rating LPO 0%
  taxblAmtC3: number;     // Zero-rated by nature 0%
  taxblAmtD: number;      // Exempt (no tax charge)
  taxblAmtRvat: number;   // Reverse VAT (imported services)
  taxblAmtE: number;      // Disbursement
  taxblAmtF: number;      // Service Charge 10%
  taxblAmtIpl1: number;   // Insurance Premium Levy
  taxblAmtIpl2: number;   // Re-Insurance IPL
  taxblAmtTl: number;     // Tourism Levy
  taxblAmtEcm: number;    // Excise Coal Mining
  taxblAmtExeeg: number;  // Excise Electricity/Energy
  taxblAmtTot: number;    // Turnover Tax (always 0.0)

  // Tax rates — as fetched from VSDC /code/selectCodes (pass 0 for unused)
  taxRtA: number;   taxRtB: number;  taxRtC1: number; taxRtC2: number;
  taxRtC3: number;  taxRtD: number;  taxRtRvat: number; taxRtE: number;
  taxRtF: number;   taxRtIpl1: number; taxRtIpl2: number; taxRtTl: number;
  taxRtEcm: number; taxRtExeeg: number; taxRtTot: number;

  // Tax amounts per category (pass 0.0 for unused categories)
  taxAmtA: number;   taxAmtB: number;  taxAmtC1: number; taxAmtC2: number;
  taxAmtC3: number;  taxAmtD: number;  taxAmtRvat: number; taxAmtE: number;
  taxAmtF: number;   taxAmtIpl1: number; taxAmtIpl2: number; taxAmtTl: number;
  taxAmtEcm: number; taxAmtExeeg: number; taxAmtTot: number;

  totTaxblAmt: number;    // Sum of all taxblAmt buckets
  totTaxAmt: number;      // Sum of all taxAmt buckets
  totAmt: number;         // Grand total (tax-inclusive)
  prchrAcptcYn: string;   // Purchaser accepted — always "Y"

  regrId: string;         // Registrar ID
  regrNm: string;         // Registrar name
  modrId: string;         // Modifier ID
  modrNm: string;         // Modifier name
  itemList: VsdcSalesItem[];
}

interface VsdcSalesItem {
  itemSeq: number;          // Line number (1-based)
  itemCd: string;           // ZRA item code (from item registration)
  itemClsCd: string;        // UNSPSC classification code (10 chars)
  itemNm: string;           // Item description
  bcd?: string | null;      // Barcode (optional)
  pkgUnitCd: string;        // Package unit code (see spec 6.4)
  pkg: number;              // Package quantity
  qtyUnitCd: string;        // Qty unit code (see spec 6.5): U=Each, KG, L, etc.
  qty: number;              // Quantity sold
  prc: number;              // Unit price (TAX-INCLUSIVE)
  splyAmt: number;          // Line total = prc × qty (TAX-INCLUSIVE)
  dcRt: number;             // Discount rate (0.0 if no discount)
  dcAmt: number;            // Discount amount (0.0 if no discount)
  vatCatCd: string;         // VAT category: A, B, C1, C2, C3, D, E (see spec 6.1)
  exciseTxCatCd: string | null;  // Excise tax category (null if not applicable)
  tlCatCd: string | null;        // Tourism levy category (null if not applicable)
  iplCatCd: string | null;       // Insurance premium levy category (null if not applicable)
  vatTaxblAmt: number;      // Line tax-exclusive base = splyAmt / (1 + rate)
  exciseTaxblAmt: number;   // Excise tax-exclusive base (0.0 if not applicable)
  tlTaxblAmt: number;       // Tourism levy tax-exclusive base (0.0 if not applicable)
  iplTaxblAmt: number;      // IPL tax-exclusive base (0.0 if not applicable)
  vatAmt: number;           // VAT amount = splyAmt - vatTaxblAmt
  exciseTxAmt: number;      // Excise tax amount (0.0 if not applicable)
  tlAmt: number;            // Tourism levy amount (0.0 if not applicable)
  iplAmt: number;           // IPL amount (0.0 if not applicable)
  isrccCd: string | null;   // Insurance company code (null if not applicable)
  isrccNm: string | null;   // Insurance company name (null if not applicable)
  isrcAmt: number;          // Insurance amount (0.0 if not applicable)
  totAmt: number;           // Line grand total (tax-inclusive = splyAmt - dcAmt)
}
```

### VSDC Response
```typescript
interface VsdcSalesResponse {
  resultCd: string;       // '000' = success
  resultMsg: string;
  resultDt: string;
  data: {
    rcptNo: number;       // FISCAL RECEIPT NUMBER — print this on receipt
    intrlData: string;    // Cryptographic signature — print this on receipt
    rcptSign: string;     // Verification code
    totRcptNo: number;    // Total receipt count for this device
    vsdcRcptPbctDt: string; // Publication datetime
    sdcId: string;        // Your SDC ID (confirmation)
    mrcNo: string;        // Your MRC No (confirmation)
  }
}
```

### Full Implementation
```typescript
// fiscalization.service.ts
async fiscalizeInvoice(
  tenantId: string,
  invoiceData: FiscalizeInvoiceDto
): Promise<FiscalInvoiceResponseDto> {

  // 1. Check if already fiscalized (idempotency)
  const existing = await this.fiscalInvoiceRepo.findOne({
    where: { tenant_id: tenantId, local_invoice_number: invoiceData.invoiceNumber }
  });
  if (existing?.fiscalization_status === 'fiscalized') {
    return this.mapToResponseDto(existing);
  }

  // 2. Create fiscal invoice record (status = pending)
  const fiscalInvoice = await this.createFiscalInvoiceRecord(tenantId, invoiceData);

  try {
    // 3. Get ZRA config
    const config = await this.tpinValidationService.getConfiguration(tenantId);
    const taxRates = await this.tpinValidationService.getTaxRates(tenantId);

    // 4. Build VSDC request (see tax calculation section)
    const vsdcRequest = this.buildVsdcRequest(config.tpin, invoiceData, taxRates);
    fiscalInvoice.vsdc_request = vsdcRequest;

    // 5. Submit to VSDC
    const vsdcResponse = await this.vsdcApiService.submitSale(vsdcRequest);

    // 6. Save fiscal details
    fiscalInvoice.fiscal_invoice_number = String(vsdcResponse.rcptNo);
    fiscalInvoice.fiscal_signature = vsdcResponse.intrlData;
    fiscalInvoice.verification_code = vsdcResponse.rcptSign;
    fiscalInvoice.verification_url = this.signatureUtil.buildVerificationUrl(
      config.tpin, vsdcResponse
    );
    fiscalInvoice.vsdc_response = vsdcResponse;
    fiscalInvoice.fiscalization_status = 'fiscalized';
    fiscalInvoice.fiscalization_completed_at = new Date();
    await this.fiscalInvoiceRepo.save(fiscalInvoice);

    return this.mapToResponseDto(fiscalInvoice);
  } catch (error) {
    // 7. On failure — queue for retry
    fiscalInvoice.error_message = error.message;
    fiscalInvoice.fiscalization_status = 'queued';
    await this.fiscalInvoiceRepo.save(fiscalInvoice);
    await this.queueForFiscalization(fiscalInvoice.id);
    throw error;
  }
}
```

### What to Print on the Receipt
After successful fiscalization, print these fields:
```
Fiscal Invoice Number: {fiscal_invoice_number}
Verification Code:     {verification_code}
Signature:             {fiscal_signature}
Verify at:             https://siportal.zra.org.zm/verify/{tpin}/{sdcId}/{rcptNo}/{intrlData}
```

---

## 6. Credit Notes (Refunds)

### When to Use
Issue a credit note when a customer returns goods or when you need to reverse a fiscalized sale.

### VSDC Endpoint
Same as sales: `POST /trnsSales/saveSales`
But with different type codes:
```json
{
  "salesTyCd": "N",    // Normal (spec 6.7 — only N or C are valid; R is NOT a valid salesTyCd)
  "rcptTyCd": "R",     // Reversal/Credit Note (spec 6.8)
  "salesSttsCd": "05", // Refunded (spec 6.10 — NOT "02")
  "orgInvcNo": 26,     // Original fiscal receipt number (rcptNo from original sale)
  "orgSdcId": "SDC0010002119",  // REQUIRED: original invoice's SDC ID
  "rfdDt": "20260101", // Refund date "YYYYMMDD"
  "rfdRsnCd": "07",    // Refund reason code (see spec 6.15)
  "saleCtyCd": "1",    // Always "1" (REQUIRED)
  "prchrAcptcYn": "Y", // Always "Y"
  "totAmt": -100.0000  // Negative amounts for refunds
}
```

### Refund Reason Codes (spec 6.15)
| Code | Meaning |
|---|---|
| `01` | Wrong item sent |
| `02` | Wrong price charged |
| `03` | Goods damaged |
| `04` | Goods expired |
| `05` | Goods not received |
| `06` | Service not rendered |
| `07` | Other |

### Implementation
```typescript
// credit-note.service.ts
async createCreditNote(tenantId: string, dto: CreateCreditNoteDto) {
  // 1. Get original fiscal invoice
  const originalInvoice = await this.fiscalInvoiceRepo.findOne({
    where: { id: dto.originalInvoiceId, tenant_id: tenantId }
  });

  if (originalInvoice.fiscalization_status !== 'fiscalized') {
    throw new BadRequestException('Cannot create credit note on unfiscalized invoice');
  }

  // 2. Determine items to refund
  const refundItems = dto.fullRefund
    ? originalInvoice.items   // All items
    : dto.items;               // Partial items

  // 3. Build VSDC credit note request
  const config = await this.tpinValidationService.getConfiguration(tenantId);
  const vsdcRequest = this.buildVsdcCreditNoteRequest(
    config.tpin,
    refundItems,
    originalInvoice.fiscal_invoice_number,  // orgInvcNo
    originalInvoice.vsdc_response?.sdcId,   // orgSdcId — REQUIRED
    dto.reason,
    dto.reasonCode,
  );

  // 4. Submit to VSDC (same /trnsSales/saveSales endpoint)
  const vsdcResponse = await this.vsdcApiService.submitSale(vsdcRequest);

  // 5. Save credit note record
  const creditNote = new FiscalCreditNote();
  creditNote.tenant_id = tenantId;
  creditNote.original_invoice_id = dto.originalInvoiceId;
  creditNote.original_receipt_number = originalInvoice.fiscal_invoice_number;
  creditNote.fiscal_credit_note_number = String(vsdcResponse.rcptNo);
  creditNote.reason = dto.reason;
  creditNote.reason_code = dto.reasonCode;
  creditNote.fiscalization_status = 'fiscalized';
  return this.creditNoteRepo.save(creditNote);
}

private buildVsdcCreditNoteRequest(
  tpin: string, items: any[], originalRcptNo: string, orgSdcId: string,
  reason: string, reasonCode: string
): VsdcSalesRequest {
  // Amounts are NEGATIVE for refunds
  const now = new Date();
  const dateStr = now.toISOString().substring(0, 10).replace(/-/g, '');
  return {
    tpin,
    bhfId: '000',
    cisInvcNo: `CR-${Date.now()}`,
    orgInvcNo: parseInt(originalRcptNo),   // Original receipt number
    orgSdcId,                              // Original SDC ID — REQUIRED
    salesTyCd: 'N',      // Normal (R is NOT a valid salesTyCd)
    rcptTyCd: 'R',       // Reversal/Credit Note
    pmtTyCd: '01',
    salesSttsCd: '05',   // Refunded
    cfmDt: now.toISOString().replace(/[-T:.Z]/g, '').substring(0, 14),
    salesDt: dateStr,
    stockRlsDt: null,
    cnclReqDt: null,
    cnclDt: null,
    rfdDt: dateStr,
    rfdRsnCd: reasonCode || '07',
    currencyTyCd: 'ZMW',
    exchangeRt: 1,
    saleCtyCd: '1',      // REQUIRED
    lpoNumber: null,
    dbtRsnCd: null,
    invcAdjustReason: reason || null,
    destnCountryCd: null,
    cashDcRt: 0,
    cashDcAmt: 0,
    prchrAcptcYn: 'Y',  // Always Y
    totItemCnt: items.length,
    // Amounts calculated the same way as sales but negated
    ...this.calculateNegativeTaxAmounts(items),
    itemList: items.map((item, idx) => ({
      ...this.buildSalesItem(item, idx + 1),
      // Negate quantities and amounts for returns
      qty: -Math.abs(item.quantity),
      splyAmt: -Math.abs(item.total),
      totAmt: -Math.abs(item.total),
    })),
  };
}
```

---

## 7. Debit Notes (Adjustments)

### When to Use
Issue a debit note when you need to increase a previously fiscalized invoice (e.g. price correction, additional fees).

### Key Difference from Credit Notes
```json
// Debit note uses POSITIVE amounts and different type codes
{
  "salesTyCd": "N",    // Normal (spec 6.7 — N=Normal, C=Copy; these are the only two valid values)
  "rcptTyCd": "D",     // Debit Note / adjustment upwards (spec 6.8)
  "salesSttsCd": "02", // Approved
  "orgInvcNo": 26,     // Original receipt number
  "orgSdcId": "SDC0010002119",  // REQUIRED: original invoice's SDC ID
  "dbtRsnCd": "04",    // Debit note reason code (see spec 6.18)
  "saleCtyCd": "1",    // Always "1" (REQUIRED)
  "prchrAcptcYn": "Y"  // Always "Y"
}
```

### Debit Note Reason Codes (spec 6.18)
| Code | Meaning |
|---|---|
| `01` | Price increase |
| `02` | Quantity increase |
| `03` | Service extension |
| `04` | Other adjustment |

### Implementation
```typescript
// debit-note.service.ts — same pattern as credit notes but:
// 1. Amounts are POSITIVE (not negated)
// 2. rcptTyCd: 'D' (Debit Note), salesTyCd: 'N' (Normal)
// 3. orgSdcId is REQUIRED — get from originalInvoice.vsdc_response?.sdcId
// 4. dbtRsnCd: the debit note reason code from spec 6.18
// 5. salesSttsCd: '02' (Approved, not '05' Refunded)
```

---

## 8. Purchase Fiscalization

### When to Use
Required for wholesale and manufacturing businesses to report supplier purchases to ZRA. Retail businesses do not need to submit purchases.

### VSDC Endpoint
```
POST /trnsPurch/savePurchase
```

### Request Structure
```typescript
interface VsdcPurchaseRequest {
  tpin: string;           // YOUR TPIN (buyer)
  bhfId: string;          // '000'
  invcNo: string;         // Your internal purchase order number
  orgInvcNo: number;      // 0 for new purchases
  spplrTpin: string;      // Supplier's TPIN (10 digits, required)
  spplrNm: string;        // Supplier name
  spplrBhfId?: string;    // Supplier branch ('000' default)
  regTyCd: string;        // 'M' = Manual
  pchsTyCd: string;       // 'N' = Normal purchase
  rcptTyCd: string;       // 'P' = Purchase
  pmtTyCd: string;        // Payment method code
  pchsSttsCd: string;     // '02' = Complete
  cfmDt: string;          // "YYYYMMDDHHmmss"
  pchsDt: string;         // "YYYYMMDD"
  currencyTyCd: string;   // 'ZMW'
  exchangeRt: string;     // '1'

  // Same tax bucket structure as sales
  totItemCnt: number;
  taxblAmtA: number; taxAmtA: number;
  // ... (B, C1, C2, C3, D, E same as sales)
  totTaxblAmt: number; totTaxAmt: number; totAmt: number;

  itemList: VsdcPurchaseItem[];
}

interface VsdcPurchaseItem {
  itemSeq: number;
  itemCd: string;
  itemClsCd: string;
  itemNm: string;
  qty: number;
  prc: number;            // Unit price (tax-inclusive)
  splyAmt: number;        // Line total
  vatCatCd: string;
  vatTaxblAmt: number;
  vatAmt: number;
  totAmt: number;
}
```

### Implementation
```typescript
// purchase-fiscalization.service.ts
async fiscalizePurchase(tenantId: string, dto: CreatePurchaseDto) {
  // Validate supplier TPIN format
  if (!/^\d{10}$/.test(dto.supplierTpin)) {
    throw new BadRequestException('Supplier TPIN must be exactly 10 digits');
  }

  // Check business type allows purchases
  const featureEnabled = await this.tpinValidationService.isFeatureEnabled(
    tenantId, 'purchases'
  );
  if (!featureEnabled) {
    throw new BadRequestException('Purchase fiscalization not enabled for this business type');
  }

  const config = await this.tpinValidationService.getConfiguration(tenantId);
  const vsdcRequest = this.buildVsdcPurchaseRequest(config.tpin, dto);
  const vsdcResponse = await this.vsdcApiService.savePurchase(vsdcRequest);

  const purchase = new FiscalPurchase();
  purchase.tenant_id = tenantId;
  purchase.purchase_order_id = dto.purchaseOrderId;
  purchase.supplier_tpin = dto.supplierTpin;
  purchase.supplier_name = dto.supplierName;
  purchase.fiscal_purchase_number = String(vsdcResponse.rcptNo);
  purchase.fiscalization_status = 'fiscalized';
  return this.purchaseRepo.save(purchase);
}
```

---

## 9. Stock / Inventory Sync

### When to Use
Required for retail, wholesale, and manufacturing. Reports every stock movement (receiving, adjustments, write-offs, transfers) to ZRA.

### VSDC Endpoint
```
POST /stock/saveStockItems
```

### SAR Type Codes (spec 6.14)
Per the ZRA VSDC API spec section 6.14, there are 16 distinct stock adjustment reason codes:

**Incoming (Stock Increases):**
| Internal Type | sarTyCd | ZRA Description |
|---|---|---|
| `IMPORT` | `01` | Import In |
| `PURCHASE` / `OPENING_BALANCE` | `02` | Purchase In |
| `RETURN` | `03` | Return In (customer returns goods) |
| `TRANSFER_IN` | `04` | Transfer In (from another branch) |
| `PRODUCTION` | `05` | Processing In (manufactured/produced) |
| `ADJUSTMENT_IN` | `06` | Adjustment In (stock count increase) |

**Outgoing (Stock Decreases):**
| Internal Type | sarTyCd | ZRA Description |
|---|---|---|
| `SALE` | `11` | Sale Out |
| `SUPPLIER_RETURN` | `12` | Return Out (returned to supplier) |
| `TRANSFER_OUT` | `13` | Transfer Out (to another branch) |
| `PROCESSING` | `14` | Processing Out (used in manufacturing) |
| `WASTE` | `15` | Discarding Out (expired/damaged/written off) |
| `ADJUSTMENT_OUT` | `16` | Adjustment Out (stock count decrease) |

> ⚠️ **The old 2-code system (01/02) is WRONG.** Always use the specific 2-digit code above.

### Request Structure
```typescript
interface VsdcStockRequest {
  tpin: string;
  bhfId: string;
  sarNo: string;          // SAR reference number (your internal ID)
  sarTyCd: string;        // '01'=Received, '02'=Deducted
  ocrnDt: string;         // "YYYYMMDD"
  totItemCnt: number;

  // Same tax buckets as sales
  taxblAmtA: number; taxAmtA: number;
  // ... (B through E)
  totTaxblAmt: number; totTaxAmt: number; totAmt: number;

  itemList: VsdcStockItem[];
}

interface VsdcStockItem {
  itemSeq: number;
  itemCd: string;
  itemClsCd: string;
  itemNm: string;
  qty: number;
  prc: number;            // Unit cost/value (tax-inclusive)
  splyAmt: number;
  vatCatCd: string;
  vatTaxblAmt: number;
  vatAmt: number;
  totAmt: number;
}
```

### Implementation
```typescript
// stock-sync.service.ts
async syncStockMovement(tenantId: string, movementData: StockMovementData) {
  const sarTyCd = this.mapMovementTypeToSarType(movementData.movementType);
  const config = await this.tpinValidationService.getConfiguration(tenantId);
  const taxRates = await this.tpinValidationService.getTaxRates(tenantId);

  const vsdcRequest = this.buildStockRequest(config.tpin, movementData, sarTyCd, taxRates);
  const vsdcResponse = await this.vsdcApiService.saveStockItems(vsdcRequest);

  const movement = new ZraStockMovement();
  movement.tenant_id = tenantId;
  movement.stock_movement_id = movementData.id;
  movement.movement_type = movementData.movementType;
  movement.movement_type_code = sarTyCd;
  movement.sar_no = vsdcResponse.sarNo;
  movement.sync_status = 'synced';
  return this.movementRepo.save(movement);
}

private mapMovementTypeToSarType(movementType: string): string {
  // Per ZRA VSDC spec 6.14 Stock In/Out Type
  const mapping: Record<string, string> = {
    'IMPORT':          '01',  // Incoming — Import
    'PURCHASE':        '02',  // Incoming — Purchase from supplier
    'OPENING_BALANCE': '02',  // Incoming — treat as purchase
    'RETURN':          '03',  // Incoming — Customer return
    'TRANSFER_IN':     '04',  // Incoming — From another branch
    'PRODUCTION':      '05',  // Incoming — Manufactured/produced
    'ADJUSTMENT_IN':   '06',  // Incoming — Stock count increase
    'SALE':            '11',  // Outgoing — Sale
    'SUPPLIER_RETURN': '12',  // Outgoing — Return to supplier
    'TRANSFER_OUT':    '13',  // Outgoing — To another branch
    'PROCESSING':      '14',  // Outgoing — Used in manufacturing
    'WASTE':           '15',  // Outgoing — Discarding (expired/damaged)
    'ADJUSTMENT_OUT':  '16',  // Outgoing — Stock count decrease
    'ADJUSTMENT':      '06',  // Default to incoming adjustment
  };
  return mapping[movementType] || '02';
}
```

---

## 10. Item Registration

### What It Does
Every product sold must be registered with ZRA and have a ZRA item code (`itemCd`). This code is required in all sales submissions.

### VSDC Endpoint
```
POST /items/saveItem
```

### Item Code Format (spec 6.16)
If you don't have a pre-assigned ZRA item code, generate one following the exact format:
```
ZM{productType}{pkgUnit:2chars}{qtyUnit:2chars}{sequence:7digits}

// Example: ZM2NTU0000001
//   ZM       = Country of Origin (Zambia — always ZM)
//   2        = Product Type: 1=Raw Material, 2=Finished Good, 3=Service
//   NT       = Packaging Unit code (2 chars, padded): NT=Net, BG=Bag, CT=Carton, etc.
//   U        = Quantity Unit code (2 chars, padded): U =Each, KG, L =Litre, M =Metre, etc.
//   0000001  = 7-digit sequential counter per tenant (zero-padded)
```

Generation logic:
```typescript
private async generateItemCode(tenantId: string, product: ProductInfo): Promise<string> {
  const count = await this.registeredItemRepo.count({ where: { tenant_id: tenantId } });
  const productType = product.itemType || '2';                        // 1=Raw, 2=Finished, 3=Service
  const pkgUnit = (product.pkgUnitCode || 'NT').substring(0, 2).padEnd(2, 'X');
  const qtyUnit = (product.qtyUnitCode || 'U').substring(0, 2).padEnd(2, 'X');
  const sequence = (count + 1).toString().padStart(7, '0');
  return `ZM${productType}${pkgUnit}${qtyUnit}${sequence}`;
}
```

### Request Structure
```typescript
interface VsdcItemRequest {
  tpin: string;
  bhfId: string;
  itemCd: string;         // Generated or assigned item code
  itemClsCd: string;      // UNSPSC class code (e.g. "5020230101" for food items)
  itemTyCd: string;       // '1'=Raw material, '2'=Finished good, '3'=Service
  itemNm: string;         // Product name
  itemSttsCd: string;     // '1' = Active
  addInfo?: string;       // Additional info
  safeQty?: number;       // Safety stock level (optional)
  sftyQty?: number;
  qtyUnitCd: string;      // 'U'=Unit, 'KG'=Kilogram, 'L'=Litre, 'M'=Metre
  taxTyCd: string;        // Tax category: 'A','B','C1','C2','C3','D','E'
  useYn: string;          // 'Y' = In use
  regrId: string;         // Registrar ID (use tpin)
  regrNm: string;         // Registrar name (business name)
  modrId: string;         // Modifier ID (use tpin)
  modrNm: string;         // Modifier name
}
```

### Auto-Register on Sale
```typescript
// item-registration.service.ts
async ensureItemRegistered(tenantId: string, productId: string, productData: any): Promise<string> {
  // Check cache first
  const existing = await this.registeredItemRepo.findOne({
    where: { tenant_id: tenantId, product_id: productId, registration_status: 'registered' }
  });
  if (existing) return existing.zra_item_code;

  // Register with VSDC
  const config = await this.tpinValidationService.getConfiguration(tenantId);
  const itemCd = this.generateItemCode(config.tpin, productData.taxCategory, productId);

  await this.vsdcApiService.saveItem({
    tpin: config.tpin,
    bhfId: '000',
    itemCd,
    itemClsCd: productData.itemClassCode || '5020230101',
    itemTyCd: productData.itemType || '2',
    itemNm: productData.name,
    itemSttsCd: '1',
    qtyUnitCd: productData.qtyUnitCode || 'U',
    taxTyCd: productData.taxCategory || 'A',
    useYn: 'Y',
    regrId: config.tpin,
    regrNm: config.business_name,
    modrId: config.tpin,
    modrNm: config.business_name,
  });

  // Save registration
  const item = new ZraRegisteredItem();
  item.tenant_id = tenantId;
  item.product_id = productId;
  item.zra_item_code = itemCd;
  item.registration_status = 'registered';
  await this.registeredItemRepo.save(item);

  return itemCd;
}
```

---

## 11. Tax Calculation Rules

> This is the most critical section. VSDC strictly validates that item-level amounts sum exactly to header-level amounts. Any mismatch causes rejection.

### Core Rule: All Prices Are TAX-INCLUSIVE
ZRA requires that `prc` (unit price) and all amounts are already inclusive of VAT.

### Per-Item Calculation
```typescript
// For each line item:
const prc = item.unitPrice;                          // Tax-inclusive unit price
const splyAmt = prc * item.quantity;                 // Tax-inclusive line total
const rate = taxRates[item.taxCategory] / 100;       // e.g. 0.16 for 16%
const vatTaxblAmt = splyAmt / (1 + rate);            // Tax-exclusive base
const vatAmt = splyAmt - vatTaxblAmt;                // Tax amount
const totAmt = splyAmt;                              // Always equals splyAmt (no discount case)

// Round to 4 decimal places
const round4 = (n: number) => Math.round(n * 10000) / 10000;
```

### Header Calculation
```typescript
// Group items by tax category, then SUM (do NOT round per item first)
const taxBuckets = { A: {taxbl: 0, tax: 0}, B: {taxbl: 0, tax: 0}, E: {taxbl: 0, tax: 0} ... };

for (const item of items) {
  const cat = item.taxCategory || 'A';
  const rate = taxRates[cat] / 100;
  const splyAmt = item.unitPrice * item.quantity;
  const vatTaxblAmt = splyAmt / (1 + rate);
  const vatAmt = splyAmt - vatTaxblAmt;
  taxBuckets[cat].taxbl += vatTaxblAmt;
  taxBuckets[cat].tax += vatAmt;
}

// Header fields (round the SUMS, not individual items)
const taxblAmtA = round4(taxBuckets.A.taxbl);
const taxAmtA = round4(taxBuckets.A.tax);
// ... repeat for B, C1, C2, C3, D, E

const totTaxblAmt = round4(Object.values(taxBuckets).reduce((s, b) => s + b.taxbl, 0));
const totTaxAmt = round4(Object.values(taxBuckets).reduce((s, b) => s + b.tax, 0));
const totAmt = round4(items.reduce((s, i) => s + (i.unitPrice * i.quantity), 0));
```

### Example
```
Item: Coca Cola 500ml, Qty=3, Price=K15.00 each, Category A (16% VAT)

splyAmt      = 15.00 × 3 = 45.0000
vatTaxblAmt  = 45.0000 / 1.16 = 38.7931
vatAmt       = 45.0000 - 38.7931 = 6.2069
totAmt       = 45.0000

Header:
taxblAmtA    = 38.7931
taxAmtA      = 6.2069
totTaxblAmt  = 38.7931
totTaxAmt    = 6.2069
totAmt       = 45.0000
```

### Zero-Rate, Exempt and Disbursement
```
Category C1/C2/C3 (0% zero-rated):
  vatTaxblAmt = splyAmt / 1.00 = splyAmt
  vatAmt = 0

Category D (Exempt):
  No VAT charged at all — goods/services exempt by law
  vatTaxblAmt = splyAmt, vatAmt = 0

Category E (Disbursement):
  Amounts passed through to a third party on behalf of the customer
  vatTaxblAmt = splyAmt, vatAmt = 0
```

### Tax Categories Reference (spec 6.1)
```typescript
const DEFAULT_TAX_RATES = {
  'A':    16,   // Standard VAT — 16% on most taxable goods & services
  'B':    16,   // MTV (Minimum Taxable Value) — 16% applied at manufacturer's retail price
  'C1':    0,   // Exports — 0% (goods/services exported out of Zambia)
  'C2':    0,   // Zero-rating LPO — 0% (approved Local Purchase Orders)
  'C3':    0,   // Zero-rated by nature — 0% (essential goods: basic foodstuffs, etc.)
  'D':     0,   // Exempt — no VAT applicable (medical, education, financial services)
  'E':     0,   // Disbursement — third-party pass-through amounts
  'RVAT':  0,   // Reverse VAT — imported services (buyer accounts for VAT)
  'F':    10,   // Service Charge — 10% on hospitality/tourism services
  'IPL1':  0,   // Insurance Premium Levy
  'IPL2':  0,   // Re-Insurance IPL
  'TL':    0,   // Tourism Levy
  'ECM':   0,   // Excise Coal Mining
  'EXEEG': 0,   // Excise Electricity/Energy
  'TOT':   0,   // Turnover Tax (always 0.0 per spec)
};
// ⚠️  B is NOT zero-rated — it is 16% applied at manufacturer's retail price.
//     Only C1, C2, C3 are truly zero-rated.
```

---

## 12. Payment Method Codes (spec 6.9)

| Code | Payment Type | Internal Name |
|---|---|---|
| `01` | Cash | `cash` |
| `02` | Credit | `credit` |
| `03` | Cash + Credit (split) | `cash/credit` |
| `04` | Bank Cheque | `check` / `cheque` |
| `05` | Credit/Debit Card | `card` |
| `06` | Mobile Money | `mobile` / `mobile_money` |
| `07` | Other | `other` |
| `08` | Bank Transfer | `bank_transfer` |

Mapping logic:
```typescript
private mapPaymentMethod(method: string): string {
  const map: Record<string, string> = {
    'cash':          '01',
    'credit':        '02',
    'cash/credit':   '03',
    'check':         '04',
    'cheque':        '04',
    'card':          '05',
    'mobile':        '06',
    'mobile_money':  '06',
    'bank_transfer': '08',
    'other':         '07',
  };
  return map[method?.toLowerCase()] || '01';
}
```

---

## 13. Queue & Retry System

### Why It Exists
The VSDC server can be temporarily unavailable. If a sale cannot be fiscalized immediately, it must be queued and retried automatically — every invoice MUST eventually be submitted to ZRA.

### Queue Processing (Cron Job)
```typescript
// fiscalization.service.ts
@Cron(CronExpression.EVERY_MINUTE)
async processQueue(): Promise<void> {
  const pendingItems = await this.queueRepo.find({
    where: [
      { status: 'queued' },
      { status: 'retry', next_retry_at: LessThanOrEqual(new Date()) }
    ],
    order: { priority: 'DESC', created_at: 'ASC' },
    take: 10,  // Process 10 at a time
  });

  for (const item of pendingItems) {
    await this.processQueueItem(item);
  }
}

private async processQueueItem(item: FiscalInvoiceQueue): Promise<void> {
  item.status = 'processing';
  await this.queueRepo.save(item);

  try {
    const fiscalInvoice = await this.fiscalInvoiceRepo.findOne({
      where: { id: item.fiscal_invoice_id }
    });

    // Replay stored VSDC request
    const vsdcResponse = await this.vsdcApiService.submitSale(fiscalInvoice.vsdc_request);

    fiscalInvoice.fiscal_invoice_number = String(vsdcResponse.rcptNo);
    fiscalInvoice.fiscal_signature = vsdcResponse.intrlData;
    fiscalInvoice.fiscalization_status = 'fiscalized';
    await this.fiscalInvoiceRepo.save(fiscalInvoice);

    item.status = 'completed';
    await this.queueRepo.save(item);
  } catch (error) {
    item.retry_count++;
    item.last_error = error.message;

    if (item.retry_count >= item.max_retries) {
      item.status = 'failed';
    } else {
      // Exponential backoff: 5min, 10min, 20min, 40min, 80min
      const delayMinutes = 5 * Math.pow(2, item.retry_count - 1);
      item.next_retry_at = addMinutes(new Date(), delayMinutes);
      item.status = 'retry';
    }
    await this.queueRepo.save(item);
  }
}
```

### Manual Retry
```typescript
// POST /api/zra/invoices/:id/retry
async retryFiscalInvoice(tenantId: string, invoiceId: string) {
  const invoice = await this.fiscalInvoiceRepo.findOne({
    where: { id: invoiceId, tenant_id: tenantId }
  });

  // Re-queue with high priority
  await this.queueRepo.update(
    { fiscal_invoice_id: invoiceId },
    { status: 'queued', next_retry_at: new Date(), priority: 10 }
  );
}
```

---

## 14. Encryption & Security

### AES-256-CBC for Credential Storage
Used to encrypt API passwords stored in the `api_password_encrypted` column.

```typescript
// encryption.util.ts
import * as crypto from 'crypto';

@Injectable()
export class EncryptionUtil {
  private readonly algorithm = 'aes-256-cbc';
  private readonly key: Buffer;

  constructor(private config: ConfigService) {
    const encKey = config.get<string>('ZRA_ENCRYPTION_KEY');
    // Derive 32-byte key from the secret
    this.key = crypto.scryptSync(encKey, 'salt', 32);
  }

  encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    const encrypted = cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  decrypt(encryptedText: string): string {
    const [ivHex, encrypted] = encryptedText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    return decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
  }
}
```

### Signature Verification
```typescript
// signature.util.ts
@Injectable()
export class SignatureUtil {
  verifySignature(data: string, signature: string, publicKey: string): boolean {
    const verify = crypto.createVerify('SHA256');
    verify.update(data);
    return verify.verify(publicKey, signature, 'base64');
  }

  buildVerificationUrl(tpin: string, vsdcResponse: VsdcSalesResponse): string {
    const { sdcId, rcptNo, intrlData } = vsdcResponse;
    return `https://siportal.zra.org.zm/verify/${tpin}/${sdcId}/${rcptNo}/${intrlData}`;
  }

  generateQrCodeData(fiscalInvoiceNumber: string, verificationCode: string, total: number): string {
    return `FIN:${fiscalInvoiceNumber}|VC:${verificationCode}|AMT:${total}`;
  }
}
```

---

## 15. Multi-Tenant Architecture

### Every DB Query is Tenant-Scoped
```typescript
// Always filter by tenant_id — never query globally
const config = await this.zraConfigRepo.findOne({
  where: { tenant_id: tenantId }  // ← ALWAYS include this
});

const invoices = await this.fiscalInvoiceRepo.find({
  where: { tenant_id: tenantId }
});
```

### Controller Guards
```typescript
// zra.controller.ts
@Controller('zra')
@UseGuards(JwtAuthGuard, TenantGuard)  // Validates JWT + extracts tenantId
export class ZraController {
  @Post('fiscalize')
  async fiscalize(@Body() dto: FiscalizeInvoiceDto, @Req() req: any) {
    const tenantId = req.user.tenantId;  // Always from JWT, never from request body
    return this.zraService.fiscalizeInvoice(tenantId, dto);
  }
}
```

### TPIN Uniqueness Enforcement
```typescript
// tpin-validation.service.ts
const existingConfig = await this.zraConfigRepo.findOne({ where: { tpin } });
if (existingConfig && existingConfig.tenant_id !== tenantId) {
  throw new BadRequestException('This TPIN is already registered to another business');
}
```

### Country Guard (Zambia Only)
```typescript
// zra.service.ts
async checkZraSupport(tenantId: string): Promise<boolean> {
  const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } });
  return tenant?.country === 'Zambia';
}
```

---

## 16. API Reference

All endpoints require JWT authentication. `tenantId` is extracted from the JWT token.

### Configuration
| Method | Path | Body | Description |
|---|---|---|---|
| `POST` | `/api/zra/auto-configure` | `{ tpin, serialNumber }` | Full setup: validates TPIN, initializes device |
| `POST` | `/api/zra/register-tpin` | `{ tpin }` | TPIN-only setup (no device init) |
| `GET` | `/api/zra/status` | — | ZRA status: enabled, deviceId, queue totals |
| `PUT` | `/api/zra/config` | Partial ZraConfiguration | Update config settings |
| `PUT` | `/api/zra/business-type` | `{ businessType, options? }` | Set business type & features |

### Fiscalization
| Method | Path | Body | Description |
|---|---|---|---|
| `POST` | `/api/zra/fiscalize` | `FiscalizeInvoiceDto` | Fiscalize a sale |
| `GET` | `/api/zra/invoices` | — | List fiscal invoices |
| `GET` | `/api/zra/invoices/:id` | — | Get single invoice with VSDC response |
| `POST` | `/api/zra/invoices/:id/retry` | — | Manual retry for failed invoice |
| `POST` | `/api/zra/sync` | — | Trigger queue processing now |

### Credit & Debit Notes
| Method | Path | Body | Description |
|---|---|---|---|
| `POST` | `/api/zra/credit-notes` | `CreateCreditNoteDto` | Create refund credit note |
| `GET` | `/api/zra/credit-notes` | — | List credit notes |
| `POST` | `/api/zra/credit-notes/:id/retry` | — | Retry failed credit note |
| `POST` | `/api/zra/debit-notes` | `CreateDebitNoteDto` | Create adjustment debit note |
| `GET` | `/api/zra/debit-notes` | — | List debit notes |

### Purchases
| Method | Path | Body | Description |
|---|---|---|---|
| `POST` | `/api/zra/purchases` | `CreatePurchaseDto` | Fiscalize a purchase |
| `GET` | `/api/zra/purchases` | — | List fiscal purchases |

### Stock
| Method | Path | Body | Description |
|---|---|---|---|
| `POST` | `/api/zra/stock/sync` | `StockMovementData` | Sync stock movement to VSDC |
| `GET` | `/api/zra/stock/movements` | — | List synced movements |

### Items
| Method | Path | Body | Description |
|---|---|---|---|
| `POST` | `/api/zra/items/register` | `RegisterItemDto` | Register single item |
| `POST` | `/api/zra/items/register-bulk` | `RegisterItemDto[]` | Bulk register items |
| `GET` | `/api/zra/items/:productId/status` | — | Check if item is registered |

---

## 17. VSDC Response Codes

| Code | Meaning | Action |
|---|---|---|
| `000` | Success | Save fiscal data |
| `001` | Invalid TPIN | Check TPIN registration with ZRA |
| `002` | Invalid branch ID | Use `000` for HQ |
| `100` | Missing required field | Check request structure |
| `200` | Data validation error | Check amounts/dates |
| `800` | System error | Retry later |
| `899` | TPIN not registered | TPIN not in ZRA system |
| `902` | Device already initialized | Treat as success in sandbox |
| `903` | Invoice already submitted | Check for duplicate `cisInvcNo` |

---

## Common Pitfalls

1. **Init data nesting** — ZRA wraps `initializeDevice` response under `data.info`, not `data` directly. Always unwrap.

2. **Tax-inclusive prices** — `prc` in VSDC must always be the final tax-inclusive price. Do NOT pass the pre-tax price.

3. **Header vs item sum mismatch** — Never round individual items first then sum. Sum first, then round the total.

4. **FK constraint on sale_id** — The sale may not exist in the DB when fiscalization is triggered (offline sync). Always verify existence before setting the FK.

5. **Comma in `ALLOWED_ORIGINS`** — When passing to `gcloud run deploy --set-env-vars`, use the `^##^` separator: `--set-env-vars "^##^ALLOWED_ORIGINS=https://a.com,https://b.com"`

6. **Electron folder in NestJS build** — Create `tsconfig.build.json` explicitly excluding `electron/` if your project has one.

7. **`orgInvcNo` type** — Must be an integer (`0` for new, actual `rcptNo` for credit/debit notes). Do not pass a string.

8. **`orgSdcId` required for credit/debit notes** — Must pass the original invoice's `sdcId` from the VSDC response. Omitting this will cause rejection.

9. **`salesTyCd` ≠ `rcptTyCd`** — `salesTyCd` is the transaction type (`N`=Normal, `C`=Copy) per spec 6.7. `rcptTyCd` is the receipt type (`S`=Sale, `R`=Reversal, `D`=Debit Note) per spec 6.8. `R` is NOT a valid `salesTyCd` value.

10. **`salesSttsCd` for refunds** — Must be `'05'` (Refunded) for credit notes, not `'02'` (Approved).

11. **`saleCtyCd` is required** — Always pass `"1"`. Omitting this field causes validation rejection.

12. **`prchrAcptcYn` is always "Y"** — Never pass "N". This field indicates purchaser acknowledged the invoice.

13. **Tax category B is 16%, not 0%** — B = MTV (Minimum Taxable Value), applies 16% VAT at manufacturer's retail price. Only C1, C2, C3 are zero-rated.

14. **SAR codes are 2-digit specific codes, not binary** — Stock sync must use the specific 2-digit codes (01–06 for in, 11–16 for out) per spec 6.14, not a generic 01/02 system.

15. **Item code format** — Must be `ZM{type}{pkg:2}{qty:2}{seq:7}` e.g. `ZM2NTU0000001`. Old format `{tpin5}{category}{seq3}` is incorrect.

16. **`cfmDt` format** — Must be `YYYYMMDDHHmmss` (14 chars, no separators). `salesDt` is `YYYYMMDD` (8 chars).

17. **VSDC runs locally** — The VSDC is a Java/Tomcat WAR file installed on the local machine, not a remote cloud API. There is no separate production URL — production vs sandbox depends on which WAR installer ZRA provides.

18. **Retry queue replay** — Store the full `vsdc_request` JSON on first attempt. Replay this exact request on retry rather than rebuilding, to avoid invoice counter drift.
