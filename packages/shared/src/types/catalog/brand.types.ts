/**
 * brand.types.ts
 *
 * Shared response types for Brand API endpoints.
 * Used by both backend (controller response shaping) and frontend (API client typing).
 *
 * These types define what the CLIENT sees — not the DB document shape.
 * The backend's IBrand (Mongoose Document) is an internal detail.
 * The controller maps IBrand → BrandResponse before sending to the client.
 */

export type BrandResponse = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};
