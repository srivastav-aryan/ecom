import { CategoryResponse, CategoryTreeResponse } from "@e-com/shared/types";
import { CategoryDocument, LeanCategory } from "../models/category.model.js";
import { CategoryWithStatus } from "../services/category.service.js";

type CategorySource = LeanCategory | CategoryDocument | CategoryWithStatus;

const isCategoryWithStatus = (cat: CategorySource): cat is CategoryWithStatus =>
  "isEffectivelyActive" in cat && "blockingAncestorId" in cat;

export class CategoryMapper {
  /**
   * Maps a single internal category document / lean object to the public CategoryResponse DTO.
   */
  static toResponse(category: CategorySource): CategoryResponse {
    return {
      id: category._id.toString(),
      name: category.name,
      slug: category.slug,
      description: category.description,
      parent: category.parent ? category.parent.toString() : null,
      ancestors: (category.ancestors ?? []).map((a) => a.toString()),
      isActive: category.isActive,
      isEffectivelyActive: isCategoryWithStatus(category)
        ? category.isEffectivelyActive
        : category.isActive,
      blockingAncestorId: isCategoryWithStatus(category)
        ? (category.blockingAncestorId?.toString() ?? null)
        : null,
      createdAt:
        category.createdAt instanceof Date
          ? category.createdAt.toISOString()
          : String(category.createdAt),
      updatedAt:
        category.updatedAt instanceof Date
          ? category.updatedAt.toISOString()
          : String(category.updatedAt),
    };
  }

  /**
   * Recursively maps an in-memory tree node (including all nested children)
   * to the public CategoryTreeResponse DTO.
   */
  static toTreeNode(node: any): CategoryTreeResponse {
    return {
      ...CategoryMapper.toResponse(node),
      children: (node.children ?? []).map(CategoryMapper.toTreeNode),
    };
  }

  /**
   * Maps an array of in-memory tree root nodes to an array of CategoryTreeResponse DTOs.
   */
  static toTreeResponse(nodes: any[]): CategoryTreeResponse[] {
    return nodes.map(CategoryMapper.toTreeNode);
  }
}
