import { CreateCategoryInput } from "@e-com/shared/schemas";
import { RequestContext } from "../../../shared/types/request-context.js";
import { ICategory } from "../models/category.model.js";

export interface ICategoryServices {

  createCategory(input: CreateCategoryInput , ctx?: RequestContext ): Promise<ICategory>

}
