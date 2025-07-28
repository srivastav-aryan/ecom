import { NextFunction, Request, Response } from "express";
import { success, ZodError } from "zod";

// coustom Api endpoint error creator
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public isOperational = true
  ) {
    super(message);
    this.name = "ApiError";

    //Add stack tracing here, later
  }
}

// globall error handler
const globalErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // some code error programing error
  let statusCode = 500;
  let message = "Generic internal server error";
  let errors: string[] | undefined;  //zodError (if using safeParse) or some other have errors as property 

  // for user errors
  if (err instanceof ApiError) {
    statusCode = 400;
    message = err.message;
    //stack trace logic will come here
  } else if (err instanceof ZodError) {
    //for zodError
    statusCode = 400
    message = err.message
    errors = err.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`)
  }
  // add more type of errors later 


  res.status(statusCode).json({
    success: false,
    message
  })
};
