import { NextFunction, Request, Response } from "express";
import { ZodObject, ZodError } from "zod";

const validateReq =
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
