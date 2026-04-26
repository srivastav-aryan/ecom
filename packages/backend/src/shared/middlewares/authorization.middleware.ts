import { Permission, hasPermission } from "@e-com/shared/authorization";
import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/applevel.utils.js";

export const authorize = (requiredPermission: Permission) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. Ensure the user is authenticated
      if (!req.user) {
        throw new ApiError(401, "Authentication required");
      }

      
      // (These were populated by authentication.middleware from Cache/DB)
      const role = req.user.role;
      const userSpecificPermissions = req.user.permissions || [];

      // 3. Evaluate using the centralized logic from shared package
      const isAuthorized = hasPermission(role, userSpecificPermissions, requiredPermission);

      if (!isAuthorized) {
        if (req.log) {
          req.log.warn(
            { userId: req.user._id, role, required: requiredPermission },
            "Authorization denied"
          );
        }
        throw new ApiError(403, "Insufficient permissions to perform this action");
      }

      // 4. User holds the necessary permission, proceed to controller
      next();
    } catch (error) {
      next(error);
    }
  };
};
