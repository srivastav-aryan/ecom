export type CategoryResponse = {
  id: string,
  name: string,
  slug: string,
  description: string,
  parent: string | null,
  ancestors: string[],
  isActive: boolean,
  isEffectivelyActive: boolean,
  createdAt: string,
  updatedAt: string,
} 
