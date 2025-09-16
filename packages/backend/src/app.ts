import express, { Request, Response } from "express";
import helmet from "helmet";
import { env } from "./config/env.js";
import compression from "compression";
import morgan from "morgan";
import { logStream } from "./utilities/logging.js";

const setupMiddleWares = (app: express.Application): void => {
  app.use(
    helmet({
      contentSecurityPolicy: env.NODE_ENV == "development" ? false : undefined,
    })
  );

  app.use(compression());

  if (env.NODE_ENV == "production") {
    morgan.token("user-id", (req) =>
      // @ts-ignore
      req.user?.id ? String(req.user.id) : "Guest"
    );

    app.use(
      morgan(
        (tokens, req, res) => {
          return JSON.stringify({
            timestamp: new Date().toISOString(),
            method: tokens.method(req, res),
            url: tokens.url(req, res),
            status: tokens.status(req, res),
            responseTime: tokens["response-time"](req, res),
            userId: tokens["user-id"](req, res),
          });
        },
        { stream: logStream }
      )
    );
  } else {
    app.use(morgan("dev"));
  }

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
