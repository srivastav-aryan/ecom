import { createStream } from "rotating-file-stream";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pino from "pino";
import { env } from "../config/env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const logStream = createStream("access.log", {
  path: path.join(__dirname, "..", "logs"),
  interval: "1d",
  maxSize: "10M",
  compress: "gzip",
});

export const logger = pino(
  {
    level: env.NODE_ENV === "production" ? "info" : "debug",
    transport:
      env.NODE_ENV !== "production"
        ? {
            target: "pino-pretty",
            options: {
              colorize: true,
              translateTime: "SYS:standard", // nice readable timestamps
              ignore: "pid,hostname", // less noise
            },
          }
        : undefined,
  },
  env.NODE_ENV === "production" ? logStream : undefined
);
