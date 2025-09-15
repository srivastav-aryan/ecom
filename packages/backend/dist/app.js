import express from "express";
import helmet from "helmet";
import { env } from "./config/env.js";
import compression from "compression";
import morgan from "morgan";
import { createStream } from "rotating-file-stream";
import path from "node:path";
const logStreams = createStream("access.log", {
    path: path.join(__dirname, "..", "logs"),
    interval: "1d",
    maxSize: "10M",
    compress: "gzip",
});
const setupMiddleWares = (app) => {
    app.use(helmet({
        contentSecurityPolicy: env.NODE_ENV == "development" ? false : undefined,
    }));
    app.use(compression());
    if (env.NODE_ENV == "production") {
        morgan.token("user-id", (req) => (req.user?.id ?  : ));
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
