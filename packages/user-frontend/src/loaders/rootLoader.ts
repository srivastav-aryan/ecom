import { getNaviData } from "@/services/navigation";
import type { NavigationData } from "@e-com/shared/types";

export const rootLoader = async (): Promise<NavigationData> => {
  try {
    const navData = await getNaviData();
    return navData;
  } catch (error: unknown) {
    throw new Error("errrrrrrrrrr", error as Error);
  }
};
