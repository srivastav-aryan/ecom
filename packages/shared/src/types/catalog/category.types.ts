export type CategoryResponse = {
  id: string,
  name: string,
  slug: string,
  description: string,
  parent: string | null,
  ancestors: string[],
  isActive: boolean,
  isEffectivelyActive: boolean,
  blockingAncestorId: string | null,
  createdAt: string,
  updatedAt: string,
} 
