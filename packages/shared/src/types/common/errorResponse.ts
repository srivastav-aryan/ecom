/**
 * Defines the standard shape of a failed API response (HTTP 4xx or 5xx).
 * Used globally by the backend error handler middleware and the frontend fetchClient
 * to ensure errors are thrown, caught, and parsed consistently across the entire stack.
 */
export type ErrorResponse = {
  success: false;
  message: string;
  code?: string;
  errors?: { path: (string | number)[]; message: string }[];
  stack?: string; // Optional stack trace (typically included only in non-production environments)
};
