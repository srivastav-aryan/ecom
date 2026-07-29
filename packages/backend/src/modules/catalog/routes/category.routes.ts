import { PERMISSIONS } from "@e-com/shared/authorization";
import { authorize } from "../../../shared/middlewares/authorization.middleware.js";
import { ICategoryContollerInterface } from "../interfaces/category.controller.interface.js";

import express, { RequestHandler } from "express";
import { validateReq } from "../../../shared/middlewares/validation.middleware.js";
import { createCategorySchema } from "@e-com/shared/schemas";

export const createCategoryRouter = (
  categoryController: ICategoryContollerInterface,
  authenticate: RequestHandler,
) => {
  const categoryRouter = express.Router();

  categoryRouter.post(
    "/",
    authenticate,
    authorize(PERMISSIONS.CATEGORIES_CREATE),
    validateReq(createCategorySchema),
    categoryController.createCategory,
  );

  return categoryRouter;
};
