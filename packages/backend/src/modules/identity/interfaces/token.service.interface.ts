import { UserRole } from "@e-com/shared/authorization";
import { JwtPayload } from "jsonwebtoken";
import { RequestContext } from "../../../shared/types/request-context.js";

export interface AccessTokenPayload extends JwtPayload {
  _id: string;
  email: string;
  role: UserRole;
}

export interface RefreshTokenPayload extends JwtPayload {
  _id: string;
}

export { JWTError, type JWTErrorCode, JWT_ERROR_CODES } from "../errors/identity.errors.js";

export interface TokenServiceInterface {
  generateAccessToken(payload: AccessTokenPayload): string;
  generateRefreshToken(payload: RefreshTokenPayload): string;
  verifyAccessToken(token: string, ctx?: RequestContext): AccessTokenPayload;
  verifyRefreshToken(token: string, ctx?: RequestContext): { decoded: RefreshTokenPayload };
  extractTokenFromHeader(authHeader?: string, ctx?: RequestContext): string;
  extractRefreshToken(cookies?: Record<string, string>, body?: any, ctx?: RequestContext): string ;
}
