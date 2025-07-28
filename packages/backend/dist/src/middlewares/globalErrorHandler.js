import { ZodError } from "zod";
// coustom Api endpoint error creator
export class ApiError extends Error {
    statusCode;
    isOperational;
    constructor(statusCode, message, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.name = "ApiError";
        //Add stack tracing here, later
    }
}
// globall error handler
const globalErrorHandler = (err, req, res, next) => {
    // some code error programing error
    let statusCode = 500;
    let message = "Generic internal server error";
    let errors; //zodError (if using safeParse) or some other have errors as property 
    // for user errors
    if (err instanceof ApiError) {
        statusCode = 400;
        message = err.message;
        //stack trace logic will come here
    }
    else if (err instanceof ZodError) {
        //for zodError
        statusCode = 400;
        message = err.message;
        errors = err.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    }
    // add more type of errors later 
    res.status(statusCode).json({
        success: false,
        message
    });
};
