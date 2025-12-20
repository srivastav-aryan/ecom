import { Outlet, useLoaderData } from "react-router-dom";
import Header from "@/components/Header/Header";
import type { NavigationData } from "@e-com/shared/types";

function RootLayout() {
  const navData: NavigationData = useLoaderData();
  
  return (
    <main>
      <Header navData={navData} />
      <Outlet />
    </main>
  );
}

export default RootLayout;
