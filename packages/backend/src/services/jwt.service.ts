import bcrypt from "bcryptjs";
import { AccessTokenPayload, RefreshTokenPayload } from "../utils/jwt.utils";
import jwt, { } from "jsonwebtoken";
import { env } from "../config/env.js";
import { JWTError } from "../utils/jwt.utils";
import { JWT_ERROR_CODES } from "../utils/jwt.utils";
import { IUser } from "../models/user.model";
import UserServices from "./user.service";

export default class JwtServices {
  static verifyAccessToken = (token: string): AccessTokenPayload => {
    try {
      const decoded = jwt.verify(
        token,
        env.ACCESS_TOKEN_SECRET,
      ) as AccessTokenPayload;

      if (!decoded._id || !decoded.email || !decoded.role) {
        throw new JWTError(
          "claim missing from the token",
          JWT_ERROR_CODES.INVALID,
        );
      }

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new JWTError("access token has EXPIRED", JWT_ERROR_CODES.EXPIRED);
      }

      if (error instanceof jwt.JsonWebTokenError) {
        throw new JWTError("token is not valid", JWT_ERROR_CODES.INVALID);
      }

      if (error instanceof JWTError) {
        throw error;
      }

      throw new JWTError(
        "Token verification failed",
        JWT_ERROR_CODES.MALFORMED,
      );
    }
  };

  static verifyRefreshToken = async (
    token: string,
  ): Promise<{ decoded: RefreshTokenPayload; userOfToken: IUser }> => {
    try {
      const decoded = jwt.verify(
        token,
        env.REFRESH_TOKEN_SECRET,
      ) as RefreshTokenPayload;

      if (!decoded._id || !decoded.tokenVersion) {
        throw new JWTError(
          "missing claims in the token",
          JWT_ERROR_CODES.MALFORMED,
        );
      }
      const userOfToken = await UserServices.findUserByIdForAuth(decoded._id);

      if (userOfToken == null) {
        throw new JWTError(
          "invalid token no such user found",
          JWT_ERROR_CODES.INVALID,
        );
      }

      const tokenMatch = bcrypt.compare(token, userOfToken.refreshToken || "");

      if (!tokenMatch) {
        throw new JWTError(
          "provided ref token does not match",
          JWT_ERROR_CODES.INVALID,
        );
      }

      return { decoded, userOfToken };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new JWTError(
          "The refresh token  is expired",
          JWT_ERROR_CODES.EXPIRED,
        );
      }

      if (error instanceof jwt.JsonWebTokenError) {
        throw new JWTError(
          "Refresh token is not valid",
          JWT_ERROR_CODES.INVALID,
        );
      }

      if (error instanceof JWTError) {
        throw error;
      }

      throw new JWTError(
        "Refresh token verification failed",
        JWT_ERROR_CODES.MALFORMED,
      );
    }
  };

  static extractTokenFromHeader(authHeader?: string): string | null {
    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return null;
    }

    return parts[1];
  }

  static extractRefreshToken = (
    cookies?: Record<string, string>,
    body?: any,
  ): string | null => {
    return cookies?.refreshToken || body?.refreshToken || null;
  };
}
