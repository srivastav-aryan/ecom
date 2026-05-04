import { NextFunction, Request, Response } from "express";
import { IBrandService } from "../interfaces/brand.service.interface.js";
import { RequestContext } from "../../../shared/types/request-context.js";
import { BrandResponse } from "@e-com/shared/types";
import { IBrand } from "../models/brand.model.js";

const createCtx = (req: Request, route: string): RequestContext => ({
  logger: req.log?.child({ route }),
  deviceInfo: req.headers["user-agent"] || "unknown",
  ip: req.ip || "unknown",
  requestId: req.id,
});

/**
 * Maps an internal IBrand (Mongoose document) to a BrandResponse (API contract).
 * This is the ONLY place where DB shape meets client shape.
 * If IBrand or BrandResponse changes, this function is the single point of update.
 */
const toBrandResponse = (brand: IBrand): BrandResponse => ({
  id: (brand as any)._id.toString(),
  name: brand.name,
  slug: brand.slug,
  description: brand.description,
  logo: brand.logo ?? null,
  isActive: brand.isActive,
  createdAt: (brand as any).createdAt.toISOString(),
  updatedAt: (brand as any).updatedAt.toISOString(),
});

export const brandControllerCreator = (brandService: IBrandService) => {
  return {
    createBrand: async (req: Request, res: Response, next: NextFunction) => {
      const ctx = createCtx(req, "create_brand");
      try {
        const brand = await brandService.createBrand(req.body, ctx);

        res.status(201).json({
          success: true,
          data: toBrandResponse(brand),
          message: "Brand created successfully",
        });
      } catch (error) {
        next(error);
      }
    },

    getBrandById: async (req: Request, res: Response, next: NextFunction) => {
      const ctx = createCtx(req, "get_brand_by_id");
      try {
        const brand = await brandService.getBrandById(req.params.id, ctx);

        res.status(200).json({
          success: true,
          data: toBrandResponse(brand),
        });
      } catch (error) {
        next(error);
      }
    },

    getBrandBySlug: async (req: Request, res: Response, next: NextFunction) => {
      const ctx = createCtx(req, "get_brand_by_slug");
      try {
        const brand = await brandService.getBrandBySlug(req.params.slug, ctx);

        res.status(200).json({
          success: true,
          data: toBrandResponse(brand),
        });
      } catch (error) {
        next(error);
      }
    },

    listBrands: async (req: Request, res: Response, next: NextFunction) => {
      const ctx = createCtx(req, "list_brands");
      try {
        const result = await brandService.listBrands(req.query as any, ctx);

        res.status(200).json({
          success: true,
          data: result.items.map(toBrandResponse),
          pagination: result.pagination,
        });
      } catch (error) {
        next(error);
      }
    },

    updateBrand: async (req: Request, res: Response, next: NextFunction) => {
      const ctx = createCtx(req, "update_brand");
      try {
        const brand = await brandService.updateBrand(
          req.params.id,
          req.body,
          ctx,
        );

        res.status(200).json({
          success: true,
          data: toBrandResponse(brand),
          message: "Brand updated successfully",
        });
      } catch (error) {
        next(error);
      }
    },

    softDeleteBrand: async (req: Request, res: Response, next: NextFunction) => {
      const ctx = createCtx(req, "soft_delete_brand");
      try {
        await brandService.softDeleteBrand(req.params.id, ctx);

        res.status(204).send();
      } catch (error) {
        next(error);
      }
    },

    hardDeleteBrand: async (req: Request, res: Response, next: NextFunction) => {
      const ctx = createCtx(req, "hard_delete_brand");
      try {
        await brandService.hardDeleteBrand(req.params.id, ctx);

        res.status(204).send();
      } catch (error) {
        next(error);
      }
    },
  };
};
