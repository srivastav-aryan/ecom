import type { Request, Response, NextFunction } from "express";

export interface AuthControllerInterface {
  registerController(req: Request, res: Response, next: NextFunction): Promise<void>;
  loginController(req: Request, res: Response, next: NextFunction): Promise<void>;
  refreshController(req: Request, res: Response, next: NextFunction): Promise<void>;
  logOut(req: Request, res: Response, next: NextFunction): Promise<void>;
}
