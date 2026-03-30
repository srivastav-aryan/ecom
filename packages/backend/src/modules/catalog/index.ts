// === Catalog Module Public API ===
// Other modules should ONLY import from this file, never reach into internals.

export { Product, type IProduct } from "./models/product.model.js";
export { ProductVariant, type IProductVariant } from "./models/productVariant.model.js";
export { Category, type ICategory } from "./models/category.model.js";
export { Brand, type IBrand } from "./models/brand.model.js";
