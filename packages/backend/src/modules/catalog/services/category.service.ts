import { CreateCategoryInput } from "@e-com/shared/schemas";
import { RequestContext } from "../../../shared/types/request-context.js";
import { ICategoryServices } from "../interfaces/category.service.interface.js";
import { generateSlug } from "../../../shared/utils/slug.utils.js";
import { Category, LeanCategory } from "../models/category.model.js";
import { CatalogError } from "../errors/catalog.errors.js";
import {
  getDuplicateKeyField,
  isMongoDuplicateKeyError,
} from "../../../shared/utils/mongo.utils.js";

export class CategoryService implements ICategoryServices {
  async createCategory(
    input: CreateCategoryInput,
    ctx?: RequestContext,
  ): Promise<LeanCategory> {
    try {
      ctx?.logger.info({ categoryName: input.name }, "Creating category");

      const slug: string = input.slug ?? generateSlug(input.name);

      if (!input.parent) {
        const category = await Category.create({
          name: input.name,
          slug,
          description: input.description,
        });

        ctx?.logger.info({ categoryId: category.id }, "Category created");

        return category.toObject();
      }



      const parentDoc: LeanCategory | null = await Category.findById(input.parent).lean();
      if (!parentDoc) {
        ctx?.logger.warn({ parentId: input.parent }, "Parent does not exist");
        throw new CatalogError(
          "CATEGORY_NOT_FOUND",
          "No such parent exists",
          404,
        );
      }

      const ancestors = [...parentDoc.ancestors, parentDoc._id];

      const isInActiveAncestors = await Category.findOne({ _id: { $in: ancestors }, isActive: false }).lean();

      if (isInActiveAncestors) {
        ctx?.logger.warn(
          { ancestorId: isInActiveAncestors._id, ancestorName: isInActiveAncestors.name },
          "An ancestor category is inactive",
        );
        throw new CatalogError(
          "CATEGORY_INACTIVE",
          "An ancestor category in this branch is inactive",
          400,
        );
      }
      
      const category = await Category.create({
        name: input.name,
        slug,
        description: input.description,
        parent: input.parent,
        ancestors,
      });

      ctx?.logger.info({ categoryId: category.id }, "Category created");

      return category.toObject();
    } catch (error: unknown) {
      if (error instanceof CatalogError) throw error;

      if (isMongoDuplicateKeyError(error)) {
        const field = getDuplicateKeyField(error);
        const value = error.keyValue[field];

        ctx?.logger.warn(
          { field, value, name: input.name },
          "Duplicate category field on create",
        );

        throw new CatalogError(
          "CATEGORY_ALREADY_EXISTS",
          `Category ${field} already exists`,
          409,
        );
      }

      throw error;
    }
  }
}

