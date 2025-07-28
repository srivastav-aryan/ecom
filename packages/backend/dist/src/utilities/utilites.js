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
