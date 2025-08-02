import mongoose from "mongoose";
import { createApp } from "./src/app.js";
import { connectDB } from "./src/config/dbconfig.js";
import { env } from "./src/config/env.js";
import { startGracefullShutdown } from "./src/utilities/utilites.js";

const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    const app = createApp();

    const server = app.listen(env.PORT, () => {
      console.log(`server started and listening on port: ${env.PORT}`);
      console.log(`ENVIORNMNET:- ${env.NODE_ENV}`);

      if (env.NODE_ENV == "development") {
        console.log(`Health check:- http://localhost:${env.PORT}/health`);
      }
    });

    process.on("SIGTERM", () => startGracefullShutdown("SIGTERM", server, mongoose.disconnect));
    process.on("SIGINT", () => startGracefullShutdown("SIGINT", server , mongoose.disconnect));
  } catch (error) {
    console.log(`Unable to start the server becasue of error:- ${error}`);
    process.exit(1);
  }
};

startServer();
