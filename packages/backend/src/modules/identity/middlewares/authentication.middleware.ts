import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import { authCache } from "../cache/auth.cache.js";
import { TokenServiceInterface, JWT_ERROR_CODES, JWTError } from "../interfaces/token.service.interface.js";
import { UserServiceInterface } from "../interfaces/user.service.interface.js";
import { RequestContext } from "../../../shared/types/request-context.js";

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

      // Cache Miss: Fetch from DB and populate cache
      if (!cachedUser) {
        const user = await userService.findUserByIdForAuth(userId, ctx);

        if (!user.isActive) {
          throw new JWTError("User inactive", JWT_ERROR_CODES.INVALID);
        }

        cachedUser = {
          role: user.role,
          isActive: user.isActive,
          permissions: user.permissions,
          expiresAt: Date.now() + auth_cache_TTL,
        };
        
        authCache.set(userId, cachedUser);
      }

      // Check if user is active based on cached or freshly fetched data
      if (!cachedUser.isActive) {
        throw new JWTError("User inactive", JWT_ERROR_CODES.INVALID);
      }

      // Unconditionally attach the user object to the request for downstream middlewares
      req.user = {
        _id: new Types.ObjectId(decoded._id),
        role: cachedUser.role,
        email: decoded.email, // email comes from JWT, not cache
        permissions: cachedUser.permissions,
      };

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
