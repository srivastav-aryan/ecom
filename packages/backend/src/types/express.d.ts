import type { IUser } from "../models/user.model";
import type pino from "pino";

declare global {
  namespace Express {
    interface Request {
      id: string;
      log: pino.Logger;
      user?: IUser;
    }
  }
}

export { };
