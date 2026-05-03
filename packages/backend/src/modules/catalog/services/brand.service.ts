import { CreateBrandInput, UpdateBrandInput } from "@e-com/shared/schemas";
import { IBrandService } from "../interfaces/brand.service.interface.js";
import { RequestContext } from "../../../shared/types/request-context.js";
import { IBrand, Brand } from "../models/brand.model.js";
import { generateSlug } from "../../../shared/utils/slug.utils.js";
import { ApiError } from "../../../shared/utils/applevel.utils.js";
import { BrandListQuery } from "@e-com/shared/schemas";
import {
  PaginatedResult,
  parsePagination,
  buildPaginationMeta,
} from "../../../shared/utils/pagination.utils.js";

export class BrandService implements IBrandService {
  async createBrand(
    input: CreateBrandInput,
    ctx?: RequestContext,
  ): Promise<IBrand> {
    ctx?.logger?.info({ Brandname: input.name }, "Creating brand");

    try {
      const slug = input.slug ?? generateSlug(input.name);

      const brand = await Brand.create({
        name: input.name,
        slug,
        description: input.description,
        logo: input.logo,
      });

      ctx?.logger?.info({ brandId: brand.id }, "Brand created");

      return brand;
    } catch (error: any) {
      if (error.code === 11000) {
        ctx?.logger?.warn(
          { slug: input.slug },
          "Attempt to create a brand with an already registered slug or name",
        );
        throw new ApiError(
          409,
          "The slug or name is already registered. Please use a different one",
        );
      }
      throw error;
    }
  }
  async getBrandById(id: string, ctx?: RequestContext): Promise<IBrand> {
    ctx?.logger?.debug({ brandId: id }, "Fetching brand by ID");
    const brand = await Brand.findById(id).lean();
    if (!brand) {
      ctx?.logger?.warn({ brandId: id }, "Brand not found");
      throw new ApiError(404, "Brand not found");
    }
    return brand as IBrand;
  }
  async getBrandBySlug(slug: string, ctx?: RequestContext): Promise<IBrand> {
    ctx?.logger?.debug({ slug }, "Fetching brand by slug");
    const brand = await Brand.findOne({ slug }).lean();
    if (!brand) {
      ctx?.logger?.warn({ slug }, "Brand not found");
      throw new ApiError(404, "Brand not found");
    }
    return brand as IBrand;
  }

  async listBrands(
    query: BrandListQuery,
    ctx?: RequestContext,
  ): Promise<PaginatedResult<IBrand>> {
    ctx?.logger?.debug({ query }, "Fetching brands based on query");

    // service level validation for query params after zod validation
    const { page, limit, skip } = parsePagination(query.page, query.limit);

    // querry building for passing to the DB query
    const filter: Record<string, any> = {
      isActive: query.isActive,
    };

    if (query.search) {
      filter.name = { $regex: query.search, $options: "i" };
    }

    const [totalCount, brands] = await Promise.all([
      Brand.countDocuments(filter),
      Brand.find(filter).sort({ name: 1 }).skip(skip).limit(limit).lean(),
    ]);
    return {
      items: brands as IBrand[],
      pagination: buildPaginationMeta(totalCount, page, limit),
    };
  }

  async updateBrand(
    id: string,
    input: UpdateBrandInput,
    ctx?: RequestContext,
  ): Promise<IBrand> {
    ctx?.logger?.info({ brandId: id }, "Updating brand");
    ctx?.logger?.debug({ input }, "Update payload");

    try {
      const brand = await Brand.findByIdAndUpdate(
        id,
        { $set: input },
        { new: true, runValidators: true },
      ).lean();

      if (!brand) {
        throw new ApiError(404, "Brand not found");
      }

      ctx?.logger?.info({ brandId: id }, "Brand updated");
      return brand as IBrand;
    } catch (error: any) {
      if (error.code === 11000) {
        ctx?.logger?.warn(
          { brandId: id },
          "Attempt to update a brand with an already registered name",
        );
        throw new ApiError(
          409,
          "The name is already registered. Please use a different one",
        );
      }
      throw error;
    }
  }
}
