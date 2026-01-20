import { Permission, UserRole } from "@e-com/shared/types";

export interface AuthCacheEntry{
  role: UserRole,
  refreshTokenVersion: number | undefined,
  permissions: Permission[]
  isActive: boolean,
  expiresAt: number
}

const authMap = new Map<
  string,
  AuthCacheEntry
>();

export const authCache = {
  get (userId: string) : AuthCacheEntry | null {
    const entry = authMap.get(userId);
    if (!entry) {
      return null
    }

    if (entry.expiresAt < Date.now()) {
      authMap.delete(userId);
      return null
    }

    return entry
  },
  
  set (userId:string, entryData: AuthCacheEntry) {
    authMap.set(userId, entryData)
  },

  delete(userId: string){
    authMap.delete(userId)
  }

}
