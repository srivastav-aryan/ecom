import { NextFunction, Request, Response } from "express";
import { ICategoryControllerInterface } from "../interfaces/category.controller.interface.js";
import { ICategoryServices } from "../interfaces/category.service.interface.js";
import { createCtx } from "../../../shared/utils/ctx.utils.js";
import { CategoryMapper } from "../mappers/category.mapper.js";

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
          data: CategoryMapper.toResponse(category),
          message: "Category created successfully",
        });
      } catch (error) {
        next(error);
      }
    },

    getAllCategoryTree: async (
      req: Request,
      res: Response,
      next: NextFunction,
    ) => {
      const ctx = createCtx(req, "get_category_tree");

      try {
        const categories = await categoryService.getCategoryTree(ctx);

        res.status(200).json({
          success: true,
          data: categories.map(CategoryMapper.toResponse),
        });
      } catch (error) {
        next(error);
      }
    },

    getCategoryTable: async (
      req: Request,
      res: Response,
      next: NextFunction,
    ) => {
      const ctx = createCtx(req, "get_category_table");
      try {
        const result = await categoryService.getCategory(req.query as any, ctx);

        res.status(200).json({
          success: true,
          data: {
            items: result.items.map(CategoryMapper.toResponse),
            pagination: result.pagination,
          },
        });
      } catch (error) {
        next(error);
      }
    },

    getCategoryTree: async (
      req: Request,
      res: Response,
      next: NextFunction,
    ) => {
      const ctx = createCtx(req, "get_category_admin_tree");

      try {
        const result = await categoryService.getTree(req.query as any, ctx);

        res.status(200).json({
          success: true,
          data: CategoryMapper.toTreeResponse(result),
        });
      } catch (error) {
        next(error);
      }
    },
  };
};

