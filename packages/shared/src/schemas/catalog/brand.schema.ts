/*
 * brand.schema.ts
 *
 * Zod validation schemas for Brand API endpoints.
 *

 * Covers:
 *   POST   /api/catalog/brands            → createBrandSchema
 *   PATCH  /api/catalog/brands/:id        → updateBrandSchema
 *   GET    /api/catalog/brands            → brandListQuerySchema
 *   GET    /api/catalog/brands/:id        → brandIdParamSchema
 *   GET    /api/catalog/brands/slug/:slug → brandSlugParamSchema
 *   DELETE /api/catalog/brands/:id        → brandIdParamSchema
 */
import { z } from "zod";
import { MAX_DESCRIPTION_LENGTH, MAX_NAME_LENGTH, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "../../constants/index.js";
import { imageUrlAtom, objectIdAtom, slugAtom } from "./catalog.atoms.js";

// ---------------------------------------------------------------------------
// CREATE
// ---------------------------------------------------------------------------
// slug is optional: if absent, the service generates one from `name`.
//   "Allen Solly" → "allen-solly"
// logo is optional at creation — brand logos are often added after the initial
//   record is created, once the asset is ready.
// isActive is NOT here — brands are always active by default (DB default: true).
//   Active status can only be toggled via an update, never set at creation.
// ---------------------------------------------------------------------------
export const createBrandSchema = z.object({
  body: z.object({
    name: z
      .string({ error: "Brand name is required" })
      .trim()
      .min(1, "Brand name cannot be empty")
      .max(MAX_NAME_LENGTH, `Brand name cannot exceed ${MAX_NAME_LENGTH} characters`),

    slug: slugAtom.optional(),

    description: z
      .string({ error: "Brand description is required" })
      .trim()
      .min(10, "Brand description must be at least 10 characters")
      .max(MAX_DESCRIPTION_LENGTH, `Description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters`),

    logo: imageUrlAtom.optional(),
  }),
});

// ---------------------------------------------------------------------------
// UPDATE
// ---------------------------------------------------------------------------
// Key asymmetries vs createBrandSchema (intentional, not accidental):
//
//   slug     → ABSENT. Immutable after creation. Changing it breaks all
//              existing URLs, Google rankings, and shared links.
//
//   logo     → nullable here (logo: null removes the logo).
//              On create, null makes no sense — you'd just omit the field.
//
//   isActive → ONLY in update. A brand is created active. You deactivate later.
//
// .refine() on body ensures the client actually sent something useful.
// A PATCH with an empty {} body is a no-op DB write — wasteful under load.
// ---------------------------------------------------------------------------
export const updateBrandSchema = z.object({
  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(1)
        .max(MAX_NAME_LENGTH, `Brand name cannot exceed ${MAX_NAME_LENGTH} characters`)
        .optional(),

      description: z
        .string()
        .trim()
        .min(10, "Brand description must be at least 10 characters")
        .max(MAX_DESCRIPTION_LENGTH)
        .optional(),

      logo: imageUrlAtom.nullable().optional(),

      isActive: z.boolean().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided to update",
    }),

  // Validating :id in params means an invalid ObjectId is rejected as a clean
  // 400 here — not as a Mongoose CastError 500 inside the service.
  params: z.object({
    id: objectIdAtom,
  }),
});

// ---------------------------------------------------------------------------
// PARAM-ONLY SCHEMAS
// ---------------------------------------------------------------------------
// Routes that have NO body — the only input is the URL parameter.
// Used by: GET /brands/:id, DELETE /brands/:id, GET /brands/slug/:slug
//
// Why not inline these in each route? DRY. The objectIdAtom validation is
// identical for get-by-id and delete. Centralise it here, reuse everywhere.
//
// The update schema has its OWN params block (identical shape) because it
// also carries a body. Extracting and composing would add complexity with
// z.intersection / .merge — not worth it for one shared field.
// ---------------------------------------------------------------------------
export const brandIdParamSchema = z.object({
  params: z.object({
    id: objectIdAtom,
  }),
});

export const brandSlugParamSchema = z.object({
  params: z.object({
    slug: slugAtom,
  }),
});

// ---------------------------------------------------------------------------
// LIST QUERY
// ---------------------------------------------------------------------------
// All query params arrive as STRINGS from Express (req.query).
// ?page=1 gives req.query.page = "1" (string), not 1 (number).
// .transform(Number) + .pipe() converts and validates.
//
// isActive defaults to "true" — public listing only shows active brands.
// Admin panels can explicitly pass isActive=false to see deactivated brands.
// ---------------------------------------------------------------------------
export const brandListQuerySchema = z.object({
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
        z.number().int().positive().max(MAX_PAGE_SIZE, `Limit cannot exceed ${MAX_PAGE_SIZE}`),
      ),

    isActive: z
      .enum(["true", "false"])
      .optional()
      .default("true")
      .transform((val) => val === "true"),

    search: z.string().trim().max(200, "Search query too long").optional(),
  }),
});

// ---------------------------------------------------------------------------
// Inferred TypeScript types
// ---------------------------------------------------------------------------
// z.infer gives us types FOR FREE from the schema shape.
// No duplicate interface needed. Change the schema → type updates automatically.
// These are what service method signatures use as parameter types.
// ---------------------------------------------------------------------------
export type CreateBrandInput = z.infer<typeof createBrandSchema>["body"];
export type UpdateBrandInput = z.infer<typeof updateBrandSchema>["body"];
export type BrandListQuery   = z.infer<typeof brandListQuerySchema>["query"];
