/**
 * product.schema.ts
 *
 * Zod validation schemas for Product API endpoints.
 *
 * WHO OWNS THIS FILE: The product catalog team.
 * Reason to change: Product data requirements change — new fields added,
 * GST rates updated, HSN code rules change, description constraints revised.
 *
 * Covers:
 *   POST /api/catalog/products           → createProductSchema
 *   PUT  /api/catalog/products/:id       → updateProductSchema
 *   GET  /api/catalog/products           → productListQuerySchema
 */
import { z } from "zod";
import {
  DEFAULT_PAGE_SIZE,
  HSN_CODE_REGEX,
  MAX_DESCRIPTION_LENGTH,
  MAX_NAME_LENGTH,
  MAX_PAGE_SIZE,
  MAX_TAG_LENGTH,
  MAX_TAGS_PER_PRODUCT,
  MAX_IMAGES_PER_PRODUCT,
} from "../../constants/index.js";
import { imagesAtom, objectIdAtom, slugAtom } from "./catalog.atoms.js";

// ---------------------------------------------------------------------------
// CREATE
// ---------------------------------------------------------------------------
// category and brand are ObjectIds from admin dropdowns.
// Flow: admin loads the create-product page → frontend calls GET /categories
// and GET /brands → gets JSON with _ids → renders dropdowns with human names
// but ObjectId values → admin picks "Men's Shirts" → form submits ObjectId.
// The human never sees the ID. The form's <option value="..."> holds it.
//
// gstRate: z.union([z.literal(5), z.literal(12)]) NOT z.enum([5, 12]).
// In Zod v4, z.enum() coerces numeric values to strings internally.
// Your service would receive "5" (string) not 5 (number), breaking the
// Mongoose enum: [5, 12] type check. Use z.literal for numeric discriminants.
//
// tags deduplication: tags.map(toLowerCase) → new Set → back to array.
// Why? ["Cotton", "cotton", "COTTON"] should be stored as ["cotton"] — one tag.
// Tags drive search and faceted filtering; duplicates in different cases waste
// index space and can skew tag-count aggregations.
//
// vendorId is ABSENT — set by the system from req.user, never from client input.
// Zod strips unknown keys by default, so even if an attacker sends
// { vendorId: "other-vendor" }, it's silently dropped before the service sees it.
// ---------------------------------------------------------------------------
export const createProductSchema = z.object({
  body: z.object({
    name: z
      .string({ error: "Product name is required" })
      .trim()
      .min(3, "Product name must be at least 3 characters")
      .max(MAX_NAME_LENGTH, `Product name cannot exceed ${MAX_NAME_LENGTH} characters`),

    slug: slugAtom.optional(),

    // min(20) is deliberate for SEO. Google penalises thin product pages.
    // "Nice shirt." is not a product description; it's a stub.
    description: z
      .string({ error: "Product description is required" })
      .trim()
      .min(20, "Product description must be at least 20 characters")
      .max(MAX_DESCRIPTION_LENGTH, `Description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters`),

    category: objectIdAtom,
    brand: objectIdAtom,

    // Indian regulatory requirement for GST invoicing.
    // Chapter 61 (knitted clothing), 62 (woven clothing), 63 (other textiles).
    // An invalid HSN code causes document holds at customs and GST filing errors.
    hsnCode: z
      .string({ error: "HSN code is required" })
      .regex(
        HSN_CODE_REGEX,
        "Invalid HSN code — must be Chapter 61, 62, or 63 (e.g. 6109, 620342)",
      ),

    // Numeric literal union — see note above about z.enum vs z.union for numbers.
    gstRate: z
      .union([z.literal(5), z.literal(12)], { error: "GST rate must be 5 or 12" })
      .default(5),

    images: imagesAtom(MAX_IMAGES_PER_PRODUCT),

    tags: z
      .array(
        z
          .string()
          .trim()
          .toLowerCase()
          .min(1, "Tag cannot be empty")
          .max(MAX_TAG_LENGTH, `Tag cannot exceed ${MAX_TAG_LENGTH} characters`),
      )
      .max(MAX_TAGS_PER_PRODUCT, `Cannot have more than ${MAX_TAGS_PER_PRODUCT} tags`)
      .default([])
      .transform((tags) => [...new Set(tags)]),
  }),
});

// ---------------------------------------------------------------------------
// UPDATE
// ---------------------------------------------------------------------------
// Absent from update (intentional):
//
//   slug      → immutable (SEO, backlinks, all shared URLs)
//   vendorId  → system-set only, never client-settable
// ---------------------------------------------------------------------------
export const updateProductSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(3).max(MAX_NAME_LENGTH).optional(),

      description: z.string().trim().min(20).max(MAX_DESCRIPTION_LENGTH).optional(),

      category: objectIdAtom.optional(),
      brand: objectIdAtom.optional(),

      hsnCode: z.string().regex(HSN_CODE_REGEX, "Invalid HSN code").optional(),

      gstRate: z.union([z.literal(5), z.literal(12)]).optional(),

      images: imagesAtom(MAX_IMAGES_PER_PRODUCT).optional(),

      tags: z
        .array(z.string().trim().toLowerCase().min(1).max(MAX_TAG_LENGTH))
        .max(MAX_TAGS_PER_PRODUCT)
        .transform((tags) => [...new Set(tags)])
        .optional(),

      isActive: z.boolean().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided to update",
    }),

  params: z.object({ id: objectIdAtom }),
});

// ---------------------------------------------------------------------------
// LIST QUERY
// ---------------------------------------------------------------------------
// All query params arrive as STRINGS from Express — ?page=1 gives "1" not 1.
// .transform(Number) + .pipe() converts and validates the numeric result.
//
// limit hard-capped at MAX_PAGE_SIZE.
// Without cap: ?limit=999999 → Mongoose loads and serialises hundreds of
// thousands of documents → guaranteed OOM or request timeout under load.
//
// tags: comma-separated string → array
//   ?tags=cotton,denim → ["cotton", "denim"]
//   Standard REST convention for multi-value query params.
//
// isActive: "true"/"false" string → boolean.
//   z.boolean() alone fails on query strings because "true" !== true.
//   z.enum(["true","false"]).transform() is the correct pattern.
//
// minPrice/maxPrice: undefined if absent (not 0).
//   Using undefined (not 0) lets the service know "no filter was requested"
//   vs "user wants products at exactly ₹0". Semantically different.
// ---------------------------------------------------------------------------
export const productListQuerySchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .default(String(1))
      .transform(Number)
      .pipe(z.number().int().positive("Page must be a positive integer")),

    limit: z
      .string()
      .optional()
      .default(String(DEFAULT_PAGE_SIZE))
      .transform(Number)
      .pipe(
        z
          .number()
          .int()
          .positive("Limit must be a positive integer")
          .max(MAX_PAGE_SIZE, `Limit cannot exceed ${MAX_PAGE_SIZE}`),
      ),

    categoryId: objectIdAtom.optional(),
    brandId:    objectIdAtom.optional(),

    minPrice: z
      .string()
      .optional()
      .transform((val) => (val !== undefined ? Number(val) : undefined))
      .pipe(z.number().min(0, "Minimum price cannot be negative").optional()),

    maxPrice: z
      .string()
      .optional()
      .transform((val) => (val !== undefined ? Number(val) : undefined))
      .pipe(z.number().min(0, "Maximum price cannot be negative").optional()),

    tags: z
      .string()
      .optional()
      .transform((val) =>
        val
          ? val.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean)
          : undefined,
      ),

    // Default: true — public product listings show only active products.
    // Admin dashboards pass isActive=false explicitly to see deactivated items.
    isActive: z
      .enum(["true", "false"])
      .optional()
      .default("true")
      .transform((val) => val === "true"),

    // Capped to prevent abuse of DB text search indexes with huge inputs.
    search: z.string().trim().max(200, "Search query too long").optional(),
  }),
});

// ---------------------------------------------------------------------------
// Inferred TypeScript types
// ---------------------------------------------------------------------------
export type CreateProductInput = z.infer<typeof createProductSchema>["body"];
export type UpdateProductInput = z.infer<typeof updateProductSchema>["body"];
export type ProductListQuery   = z.infer<typeof productListQuerySchema>["query"];
