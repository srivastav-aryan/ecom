// coustom Api endpoint error creator
export class ApiError extends Error {
    statusCode;
    isOperational;
    constructor(statusCode, message, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.name = "ApiError";
        //stack tracing
        Error.captureStackTrace(this, this.constructor);
    }
}
