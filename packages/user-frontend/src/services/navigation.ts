import { mockNaviData } from "@/mocks/data/navigationMocks";
import type { NavigationData } from "@e-com/shared/types";

export async function getNaviData(): Promise<NavigationData> {
  try {
      return mockNaviData;
  } catch (error: any) {
    throw new Error(" fetching nav data error", error);
  }
}
