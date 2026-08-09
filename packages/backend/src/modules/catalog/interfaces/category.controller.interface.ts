import { NextFunction, Request, Response } from "express";

export interface ICategoryControllerInterface {
  createCategory(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void>;
}
