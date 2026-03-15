import { Outlet, useRouteLoaderData } from "react-router-dom";
import Header from "@/components/Header/Header";

function RootLayout() {
  const { navData } = useRouteLoaderData("root");

  return (
    <main>
      <Header navData={navData} />
      <Outlet />
    </main>
  );
}

export default RootLayout;
