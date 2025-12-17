import { fetchClient } from "@/core/fetchClient";
import { mockNaviData } from "@/mocks/data/navigationMocks";
import type { NavigationData } from "@e-com/shared/types";

export async function getNaviData(): Promise<NavigationData> {
  try {
    if (import.meta.env.DEV && import.meta.env.VITE_API_MODE == "mock") {
      return mockNaviData;
    }

    const data = await fetchClient("/nav", { timeOut: 4000 });
    return data;
  } catch (error: any) {
    throw new Error(" fetching nav data error", error);
  }
}
