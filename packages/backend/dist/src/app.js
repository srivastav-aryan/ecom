import express from "express";
import helmet from "helmet";
import { env } from "./config/env.js";
import compression from "compression";
import morgan from "morgan";
import { logger } from "./utilities/logging.js";
import { randomUUID } from "node:crypto";
const setupMiddleWares = (app) => {
    app.use(helmet({
        contentSecurityPolicy: env.NODE_ENV == "development" ? false : undefined,
    }));
    app.use((req, res, next) => {
        //@ts-ignore
        req.id = randomUUID();
        next();
    });
    app.use(compression());
    if (env.NODE_ENV == "production") {
        morgan.token("user-id", (req) => 
        // @ts-ignore
        req.user?.id ? String(req.user.id) : "Guest");
        //@ts-ignore
        morgan.token("req-id", (req) => req.id);
        app.use(morgan((tokens, req, res) => {
            return JSON.stringify({
                timestamp: new Date().toISOString(),
                reqId: tokens["req-id"](req, res),
                method: tokens.method(req, res),
                url: tokens.url(req, res),
                status: tokens.status(req, res),
                responseTime: tokens["response-time"](req, res),
                userId: tokens["user-id"](req, res),
            });
        }, {
            stream: {
                write: (mssg) => {
                    try {
                        logger.info(JSON.parse(mssg));
                    }
                    catch (error) {
                        logger.error("failed to parse morgan log ");
                    }
                },
            },
        }));
    }
    else {
        app.use(morgan("dev"));
    }
    app.use(express.json({
        limit: "10mb",
        type: "application/json",
    }));
    app.use(express.urlencoded({
        limit: "10mb",
        extended: true,
    }));
};
export const createApp = () => {
    const app = express();
    //setting up the  middlewares
    setupMiddleWares(app);
    app.get("/health", (req, res) => {
        res.json({
            status: "OK",
            timeStamp: new Date().toISOString(),
            environment: env.NODE_ENV,
        });
    });
    return app;
};
