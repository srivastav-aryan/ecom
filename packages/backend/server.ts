import { createApp } from "./src/app.js";
import { env } from "./src/config/env.js";

const startServer = (): void => {
  try {
    const app = createApp();

    const server = app.listen(env.PORT, () => {
      console.log(`server started and listening on port: ${env.PORT}`);
      console.log(`ENVIORNMNET:- ${env.NODE_ENV}`);

      if (env.NODE_ENV == "development") {
        console.log(`Health check:- http://localhost:${env.PORT}/health`);
      }
    });

    const startGracefullShutdown = (signal: string): void => {
      console.log(
        `Recived signal: ${signal}, starting gracefull server shutdown`
      );

      server.close(() => {
        console.log("HTTP server closed.");
        process.exit(0);
      });

      //forced shutdown after 30 seconds
      setTimeout(() => {
        console.log("Forced shutdown after timeout");
        process.exit(1);
      }, 30000);
    };
    
    process.on("SIGTERM", () => startGracefullShutdown("SIGTERM"));
    process.on("SIGINT", () => startGracefullShutdown("SIGINT"));
  } catch (error) {
    console.log(`Unable to start the server becasue of error:- ${error}`);
    process.exit(1);
  }
};

startServer();
