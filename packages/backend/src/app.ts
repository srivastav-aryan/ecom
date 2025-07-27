import express, { Request, Response } from "express";
import helmet from "helmet";
import { env } from "./config/env.js";
import compression from "compression";
import morgan from "morgan";

const setupMiddleWares = (app: express.Application): void => {
  app.use(
    helmet({
      contentSecurityPolicy: env.NODE_ENV == "development" ? false : undefined,
    })
  );

  app.use(compression());

  app.use(morgan(env.NODE_ENV == "development" ? "dev" : "combined"));

  app.use(
    express.json({
      limit: "10mb",
      type: "application/json",
    })
  );

  app.use(
    express.urlencoded({
      limit: "10mb",
      extended: true,
    })
  );
};

export const createApp = (): express.Application => {
  const app = express();

  //setting up the  middlewares
  setupMiddleWares(app);

  app.get("/health", (req: Request, res: Response) => {
    res.json({
      status: "OK",
      timeStamp: new Date().toISOString(),
      environment: env.NODE_ENV,
    });
  });

  return app;
};
