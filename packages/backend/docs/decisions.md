 Engineering Decisions & Tradeoffs

> Living document. Every non-obvious decision gets recorded here with its rationale, alternatives considered, and conditions under which we'd revisit it.

---

## DEC-001: Slug Immutability on Entity Rename

**Date**: 2026-05-03
**Status**: Accepted
**Applies to**: Brand, Product, Category (all slugged entities)

### Context

When an entity's `name` is updated (e.g., "Addidas" → "Adidas"), should the `slug` be regenerated to match?

### Decision

**No.** Slugs are immutable after creation. The slug `addidas` will persist even after the name is corrected to "Adidas."

### Rationale

- Slugs are used in public-facing URLs (`/brands/addidas`).
- Changing a slug breaks:
  - Bookmarked URLs → 404
  - Google search index rankings → SEO loss
  - Shared links on social media / marketing emails → dead links
- The alternative (slug regeneration + redirect history) requires:
  - A `slugHistory: string[]` field on every slugged model
  - Middleware to check old slugs and issue 301 redirects
  - Testing for slug collision across active + historical slugs
  - Complexity disproportionate to the problem for a v1

### Industry Precedent

- **Amazon**: Uses ASINs in URLs, slugs are decorative
- **Shopify**: Handle (slug) does not auto-change on title change
- **WordPress**: Permalink stays the same when post title changes

### Tradeoff Accepted

Slug and name may visually diverge. This is cosmetic, not functional.

### Revisit Conditions

- If SEO becomes a top priority and marketing needs "pretty" URLs that always match the brand name
- If we build an admin dashboard where slug management is a feature

### Future Path (If Needed)

1. Add `slugHistory: string[]` to the model
2. On slug change, push old slug to history
3. Query both `slug` and `slugHistory` on lookup
4. Return 301 redirect if matched via history

---

## DEC-002: PATCH (Not PUT) for Entity Updates

**Date**: 2026-05-03
**Status**: Accepted
**Applies to**: All update endpoints

### Context

The update schemas have all-optional body fields (partial update semantics). Which HTTP method correctly represents this?

### Decision

**Use PATCH.** The request body represents a partial modification, not a full replacement.

### Rationale

- **PUT** (RFC 9110) means "replace the entire resource with this body." Omitting a field on PUT semantically means "delete that field."
- **PATCH** means "apply these changes to the resource." Omitting a field means "don't touch it."
- Our Zod schemas enforce at least one field (`Object.keys(data).length > 0`), which is a PATCH pattern.
- Using PUT with all-optional fields misleads API consumers — they don't know if omitting a field means "keep it" or "delete it."

### Tradeoff Accepted

PATCH is technically not guaranteed to be idempotent (unlike PUT). However, `$set` operations are inherently idempotent — calling `{ $set: { name: "Nike" } }` ten times produces the same result. So in practice, our PATCH endpoints *are* idempotent.

### Revisit Conditions

- If we add `$inc`-style operations (e.g., increment view count) to an update endpoint, we need to reconsider idempotency guarantees.

---

## DEC-003: Mongoose `undefined` Stripping for Partial Updates

**Date**: 2026-05-03
**Status**: Accepted
**Applies to**: All service-layer update methods

### Context

When a PATCH body has `{ name: "Nike" }`, the TypeScript type resolves `description`, `logo`, and `isActive` as `undefined`. How do we ensure these undefined fields don't overwrite existing values in MongoDB?

### Decision

Rely on Mongoose v6+ default behavior: **`undefined` values are stripped from `$set` payloads.** Only fields explicitly set to a value (including `null`) are sent to MongoDB.

### Rationale

- Mongoose (since v6) strips `undefined` from update objects by default
- `null` is preserved and sent to MongoDB — this is correct for "remove this field" semantics (e.g., `logo: null` removes the logo)
- This means we can safely spread the entire `input` object into `findByIdAndUpdate` without manually filtering

### Risk

- If Mongoose changes this default in a future major version, our partial updates would break silently.
- Mitigated by: pinning Mongoose major version, testing update behavior in integration tests.

---

## DEC-004: Atomic Unique Index Constraints (No Pre-flight Checks)

**Date**: 2026-07-31
**Status**: Accepted
**Applies to**: Brand, Category, Product, Variant (slugs, names, SKUs)

### Context

When creating or updating entities with uniqueness constraints (like slugs or SKUs), we need to handle name/slug/SKU collisions. Should we query the database beforehand to check if the value is taken, or rely directly on MongoDB unique indexes?

### Decision

**Do not do pre-flight "existence" checks.** Rely purely on MongoDB's unique indexes and catch the `11000` duplicate key error in the service layer, translating it to a `CatalogError` (HTTP 409 Conflict).

### Rationale

- **TOCTOU Race Condition**: Doing a query first (e.g. `findOne({ slug })`) introduces a Time-of-Check to Time-of-Use race condition. If two requests search for the same slug concurrently, both will find that it does not exist, both will attempt to write, and the second one will throw a database error anyway.
- **Performance**: Pre-flight queries double the number of database round-trips for every create and update operation. Relying on the unique index handles existence and validation in a single atomic database operation.

### Tradeoff Accepted

We write code to catch database-level `11000` exceptions, which couples our service error-parsing logic to Mongoose/MongoDB error structures (like `error.code === 11000`).

---

## DEC-005: Accepted Race Condition in Category Parent Validation

**Date**: 2026-07-31
**Status**: Accepted
**Applies to**: `CategoryService.createCategory`

### Context

When creating a subcategory, we must validate that the `parent` category exists and is currently active. However, since the existence/active check and the creation of the subcategory are two separate database operations, a race condition exists.

### Decision

**Accept the check-then-write race condition window.** We perform `Category.findById(parent).select('isActive').lean()` to verify the parent, and then perform `Category.create(...)` in the next statement. We do not use database transactions or locks to block concurrent modifications to the parent category.

### Rationale

- **Operational Profile**: Category creation/hierarchy updates are low-frequency admin operations. The likelihood of a parent category being deactivated or deleted by one administrator in the exact millisecond between another administrator creating a subcategory is practically zero.
- **Overhead**: Forcing MongoDB transactions or locks on category CRUD would introduce substantial performance and setup overhead for a scenario that has no real-world impact.
- **Optimization**: The parent check is optimized using `.select('isActive')` and `.lean()` to fetch only the minimum required data and bypass full Mongoose document hydration.

### Revisit Conditions

If admin operations scale to where multiple automated catalog sync operations occur concurrently and produce orphaned categories, we will introduce MongoDB session transactions to execute these checks atomically.

---

## DEC-006: Zod-First Request Validation and Lean Service Layer

**Date**: 2026-07-31
**Status**: Accepted
**Applies to**: All REST API endpoints and Service Layers

### Context

Where should request body and parameter validation (checking missing fields, correct formats, boundaries) be enforced? Should the service layer replicate these validation checks?

### Decision

**Enforce strict schema validation at the Express middleware layer using Zod.** The service layer receives pre-validated inputs typed via Zod schemas (`CreateCategoryInput`, etc.) and assumes they are completely correct in terms of format, type, and range. The service layer handles only database-level, stateful, and domain constraints.

### Rationale

- **Single Source of Truth**: Sharing Zod schemas between the frontend and backend ensures contract consistency.
- **No Duplicate Logic**: Validating inputs at the controller/middleware layer prevents cluttering service code with format-validation boilerplate (e.g. "is name empty?").
- **Clarity of Errors**: Validation failures immediately respond with `400 Bad Request` and detailed error paths, bypassing service execution entirely.

---

<!-- Template for new decisions:

## DEC-XXX: [Title]

**Date**: YYYY-MM-DD
**Status**: Proposed | Accepted | Deprecated | Superseded by DEC-XXX
**Applies to**: [Scope]

### Context
### Decision
### Rationale
### Tradeoff Accepted
### Revisit Conditions

-->
