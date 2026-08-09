import { CreateCategoryInput } from "@e-com/shared/schemas";
import { RequestContext } from "../../../shared/types/request-context.js";
import { LeanCategory } from "../models/category.model.js";

export interface ICategoryServices {
  createCategory(
    input: CreateCategoryInput,
    ctx?: RequestContext,
  ): Promise<LeanCategory>;

  /**
   * Get all descendant categories of a given category (subtree query).
   * Single indexed query: `Category.find({ ancestors: categoryId })`
   */
  // getSubtree(categoryId: string, ctx?: RequestContext): Promise<LeanCategory[]>;

  /**
   * Get ordered ancestor chain for breadcrumbs (root → ... → parent).
   * Single query: `Category.find({ _id: { $in: doc.ancestors } })`
   */
  // getAncestors(
  //   categoryId: string,
  //   ctx?: RequestContext,
  // ): Promise<LeanCategory[]>;
  //
  /**
   * Check if a category and ALL its ancestors are active.
   * Single query: checks for any inactive ancestor in the chain.
   */
  // isEffectivelyActive(
  //   categoryId: string,
  //   ctx?: RequestContext,
  // ): Promise<boolean>;
}
