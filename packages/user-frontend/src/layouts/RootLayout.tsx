import { Outlet, useLoaderData } from "react-router-dom";
import Header from "@/components/Header/Header";

function RootLayout() {
  const navData = useLoaderData();
  

  return (
    <main>
      <Header navData={navData} />
      <Outlet />
    </main>
  );
}

export default RootLayout;
