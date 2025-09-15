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
export const startGracefullShutdown = (signal, serverInstance, dbDisconnect) => {
    console.log(`Recived signal: ${signal}, starting gracefull server shutdown`);
    serverInstance.close(async () => {
        console.log("HTTP server closed.");
        try {
            await dbDisconnect();
        }
        catch (error) {
            console.error(`error disconnecting the mongoDB:- ${error}`);
        }
        process.exit(0);
    });
    //forced shutdown after 30 seconds
    setTimeout(() => {
        console.log("Forced shutdown after timeout");
        process.exit(1);
    }, 30000);
};
