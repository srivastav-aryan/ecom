import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { ApiError } from "../utilities/utilites.js";
import { env } from "../config/env.js";

// globall error handler
export const globalErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // some code error programing error
  let statusCode = 500;
  let message = "Generic internal server error";
  let errors: any = undefined;

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
  // add more type of errors later

  // log for debuging
  console.error(
    `error occured with statusCode:- ${statusCode} and message:-${message}`
  );
  if (env.NODE_ENV == "development") {
    console.error(`the stacktrace:- ${err.stack}`);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors: errors }),
    ...(env.NODE_ENV === "development" ? { stack: err.stack } : {}),
  });
};
