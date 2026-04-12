/**
 * variant.schema.ts
 *
 * Zod validation schemas for ProductVariant API endpoints.
 *
 * WHO OWNS THIS FILE: The inventory / warehouse team.
 * Reason to change: Variant data requirements change — new physical attributes
 * tracked, pricing rules evolve, stock-on-create policy changes.
 *
 * Covers:
 *   POST /api/catalog/products/:productId/variants   → createProductVariantSchema
 *   PUT  /api/catalog/variants/:id                   → updateProductVariantSchema
 */
import { z } from "zod";
import {
  MAX_ATTRIBUTES_PER_VARIANT,
  MAX_IMAGES_PER_VARIANT,
  MAX_SKU_LENGTH,
  SKU_REGEX,
} from "../../constants/index.js";
import {
  attributeAtom,
  imagesAtom,
  objectIdAtom,
  priceAtom,
  slugAtom,
} from "./catalog.atoms.js";

// ---------------------------------------------------------------------------
// CREATE
// ---------------------------------------------------------------------------
// productId comes from route PARAMS (/products/:productId/variants), not body.
// The controller reads req.params.productId and passes it to the service.
// Validating it here (in params) means a bad ID is a clean 400, not a 500.
//
// sku normalisation: .toUpperCase() runs BEFORE .regex().
// "ls-red-xl" → "LS-RED-XL" → passes SKU_REGEX.
// This prevents "LS-RED-XL" and "ls-red-xl" from appearing as different SKUs.
// The DB has a unique index on sku — without normalisation, you can have
// "duplicate" SKUs that differ only in case, a warehouse reconciliation nightmare.
//
// stockQuantity IS present on create (opening stock when variant first arrives).
// It is explicitly ABSENT from updateProductVariantSchema.
// Stock mutations after creation MUST go through InventoryService exclusively,
// which uses atomic $inc operations with optimistic locking to prevent overselling.
// Allowing free stockQuantity updates here would bypass that safety mechanism.
//
// Price cross-field rules via .superRefine() (not .refine()):
//   - sellingPrice must be ≤ mrp  (consumer protection, Legal Metrology Act India)
//   - costPrice (if given) should be ≤ sellingPrice  (negative margin guard)
//
// Why .superRefine() over .refine()?
//   .refine() adds ONE error at the object root level.
//   .superRefine() lets us call ctx.addIssue() multiple times, each with a
//   specific `path` pointing to the exact field. The frontend gets the error
//   pinned to the "sellingPrice" input, not just a vague form-level message.
// ---------------------------------------------------------------------------
export const createProductVariantSchema = z.object({
  body: z
    .object({
      name: z
        .string({ error: "Variant name is required" })
        .trim()
        .min(3, "Variant name must be at least 3 characters")
        .max(100, "Variant name cannot exceed 100 characters"),

      slug: slugAtom.optional(),

      description: z
        .string()
        .trim()
        .max(1000, "Variant description cannot exceed 1000 characters")
        .optional()
        .default(""),

      sku: z
        .string({ error: "SKU is required" })
        .trim()
        .toUpperCase()
        .min(3, "SKU must be at least 3 characters")
        .max(MAX_SKU_LENGTH, `SKU cannot exceed ${MAX_SKU_LENGTH} characters`)
        .regex(
          SKU_REGEX,
          "SKU must be uppercase alphanumeric (hyphens and underscores allowed)",
        ),

      sellingPrice: priceAtom,
      mrp:          priceAtom,

      // Optional — not all catalog managers track cost at variant creation time.
      // NEVER returned in public API responses (service-level .select("-costPrice")).
      costPrice: priceAtom.optional(),

      // Opening stock. All subsequent mutations → InventoryService only.
      stockQuantity: z
        .number()
        .int("Stock must be a whole number — no fractional units")
        .min(0, "Stock cannot be negative")
        .default(0),

      weightInGrams: z
        .number()
        .int("Weight must be whole grams — no fractional grams")
        .min(0, "Weight cannot be negative")
        .default(0),

      attributes: z
        .array(attributeAtom)
        .min(1, "At least one attribute is required (e.g. Size, Color)")
        .max(
          MAX_ATTRIBUTES_PER_VARIANT,
          `Cannot have more than ${MAX_ATTRIBUTES_PER_VARIANT} attributes`,
        )
        // Duplicate attribute NAMES (not values) within one variant are nonsensical.
        // [{ name: "Color", value: "Red" }, { name: "Color", value: "Blue" }]
        // means "this variant is both Red AND Blue simultaneously" — impossible.
        .refine(
          (attrs) => {
            const names = attrs.map((a) => a.name.toLowerCase());
            return new Set(names).size === names.length;
          },
          { message: "Duplicate attribute names are not allowed in a single variant" },
        ),

      images: imagesAtom(MAX_IMAGES_PER_VARIANT),
    })
    .superRefine((data, ctx) => {
      if (data.sellingPrice > data.mrp) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Selling price cannot exceed MRP",
          path: ["sellingPrice"],
        });
      }

      if (data.costPrice !== undefined && data.costPrice > data.sellingPrice) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Cost price exceeds selling price — this variant would sell at negative margin",
          path: ["costPrice"],
        });
      }
    }),

  params: z.object({
    productId: objectIdAtom,
  }),
});

// ---------------------------------------------------------------------------
// UPDATE
// ---------------------------------------------------------------------------
// SECURITY BOUNDARIES — these fields are DELIBERATELY ABSENT from update.
// This is not an oversight. Read this before adding anything here.
//
//   sku
//     Immutable after creation. Every order record, invoice, warehouse manifest,
//     and shipment label ever generated references the SKU. Changing it
//     orphans all historical data. If a SKU must change, create a new variant
//     and soft-delete the old one — never mutate it.
//
//   productId
//     Immutable. A variant's parent product is fixed at creation.
//     "Moving" a variant to another product would require re-validating all
//     its attributes against the new product's category, re-indexing, and
//     potentially invalidating cart items. This is a destructive operation
//     that needs its own dedicated migration flow, not a casual update field.
//
//   stockQuantity
//     ONLY mutated via InventoryService with atomic $inc + optimistic locking.
//     Free updates here bypass reservation checks → overselling (you sell stock
//     you've already reserved for pending orders). Never allow this path.
//
//   reservedQuantity
//     Internal inventory state machine. This number is managed exclusively by
//     the order/reservation system. It is never user-facing. Ever.
// ---------------------------------------------------------------------------
export const updateProductVariantSchema = z.object({
  body: z
    .object({
      name:        z.string().trim().min(3).max(100).optional(),
      description: z.string().trim().max(1000).optional(),

      sellingPrice: priceAtom.optional(),
      mrp:          priceAtom.optional(),

      // nullable on update: costPrice: null → "stop tracking cost for this variant"
      costPrice: priceAtom.nullable().optional(),

      weightInGrams: z.number().int().min(0).optional(),

      attributes: z
        .array(attributeAtom)
        .min(1)
        .max(MAX_ATTRIBUTES_PER_VARIANT)
        .refine(
          (attrs) => {
            const names = attrs.map((a) => a.name.toLowerCase());
            return new Set(names).size === names.length;
          },
          { message: "Duplicate attribute names are not allowed" },
        )
        .optional(),

      images:   imagesAtom(MAX_IMAGES_PER_VARIANT).optional(),
      isActive: z.boolean().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided to update",
    })
    .superRefine((data, ctx) => {
      // Only validate price relationship when BOTH are in this specific update payload.
      // If only sellingPrice is provided, we can't compare against the existing DB mrp —
      // that's the service's responsibility. Validate what we have here.
      if (
        data.sellingPrice !== undefined &&
        data.mrp !== undefined &&
        data.sellingPrice > data.mrp
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Selling price cannot exceed MRP",
          path: ["sellingPrice"],
        });
      }
    }),

  params: z.object({ id: objectIdAtom }),
});

// ---------------------------------------------------------------------------
// Inferred TypeScript types
// ---------------------------------------------------------------------------
export type CreateProductVariantInput = z.infer<typeof createProductVariantSchema>["body"];
export type UpdateProductVariantInput = z.infer<typeof updateProductVariantSchema>["body"];
