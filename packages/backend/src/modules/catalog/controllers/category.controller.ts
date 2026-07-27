import { NextFunction, Request, Response } from "express";
import { ICategoryContollerInterface } from "../interfaces/category.controller.interface.js";
import { ICategoryServices } from "../interfaces/category.service.interface.js";
import { createCtx } from "../../../shared/utils/ctx.utils.js";

export const categoryControllerCreator = (
  categoryService: ICategoryServices,
): ICategoryContollerInterface => {
  return {
    createCategory: async (req: Request, res: Response, next: NextFunction) => {
      const ctx = createCtx(req, "create_category");
      try {
        const category = await categoryService.createCategory(req.body, ctx);

        res.status(201).json({
          success: true,
          data: category,
          message: "Category created successfully",
        });
      } catch (error) {
        next(error);
      }
    },
  };
};
