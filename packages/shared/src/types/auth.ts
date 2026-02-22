import { Permission, UserRole } from "./roles-permissions"

export type userForAuthStatus = {
  email: string,
  firstname: string,
  lastname: string,
  role: UserRole,
  permissions: Permission[],
}
