import { z } from "zod";
import {
  DEFAULT_PAGE_SIZE,
  HSN_CODE_REGEX,
  IMAGE_URL_REGEX,
  MAX_ATTRIBUTE_META_LENGTH,
  MAX_ATTRIBUTE_NAME_LENGTH,
  MAX_ATTRIBUTE_VALUE_LENGTH,
  MAX_ATTRIBUTES_PER_VARIANT,
  MAX_DESCRIPTION_LENGTH,
  MAX_IMAGES_PER_PRODUCT,
  MAX_IMAGES_PER_VARIANT,
  MAX_NAME_LENGTH,
  MAX_PAGE_SIZE,
  MAX_PRODUCT_PRICE,
  MAX_SKU_LENGTH,
  MAX_SLUG_LENGTH,
  MAX_TAG_LENGTH,
  MAX_TAGS_PER_PRODUCT,
  MIN_PRODUCT_PRICE,
  MONGODB_OBJECT_ID_REGEX,
  SKU_REGEX,
  SLUG_REGEX,
} from "../types/constants.js";

const objectIdAtom = z
  .string({ error: "ID is required" })
  .length(24, "Invalid ID: must be exactly 24 characters")
  .regex(MONGODB_OBJECT_ID_REGEX, "Invalid ID: must be a hexadecimal string");

const slugAtom = z
  .string()
  .trim()
  .toLowerCase()
  .min(2, "Slug must be at least 2 characters")
  .max(MAX_SLUG_LENGTH, `Slug cannot exceed ${MAX_SLUG_LENGTH} characters`)
  .regex(
    SLUG_REGEX,
    "Slug must be lowercase alphanumeric words separated by hyphens",
  );

const priceAtom = z
  .number({
    error: "Price must be a number",
  })
  .min(MIN_PRODUCT_PRICE, `Price must be at least ₹${MIN_PRODUCT_PRICE}`)
  .max(MAX_PRODUCT_PRICE, `Price cannot exceed ₹${MAX_PRODUCT_PRICE}`)
  .multipleOf(0.01, "Price can have at most 2 decimal places");

const imageUrlAtom = z
  .string()
  .url("Must be a valid URL")
  .max(500, "Image URL is too long")
  .regex(IMAGE_URL_REGEX, "Image URL must use HTTPS");


const imagesAtom = (maxImages: number) =>
  z
    .array(imageUrlAtom)
    .max(maxImages, `Cannot upload more than ${maxImages} images`)
    .default([]);

/**
 * ATOM: Single variant attribute.
 * Shared between create and update so the shape is defined exactly once.
 */
const attributeAtom = z.object({
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

  // meta is a UI hint — e.g. "#FF0000" for a colour swatch.
  // Optional — not every attribute has a visual representation.
  meta: z
    .string()
    .trim()
    .max(
      MAX_ATTRIBUTE_META_LENGTH,
      `Attribute meta cannot exceed ${MAX_ATTRIBUTE_META_LENGTH} characters`,
    )
    .optional(),
});


// REAL SCHEMAS START FROM HERE 

// =============================================================================
// BRAND SCHEMAS
// =============================================================================
export const createBrandSchema = z.object({
  body: z.object({
    name: z
      .string({ error: "Brand name is required" })
      .trim()
      .min(1, "Brand name cannot be empty")
      .max(
        MAX_NAME_LENGTH,
        `Brand name cannot exceed ${MAX_NAME_LENGTH} characters`,
      ),

    slug: slugAtom.optional(),

    description: z
      .string({ error: "Brand description is required" })
      .trim()
      .min(10, "Brand description must be at least 10 characters")
      .max(
        MAX_DESCRIPTION_LENGTH,
        `Description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters`,
      ),

    logo: imageUrlAtom.optional(),
  }),
});

/**
 * Schema for PUT /api/catalog/brands/:id
 *
 * Differences from createBrandSchema:
 *  - All body fields are optional (it's a partial update)
 *  - logo is nullable (passing null explicitly removes the logo)
 *  - isActive is present (you can only toggle active status via update)
 *  - slug is ABSENT (immutable — changing it breaks URLs and SEO)
 *  - params.id validates the URL param as a real ObjectId
 *  - .refine() ensures at least one field was actually sent
 */
export const updateBrandSchema = z.object({
  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(1)
        .max(
          MAX_NAME_LENGTH,
          `Brand name cannot exceed ${MAX_NAME_LENGTH} characters`,
        )
        .optional(),

      description: z
        .string()
        .trim()
        .min(10, "Brand description must be at least 10 characters")
        .max(MAX_DESCRIPTION_LENGTH)
        .optional(),

      // nullable on update: logo: null → "remove the logo"
      // This asymmetry vs create is intentional.
      logo: imageUrlAtom.nullable().optional(),

      // isActive lives ONLY in update schemas.
      // Brands are always active at creation (DB default: true).
      // A brand can only be deactivated after it exists.
      isActive: z.boolean().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided to update",
    }),

  // Validate the :id URL param — prevents Mongoose CastErrors downstream.
  params: z.object({
    id: objectIdAtom,
  }),
});

// Inferred TypeScript types — zero hand-written interfaces needed.
export type CreateBrandInput = z.infer<typeof createBrandSchema>["body"];
export type UpdateBrandInput = z.infer<typeof updateBrandSchema>["body"];

// =============================================================================
// CATEGORY SCHEMAS
// =============================================================================

/**
 * Schema for POST /api/catalog/categories
 *
 * parent: ObjectId of a parent category, or null for root categories.
 *   null  → root level (Men, Women, Kids)
 *   ObjectId → subcategory (Men > Topwear > T-Shirts)
 *
 * IMPORTANT NOTE: Zod validates that parent is a *structurally valid* ObjectId.
 * It does NOT validate that this ObjectId actually exists in the DB.
 * That semantic check belongs in the service layer — Zod only knows shapes,
 * not database state.
 */
export const createCategorySchema = z.object({
  body: z.object({
    name: z
      .string({ error: "Category name is required" })
      .trim()
      .min(1, "Category name cannot be empty")
      .max(
        MAX_NAME_LENGTH,
        `Category name cannot exceed ${MAX_NAME_LENGTH} characters`,
      ),

    slug: slugAtom.optional(),

    description: z
      .string({ error: "Category description is required" })
      .trim()
      .min(5, "Category description must be at least 5 characters")
      .max(
        MAX_DESCRIPTION_LENGTH,
        `Description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters`,
      ),

    // nullable + optional = can be null (root category) or absent (defaults to null in service).
    parent: objectIdAtom.nullable().optional(),
  }),
});

/**
 * Schema for PUT /api/catalog/categories/:id
 */
export const updateCategorySchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(1).max(MAX_NAME_LENGTH).optional(),
      description: z
        .string()
        .trim()
        .min(5)
        .max(MAX_DESCRIPTION_LENGTH)
        .optional(),
      isActive: z.boolean().optional(),
      // parent is NOT here — reparenting a category is a destructive tree operation
      // that needs its own dedicated endpoint with cycle-detection logic.
      // Allowing parent changes via a generic update endpoint is asking for trouble:
      // a category could accidentally become its own ancestor.
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided to update",
    }),

  params: z.object({ id: objectIdAtom }),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>["body"];
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>["body"];

// =============================================================================
// PRODUCT SCHEMAS
// =============================================================================

/**
 * Schema for POST /api/catalog/products
 *
 * category and brand are ObjectIds — the admin picks them from dropdowns
 * on the frontend. The frontend loaded these IDs from GET /categories and
 * GET /brands. The human sees "Men's Jeans" and "Levi's"; the form submits
 * the underlying _ids. The service then validates those IDs exist in DB.
 *
 * gstRate uses z.union of z.literal — NOT z.enum.
 * In Zod v4, z.enum() works for strings. For numeric literal unions, use
 * z.union([z.literal(5), z.literal(12)]). Using z.enum([5, 12]) would
 * cause internal string coercion, and your service would receive "5" (string)
 * instead of 5 (number) — a subtle type mismatch with your Mongoose enum.
 *
 * tags deduplication: ["Cotton", "cotton"] → ["cotton"] after toLowerCase + Set.
 * Why deduplicate here? Tags drive search and filtering. Duplicate tags waste
 * index space and can skew tag-count facets in search.
 *
 * vendorId is NOT in this schema — it's set by the system from req.user,
 * never from user input. A malicious payload with vendorId: "some-other-vendor"
 * gets stripped silently by Zod (unknown keys are stripped by default).
 */
export const createProductSchema = z.object({
  body: z.object({
    name: z
      .string({ error: "Product name is required" })
      .trim()
      .min(3, "Product name must be at least 3 characters")
      .max(
        MAX_NAME_LENGTH,
        `Product name cannot exceed ${MAX_NAME_LENGTH} characters`,
      ),

    slug: slugAtom.optional(),

    // min(20) is intentional — "Nice shirt." is not a product description.
    // Short descriptions hurt SEO (Google penalises thin content) and UX.
    description: z
      .string({ error: "Product description is required" })
      .trim()
      .min(20, "Product description must be at least 20 characters")
      .max(
        MAX_DESCRIPTION_LENGTH,
        `Description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters`,
      ),

    // ObjectIds from the admin's category/brand dropdowns.
    // Zod validates: "is this string a valid ObjectId format?"
    // Service validates: "does a document with this _id actually exist?"
    // Two different questions, two different layers.
    category: objectIdAtom,
    brand: objectIdAtom,

    // Indian regulatory requirement for GST invoicing.
    // Chapter 61 (knitted), 62 (woven), 63 (other textiles).
    hsnCode: z
      .string({ error: "HSN code is required" })
      .regex(
        HSN_CODE_REGEX,
        "Invalid HSN code — must be Chapter 61, 62, or 63 (e.g. 6109, 620342)",
      ),

    // Numeric literal union — see note above about z.enum vs z.union for numbers.
    gstRate: z
      .union([z.literal(5), z.literal(12)], {
        error: "GST rate must be 5 or 12",
      })
      .default(5),

    images: imagesAtom(MAX_IMAGES_PER_PRODUCT),

    tags: z
      .array(
        z
          .string()
          .trim()
          .toLowerCase()
          .min(1, "Tag cannot be empty")
          .max(
            MAX_TAG_LENGTH,
            `Tag cannot exceed ${MAX_TAG_LENGTH} characters`,
          ),
      )
      .max(
        MAX_TAGS_PER_PRODUCT,
        `Cannot have more than ${MAX_TAGS_PER_PRODUCT} tags`,
      )
      .default([])
      // Deduplicate AFTER lowercasing: ["Cotton","cotton"] → Set → ["cotton"]
      // A Set on strings is fine here — we're working with simple primitive values.
      .transform((tags) => [...new Set(tags)]),
  }),
});

/**
 * Schema for PUT /api/catalog/products/:id
 *
 * Deliberately absent fields and why:
 *   slug      — immutable (SEO, backlinks)
 *   vendorId  — system-set, never user-set
 */
export const updateProductSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(3).max(MAX_NAME_LENGTH).optional(),
      description: z
        .string()
        .trim()
        .min(20)
        .max(MAX_DESCRIPTION_LENGTH)
        .optional(),
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

export type CreateProductInput = z.infer<typeof createProductSchema>["body"];
export type UpdateProductInput = z.infer<typeof updateProductSchema>["body"];

// =============================================================================
// PRODUCT VARIANT SCHEMAS
// =============================================================================

/**
 * Schema for POST /api/catalog/products/:productId/variants
 *
 * productId comes from the route PARAMS, not the body.
 * The route is /products/:productId/variants — RESTful nesting.
 * The controller reads req.params.productId and passes it to the service.
 * It never needs to be in the body.
 *
 * stockQuantity IS present on create — when a new variant is first added,
 * you typically know the opening stock (e.g. 50 units just arrived).
 * stockQuantity is ABSENT from the update schema because stock mutations
 * must go through InventoryService exclusively (atomic operations, reservations).
 *
 * sku is normalised to uppercase via .toUpperCase() transform before the regex.
 * This prevents "LS-RED-XL" and "ls-red-xl" from being treated as different SKUs.
 * The DB has a unique index on sku — without normalisation, you can have
 * "duplicate" SKUs that differ only in case, which is a warehouse nightmare.
 *
 * SECURITY BOUNDARY clearly documented here:
 * Fields absent from updateVariantSchema:
 *   sku              — immutable (every order, invoice, warehouse system references it)
 *   productId        — immutable (a variant's parent product never changes)
 *   stockQuantity    — InventoryService only (atomic stock ops, prevents race conditions)
 *   reservedQuantity — internal inventory state machine, never user-facing
 *
 * CROSS-FIELD RULES via .superRefine() (not .refine()):
 *   - sellingPrice MUST be <= mrp (can't sell above listed price)
 *   - costPrice (if provided) SHOULD be <= sellingPrice (negative margin guard)
 *
 * .superRefine() over .refine() because it lets us call ctx.addIssue() multiple
 * times with specific field PATHS. The frontend gets an error pinned to the
 * exact input field ("sellingPrice"), not just a generic form-level message.
 */
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
        .toUpperCase() // normalise FIRST, validate the normalised result
        .min(3, "SKU must be at least 3 characters")
        .max(MAX_SKU_LENGTH, `SKU cannot exceed ${MAX_SKU_LENGTH} characters`)
        .regex(
          SKU_REGEX,
          "SKU must be uppercase alphanumeric (hyphens and underscores allowed)",
        ),

      sellingPrice: priceAtom,
      mrp: priceAtom,

      // Optional — not all catalog managers track cost price.
      // If provided: validated with the same price rules.
      // NEVER returned in public-facing API responses (service layer projection).
      costPrice: priceAtom.optional(),

      // Opening stock on variant creation. Subsequent mutations → InventoryService.
      stockQuantity: z
        .number()
        .int("Stock must be a whole number")
        .min(0, "Stock cannot be negative")
        .default(0),

      weightInGrams: z
        .number()
        .int("Weight must be a whole number of grams")
        .min(0, "Weight cannot be negative")
        .default(0),

      attributes: z
        .array(attributeAtom)
        .min(1, "At least one attribute is required (e.g. Size, Color)")
        .max(
          MAX_ATTRIBUTES_PER_VARIANT,
          `Cannot have more than ${MAX_ATTRIBUTES_PER_VARIANT} attributes`,
        )
        .refine(
          (attrs) => {
            // A single variant cannot have two attributes with the same name.
            // [{ name: "Color", value: "Red" }, { name: "Color", value: "Blue" }] is nonsensical —
            // a variant is one specific thing. It can't simultaneously be Red AND Blue.
            const names = attrs.map((a) => a.name.toLowerCase());
            return new Set(names).size === names.length;
          },
          {
            message:
              "Duplicate attribute names are not allowed in a single variant",
          },
        ),

      images: imagesAtom(MAX_IMAGES_PER_VARIANT),
    })
    .superRefine((data, ctx) => {
      // RULE 1: Can't sell above MRP. This is a consumer protection principle —
      // selling above MRP is illegal under Indian consumer law (Legal Metrology Act).
      if (data.sellingPrice > data.mrp) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Selling price cannot exceed MRP",
          path: ["sellingPrice"], // pinned to the exact field — frontend shows error on that input
        });
      }

      // RULE 2: Negative margin guard. Selling below cost is a business error,
      // not just a data error — but we warn at the API level so admins notice.
      if (data.costPrice !== undefined && data.costPrice > data.sellingPrice) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Cost price exceeds selling price — this variant would have negative margin",
          path: ["costPrice"],
        });
      }
    }),

  // productId comes from the :productId route param (not the body).
  params: z.object({
    productId: objectIdAtom,
  }),
});

/**
 * Schema for PUT /api/catalog/variants/:id
 *
 * DELIBERATELY ABSENT — these are security boundaries, not oversights:
 *
 *   sku              Immutable. Referenced by every order, invoice, and warehouse
 *                    record ever created. Changing it breaks history.
 *
 *   productId        Immutable. A variant's parent cannot be reassigned.
 *                    If you need this variant under a different product, create
 *                    a new variant and soft-delete this one.
 *
 *   stockQuantity    ONLY mutated via InventoryService with atomic DB ops
 *                    ($inc with optimistic locking). Allowing free stockQuantity
 *                    updates here would bypass reservation checks and cause
 *                    overselling (selling items you don't have).
 *
 *   reservedQuantity Internal inventory state. Never user-facing. Ever.
 */
export const updateProductVariantSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(3).max(100).optional(),
      description: z.string().trim().max(1000).optional(),
      sellingPrice: priceAtom.optional(),
      mrp: priceAtom.optional(),
      // nullable on update: costPrice: null → "remove cost price tracking"
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
      images: imagesAtom(MAX_IMAGES_PER_VARIANT).optional(),
      isActive: z.boolean().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided to update",
    })
    .superRefine((data, ctx) => {
      // Only validate price relationship when BOTH fields are being updated together.
      // If only sellingPrice is provided, we can't check against the existing mrp in DB —
      // that's the service's job. We only validate what we have in this payload.
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

export type CreateProductVariantInput = z.infer<
  typeof createProductVariantSchema
>["body"];
export type UpdateProductVariantInput = z.infer<
  typeof updateProductVariantSchema
>["body"];

// =============================================================================
// QUERY / FILTER SCHEMAS
// =============================================================================

/**
 * Schema for GET /api/catalog/products?page=1&limit=20&categoryId=...
 *
 * ALL query params arrive as STRINGS from Express (req.query).
 * ?page=1 → req.query.page = "1" (the string "1", not the number 1).
 *
 * .transform(Number) converts "1" → 1.
 * .pipe() then validates the converted number.
 *
 * Without this dance:
 *   ?page=abc → "abc" * 20 = NaN → skip = NaN → Mongoose does undefined behaviour.
 * With this:
 *   ?page=abc → transform("abc") = NaN → z.number() fails → clean 400 response.
 *
 * limit is capped at MAX_PAGE_SIZE (100).
 * Without the cap: ?limit=999999 forces a full table scan and serialises
 * hundreds of thousands of documents — guaranteed OOM or timeout under load.
 *
 * tags: comma-separated string → array.
 * Standard REST convention for multi-value query params.
 * ?tags=cotton,denim → ["cotton", "denim"]
 *
 * isActive: "true"/"false" (strings) → boolean.
 * z.boolean() alone fails on query strings because "true" !== true.
 */
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
    brandId: objectIdAtom.optional(),

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

    // ?tags=cotton,denim   → "cotton,denim" → split → ["cotton", "denim"]
    // ?tags=cotton         → "cotton"        → split → ["cotton"]
    tags: z
      .string()
      .optional()
      .transform((val) =>
        val
          ? val
            .split(",")
            .map((t) => t.trim().toLowerCase())
            .filter(Boolean)
          : undefined,
      ),

    // "true" | "false" (strings) → boolean.
    // Default: only show active products on public-facing endpoints.
    isActive: z
      .enum(["true", "false"])
      .optional()
      .default("true")
      .transform((val) => val === "true"),

    // Caps search string length — prevents abuse of the text search index
    // with extremely long inputs. Also limits CPU for regex-based searches.
    search: z.string().trim().max(200, "Search query too long").optional(),
  }),
});

// Brand / Category list queries — simpler, no price filtering
export const brandListQuerySchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .default(String(1))
      .transform(Number)
      .pipe(z.number().int().positive()),

    limit: z
      .string()
      .optional()
      .default(String(DEFAULT_PAGE_SIZE))
      .transform(Number)
      .pipe(z.number().int().positive().max(MAX_PAGE_SIZE)),

    isActive: z
      .enum(["true", "false"])
      .optional()
      .default("true")
      .transform((val) => val === "true"),

    search: z.string().trim().max(200).optional(),
  }),
});

export const categoryListQuerySchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .default(String(1))
      .transform(Number)
      .pipe(z.number().int().positive()),

    limit: z
      .string()
      .optional()
      .default(String(DEFAULT_PAGE_SIZE))
      .transform(Number)
      .pipe(z.number().int().positive().max(MAX_PAGE_SIZE)),

    isActive: z
      .enum(["true", "false"])
      .optional()
      .default("true")
      .transform((val) => val === "true"),

    parent: objectIdAtom.optional(), // filter by parent category
  }),
});

// Inferred types for query schemas — used in service method signatures
export type ProductListQuery = z.infer<typeof productListQuerySchema>["query"];
export type BrandListQuery = z.infer<typeof brandListQuerySchema>["query"];
export type CategoryListQuery = z.infer<
  typeof categoryListQuerySchema
>["query"];
