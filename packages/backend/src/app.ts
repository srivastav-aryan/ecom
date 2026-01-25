import express, { NextFunction, Request, Response } from "express";
import helmet from "helmet";
import { env } from "./config/env.js";
import compression from "compression";
import morgan from "morgan";
import { logger } from "./utils/logging.utils.js";
import { randomUUID } from "node:crypto";
import { authRouter } from "./routes/auth.routes.js";
import { globalErrorHandler } from "./middlewares/globalErrorHandler.js";
import cookieParser from "cookie-parser";

const setupMiddleWares = (app: express.Application): void => {
  app.use(
    helmet({
      contentSecurityPolicy: env.NODE_ENV == "development" ? false : undefined,
    }),
  );

  app.use(compression());

  app.use((req: Request, res: Response, next: NextFunction) => {
    req.id = randomUUID();
    req.log = logger.child({ reqId: req.id });

    req.log.info({ method: req.method, url: req.url }, "Incoming Request");

    next();
  });

  if (env.NODE_ENV == "production") {
    morgan.token("user-id", (req) =>
      //@ts-ignore
      req.user?.id ? String(req.user.id) : "Guest",
    );
    //@ts-ignore
    morgan.token("req-id", (req) => req.id);

    app.use(
      morgan(
        (tokens, req, res) => {
          return JSON.stringify({
            timestamp: new Date().toISOString(),
            reqId: tokens["req-id"](req, res),
            method: tokens.method(req, res),
            url: tokens.url(req, res),
            status: tokens.status(req, res),
            responseTime: tokens["response-time"](req, res),
            userId: tokens["user-id"](req, res),
          });
        },
        {
          stream: {
            write: (mssg: string) => {
              try {
                logger.info(JSON.parse(mssg));
              } catch (error) {
                logger.error("failed to parse morgan log ");
              }
            },
          },
        },
      ),
    );
  } else {
    app.use(morgan("dev"));
  }


  app.use(cookieParser())

  app.use(
    express.json({
      limit: "10mb",
      type: "application/json",
    }),
  );

  app.use(
    express.urlencoded({
      limit: "10mb",
      extended: true,
    }),
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

  // user endpoint for REST API
  app.use("/api/user", authRouter);

  //global error handler
  app.use(globalErrorHandler);

  return app;
};
