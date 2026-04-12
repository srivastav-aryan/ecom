/**
 * catalog/index.ts
 *
 * Barrel export for all public catalog schemas and types.
 *
 * Notice that catalog.atoms.js is NOT exported here. Atoms are internal
 * implementation details of the catalog schemas. Consumers of this package
 * (like the backend services and frontend UI) should only ever import the
 * finished schemas and types.
 */

export * from "./brand.schema.js";
export * from "./category.schema.js";
export * from "./product.schema.js";
export * from "./variant.schema.js";
