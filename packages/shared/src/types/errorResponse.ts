export type ErrorResponse = {
  success: false;
  message: string;
  code?: string;
  errors?: { path: (string | number)[]; message: string }[];
  stack?: string;
};
