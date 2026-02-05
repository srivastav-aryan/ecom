import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import { authCache } from "../cache/auth.cache.js";
import { TokenServiceInterface, JWT_ERROR_CODES, JWTError } from "../interfaces/services/token.service.interface.js";
import { UserServiceInterface } from "../interfaces/services/user.service.interface.js";
import { RequestContext } from "../types/request-context.js";

export const auth_cache_TTL = 5 * 60 * 1000;

export const createAuthMiddleware = (
  tokenService: TokenServiceInterface,
  userService: UserServiceInterface,
) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    // Create context for this request
    const ctx: RequestContext = {
      logger: req.log?.child({ middleware: "auth" }),
      deviceInfo: req.headers['user-agent'] || 'unknown',
      ip: req.ip || 'unknown',
      requestId: req.id,
    };

    try {
      const accessToken = tokenService.extractTokenFromHeader(
        req.headers.authorization,
        ctx,
      );

      const decoded = tokenService.verifyAccessToken(accessToken, ctx);

      const userId: string = decoded._id;

      let cachedUser = authCache.get(userId);

      if (!cachedUser) {
        const user = await userService.findUserByIdForAuth(userId, ctx);

        if (!user.isActive) {
          throw new JWTError("User inactive", JWT_ERROR_CODES.INVALID);
        }

        authCache.set(userId, {
          role: user.role,
          isActive: user.isActive,
          permissions: user.permissions,
          expiresAt: Date.now() + auth_cache_TTL,
        });

        req.user = {
          _id: new Types.ObjectId(decoded._id),
          role: decoded.role,
          email: decoded.email,
        };
      }

      if (!cachedUser?.isActive) {
        throw new JWTError("User inactive", JWT_ERROR_CODES.INVALID);
      }

      next();
    } catch (error) {
      if (error instanceof JWTError) {
        return next(error);
      }
      next(
        new JWTError(
          "Authentication failed",
          JWT_ERROR_CODES.MALFORMED,
          false,
        ),
      );
    }
  };
};
