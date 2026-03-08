import { Permission, UserRole } from "./roles-permissions"

export type userForAuthStatus = {
  email: string,
  firstname: string,
  lastname: string,
  role: UserRole,
  permissions: Permission[],
}

export type responseForAuth = {
  accessToken: string,
  user: userForAuthStatus
}

export type FieldErrors = {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export type ActionResponse<T = unknown> = {
  success?: boolean;
  data?: T;
  errors?: FieldErrors;
  serverError?: string;
};
