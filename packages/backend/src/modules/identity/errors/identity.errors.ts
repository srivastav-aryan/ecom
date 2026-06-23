import { ApiError } from "../../../shared/utils/applevel.utils.js";

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

export class JWTError extends ApiError {
  constructor(
    message: string,
    public readonly code: JWTErrorCode,
    isOperational: boolean = true,
    statusCode: number = 401,
  ) {
    super(statusCode, message, isOperational);
    this.name = "JWTError";
  }
}
