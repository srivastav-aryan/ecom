import { PERMISSIONS } from "@e-com/shared/authorization";
import { authorize } from "../../../shared/middlewares/authorization.middleware.js";
import { ICategoryControllerInterface } from "../interfaces/category.controller.interface.js";

import express, { RequestHandler } from "express";
import { validateReq } from "../../../shared/middlewares/validation.middleware.js";
import { createCategorySchema } from "@e-com/shared/schemas";

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

  return categoryRouter;
};
