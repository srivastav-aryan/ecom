import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { ApiError } from "../utils/applevel.utils.js";
import { env } from "../config/env.js";
import { JWTError } from "../../modules/identity/interfaces/token.service.interface.js";
import { ErrorResponse } from "@e-com/shared/types";

// globall error handler
export const globalErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = "Generic internal server error";
  let errors: any = undefined;
  let code;

  if (err instanceof ApiError) {
    // for user errors
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof ZodError) {
    //for zodError
    statusCode = 400;
    message = err.message;

    errors = err.issues.map((error) => ({
      path: error.path,
      message: error.message,
    }));
  }
  else if (err instanceof JWTError){
    statusCode = err.statusCode
    message = err.message
    code = err.code
  }

  // log for debuging
  console.error(
    `error occured with statusCode:- ${statusCode} and message:-${message}`
  );
  
  const errorResponse: ErrorResponse = {
    success: false,
    message,
    code,
    ...(errors && { errors: errors }),
    ...(env.NODE_ENV === "development" ? { stack: err.stack } : {}),
  }
  res.status(statusCode).json(errorResponse);
};
