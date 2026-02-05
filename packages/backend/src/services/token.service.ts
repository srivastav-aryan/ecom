import { env } from "../config/env.js";
import jwt, { Secret, SignOptions } from "jsonwebtoken";
import {
  AccessTokenPayload,
  RefreshTokenPayload,
  JWT_ERROR_CODES,
  JWTError,
  TokenServiceInterface,
} from "../interfaces/services/token.service.interface.js";
import { RequestContext } from "../types/request-context.js";

// --------- SERVICE CLASS-------
export class TokenService implements TokenServiceInterface {
  generateAccessToken(payload: AccessTokenPayload): string {
    return jwt.sign({ ...payload }, env.ACCESS_TOKEN_SECRET as Secret, {
      expiresIn: (env.ACCESS_TOKEN_EXPIRY || "15m") as SignOptions["expiresIn"],
    });
  }

  generateRefreshToken(payload: RefreshTokenPayload): string {
    return jwt.sign({ ...payload }, env.REFRESH_TOKEN_SECRET as Secret, {
      expiresIn: env.REFRESH_TOKEN_EXPIRY as SignOptions["expiresIn"],
    });
  }

  verifyAccessToken(token: string, ctx?: RequestContext): AccessTokenPayload {
    try {
      ctx?.logger?.info({ token }, "Verifying access token");
      ctx?.logger?.debug({ token }, "Decoding access token");
      const decoded = jwt.verify(
        token,
        env.ACCESS_TOKEN_SECRET,
      ) as AccessTokenPayload;

      ctx?.logger?.debug({ decoded }, "Decoded access token");

      if (!decoded._id || !decoded.email || !decoded.role) {
        throw new JWTError(
          "claim missing from the token",
          JWT_ERROR_CODES.INVALID,
        );
      }

      ctx?.logger?.debug({ decoded }, "Access token verified");

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        ctx?.logger?.warn({ token }, "Access token has expired");
        throw new JWTError("access token has EXPIRED", JWT_ERROR_CODES.EXPIRED);
      }

      if (error instanceof jwt.JsonWebTokenError) {
        ctx?.logger?.warn({ token }, "Access token is not valid");
        throw new JWTError("token is not valid", JWT_ERROR_CODES.INVALID);
      }

      if (error instanceof JWTError) {
        ctx?.logger?.warn({ token }, "Access token verification failed");
        throw error;
      }

      ctx?.logger?.error({ token }, "Access token verification failed");
      throw new JWTError(
        "Token verification failed",
        JWT_ERROR_CODES.MALFORMED,
      );
    }
  }

  verifyRefreshToken(token: string, ctx?: RequestContext): {
    decoded: RefreshTokenPayload;
  } {
    try {
      ctx?.logger?.info({ token }, "Verifying refresh token");
      ctx?.logger?.debug({ token }, "Decoding refresh token");
      const decoded = jwt.verify(
        token,
        env.REFRESH_TOKEN_SECRET,
      ) as RefreshTokenPayload;

      ctx?.logger?.debug({ decoded }, "Decoded refresh token");

      if (!decoded._id) {
        throw new JWTError(
          "missing claims in the token",
          JWT_ERROR_CODES.MALFORMED,
        );
      }

      ctx?.logger?.debug({ decoded }, "Refresh token verified");

      return { decoded };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        ctx?.logger?.warn({ token }, "Refresh token is expired");
        throw new JWTError(
          "The refresh token  is expired",
          JWT_ERROR_CODES.EXPIRED,
        );
      }

      if (error instanceof jwt.JsonWebTokenError) {
        ctx?.logger?.warn({ token }, "Refresh token is not valid");
        throw new JWTError(
          "Refresh token is not valid",
          JWT_ERROR_CODES.INVALID,
        );
      }

      if (error instanceof JWTError) {
        ctx?.logger?.warn({ token }, "Refresh token verification failed");
        throw error;
      }

      ctx?.logger?.error({ token }, "Refresh token verification failed");
      throw new JWTError(
        "Refresh token verification failed",
        JWT_ERROR_CODES.MALFORMED,
      );
    }
  }

  extractTokenFromHeader(
    authHeader?: string,
    ctx?: RequestContext,
  ): string | null {
    if (!authHeader) {
      ctx?.logger?.warn({ authHeader }, "No auth header provided");
      return null;
    }

    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      ctx?.logger?.warn({ authHeader }, "Invalid auth header format");
      return null;
    }

    return parts[1];
  }

  extractRefreshToken(
    cookies?: Record<string, string>,
    body?: any,
    ctx?: RequestContext,
  ): string | null {
    return cookies?.refreshToken || body?.refreshToken || null;
  }
}
