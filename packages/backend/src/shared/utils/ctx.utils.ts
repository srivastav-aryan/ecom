import { RequestContext } from "../types/request-context.js";
import { Request } from "express";

export const createCtx = (req: Request, route: string): RequestContext => ({
  logger: req.log.child({ route }),
  deviceInfo: req.headers["user-agent"] || "unknown",
  ip: req.ip || "unknown",
  requestId: req.id,
});

