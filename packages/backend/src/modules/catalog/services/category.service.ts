import { CategoryListQuery, CreateCategoryInput } from "@e-com/shared/schemas";
import mongoose from "mongoose";
import { RequestContext } from "../../../shared/types/request-context.js";
import {
  getDuplicateKeyField,
  isMongoDuplicateKeyError,
} from "../../../shared/utils/mongo.utils.js";
import {
  buildPaginationMeta,
  PaginatedResult,
  parsePagination,
} from "../../../shared/utils/pagination.utils.js";
import { generateSlug } from "../../../shared/utils/slug.utils.js";
import { CatalogError } from "../errors/catalog.errors.js";
import { ICategoryServices } from "../interfaces/category.service.interface.js";
import { Category, LeanCategory } from "../models/category.model.js";
import { CategoryTreeResponse } from "@e-com/shared/types";
import Fuse from "fuse.js";

export type CategoryWithStatus = LeanCategory & {
  isEffectivelyActive: boolean;
  blockingAncestorId: mongoose.Types.ObjectId | null;
};

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

      const parentDoc: LeanCategory | null = await Category.findById(
        input.parent,
      ).lean();
      if (!parentDoc) {
        ctx?.logger.warn({ parentId: input.parent }, "Parent does not exist");
        throw new CatalogError(
          "CATEGORY_NOT_FOUND",
          "No such parent exists",
          404,
        );
      }

      const ancestors = [...parentDoc.ancestors, parentDoc._id];

      const isInActiveAncestors = await Category.findOne({
        _id: { $in: ancestors },
        isActive: false,
      }).lean();

      if (isInActiveAncestors) {
        ctx?.logger.warn(
          {
            ancestorId: isInActiveAncestors._id,
            ancestorName: isInActiveAncestors.name,
          },
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

  async getCategoryTree(ctx?: RequestContext): Promise<CategoryWithStatus[]> {
    ctx?.logger.info("Fetching category tree with active status");

    try {
      const entireCatTree = await Category.find().lean();
      const categoryMap = new Map<string, LeanCategory>();

      for (const doc of entireCatTree) {
        categoryMap.set(doc._id.toString(), doc);
      }

      const categoriesWithStatus: CategoryWithStatus[] = entireCatTree.map(
        (doc) => {
          if (!doc.isActive) {
            return {
              ...doc,
              isEffectivelyActive: false,
              blockingAncestorId: null,
            };
          }

          for (const ancestorId of doc.ancestors) {
            const ancestorDoc = categoryMap.get(ancestorId.toString());

            if (!ancestorDoc || !ancestorDoc.isActive) {
              return {
                ...doc,
                isEffectivelyActive: false,
                blockingAncestorId: ancestorId,
              };
            }
          }

          return {
            ...doc,
            isEffectivelyActive: true,
            blockingAncestorId: null,
          };
        },
      );

      ctx?.logger.info(
        { totalCategories: categoriesWithStatus.length },
        "Category tree retrieved successfully",
      );

      return categoriesWithStatus;
    } catch (error: unknown) {
      ctx?.logger.error({ err: error }, "Failed to retrieve category tree");
      if (error instanceof CatalogError) throw error;
      throw error;
    }
  }

  async getCategory(
    query: CategoryListQuery,
    ctx?: RequestContext,
  ): Promise<PaginatedResult<CategoryWithStatus>> {
    ctx?.logger.info({ query }, "fetching categories for admin frontend");

    try {
      const { search, page, limit, status, depth, parent } = query;

      const entireCatTree = await Category.find().lean();
      ctx?.logger.info(
        { totalDBCount: entireCatTree.length },
        "Fetched entire category tree from DB",
      );
      const categoryMap = new Map<string, LeanCategory>();

      for (const doc of entireCatTree) {
        categoryMap.set(doc._id.toString(), doc);
      }

      const categoriesWithStatus: CategoryWithStatus[] = entireCatTree.map(
        (doc) => {
          if (!doc.isActive) {
            return {
              ...doc,
              isEffectivelyActive: false,
              blockingAncestorId: null,
            };
          }

          for (const ancestorId of doc.ancestors) {
            const ancestorDoc = categoryMap.get(ancestorId.toString());

            if (!ancestorDoc || !ancestorDoc.isActive) {
              return {
                ...doc,
                isEffectivelyActive: false,
                blockingAncestorId: ancestorId,
              };
            }
          }

          return {
            ...doc,
            isEffectivelyActive: true,
            blockingAncestorId: null,
          };
        },
      );

      let filteredData = categoriesWithStatus;

      // 1. Status Filter
      if (status === "active") {
        filteredData = filteredData.filter((cat) => cat.isEffectivelyActive);
      } else if (status === "inActive" || (status as string) === "inactive") {
        filteredData = filteredData.filter((cat) => !cat.isActive);
      } else if (status === "blocked") {
        filteredData = filteredData.filter(
          (cat) => cat.isActive && !cat.isEffectivelyActive,
        );
      }
      ctx?.logger.info(
        { count: filteredData.length, status },
        "Applied status filter",
      );

      // 2. Search Filter (name or slug)
      if (search) {
        const searchRegex = new RegExp(search, "i");
        filteredData = filteredData.filter(
          (cat) => searchRegex.test(cat.name) || searchRegex.test(cat.slug),
        );
        ctx?.logger.info(
          { count: filteredData.length, search },
          "Applied search filter",
        );
      }

      // 3. Depth Filter
      if (depth === "root") {
        filteredData = filteredData.filter((cat) => cat.ancestors.length === 0);
      } else if (depth === "level1") {
        filteredData = filteredData.filter((cat) => cat.ancestors.length === 1);
      } else if (depth === "level2") {
        filteredData = filteredData.filter((cat) => cat.ancestors.length === 2);
      }
      ctx?.logger.info(
        { count: filteredData.length, depth },
        "Applied depth filter",
      );

      // 4. Parent Filter (if provided)
      if (parent) {
        filteredData = filteredData.filter(
          (cat) => cat.parent?.toString() === parent,
        );
        ctx?.logger.info(
          { count: filteredData.length, parent },
          "Applied parent filter",
        );
      }

      // 5. Pagination
      const {
        page: safePage,
        limit: safeLimit,
        skip,
      } = parsePagination(page, limit);
      const totalCount = filteredData.length;
      const paginatedItems = filteredData.slice(skip, skip + safeLimit);
      const pagination = buildPaginationMeta(totalCount, safePage, safeLimit);

      ctx?.logger.info(
        {
          totalCount,
          returnedCount: paginatedItems.length,
          page: safePage,
          limit: safeLimit,
        },
        "Categories retrieved successfully",
      );

      return {
        items: paginatedItems,
        pagination,
      };
    } catch (error: unknown) {
      ctx?.logger.error({ err: error, query }, "Failed to retrieve categories");
      if (error instanceof CatalogError) throw error;
      throw error;
    }
  }

  async getTree(
    query: CategoryListQuery,
    ctx?: RequestContext,
  ): Promise<CategoryTreeResponse[]> {
    ctx?.logger.info({ query }, "Fetching category tree for admin frontend");

    try {
      const { status, search, parent } = query;

      const allCategories = await Category.find().lean();
      ctx?.logger.info(
        { totalDBCount: allCategories.length },
        "Fetched categories from DB",
      );

      const categoryMap = new Map<string, LeanCategory>();

      for (const category of allCategories) {
        categoryMap.set(category._id.toString(), category);
      }

      const categoriesWithStatus: CategoryWithStatus[] = allCategories.map(
        (doc) => {
          if (!doc.isActive) {
            return {
              ...doc,
              isEffectivelyActive: false,
              blockingAncestorId: null,
            };
          }

          for (const ancestorId of doc.ancestors) {
            const ancestorDoc = categoryMap.get(ancestorId.toString());

            if (!ancestorDoc || !ancestorDoc.isActive) {
              return {
                ...doc,
                isEffectivelyActive: false,
                blockingAncestorId: ancestorId,
              };
            }
          }

          return {
            ...doc,
            isEffectivelyActive: true,
            blockingAncestorId: null,
          };
        },
      );

      let filteredCategories = categoriesWithStatus;

      if (status == "active") {
        filteredCategories = filteredCategories.filter(
          (doc) => doc.isActive && doc.isEffectivelyActive,
        );
        ctx?.logger.info(
          { count: filteredCategories.length, status },
          "Applied status filter",
        );
      }

      if (search) {
        const fuse = new Fuse(categoriesWithStatus, {
          keys: ["name", "slug"],
          threshold: 0.3,
        });

        const searchHits = fuse.search(search).map((result) => result.item);

        const matchedCategoryIds = new Set(
          searchHits.map((cat) => cat._id.toString()),
        );

        filteredCategories = filteredCategories.filter(
          (cat) =>
            matchedCategoryIds.has(cat._id.toString()) ||
            cat.ancestors.some((id) => matchedCategoryIds.has(id.toString())),
        );

        ctx?.logger.info(
          {
            count: filteredCategories.length,
            search,
            directMatches: searchHits.length,
          },
          "Applied search filter",
        );
      }

      if (parent) {
        filteredCategories = filteredCategories.filter(
          (cat) =>
            cat._id.toString() === parent ||
            cat.ancestors.some((ancestorId) => ancestorId.toString() === parent),
        );
        ctx?.logger.info(
          { count: filteredCategories.length, parent },
          "Applied parent filter",
        );
      }

      const categoryTree: any[] = [];
      const treeMap = new Map<string, any>();

      for (const cat of filteredCategories) {
        treeMap.set(cat._id.toString(), { ...cat, children: [] });
      }

      for (const cat of filteredCategories) {
        const node = treeMap.get(cat._id.toString());
        if (cat.parent && treeMap.has(cat.parent.toString())) {
          treeMap.get(cat.parent.toString()).children.push(node);
        } else {
          categoryTree.push(node);
        }
      }
      // Since JS objects are held by reference, updating child in treeMap updates it in categoryTree as well

      ctx?.logger.info(
        {
          rootNodesCount: categoryTree.length,
          totalNodesCount: filteredCategories.length,
        },
        "Category tree assembled successfully",
      );

      const responseTree: CategoryTreeResponse[] = categoryTree;

      return responseTree;
    } catch (error: unknown) {
      ctx?.logger.error({ err: error, query }, "Failed to retrieve category tree");
      if (error instanceof CatalogError) throw error;
      throw error;
    }
  }
}
