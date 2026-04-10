// ─── Auth ────────────────────────────────────────────────────────────────────

export const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

export const password_Min_Length = 8;

export const password_Max_Length = 16;

export const name_Regex = /^[a-zA-Z\s]+$/;

// ─── Catalog — Regex Patterns ─────────────────────────────────────────────────

/**
 * MongoDB ObjectId: exactly 24 hexadecimal characters.
 * We check length FIRST (fail-fast), then regex (fail-safe).
 * Anchored with ^ and $ so partial matches are impossible.
 * Linear O(24) — no backtracking risk whatsoever.
 */
export const MONGODB_OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

/**
 * Slug: lowercase alphanumeric words separated by single hyphens.
 * Valid:   "levis-511-slim-fit-jeans"
 * Invalid: "Levis--Jeans", "levis_jeans", "-levis", "levis-"
 *
 * Pattern breakdown:
 *   ^[a-z0-9]+        → must start with at least one alphanumeric char
 *   (?:-[a-z0-9]+)*   → optionally followed by (hyphen + alphanumerics), zero or more times
 *   $                 → nothing else allowed
 *
 * We also .trim() and .toLowerCase() BEFORE this regex runs in the schema,
 * so the regex never receives untransformed input.
 */
export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Indian HSN (Harmonized System of Nomenclature) codes for fashion:
 *   Chapter 61 — knitted / crocheted clothing (T-shirts, knitwear)
 *   Chapter 62 — woven clothing (shirts, trousers, dresses)
 *   Chapter 63 — other textile articles (home textiles, scarves)
 *
 * Format: 4 digits (6101), 6 digits (610510), or 8 digits (61051000)
 * This is a REAL regulatory requirement for GST invoicing in India.
 * An invalid HSN code causes issues at customs and GST filings.
 */
export const HSN_CODE_REGEX = /^(61|62|63)\d{2}(\d{2})?(\d{2})?$/;

/**
 * SKU (Stock Keeping Unit): uppercase alphanumeric, hyphens and underscores allowed.
 * Examples: "LS-511-RED-XL", "AS_SHIRT_001"
 * We .toUpperCase() BEFORE this regex — so "ls-red-xl" normalises to "LS-RED-XL".
 * Must start and end with an alphanumeric char (no leading/trailing hyphens).
 */
export const SKU_REGEX = /^[A-Z0-9]([A-Z0-9\-_]*[A-Z0-9])?$/;

/**
 * Image URLs must be HTTPS.
 * Why? Your frontend is served over HTTPS. HTTP image URLs cause mixed-content
 * browser warnings/blocks. Catch this at the API layer, not at runtime in browser.
 * Images go to S3 / Cloudinary — both always return HTTPS URLs.
 */
export const IMAGE_URL_REGEX = /^https:\/\/.+/;

// ─── Catalog — String Length Caps ─────────────────────────────────────────────

export const MAX_NAME_LENGTH = 150;
export const MAX_DESCRIPTION_LENGTH = 5000;
export const MAX_TAG_LENGTH = 50;
export const MAX_SKU_LENGTH = 100;
export const MAX_SLUG_LENGTH = 200;
export const MAX_ATTRIBUTE_NAME_LENGTH = 50;
export const MAX_ATTRIBUTE_VALUE_LENGTH = 100;
// meta is for UI hints like hex colour codes ("#FF0000" = 7 chars).
// 30 gives room for other short UI hints without being open-ended.
export const MAX_ATTRIBUTE_META_LENGTH = 30;

// ─── Catalog — Array Size Caps ────────────────────────────────────────────────

// Products go to S3/Cloudinary BEFORE the API call — these are already-uploaded URLs.
// 10 images per product is generous for fashion. Variants need fewer (angle shots).
export const MAX_IMAGES_PER_PRODUCT = 10;
export const MAX_IMAGES_PER_VARIANT = 5;

// Tags power search and filtering. 20 is plenty; beyond that is spam.
export const MAX_TAGS_PER_PRODUCT = 20;

// Each variant describes ONE variation (e.g. Size=XL, Color=Red, Material=Cotton).
// 10 attributes is generous. Most fashion variants have 2-3.
export const MAX_ATTRIBUTES_PER_VARIANT = 10;

// ─── Catalog — Price Bounds (INR) ────────────────────────────────────────────

// Re 1 minimum — prevents accidental ₹0 products going live.
export const MIN_PRODUCT_PRICE = 1;

// ₹10,00,000 ceiling — a sanity check. Any price above this is almost certainly
// a data entry error (e.g. someone typed 1000000 instead of 100000).
export const MAX_PRODUCT_PRICE = 1_000_000;

// ─── Catalog — Pagination Defaults ───────────────────────────────────────────

export const DEFAULT_PAGE_SIZE = 20;

// Hard cap on page size. Without this, ?limit=999999 forces Mongoose to load
// and serialize hundreds of thousands of documents — guaranteed OOM crash.
export const MAX_PAGE_SIZE = 100;
