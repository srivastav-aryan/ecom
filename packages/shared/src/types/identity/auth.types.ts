import { Permission, UserRole } from "../../authorization/index.js";

/**
 * Represents the structure of the authenticated user returned back to the frontend.
 * Used across both backend and frontend to ensure the user object matches the UI needs.
 */
export type userForAuthStatus = {
  email: string,
  firstname: string,
  lastname: string,
  role: UserRole,
  permissions: Permission[],
}

/**
 * Defines the successful API response shape after login, registration, or token refresh.
 * It contains the JWT token and the authenticated user details.
 */
export type responseForAuth = {
  accessToken: string,
  user: userForAuthStatus
}

/**
 * Maps form field names to their respective validation error messages.
 * Used heavily in frontend forms (like Login/Register) to display Zod validation errors.
 */
export type FieldErrors = {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

/**
 * Standardised server response payload for generic actions (like form submissions).
 * Wraps success/failure state, generic data, field-level errors, or fatal server errors.
 */
export type ActionResponse<T = unknown> = {
  success?: boolean;
  data?: T;
  errors?: FieldErrors;
  serverError?: string;
};
