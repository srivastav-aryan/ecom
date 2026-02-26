import { authServices } from "@/features/auth/services/auth.service";
import { setAccessToken } from "@/http/fetchClient";
import { getNaviData } from "@/services/navigation";
import type { NavigationData, userForAuthStatus } from "@e-com/shared/types";

export const rootLoader = async (): Promise<{
  navData: NavigationData;
  user: userForAuthStatus | null;
}> => {
  let user: userForAuthStatus | null = null;
  try {
    // 1. Silent auth bootstrap using HttpOnly cookie
    const data = await authServices.refresh();
    user = data.user;
    setAccessToken(data.accessToken);
  } catch (err) {
    // If refresh fails (no session/expired), user remains null
    setAccessToken(null);
  }
  try {
    // 2. Fetch navigation/layout data concurrently or sequentially
    const navData = await getNaviData();
    return { navData, user };
  } catch (error: unknown) {
    throw new Error("getNaviData error", { cause: error });
  }
};
