import { IBrand } from "../models/brand.model.js";
import { CreateBrandInput, UpdateBrandInput, BrandListQuery } from "@e-com/shared/schemas";
import { RequestContext } from "../../../shared/types/request-context.js";
import { PaginatedResult } from "../../../shared/utils/pagination.utils.js";

export interface IBrandService {
  createBrand(input: CreateBrandInput, ctx?: RequestContext): Promise<IBrand>;
  getBrandById(id: string, ctx?: RequestContext): Promise<IBrand>;
  getBrandBySlug(slug: string, ctx?: RequestContext): Promise<IBrand>;
  listBrands(query: BrandListQuery, ctx?: RequestContext): Promise<PaginatedResult<IBrand>>;
  updateBrand(id: string, input: UpdateBrandInput, ctx?: RequestContext): Promise<IBrand>;
  deleteBrand(id: string, ctx?: RequestContext): Promise<void>;
}
