import { z } from "zod";
import {
  DEFAULT_PAGE_SIZE,
  MAX_DESCRIPTION_LENGTH,
  MAX_NAME_LENGTH,
  MAX_PAGE_SIZE,
} from "../../constants/index.js";
import { objectIdAtom, slugAtom } from "./catalog.atoms.js";

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

    parent: objectIdAtom.nullable().optional(),
  }),
});

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

export const categoryListQuerySchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .default("1")
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
          .positive()
          .max(MAX_PAGE_SIZE, `Limit cannot exceed ${MAX_PAGE_SIZE}`),
      ),

    status: z
      .enum(["active", "all", "blocked", "inActive", "draft"])
      .optional()
      .default("all"),

    search: z.string().optional(),

    depth: z.enum(["root", "level1", "level2"]).optional().default("root"),

    parent: objectIdAtom.optional(),
  }),
});

export const categoryListNodeQuerySchema = z.object({
  params: z.object({ id: objectIdAtom }),
});

// ---------------------------------------------------------------------------
// Inferred TypeScript types
// ---------------------------------------------------------------------------
export type CreateCategoryInput = z.infer<typeof createCategorySchema>["body"];
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>["body"];
export type CategoryListQuery = z.infer<
  typeof categoryListQuerySchema
>["query"];
export type categoryListNodeQuerySchema = z.infer<
  typeof categoryListNodeQuerySchema
>["params"];
