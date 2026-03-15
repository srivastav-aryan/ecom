import { Outlet, useLoaderData } from "react-router-dom";
import Header from "@/components/Header/Header";
import { AuthProvider } from "@/features/auth/context/AuthContext";

function RootLayout() {
  const { navData, user } = useLoaderData();

  let authKey = user ? user.email : "guest"

  return (
    <AuthProvider initialState={user} key={authKey}>
      <main>
        <Header navData={navData} />
        <Outlet />
      </main>
    </AuthProvider>
  );
}

export default RootLayout;
