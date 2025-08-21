export declare const USER_ROLES: {
    readonly ADMIN: "ADMIN";
    readonly USER: "USER";
    readonly SUPER_ADMIN: "SUPER_ADMIN";
};
export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
export declare const PERMISSIONS: {
    readonly PRODUCTS_CREATE: "products:create";
    readonly PRODUCTS_DELETE: "products:delete";
    readonly PRODUCTS_UPDATE: "products:update";
    readonly PRODUCTS_READ: "products:read";
    readonly CATEGORIES_CREATE: "categories:create";
    readonly CATEGORIES_READ: "categories:read";
    readonly CATEGORIES_UPDATE: "categories:update";
    readonly CATEGORIES_DELETE: "categories:delete";
    readonly ORDERS_CREATE_OWN: "orders:create:own";
    readonly ORDERS_CREATE: "orders:create";
    readonly ORDERS_READ_OWN: "orders:read:own";
    readonly ORDERS_READ: "orders:read";
    readonly ORDERS_UPDATE_OWN: "orders:update:own";
    readonly ORDERS_UPDATE: "orders:update";
    readonly ORDERS_DELETE: "orders:delete";
    readonly USERS_READ_ALL: "users:read:all";
    readonly USERS_DELETE: "users:delete";
    readonly USERS_CREATE: "users:create";
};
export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
export declare const DEFAULT_PERMISSIONS: Record<UserRole, Permission[]>;
export declare const hasPermission: (useRole: UserRole, permission: Permission[], requiredPermission: Permission) => boolean;
