# Production E-Commerce Catalog — Scope & Feature Plan
> Indian market. Single-brand. Built to production standards from day one.
> Every feature listed here has been deliberately chosen. Nothing is here for resume padding.

---

## The Guiding Philosophy

Most tutorial e-commerce apps fail at three layers:
- **Inventory correctness** — they oversell because they have no atomicity or soft-reservation.
- **The money layer** — they ignore GST, price snapshots, and audit trails, making them legally unusable.
- **Operations** — they have no observability, so when something breaks in production, there's no way to diagnose it without staring at raw logs for hours.

Every feature in this document exists to solve one of those three problems, or to provide a genuinely differentiated customer experience. If a feature doesn't serve one of those goals, it's not in scope.

---

## Data Architecture

### Collections & Their Purpose

| Collection | One-line purpose |
|---|---|
| `Category` | Hierarchical product taxonomy. Self-referential (Men → Shirts → Formal Shirts). |
| `Brand` | Independent brand entity with logo and slug. Queryable, not just a string on Product. |
| `Product` | The abstract item — title, description, HSN code, category, brand. Never purchased directly. |
| `ProductVariant` | The physical, purchasable SKU — specific size + color + stock count. This IS the inventory. |
| `CartReservation` | Soft lock on a variant at checkout intent. TTL-indexed — auto-expires in 15 minutes. |
| `InventoryEvent` | Immutable append-only ledger of every stock mutation. The audit trail. |
| `PricingRule` | Configurable discount rules with conditions, date ranges, and priority. |
| `OrderLineItem` | Legal financial snapshot of each item at time of purchase. Never recomputed from live data. |

### Key Schema Decisions

**ProductVariant holds the inventory truth.**
- `stockQuantity` — physical units in warehouse
- `reservedQuantity` — locked in active checkout sessions right now
- `availableStock` = `stockQuantity - reservedQuantity` — computed as a Mongoose virtual, never stored
- `sellingPrice` — actual transaction price (used for GST bracket determination)
- `mrp` — max retail price (shown as strikethrough in UI)
- `costPrice` — procurement cost, internal only, never exposed to frontend
- `color.name` + `color.hex` — both stored; name for display, hex for swatch rendering
- `images[]` — variant-level images (red shirt shows red shirt photos, not generic product shot)

**OrderLineItem snapshots everything at purchase time.**
All prices, GST rates, HSN codes, product titles, and SKUs are copied into the line item at checkout. If you rename a product or change its price next week, past invoices remain legally correct. References alone are not enough for financial records.

---

## Feature 1 — Inventory Integrity System

### What it is
A multi-layered system that guarantees you never sell stock you don't have, and always know exactly why your stock numbers are what they are.

### How it works

**Atomic stock operations** — all stock mutations use MongoDB's `findOneAndUpdate` with a filter guard. The check ("is stock available?") and the update ("decrement by 1") are a single round-trip to the database. There is no gap between check and update for a race condition to exploit.

```
// The guard IS the check. If stock < quantity, this returns null.
findOneAndUpdate(
  { _id: variantId, availableStock >= quantity },  // filter = guard
  { $inc: { reservedQuantity: +quantity } },        // update
  { session }                                        // transaction context
)
```

**Soft reservation at checkout** — stock is not reserved when a customer adds an item to their cart. It is reserved the moment they click "Proceed to Pay." This prevents ghost reservations from browsing users while still protecting against two customers completing payment for the same last item simultaneously.

**TTL-based reservation expiry** — `CartReservation` documents carry an `expiresAt` timestamp. A MongoDB TTL index deletes them automatically when the time passes. A Mongoose `post('findOneAndDelete')` hook fires on deletion and returns the reserved stock to the pool. No cron job. No manual cleanup. Automatic.

**InventoryEvent ledger** — every stock mutation (restock, sale, reservation, return, manual adjustment, expiry) writes an append-only event document with a delta and the resulting stock count. Events are never edited or deleted.

**Nightly integrity check** — a background job sums all `InventoryEvent` deltas for each variant and compares to the current `stockQuantity`. If they diverge, a bug caused a stock update without a corresponding event. The job alerts before a customer discovers the discrepancy.

### Why it matters for the business
Overselling is the single biggest trust-destroyer in Indian e-commerce. Customers who order and receive a cancellation email rarely return. This system makes overselling structurally impossible, not just unlikely.

---

## Feature 2 — Indian GST Compliance

### What it is
Correct, legally-compliant GST calculation baked into the checkout flow. Not an afterthought.

### The rules (clothing-specific)
Indian GST on apparel (HSN Chapter 61/62) is price-dependent:
- Selling price ≤ ₹999 → **5% GST**
- Selling price ≥ ₹1,000 → **12% GST**

The rate is determined by the **transaction value** — the actual discounted price paid — not the MRP. This is significant: a shirt with MRP ₹1,200 that is on sale for ₹899 is taxed at 5%, not 12%.

### Inclusive GST (the Indian retail standard)
Indian MRPs are GST-inclusive. The price tag on a shirt already contains the tax inside it. The correct formula is:

```
gstAmount    = sellingPrice × rate / (100 + rate)
taxableAmount = sellingPrice - gstAmount

// Example: ₹999 shirt at 5%
// gstAmount    = 999 × 5 / 105 = ₹47.57
// taxableAmount = 999 - 47.57  = ₹951.43
// Verify: 951.43 × 1.05 = ₹999 ✓
```

Most tutorials use the exclusive formula (`price × rate / 100`) which is wrong for Indian retail and will be flagged in a CA audit.

### What gets stored on OrderLineItem
Every order line item snapshots: `hsnCode`, `gstRate` (5 or 12), `gstAmount` (per unit), `taxableAmount` (per unit), `lineTaxTotal` (gstAmount × quantity). This is everything needed to generate a GSTIN-compliant tax invoice.

### Why it matters for the business
Any business crossing ₹20 lakh turnover is legally required to register for GST and issue proper tax invoices. Building this correctly from day one means zero migration pain at scale.

---

## Feature 3 — Pricing Rule Engine

### What it is
A configurable, database-driven discount system. Business rules live in the database, not in application code. Non-technical operators can create and modify promotions without a code deployment.

### Supported discount types
- `PERCENTAGE` — percentage off the selling price (e.g. 10% off)
- `FLAT_AMOUNT` — fixed rupee discount (e.g. ₹100 off)
- `BOGO` — buy one get one free (50% per unit when quantity ≥ 2)

### Rule conditions
Rules can be scoped by: category, brand, minimum cart value, minimum item quantity, and date range (`validFrom` / `validTo`). All conditions must be satisfied for a rule to apply.

### Priority system
When multiple rules apply to the same item, the rule with the highest `priority` value wins. This prevents ambiguous double-discounting and gives business operators full control over which promotions take precedence.

### Design decision — simple but modular
The pricing engine is intentionally simple in V1. The architecture is structured so that adding new discount types or condition types is additive — one new `case` in one switch statement, or one new condition check in one method. No restructuring required.

### GST interaction
GST is computed on the post-discount price. Per Indian GST law, tax applies to the transaction value (what was actually paid), not the MRP. The pricing service always applies discounts before passing the final price to the GST calculator.

---

## Feature 4 — Product Catalog Architecture

### Parent-Variant model
Products are split into two levels:
- `Product` — the abstract item. Shared identity, description, GST category, brand association.
- `ProductVariant` — the purchasable SKU. Specific size, specific color, specific stock count, specific price.

This is how real catalog systems (Myntra, Ajio, Shopify) work. A "shirt" is a product. "Red Large shirt, SKU SHRT-RED-L-001" is a variant.

### Self-referential category hierarchy
Categories can have parent categories, enabling unlimited nesting depth: Women → Western Wear → Dresses → Midi Dresses. One collection, one field that points back to itself. The root categories (Men, Women, Kids) have `parentCategory: null`.

### Color representation
Colors are stored as both `name` (display label, e.g. "Midnight Blue") and `hex` (swatch rendering, e.g. `#1F2F4A`). Storing only a hex makes the UI do reverse lookups. Storing only a name makes swatch rendering impossible. Both are necessary.

### Variant-level images
Images exist on both `Product` (lifestyle/neutral shots) and `ProductVariant` (color-specific shots). When a customer selects "Red," the gallery shows red shirt photos. This is standard customer expectation on any quality fashion site.

### Tags for search
Products carry a `tags[]` array for search enrichment: `["cotton", "formal", "slim-fit", "breathable"]`. Before a dedicated search engine is integrated, MongoDB's native text index on `title + tags` provides basic search capability. Tags are the bridge to Typesense.

---

## Feature 5 — Search (Typesense Integration)

### What it is
A dedicated search engine for product discovery that provides results a `find()` query never could.

### Why MongoDB's built-in search isn't enough
`Product.find({ title: /shirt/i })` finds documents containing the word "shirt." It does not handle typos ("shrit"), does not support multi-attribute faceting, does not rank by relevance, and does not scale past a few thousand products without becoming painfully slow.

### What Typesense provides
- **Typo tolerance** — "shrit" finds "shirt" automatically
- **Faceted filtering** — filter by color, size, price range, brand, and category simultaneously, with live counts per facet
- **Sub-10ms queries** — purpose-built for this use case, significantly faster than any MongoDB aggregation for search
- **Relevance ranking** — tunable by popularity, recency, or custom signals

### Architecture
Typesense holds a denormalized, flattened view of each product+variant combination optimized for search. MongoDB remains the source of truth. A background sync job keeps Typesense in sync after any product mutation. This separation is intentional — the search index shape is completely different from the storage shape.

### Why not Elasticsearch
Typesense is self-hosted, free, operationally simpler, and purpose-built for e-commerce catalog search. Elasticsearch is more powerful but carries significant operational overhead for a single-brand store.

---

## Feature 6 — Observability & Audit Trail

### Structured logging with correlation IDs
Every incoming HTTP request is assigned a UUID (correlation ID) at the middleware layer. Every log line generated during that request's lifecycle carries the same UUID. When a checkout fails for one user, you filter logs by their correlation ID and see the complete sequence of events — what queries ran, what services were called, where it failed — in under 30 seconds.

Without this, debugging production issues means manually reading through thousands of mixed log lines trying to reconstruct a timeline.

### Dead letter queue
Background jobs (send invoice email, update shipment status, run integrity check) sometimes fail. A dead letter queue stores failed jobs with their full payload and error details. You can inspect failures, fix the bug, and replay the job without data loss. Without this, a failed job silently disappears and the customer never gets their invoice.

### Inventory integrity job
The nightly background job described in Feature 1. Catches stock discrepancies before customers discover them.

### Why this matters for interviews and production alike
Observability is what separates a developer who has shipped to production from one who hasn't. The question "how would you debug a checkout failure affecting 5% of users?" has a very different answer depending on whether you have structured logging and a correlation ID system.

---

## Phase Roadmap

### Phase 1 — Data Layer (current)
Build all Mongoose schemas with correct indexes, virtuals, and middleware. Every schema decision has a documented reason.

### Phase 2 — Service Layer
`InventoryService` (atomic stock operations, audit logging), `PricingService` (rule evaluation, GST computation), `CartService` (orchestrates both inside a transaction).

### Phase 3 — API Layer
Express routes with Zod request validation. Error handling middleware that maps service errors (`InventoryError`, etc.) to correct HTTP status codes. No business logic in route handlers.

### Phase 4 — Background Jobs
TTL hook verification, nightly integrity check, Typesense sync job, dead letter queue setup with BullMQ + Redis.

### Phase 5 — Observability
Correlation ID middleware, structured logging (Winston or Pino), integrity alerting.

### Out of scope (V1)
Shipping/courier integration (Shiprocket, Delhivery). Payment gateway integration. Customer authentication and profile management. Admin dashboard UI. Multi-vendor/marketplace support.

---

## Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| Runtime | Node.js + TypeScript | Type safety catches schema mismatches at compile time, not at 2am in production |
| Framework | Express | Minimal, well-understood, no magic |
| Database | MongoDB + Mongoose | Document model fits catalog data; Mongoose provides schema enforcement and middleware hooks |
| Validation | Zod | Runtime type safety at API boundaries; schemas double as TypeScript types |
| Search | Typesense | Purpose-built for e-commerce catalog search; self-hosted; free |
| Background Jobs | BullMQ + Redis | Production-grade job queue with dead letter support, retries, and monitoring |
| Logging | Pino | Structured JSON logging, low overhead, built for production |

---

*Last updated: session on catalog architecture and service layer design.*
*Next action: build all Mongoose schemas in dependency order before writing any service or route code.*
