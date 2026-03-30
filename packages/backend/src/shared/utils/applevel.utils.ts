import { Server } from "node:http";


// custom Api endpoint error creator
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

export const startGracefullShutdown = (
  signal: string,
  serverInstance: Server,
  dbDisconnect : () => Promise<void>
): void => {
  console.log(`Recived signal: ${signal}, starting gracefull server shutdown`);

  serverInstance.close(async (): Promise<void> => {
    console.log("HTTP server closed.");

    try {
      await dbDisconnect();
    } catch (error) {
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
