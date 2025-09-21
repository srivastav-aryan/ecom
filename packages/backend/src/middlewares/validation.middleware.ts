import { NextFunction, Request, Response } from "express";
import { ZodObject } from "zod";

export const validateReq =
  (schema: ZodObject<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        querry: req.query,
        params: req.params,
      });

      next();
    } catch (error) {
      next(error);
    }
  };
