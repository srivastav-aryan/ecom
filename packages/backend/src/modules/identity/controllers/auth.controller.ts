// Following factory function pattern instead of classes
import { NextFunction, Request, Response } from "express";
import { cookieOptions } from "../../../shared/utils/cookie.utils.js";
import { ApiError } from "../../../shared/utils/applevel.utils.js";
import { TokenServiceInterface } from "../interfaces/token.service.interface.js";
import { AuthCacheEntry, authCache } from "../cache/auth.cache.js";
import { RequestContext } from "../../../shared/types/request-context.js";
import pino from "pino";
import { IAuthService } from "../interfaces/auth.service.interface.js";
import { userForAuthStatus, responseForAuth } from "@e-com/shared/types";

export interface RateLimiter {
  checkRateLimit: (
    identifier: string,
    logger?: pino.Logger,
  ) => {
    allowed: boolean;
    remainingAttempts: number;
    resetTime: Date;
  };
}

/**
 * Creates RequestContext from Express request
 */
const createCtx = (req: Request, route: string): RequestContext => ({
  logger: req.log.child({ route }),
  deviceInfo: req.headers["user-agent"] || "unknown",
  ip: req.ip || "unknown",
  requestId: req.id,
});

export const authControllerCreator = (
  authServices: IAuthService,
  loginLimiter: RateLimiter,
  tokenService: TokenServiceInterface,
) => {
  return {
    registerController: async (
      req: Request,
      res: Response,
      next: NextFunction,
    ) => {
      const ctx = createCtx(req, "register");

      try {
        const { accessToken, refreshToken, user } =
          await authServices.registerUser(req.body, ctx);

        // preparing the user data for auth caching
        const authCacheEntry: AuthCacheEntry = {
          role: user.role,
          permissions: user.permissions,
          isActive: user.isActive ?? true,
          expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes TTL
        };

        // preparing the user data for auth response for the client state
        const userForAuth: userForAuthStatus = {
          email: user.email,
          firstname: user.firstname,
          lastname: user.lastname,
          role: user.role,
          permissions: user.permissions,
        };

        // setting the auth cache
        authCache.set(user.id, authCacheEntry);

        const responseData: responseForAuth = {
          accessToken,
          user: userForAuth,
        };

        res.cookie("refreshToken", refreshToken, {
          ...cookieOptions,
          path: "/api/auth/refresh",
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(201).json({
          success: true,
          data: responseData,
          message: "User Registered Successfully",
        });
      } catch (error) {
        next(error);
      }
    },

    loginController: async (
      req: Request,
      res: Response,
      next: NextFunction,
    ) => {
      const ctx = createCtx(req, "login");

      try {
        const { email } = req.body;

        const result = loginLimiter.checkRateLimit(
          email || req.ip,
          ctx.logger?.child({ email }),
        );

        if (!result.allowed) {
          throw new ApiError(
            429,
            "Too many login attempts. Try again later.",
            false,
          );
        }

        const { accessToken, refreshToken, user } =
          await authServices.loginUser(req.body, ctx);

        // preparing the user data for auth caching
        const authCacheEntry: AuthCacheEntry = {
          role: user.role,
          permissions: user.permissions,
          isActive: user.isActive ?? true,
          expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes TTL
        };
        
        authCache.set(user.id, authCacheEntry);

        // preparing the user data for auth response for the client state
        const userForAuth: userForAuthStatus = {
          email: user.email,
          firstname: user.firstname,
          lastname: user.lastname,
          role: user.role,
          permissions: user.permissions,
        };


        const responseData: responseForAuth = {
          accessToken,
          user: userForAuth,
        };

        res.cookie("refreshToken", refreshToken, {
          ...cookieOptions,

          path: "/api/auth/refresh",
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(200).json({
          success: true,
          data: responseData,
          message: "User logged in successfully",
        });
      } catch (error) {
        next(error);
      }
    },

    refreshController: async (
      req: Request,
      res: Response,
      next: NextFunction,
    ) => {
      const ctx = createCtx(req, "refresh_token");
      try {
        const oldRefToken = tokenService.extractRefreshToken(
          req.cookies,
          req.body,
          ctx,
        );

        const { accessToken, refreshToken, user } =
          await authServices.refreshService(oldRefToken, ctx);

        // preparing the user data for auth caching
        const authCacheEntry: AuthCacheEntry = {
          role: user.role,
          permissions: user.permissions,
          isActive: user.isActive ?? true,
          expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes TTL
        };
        
        authCache.set(user.id, authCacheEntry);

        const userForAuth: userForAuthStatus = {
          email: user.email,
          firstname: user.firstname,
          lastname: user.lastname,
          role: user.role,
          permissions: user.permissions,
        };

        res.cookie("refreshToken", refreshToken, {
          ...cookieOptions,
          path: "/api/auth/refresh",
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        const responseData: responseForAuth = {
          accessToken,
          user: userForAuth,
        };

        res.status(200).json({
          success: true,
          data: responseData,
          message: "Token refreshed successfully",
        });
      } catch (error) {
        next(error);
      }
    },

    logOut: async (req: Request, res: Response, next: NextFunction) => {
      const ctx = createCtx(req, "log out one device routee");
      try {
        const refreshToken = tokenService.extractRefreshToken(
          req.cookies,
          req.body,
          ctx,
        );

        await authServices.deleteOneSession(refreshToken);

        res.clearCookie("refreshToken", {
          ...cookieOptions,
          path: "/auth/refresh",
        });

        res.status(200).json({
          success: true,
          message: "Logout successful",
        });
      } catch (error: any) {
        next(error);
      }
    },
  };
};
