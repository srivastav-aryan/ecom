import { fetchClient } from "@/http/fetchClient";
import type {
  userLoginInput,
  userRegistrationInput,
} from "@e-com/shared/schemas";
import type { responseForAuth } from "@e-com/shared/types";

export const authServices = {
  refresh: async function(): Promise<responseForAuth> {
    const response = await fetchClient("/auth/refresh", {
      method: "POST",
    });

    return response.data;
  },

  login: async function(data: userLoginInput): Promise<responseForAuth> {
    const response = await fetchClient("/auth/login", {
      method: "POST",
      body: data,
    });

    return response.data;
  },

  logout: async function(): Promise<string> {
    const response = await fetchClient("/auth/logout", {
      method: "POST",
    });

    return response.message;
  },

  register: async function(
    data: userRegistrationInput,
  ): Promise<responseForAuth> {
    const response = await fetchClient("/auth/register", {
      method: "POST",
      body: data,
    });
    return response.data;
  },
};
