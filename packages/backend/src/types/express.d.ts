import { Types } from "mongoose";
import type { IUser } from "../models/user.model";
import type pino from "pino";
import { UserRole } from "@e-com/shared/types";

declare global {
  namespace Express {
    interface Request {
      id: string;
      log: pino.Logger;
      user?: {
        _id: Types.ObjectId,
        email: string,
        role: UserRole
      };
    }
  }
}

export { };
