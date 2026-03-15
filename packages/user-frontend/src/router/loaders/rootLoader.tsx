import { authServices } from "@/features/auth/services/auth.service";
import { setAccessToken } from "@/http/fetchClient";
import { getNaviData } from "@/services/navigation";
import type { NavigationData, userForAuthStatus } from "@e-com/shared/types";

export const rootLoader = async (): Promise<{
  navData: NavigationData;
  user: userForAuthStatus | null;
}> => {
  // Fire both requests in parallel — they have no dependency on each other
  const [authResult, navResult] = await Promise.allSettled([
    authServices.refresh(),
    getNaviData(),
  ]);

  // Auth: a failed refresh just means unauthenticated — not an error
  let user: userForAuthStatus | null = null;
  if (authResult.status === "fulfilled") {
    user = authResult.value.user;
    setAccessToken(authResult.value.accessToken);
  } else {
    setAccessToken(null);
  }

  // Nav: a failure here is unrecoverable — throw so the error boundary catches it
  if (navResult.status === "rejected") {
    throw new Error("getNaviData error", { cause: navResult.reason });
  }

  return { navData: navResult.value, user };
};
