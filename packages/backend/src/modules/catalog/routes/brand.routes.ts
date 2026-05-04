import express from "express";
import { validateReq } from "../../../shared/middlewares/validation.middleware.js";
import { authorize } from "../../../shared/middlewares/authorization.middleware.js";
import { PERMISSIONS } from "@e-com/shared/authorization";
import {
  createBrandSchema,
  updateBrandSchema,
  brandListQuerySchema,
  brandIdParamSchema,
  brandSlugParamSchema,
} from "@e-com/shared/schemas";
import { brandController, authenticate } from "../../../composition/app.composition.js";

export const brandRouter = express.Router();

// ---- Public routes (no auth required) ----

// GET /api/catalog/brands — List brands (paginated, filterable)
brandRouter.get(
  "/",
  validateReq(brandListQuerySchema),
  brandController.listBrands,
);

// GET /api/catalog/brands/slug/:slug — Get brand by slug (public storefront)
brandRouter.get(
  "/slug/:slug",
  validateReq(brandSlugParamSchema),
  brandController.getBrandBySlug,
);

// GET /api/catalog/brands/:id — Get brand by ID (public)
brandRouter.get(
  "/:id",
  validateReq(brandIdParamSchema),
  brandController.getBrandById,
);

// ---- Protected routes (auth + permission required) ----

// POST /api/catalog/brands — Create a new brand
brandRouter.post(
  "/",
  authenticate,
  authorize(PERMISSIONS.BRANDS_CREATE),
  validateReq(createBrandSchema),
  brandController.createBrand,
);

// PATCH /api/catalog/brands/:id — Partial update
brandRouter.patch(
  "/:id",
  authenticate,
  authorize(PERMISSIONS.BRANDS_UPDATE),
  validateReq(updateBrandSchema),
  brandController.updateBrand,
);

// PATCH /api/catalog/brands/:id/deactivate — Soft delete (set isActive: false)
brandRouter.patch(
  "/:id/deactivate",
  authenticate,
  authorize(PERMISSIONS.BRANDS_DELETE),
  validateReq(brandIdParamSchema),
  brandController.softDeleteBrand,
);

// DELETE /api/catalog/brands/:id — Hard delete (only if no products reference it)
brandRouter.delete(
  "/:id",
  authenticate,
  authorize(PERMISSIONS.BRANDS_DELETE),
  validateReq(brandIdParamSchema),
  brandController.hardDeleteBrand,
);
