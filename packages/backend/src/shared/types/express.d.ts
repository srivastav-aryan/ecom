import { Types } from "mongoose";
import type pino from "pino";
import { UserRole, Permission } from "@e-com/shared/authorization";

declare global {
  namespace Express {
    interface Request {
      id: string;
      log: pino.Logger;
      user?: {
        _id: Types.ObjectId,
        email: string,
        role: UserRole,
        permissions: Permission[],
      };
    }
  }
}

export { };
