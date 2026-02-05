import { UserRole } from "@e-com/shared/types";
import { JwtPayload } from "jsonwebtoken";
import { RequestContext } from "../../types/request-context.js";

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

export interface TokenServiceInterface {
  generateAccessToken(payload: AccessTokenPayload): string;
  generateRefreshToken(payload: RefreshTokenPayload): string;
  verifyAccessToken(token: string, ctx?: RequestContext): AccessTokenPayload;
  verifyRefreshToken(token: string, ctx?: RequestContext): { decoded: RefreshTokenPayload };
  extractTokenFromHeader(authHeader?: string, ctx?: RequestContext): string | null;
  extractRefreshToken(cookies?: Record<string, string>, body?: any, ctx?: RequestContext): string | null;
}
