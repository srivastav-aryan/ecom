import { NextFunction, Request, Response } from "express";

export interface ICategoryContollerInterface {
  createCategory(req: Request, res: Response, next: NextFunction ):Promise<void>; 
}
