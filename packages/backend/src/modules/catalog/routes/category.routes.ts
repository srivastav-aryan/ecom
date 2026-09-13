import { PERMISSIONS } from "@e-com/shared/authorization";
import { authorize } from "../../../shared/middlewares/authorization.middleware.js";
import { ICategoryControllerInterface } from "../interfaces/category.controller.interface.js";

import {
  categoryListQuerySchema,
  createCategorySchema,
} from "@e-com/shared/schemas";
import express, { RequestHandler } from "express";
import { validateReq } from "../../../shared/middlewares/validation.middleware.js";

export const createCategoryRouter = (
  categoryController: ICategoryControllerInterface,
  authenticate: RequestHandler,
) => {
  const categoryRouter = express.Router();

  // POST create category
  categoryRouter.post(
    "/",
    authenticate,
    authorize(PERMISSIONS.CATEGORIES_CREATE),
    validateReq(createCategorySchema),
    categoryController.createCategory,
  );

  // GET Category tree for navbar
  categoryRouter.get("/getCategoryTree", categoryController.getAllCategoryTree);

  //GET Category for admin side
  categoryRouter.get(
    "/category",
    authenticate,
    authorize(PERMISSIONS.CATEGORIES_READ),
    validateReq(categoryListQuerySchema),
    categoryController.getCategoryTable
  );

  return categoryRouter;
};
