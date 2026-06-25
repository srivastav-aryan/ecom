import type { Request, Response, NextFunction } from "express";

export interface BrandControllerInterface {
  createBrand(req: Request, res: Response, next: NextFunction): Promise<void>;
  listBrands(req: Request, res: Response, next: NextFunction): Promise<void>;
  getBrandBySlug(req: Request, res: Response, next: NextFunction): Promise<void>;
  getBrandById(req: Request, res: Response, next: NextFunction): Promise<void>;
  updateBrand(req: Request, res: Response, next: NextFunction): Promise<void>;
  softDeleteBrand(req: Request, res: Response, next: NextFunction): Promise<void>;
  hardDeleteBrand(req: Request, res: Response, next: NextFunction): Promise<void>;
}
