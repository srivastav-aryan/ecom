import { LeanBrand } from "../models/brand.model.js";
import { CreateBrandInput, UpdateBrandInput, BrandListQuery } from "@e-com/shared/schemas";
import { RequestContext } from "../../../shared/types/request-context.js";
import { PaginatedResult } from "../../../shared/utils/pagination.utils.js";

export interface IBrandService {
  createBrand(input: CreateBrandInput, ctx?: RequestContext): Promise<LeanBrand>;
  getBrandById(id: string, ctx?: RequestContext): Promise<LeanBrand>;
  getBrandBySlug(slug: string, ctx?: RequestContext): Promise<LeanBrand>;
  listBrands(query: BrandListQuery, ctx?: RequestContext): Promise<PaginatedResult<LeanBrand>>;
  updateBrand(id: string, input: UpdateBrandInput, ctx?: RequestContext): Promise<LeanBrand>;
  softDeleteBrand(id: string, ctx?: RequestContext): Promise<void>;
  hardDeleteBrand(id: string, ctx?: RequestContext): Promise<void>;
}
