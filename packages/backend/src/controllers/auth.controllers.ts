// Following factory function pattern instead of classes

import { NextFunction, Request, Response } from "express";
import pino from "pino";
import { env } from "../config/env.js";
import { ApiError } from "../utils/applevel.utils.js";
import { userLoginInput, userRegistrationInput } from "@e-com/shared/schemas";

export interface IAuthService {
  registerUser: (
    input: userRegistrationInput,
    logger: pino.Logger
  ) => Promise<{ accessToken: string; refreshToken: string }>;
  loginUser: (
    input: userLoginInput,
    logger: pino.Logger
  ) => Promise<{ accessToken: string; refreshToken: string }>;
}

export interface RateLimiter {
  checkRateLimit: (
    identifier: string,
    logger?: pino.Logger
  ) => {
    allowed: boolean;
    remainingAttempts: number;
    resetTime: Date;
  };
}

export const authControllerCreator = (authServices: IAuthService, loginLimitter: RateLimiter) => {
  return {
    register: async (req: Request, res: Response, next: NextFunction) => {
      //@ts-ignore
      const logger = req.log.child({ route: "register" });

      try {
        const { accessToken, refreshToken } = await authServices.registerUser(
          req.body,
          logger
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

    login: async (req: Request, res: Response, next: NextFunction) => {
      //@ts-ignore
      const logger = req.log.child({ route: "login" });

      try {
        const { email } = req.body;

        const result = loginLimitter.checkRateLimit(
          email || req.ip,
          logger.child({ email })
        );

        if (!result.allowed) {
          throw new ApiError(
            429,
            "Too many login attempts. Try again later.",
            false
          );
        }

        const { accessToken, refreshToken } = await authServices.loginUser(
          req.body,
          logger
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
          data: { accessToken },
          message: "User logged in successfully",
        });
      } catch (error) {
        next(error);
      }
    },
  };
};
