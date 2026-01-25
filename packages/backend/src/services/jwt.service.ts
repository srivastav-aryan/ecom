import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import {
  AccessTokenPayload,
  RefreshTokenPayload,
  JWT_ERROR_CODES,
  JWTError,
} from "../utils/jwt.utils.js";
import { IUser } from "../models/user.model";
import pino from "pino";
import crypto from "crypto";
import { userSession, IUserSession } from "../models/userSession.model.js";

export default class JwtServices {
  static verifyAccessToken = (
    token: string,
    logger?: pino.Logger,
  ): AccessTokenPayload => {
    try {
      logger?.info({ token }, "Verifying access token");
      logger?.debug({ token }, "Decoding access token");
      const decoded = jwt.verify(
        token,
        env.ACCESS_TOKEN_SECRET,
      ) as AccessTokenPayload;

      logger?.debug({ decoded }, "Decoded access token");

      if (!decoded._id || !decoded.email || !decoded.role) {
        throw new JWTError(
          "claim missing from the token",
          JWT_ERROR_CODES.INVALID,
        );
      }

      logger?.debug({ decoded }, "Access token verified");

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        logger?.warn({ token }, "Access token has expired");
        throw new JWTError("access token has EXPIRED", JWT_ERROR_CODES.EXPIRED);
      }

      if (error instanceof jwt.JsonWebTokenError) {
        logger?.warn({ token }, "Access token is not valid");
        throw new JWTError("token is not valid", JWT_ERROR_CODES.INVALID);
      }

      if (error instanceof JWTError) {
        logger?.warn({ token }, "Access token verification failed");
        throw error;
      }

      logger?.error({ token }, "Access token verification failed");
      throw new JWTError(
        "Token verification failed",
        JWT_ERROR_CODES.MALFORMED,
      );
    }
  };

  static verifyRefreshToken = async (
    token: string,
    logger?: pino.Logger,
  ): Promise<{
    decoded: RefreshTokenPayload;
    userOfToken: IUser;
    session: Omit<IUserSession, "userId"> & { userId: IUser };
  }> => {
    try {
      logger?.info({ token }, "Verifying refresh token");
      logger?.debug({ token }, "Decoding refresh token");
      const decoded = jwt.verify(
        token,
        env.REFRESH_TOKEN_SECRET,
      ) as RefreshTokenPayload;

      logger?.debug({ decoded }, "Decoded refresh token");

      if (!decoded._id) {
        throw new JWTError(
          "missing claims in the token",
          JWT_ERROR_CODES.MALFORMED,
        );
      }

      logger?.debug({ decoded }, "Refresh token verified");

      const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

      // decission pending probally will need to create a separate session service

      const session = await userSession
        .findOne({ refreshTokenHash: hashedToken })
        .populate<{ userId: IUser }>("userId");

      if (session === null) {
        // nuke logout later beacuse this means the session could be comporomised
        logger?.warn(
          { decoded },
          "no such session found with this refresh token",
        );
        throw new JWTError("Session invalid", JWT_ERROR_CODES.INVALID);
      }

      if (!session.isValid) {
        // nuke logout later beacuse this means the session could be comporomised
        logger?.warn({ userId: decoded._id }, "Session marked as invalid");
        throw new JWTError("Session invalid", JWT_ERROR_CODES.INVALID);
      }

      const userOfToken = session.userId;

      if (userOfToken == null) {
        logger?.warn({ decoded }, "Invalid token no such user found");
        throw new JWTError(
          "invalid token no such user found",
          JWT_ERROR_CODES.INVALID,
        );
      }

      if (new Date() > session.expiresAt) {
        throw new JWTError("Session expired", JWT_ERROR_CODES.EXPIRED);
      }

      return { decoded, userOfToken, session };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        logger?.warn({ token }, "Refresh token is expired");
        throw new JWTError(
          "The refresh token  is expired",
          JWT_ERROR_CODES.EXPIRED,
        );
      }

      if (error instanceof jwt.JsonWebTokenError) {
        logger?.warn({ token }, "Refresh token is not valid");
        throw new JWTError(
          "Refresh token is not valid",
          JWT_ERROR_CODES.INVALID,
        );
      }

      if (error instanceof JWTError) {
        logger?.warn({ token }, "Refresh token verification failed");
        throw error;
      }

      logger?.error({ token }, "Refresh token verification failed");
      throw new JWTError(
        "Refresh token verification failed",
        JWT_ERROR_CODES.MALFORMED,
      );
    }
  };

  static extractTokenFromHeader(
    authHeader?: string,
    logger?: pino.Logger,
  ): string | null {
    if (!authHeader) {
      logger?.warn({ authHeader }, "No auth header provided");
      return null;
    }

    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      logger?.warn({ authHeader }, "Invalid auth header format");
      return null;
    }

    return parts[1];
  }

  static extractRefreshToken = (
    cookies?: Record<string, string>,
    body?: any,
    logger?: pino.Logger,
  ): string | null => {
    return cookies?.refreshToken || body?.refreshToken || null;
  };
}
