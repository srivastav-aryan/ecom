import { PaginationMeta, PaginatedResult } from "@e-com/shared/types";

// Re-export so existing imports across the backend don't break.
export type { PaginationMeta, PaginatedResult };

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * Clamps page/limit from already-validated query params.
 * Returns the skip value for Mongoose .skip().
 */
export const parsePagination = (page?: number, limit?: number) => {
  const safePage = Math.max(page ?? DEFAULT_PAGE, 1);
  const safeLimit = Math.min(Math.max(limit ?? DEFAULT_LIMIT, 1), MAX_LIMIT);
  const skip = (safePage - 1) * safeLimit;

  return { page: safePage, limit: safeLimit, skip };
};

export const buildPaginationMeta = (
  totalCount: number,
  page: number,
  limit: number,
): PaginationMeta => {
  const totalPages = Math.ceil(totalCount / limit);

  return {
    page,
    limit,
    totalCount,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};
