// coustom Api endpoint error creator
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public isOperational = true
  ) {
    super(message);
    this.name = "ApiError";

    //stack tracing
    Error.captureStackTrace(this, this.constructor);
  }
}
