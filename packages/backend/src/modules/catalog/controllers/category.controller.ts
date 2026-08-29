import { NextFunction, Request, Response } from "express";
import { ICategoryControllerInterface } from "../interfaces/category.controller.interface.js";
import { ICategoryServices } from "../interfaces/category.service.interface.js";
import { createCtx } from "../../../shared/utils/ctx.utils.js";
import { CategoryDocument, LeanCategory } from "../models/category.model.js";
import { CategoryResponse } from "@e-com/shared/types";
import { CategoryWithStatus } from "../services/category.service.js";


const isCategoryWithStatus = (
  cat: LeanCategory | CategoryDocument | CategoryWithStatus,
): cat is CategoryWithStatus =>
  "isEffectivelyActive" in cat && "blockingAncestorId" in cat;

const toCategoryResponse = (
  category: LeanCategory | CategoryDocument | CategoryWithStatus,
): CategoryResponse => ({
  id: category._id.toString(),
  name: category.name,
  slug: category.slug,
  description: category.description,
  parent: category.parent ? category.parent.toString() : null,
  ancestors: (category.ancestors ?? []).map((a) => a.toString()),
  isActive: category.isActive,
  isEffectivelyActive: isCategoryWithStatus(category)
    ? category.isEffectivelyActive
    : category.isActive,
  blockingAncestorId: isCategoryWithStatus(category)
    ? category.blockingAncestorId?.toString() ?? null
    : null,
  createdAt: category.createdAt.toISOString(),
  updatedAt: category.updatedAt.toISOString(),
});


export const categoryControllerCreator = (
  categoryService: ICategoryServices,
): ICategoryControllerInterface => {
  return {
    createCategory: async (req: Request, res: Response, next: NextFunction) => {
      const ctx = createCtx(req, "create_category");
      try {
        const category = await categoryService.createCategory(req.body, ctx);
        res.status(201).json({
          success: true,
          data: toCategoryResponse(category),
          message: "Category created successfully",
        });
      } catch (error) {
        next(error);
      }
    },


    getAllCategoryTree: async (req: Request, res: Response, next: NextFunction) => {
      const ctx = createCtx(req, "get_category_tree");

      try {
        const categories = await categoryService.getCategoryTree(ctx);

        res.status(200).json({
          success: true,
          data: categories.map(toCategoryResponse),
        });
      } catch (error) {
        next(error);
      }
    }
  };
};
