// Following factory function pattern instead of classes
import { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";
import { ApiError } from "../utils/applevel.utils.js";
import { TokenServiceInterface } from "../interfaces/services/token.service.interface.js";
import { RequestContext } from "../types/request-context.js";
import pino from "pino";
import { IAuthService } from "../interfaces/services/auth.service.interface.js";

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
        const { accessToken, refreshToken } = await authServices.registerUser(
          req.body,
          ctx,
        );

        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: parseInt(env.REFRESH_TOKEN_EXPIRY),
        });

        res.status(201).json({
          success: true,
          data: { accessToken },
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

        const { accessToken, refreshToken } = await authServices.loginUser(
          req.body,
          ctx,
        );

        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: env.NODE_ENV === "production",
          sameSite: "strict",
          path: "/auth/refresh",
          maxAge:
            parseInt(env.REFRESH_TOKEN_EXPIRY, 10) || 7 * 24 * 60 * 60 * 1000,
        });

        res.status(200).json({
          success: true,
          data: { accessToken, refreshToken },
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

        const { accessToken, refreshToken } = await authServices.refreshService(
          oldRefToken,
          ctx,
        );

        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: env.NODE_ENV === "production",
          sameSite: "strict",
          path: "/auth/refresh",
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(200).json({
          success: true,
          data: { accessToken },
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
          httpOnly: true,
          secure: env.NODE_ENV === "production",
          sameSite: "strict",
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
