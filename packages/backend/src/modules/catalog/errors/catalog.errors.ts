import { ApiError } from "../../../shared/utils/applevel.utils.js";

export const CATALOG_ERROR_CODES = {
  BRAND_NOT_FOUND: "BRAND_NOT_FOUND",
  BRAND_ALREADY_EXISTS: "BRAND_ALREADY_EXISTS",
  BRAND_HAS_PRODUCTS: "BRAND_HAS_PRODUCTS",
  CATEGORY_NOT_FOUND: "CATEGORY_NOT_FOUND",
  CATEGORY_INACTIVE: "CATEGORY_INACTIVE",
  CATEGORY_ALREADY_EXISTS: "CATEGORY_ALREADY_EXISTS",
  PRODUCT_NOT_FOUND: "PRODUCT_NOT_FOUND",
  VARIANT_NOT_FOUND: "VARIANT_NOT_FOUND",
} as const;

export type CatalogErrorCode =
  (typeof CATALOG_ERROR_CODES)[keyof typeof CATALOG_ERROR_CODES];

export class CatalogError extends ApiError {
  constructor(
    public readonly code: CatalogErrorCode,
    message: string,
    statusCode: number = 400,
  ) {
    super(statusCode, message);
    this.name = "CatalogError";
  }
}
