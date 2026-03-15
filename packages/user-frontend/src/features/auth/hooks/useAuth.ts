import { useRevalidator, useRouteLoaderData } from "react-router-dom";
import { authServices } from "../services/auth.service";

export const useAuth = () => {
  const { user } = useRouteLoaderData("root");
  const { revalidate } = useRevalidator();
  if (!user) {
    return { user, isAuthenticated: false, logout: () => { } };
  }

  async function logout() {
    (await authServices.logout(), revalidate());
  }

  return { user, isAuthenticated: !!user, logout };
};
