import { env } from "../config/env.js";
import jwt, { JwtPayload, Secret, SignOptions } from "jsonwebtoken";
import { UserRole } from "@e-com/shared/types";
import pino from "pino";

export interface AccessTokenPayload extends JwtPayload {
  _id: string;
  email: string;
  role: UserRole;
}

export interface RefreshTokenPayload extends JwtPayload {
  _id: string;
}

export const JWT_ERROR_CODES = {
  EXPIRED: "EXPIRED",
  INVALID: "INVALID",
  MALFORMED: "MALFORMED",
  NO_TOKEN: "NO_TOKEN",
  MISSING_CLAIMS: "MISSING_CLAIMS",
  VERSION_MISMATCH: "VERSION_MISMATCH",
} as const;

export type JWTErrorCode =
  (typeof JWT_ERROR_CODES)[keyof typeof JWT_ERROR_CODES];

export class JWTError extends Error {
  constructor(
    message: string,
    public readonly code: JWTErrorCode,
    public readonly isOperational: boolean = true,
    public readonly statusCode: number = 401,
  ) {
    super(message);
    this.name = "JWTError";
    Error.captureStackTrace(this, this.constructor);
  }
}

// --------- SERVICE CLASS-------
export class TokenService {
  static generateAccessToken(payload: AccessTokenPayload): string {
    return jwt.sign({ ...payload }, env.ACCESS_TOKEN_SECRET as Secret, {
      expiresIn: (env.ACCESS_TOKEN_EXPIRY || "15m") as SignOptions["expiresIn"],
    });
  }

  static generateRefreshToken(payload: RefreshTokenPayload): string {
    return jwt.sign({ ...payload }, env.REFRESH_TOKEN_SECRET as Secret, {
      expiresIn: env.REFRESH_TOKEN_EXPIRY as SignOptions["expiresIn"],
    });
  }

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
  }> => {
    try {
      logger?.info("Verifying refresh token");
      logger?.debug("Decoding refresh token");
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

      return { decoded };
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
