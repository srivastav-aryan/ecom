/**
 * category.schema.ts
 *
 * Zod validation schemas for Category API endpoints.
 *
 * WHO OWNS THIS FILE: The catalog / merchandising team.
 * Reason to change: Category data requirements change (new hierarchy rules,
 * new fields, different description constraints).
 *
 * Covers:
 *   POST /api/catalog/categories            → createCategorySchema
 *   PUT  /api/catalog/categories/:id        → updateCategorySchema
 *   GET  /api/catalog/categories            → categoryListQuerySchema
 */
import { z } from "zod";
import {
  DEFAULT_PAGE_SIZE,
  MAX_DESCRIPTION_LENGTH,
  MAX_NAME_LENGTH,
  MAX_PAGE_SIZE,
} from "../../constants/index.js";
import { objectIdAtom, slugAtom } from "./catalog.atoms.js";

// ---------------------------------------------------------------------------
// CREATE
// ---------------------------------------------------------------------------
// parent field design:
//   null      → root category (Men, Women, Kids) — no parent
//   ObjectId  → subcategory ("Men > Topwear > T-Shirts")
//
// WHY nullable AND optional?
//   nullable  → the client can explicitly send parent: null for root categories
//   optional  → the client can omit parent entirely (service treats it as null)
//   Both together: all three states (null, absent, valid ObjectId) are handled.
//
// Zod validates structural validity ("is this a valid ObjectId format?").
// The SERVICE validates semantic validity ("does this ObjectId exist in DB?").
// Two different questions, two different layers. Don't conflate them.
//
// PARENT REPARENTING is intentionally NOT in updateCategorySchema.
// Moving a category to a new parent is a destructive tree operation:
//   - Could create circular references (A → B → A)
//   - Invalidates cached category tree
//   - Changes product URLs for all products under moved category
// This deserves its own dedicated endpoint with cycle-detection logic.
// ---------------------------------------------------------------------------
export const createCategorySchema = z.object({
  body: z.object({
    name: z
      .string({ error: "Category name is required" })
      .trim()
      .min(1, "Category name cannot be empty")
      .max(MAX_NAME_LENGTH, `Category name cannot exceed ${MAX_NAME_LENGTH} characters`),

    slug: slugAtom.optional(),

    description: z
      .string({ error: "Category description is required" })
      .trim()
      .min(5, "Category description must be at least 5 characters")
      .max(MAX_DESCRIPTION_LENGTH, `Description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters`),

    parent: objectIdAtom.nullable().optional(),
  }),
});

// ---------------------------------------------------------------------------
// UPDATE
// ---------------------------------------------------------------------------
// Absent from update (intentional):
//   slug   → immutable (SEO, URL stability)
//   parent → requires dedicated reparenting endpoint (cycle safety, see above)
// ---------------------------------------------------------------------------
export const updateCategorySchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(1).max(MAX_NAME_LENGTH).optional(),

      description: z
        .string()
        .trim()
        .min(5, "Category description must be at least 5 characters")
        .max(MAX_DESCRIPTION_LENGTH)
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
// parent filter: GET /categories?parent=<categoryId>
//   → returns direct children of that parent category
//   Used to build the category tree lazily (load children on drill-down).
// ---------------------------------------------------------------------------
export const categoryListQuerySchema = z.object({
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

    // Filter to direct children of a specific parent category.
    parent: objectIdAtom.optional(),
  }),
});

// ---------------------------------------------------------------------------
// Inferred TypeScript types
// ---------------------------------------------------------------------------
export type CreateCategoryInput = z.infer<typeof createCategorySchema>["body"];
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>["body"];
export type CategoryListQuery   = z.infer<typeof categoryListQuerySchema>["query"];
