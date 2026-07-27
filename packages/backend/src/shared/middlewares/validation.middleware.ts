import { NextFunction, Request, Response } from "express";
import { ZodObject } from "zod";

export const validateReq =
  (schema: ZodObject<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsedData =  schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      if (parsedData.body !== undefined) req.body = parsedData.body;
      if (parsedData.query !== undefined) req.query = parsedData.query as any;
      if (parsedData.params !== undefined) req.params = parsedData.params as any;

      next();
    } catch (error) {
      next(error);
    }
  };
