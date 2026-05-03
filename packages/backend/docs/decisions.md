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
