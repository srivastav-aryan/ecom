import { CreateCategoryInput } from "@e-com/shared/schemas";
import { RequestContext } from "../../../shared/types/request-context.js";
import { ICategoryServices } from "../interfaces/category.service.interface.js";
import { generateSlug } from "../../../shared/utils/slug.utils.js";
import { Category, LeanCategory } from "../models/category.model.js";
import { CatalogError } from "../errors/catalog.errors.js";

export class CategoryService implements ICategoryServices {
  async createCategory(
    input: CreateCategoryInput,
    ctx?: RequestContext,
  ): Promise<LeanCategory> {
    try {
      ctx?.logger.info({ Categoryname: input.name }, "creating category");

      const slug: string = input.slug ?? generateSlug(input.name);

      if (!input.parent) {
        const category = await Category.create({
          name: input.name,
          slug,
          description: input.description,
        });

        ctx?.logger.info({ categoryId: category.id }, "Category created");

        return category;
      }

      let parentDoc;

      parentDoc = await Category.findById(input.parent).select('isActive').lean();
      if (!parentDoc) {
        ctx?.logger.warn({ parentId: input.parent }, "Parent does not exsist");
        throw new CatalogError(
          "CATEGORY_NOT_FOUND",
          "No such parent exsists",
          404,
        );
      }

      if (!parentDoc.isActive) {
        ctx?.logger.warn({ parent: parentDoc.name }, "Parent is not active");
        throw new CatalogError(
          "CATEGORY_INACTIVE",
          "The parent category is inactive",
          400,
        );
      }
      const category = await Category.create({
        name: input.name,
        slug,
        description: input.description,
        parent: input.parent,
      });

      ctx?.logger.info({ categoryId: category.id }, "Category created");

      return category.toObject();
    } catch (error: any) {
      if (error.code === 11000) {
        ctx?.logger.warn(
          { slug: input.slug },
          "Attempt to create a category with an already registered slug or name",
        );
        throw new CatalogError(
          "CATEGORY_ALREADY_EXISTS",
          "The slug or name is already registered. Please use a different one",
          409,
        );
      }

      throw error;
    }
  }
}

