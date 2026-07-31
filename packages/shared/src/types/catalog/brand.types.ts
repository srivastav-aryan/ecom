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
