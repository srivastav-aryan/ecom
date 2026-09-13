import { CreateCategoryInput, CategoryListQuery } from "@e-com/shared/schemas";
import { RequestContext } from "../../../shared/types/request-context.js";
import { LeanCategory } from "../models/category.model.js";
import { CategoryWithStatus } from "../services/category.service.js";
import { PaginatedResult } from "../../../shared/utils/pagination.utils.js";

export interface ICategoryServices {
  createCategory(
    input: CreateCategoryInput,
    ctx?: RequestContext,
  ): Promise<LeanCategory>;

  getCategory(
    query: CategoryListQuery,
    ctx?: RequestContext,
  ): Promise<PaginatedResult<CategoryWithStatus>>;

  getCategoryTree(ctx?: RequestContext): Promise<CategoryWithStatus[]>;

}
