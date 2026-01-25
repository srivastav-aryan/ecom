import { NextFunction, Request, Response } from "express";
import { JWT_ERROR_CODES, JWTError } from "../utils/jwt.utils";
import { Types } from "mongoose";
import JwtServices from "../services/jwt.service";
import { authCache } from "../cache/auth.cache";
import UserServices from "../services/user.service";

export const auth_cache_TTL = 5 * 60 * 1000;

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const logger = req.log;

    const accessToken = JwtServices.extractTokenFromHeader(
      req.headers.authorization,
      logger,
    );

    if (!accessToken) {
      throw new JWTError("Access token not provided", JWT_ERROR_CODES.NO_TOKEN);
    }

    const decoded = JwtServices.verifyAccessToken(accessToken, logger);

    const userId: string = decoded._id;

    let cachedUser = authCache.get(userId);

    if (!cachedUser) {
      const user = await UserServices.findUserByIdForAuth(userId, logger);

      if (!user || !user.isActive) {
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
        false, // isOperational = false (it's a programming error)
      ),
    );
  }
};
