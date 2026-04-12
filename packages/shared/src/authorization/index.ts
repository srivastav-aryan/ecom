export const USER_ROLES = {
  ADMIN: "ADMIN",
  USER: "USER",
  SUPER_ADMIN: "SUPER_ADMIN",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const PERMISSIONS = {
  //prodcut
  PRODUCTS_CREATE: "products:create",
  PRODUCTS_DELETE: "products:delete",
  PRODUCTS_UPDATE: "products:update",
  PRODUCTS_READ: "products:read",

  // categories
  CATEGORIES_CREATE: "categories:create",
  CATEGORIES_READ: "categories:read",
  CATEGORIES_UPDATE: "categories:update",
  CATEGORIES_DELETE: "categories:delete",

  // orders
  ORDERS_CREATE_OWN: "orders:create:own", //for users and their own order
  ORDERS_CREATE: "orders:create", //for admin
  ORDERS_READ_OWN: "orders:read:own",
  ORDERS_READ: "orders:read",
  ORDERS_UPDATE_OWN: "orders:update:own",
  ORDERS_UPDATE: "orders:update",
  ORDERS_DELETE: "orders:delete", // ONLY FOR SUPER ADMINS DURING TESTING

  // users managed by admin
  USERS_READ_ALL: "users:read:all",
  USERS_DELETE: "users:delete",
  USERS_CREATE: "users:create",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const DEFAULT_PERMISSIONS: Record<UserRole, Permission[]> = {
  [USER_ROLES.USER]: [
    PERMISSIONS.ORDERS_CREATE_OWN,
    PERMISSIONS.ORDERS_READ_OWN,
    PERMISSIONS.ORDERS_UPDATE_OWN,
    PERMISSIONS.PRODUCTS_READ,
    PERMISSIONS.CATEGORIES_READ,
  ],

  [USER_ROLES.ADMIN]: [
    PERMISSIONS.PRODUCTS_CREATE,
    PERMISSIONS.PRODUCTS_READ,
    PERMISSIONS.PRODUCTS_UPDATE,
    PERMISSIONS.PRODUCTS_DELETE,
    PERMISSIONS.CATEGORIES_CREATE,
    PERMISSIONS.CATEGORIES_READ,
    PERMISSIONS.CATEGORIES_UPDATE,
    PERMISSIONS.CATEGORIES_DELETE,
    PERMISSIONS.USERS_CREATE,
    PERMISSIONS.USERS_DELETE,
    PERMISSIONS.USERS_READ_ALL,
  ],

  [USER_ROLES.SUPER_ADMIN]: [...Object.values(PERMISSIONS)],
};

// utility function to check permission for a certian role

export const hasPermission = (
  useRole: UserRole,
  permission: Permission[],
  requiredPermission: Permission
): boolean => {
  if (useRole == USER_ROLES.SUPER_ADMIN) return true;
  if (permission.includes(requiredPermission)) return true;

  const defaultRoLE = DEFAULT_PERMISSIONS[useRole] || [];

  if (defaultRoLE.includes(requiredPermission)) return true;

  return false;
};
