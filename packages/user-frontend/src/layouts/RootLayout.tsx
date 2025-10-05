import { Outlet, useLoaderData } from "react-router-dom";
import Header from "@/components/Header/Header";

function RootLayout() {
  const gg = useLoaderData()
  console.log(gg);
  
  return (
    <main>
      <Header />
      <Outlet />
    </main>
  );
}

export default RootLayout;
