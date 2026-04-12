/**
 * catalog.atoms.ts
 *
 * Internal building blocks for catalog validation schemas.
 *
 * WHO OWNS THIS FILE: The platform/infrastructure team.
 * Reason to change: a fundamental rule about what constitutes a valid ID,
 * slug, price, image URL, or attribute across the ENTIRE catalog domain.
 *
 * These are NOT exported from the package public API (not in catalog/index.ts).
 * Consumers of @e-com/shared import schemas and types, never raw atoms.
 * Atoms are an internal implementation detail — encapsulated here.
 */
import { z } from "zod";
import {
  IMAGE_URL_REGEX,
  MAX_ATTRIBUTE_META_LENGTH,
  MAX_ATTRIBUTE_NAME_LENGTH,
  MAX_ATTRIBUTE_VALUE_LENGTH,
  MAX_PRODUCT_PRICE,
  MAX_SLUG_LENGTH,
  MIN_PRODUCT_PRICE,
  MONGODB_OBJECT_ID_REGEX,
  SLUG_REGEX,
} from "../../constants/index.js";

// ---------------------------------------------------------------------------
// objectIdAtom
// ---------------------------------------------------------------------------
// MongoDB ObjectId: exactly 24 hexadecimal characters.
//
// Why .length(24) BEFORE .regex()?
//   Fail-fast ordering. A 1 MB garbage string fails at length(24) in nanoseconds.
//   The regex never runs on clearly-wrong-length input — zero CPU wasted.
//
// Why regex at all (not just length)?
//   "zzzzzzzzzzzzzzzzzzzzzzzz" is 24 chars but not a valid ObjectId.
//   MongoDB accepts it as a string key but findById() returns null,
//   making your service throw NOT_FOUND when the real problem is the ID itself.
//   Regex guarantees only hex characters — actual ObjectId alphabet.
//
// Why NOT transform to new mongoose.Types.ObjectId(val)?
//   This file lives in @e-com/shared — imported by BOTH backend and frontend.
//   Mongoose is a backend-only dependency. Importing it here breaks the frontend.
//   Keep atoms as string validators; let Mongoose auto-cast in the service layer.
// ---------------------------------------------------------------------------
export const objectIdAtom = z
  .string({ error: "ID is required" })
  .length(24, "Invalid ID: must be exactly 24 characters")
  .regex(MONGODB_OBJECT_ID_REGEX, "Invalid ID: must be a hexadecimal string");

// ---------------------------------------------------------------------------
// slugAtom
// ---------------------------------------------------------------------------
// URL-safe identifier: lowercase alphanumeric words joined by single hyphens.
// Valid:   "levis-511-slim-fit-jeans"
// Invalid: "Levis--Jeans", "levis_jeans", "-levis", "levis-"
//
// Transform order matters:
//   1. .trim()        → strips leading/trailing whitespace
//   2. .toLowerCase() → normalises case BEFORE regex runs
//   3. .regex()       → validates the already-normalised value
//
// This means "  Levi's Classic  " → trim → "Levi's Classic" → lower → ...
// Note: the regex still rejects apostrophes — slug generation (service layer)
// strips them. If admin provides a slug, it must already be clean.
//
// Slug is INTENTIONALLY IMMUTABLE after creation (no updateXxxSchema has slug).
// Reason: changing a slug breaks all existing URLs, backlinks, and Google rankings.
// ---------------------------------------------------------------------------
export const slugAtom = z
  .string()
  .trim()
  .toLowerCase()
  .min(2, "Slug must be at least 2 characters")
  .max(MAX_SLUG_LENGTH, `Slug cannot exceed ${MAX_SLUG_LENGTH} characters`)
  .regex(
    SLUG_REGEX,
    "Slug must be lowercase alphanumeric words separated by single hyphens",
  );

// ---------------------------------------------------------------------------
// priceAtom
// ---------------------------------------------------------------------------
// Monetary value in INR (Indian Rupees).
//
// Why .multipleOf(0.01)?
//   Prices are monetary — at most 2 decimal places.
//   Without this: 1499.9999999 (a floating-point arithmetic artifact) could
//   be stored. That corrupts GST calculations, invoice totals, and margin reports.
//
// Cross-field rules (sellingPrice <= mrp, costPrice <= sellingPrice) live
// in .superRefine() on the PARENT object schema — they need both fields in
// scope simultaneously, which individual atoms can't see.
// ---------------------------------------------------------------------------
export const priceAtom = z
  .number({ error: "Price must be a number" })
  .min(MIN_PRODUCT_PRICE, `Price must be at least ₹${MIN_PRODUCT_PRICE}`)
  .max(MAX_PRODUCT_PRICE, `Price cannot exceed ₹${MAX_PRODUCT_PRICE}`)
  .multipleOf(0.01, "Price can have at most 2 decimal places");

// ---------------------------------------------------------------------------
// imageUrlAtom
// ---------------------------------------------------------------------------
// A single image URL. Must be HTTPS.
//
// Why enforce HTTPS?
//   Your app is served over HTTPS. An HTTP image causes mixed-content browser
//   warnings/blocks — the browser refuses to load insecure assets on secure pages.
//   Images are uploaded to S3/Cloudinary which always return HTTPS URLs.
//   Catch non-HTTPS at the API boundary, not discovered later in the browser.
//
// We do NOT validate image format (jpg/webp/png).
//   That's Cloudinary/S3's job. By the time a URL exists, the file is already
//   uploaded and validated by the storage provider. We validate URL structure.
// ---------------------------------------------------------------------------
export const imageUrlAtom = z
  .string()
  .url("Must be a valid URL")
  .max(500, "Image URL is too long")
  .regex(IMAGE_URL_REGEX, "Image URL must use HTTPS");

// ---------------------------------------------------------------------------
// imagesAtom (factory)
// ---------------------------------------------------------------------------
// Returns an image array validator with a configurable maximum count.
//
// Why a factory and not a static atom?
//   Products allow up to MAX_IMAGES_PER_PRODUCT.
//   Variants allow up to MAX_IMAGES_PER_VARIANT.
//   Same validation logic, different cap. A factory is DRY without sacrificing
//   the ability to apply different limits per entity.
//
// .default([]) — missing "images" key is treated as empty array, not an error.
// ---------------------------------------------------------------------------
export const imagesAtom = (maxImages: number) =>
  z
    .array(imageUrlAtom)
    .max(maxImages, `Cannot upload more than ${maxImages} images`)
    .default([]);

// ---------------------------------------------------------------------------
// attributeAtom
// ---------------------------------------------------------------------------
// A single product variant attribute: { name, value, meta? }
// Example: { name: "Color", value: "Navy Blue", meta: "#000080" }
//
// This atom is shared between createProductVariantSchema AND
// updateProductVariantSchema. The shape is identical — only the array
// wrapper differs (required on create, optional on update).
// Defining it once prevents the shape from drifting between create and update.
//
// meta is a UI hint (e.g. "#FF0000" for a colour swatch).
// We do NOT validate that meta IS a hex code — meta could be anything
// (e.g. "Slim fit" for a cut attribute). Keep it flexible.
// ---------------------------------------------------------------------------
export const attributeAtom = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Attribute name is required")
    .max(
      MAX_ATTRIBUTE_NAME_LENGTH,
      `Attribute name cannot exceed ${MAX_ATTRIBUTE_NAME_LENGTH} characters`,
    ),

  value: z
    .string()
    .trim()
    .min(1, "Attribute value is required")
    .max(
      MAX_ATTRIBUTE_VALUE_LENGTH,
      `Attribute value cannot exceed ${MAX_ATTRIBUTE_VALUE_LENGTH} characters`,
    ),

  meta: z
    .string()
    .trim()
    .max(
      MAX_ATTRIBUTE_META_LENGTH,
      `Attribute meta cannot exceed ${MAX_ATTRIBUTE_META_LENGTH} characters`,
    )
    .optional(),
});
