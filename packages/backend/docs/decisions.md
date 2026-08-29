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

We write code to catch database-level `11000` exceptions, which couples our service error-parsing logic to Mongoose/MongoDB error structures. Parsing is centralized in `shared/utils/mongo.utils.ts` using an `unknown` catch + `isMongoDuplicateKeyError()` type guard — not raw `error: any`.

---

## DEC-005: Accepted Race Condition in Category Parent and Ancestor Validation

**Date**: 2026-07-31 (updated 2026-08-09)
**Status**: Accepted
**Applies to**: `CategoryService.createCategory`

### Context

When creating a subcategory, we must validate that the parent exists and that no ancestor in the branch is inactive. The service builds a materialized ancestor chain, queries for inactive nodes in that chain, then inserts the new category. These steps are separate database operations, so a race condition exists between validation and insert.

### Decision

**Accept the check-then-write race condition window.** We do not use MongoDB transactions or locks for category create in v1.

### Current Implementation (2026-08-09)

1. `Category.findById(parent).lean()` — fetch parent (needed for `ancestors` array; see DEC-007)
2. Build `ancestors = [...parent.ancestors, parent._id]`
3. `Category.findOne({ _id: { $in: ancestors }, isActive: false })` — reject if any node in the chain is inactive
4. `Category.create({ ..., ancestors })`

### Rationale

- **Operational Profile**: Category creation is a low-frequency admin operation. The likelihood of an ancestor being deactivated in the exact window between step 3 and step 4 is practically zero.
- **Overhead**: MongoDB transactions add setup complexity and latency for a scenario with no measurable production impact at current scale.

### Tradeoff Accepted

A category may be created under a branch that became inactive milliseconds after validation passed. Detection: future nightly integrity job can flag categories whose `ancestors` include inactive nodes.

### Revisit Conditions

- Automated catalog sync or bulk admin operations run concurrently and produce structurally invalid trees
- Orphaned or inactive-branch categories appear in production data

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

## DEC-007: Materialized `ancestors` Array on Category

**Date**: 2026-08-09
**Status**: Accepted
**Applies to**: Category model, `CategoryService.createCategory`

### Context

Categories form a self-referential tree (`parent` pointer). Finding all descendants of a node, or validating that an entire branch is active, requires either recursive queries or repeated parent walks — both expensive at scale.

### Decision

Store a materialized `ancestors: ObjectId[]` on each category: an ordered list of ancestor IDs from root to immediate parent. Root categories have `ancestors: []`. On create:

```
ancestors = [...parent.ancestors, parent._id]
```

Index with a multikey index on `ancestors`.

### Rationale

- **Indexed descendant lookup**: `Category.find({ ancestors: categoryId })` returns all descendants via the multikey index — no recursion
- **Single-query active-chain check**: `findOne({ _id: { $in: ancestors }, isActive: false })` validates the full branch before create
- **Industry pattern**: Materialized path is standard for read-heavy product taxonomies (Myntra, Shopify collections)

### Tradeoff Accepted

- **Write amplification on reparenting**: Moving a category requires updating `ancestors` on all descendants. Reparenting is out of scope for v1 (see `category.schema.ts` comments); when built, it needs a cascade update.
- **Denormalization drift**: If categories are mutated outside the service layer, `ancestors` can become stale. Mitigated by routing all writes through service methods.

### Revisit Conditions

- Reparenting endpoint is added → implement cascade `ancestors` update
- Tree depth regularly exceeds ~10 levels → evaluate closure table or nested set model

---

## DEC-008: Scoped Uniqueness on `(parent, name)` and `(parent, slug)`

**Date**: 2026-08-09
**Status**: Accepted
**Applies to**: Category model

### Context

Field-level `unique: true` on category `name` and `slug` prevents the same label under different branches — e.g. "Shirts" cannot exist under both Men and Women.

### Decision

**Remove global unique constraints** on category `name` and `slug`. Enforce uniqueness via compound unique indexes:

- `{ parent: 1, name: 1 }`
- `{ parent: 1, slug: 1 }`

Collisions are handled per DEC-004: rely on the index and catch MongoDB error `11000`.

### Rationale

- Same name/slug under different parents is valid in a hierarchical catalog
- Root categories (`parent: null`) remain unique by name/slug at the root level — MongoDB treats `null` as a distinct index key value
- Brands keep global unique slugs (flat entity); categories are tree-scoped — different domain rules

### Tradeoff Accepted

- Public URLs may need full path context to disambiguate slugs (`/men/shirts` vs `/women/shirts`) — a routing/UI concern, not a database one

### Revisit Conditions

- Product URLs use bare slug without path prefix and SEO collisions become a problem

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
