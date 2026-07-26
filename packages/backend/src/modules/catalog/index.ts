//Models
export { Product, type IProduct } from "./models/product.model.js";
export { ProductVariant, type IProductVariant } from "./models/productVariant.model.js";
export { Category, type ICategory } from "./models/category.model.js";
export { Brand, type IBrand } from "./models/brand.model.js";

// Services
export { BrandService } from "./services/brand.service.js";

// Interfaces
export type { IBrandService } from "./interfaces/brand.service.interface.js";
export type { BrandControllerInterface } from "./interfaces/brand.controller.interface.js";

// Controllers
export { brandControllerCreator } from "./controllers/brand.controller.js";

// Routes
export { createBrandRouter } from "./routes/brand.routes.js";



// Errors
export { CatalogError, type CatalogErrorCode, CATALOG_ERROR_CODES } from "./errors/catalog.errors.js";
