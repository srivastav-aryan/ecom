import { fetchClient } from "@/core/fetchClient";
import type { NavigationData } from "@e-com/shared/types";

export async function getNaviData(): Promise<NavigationData> {
  const data = await fetchClient("/nav", { timeOut: 4000 });

  return data;
}
