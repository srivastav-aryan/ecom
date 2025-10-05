import { getNaviData } from "@/services/navigation";
import type { NavigationData } from "@e-com/shared/types";

export const rootLoader = async (): Promise<NavigationData> => {
  const navData = await getNaviData();
  return navData;
};
