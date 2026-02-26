import { createContext, useState, type ReactNode } from "react";
import type { userForAuthStatus } from "@e-com/shared/types";
import type {userLoginInput, userRegistrationInput} from "@e-com/shared/schemas"
import { authServices } from "../services/auth.service";
import { setAccessToken } from "@/http/fetchClient";


type AuthState = {
  user: userForAuthStatus | null,
  isAuthenticated: boolean
}

type AuthContextType = AuthState & {
    login: (input: userLoginInput) => Promise<void>,
    logout: () => Promise<void>,
    register: (input: userRegistrationInput) => Promise<void>
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children , initialState}: { children: ReactNode, initialState: userForAuthStatus | null }) {

   const [authState, setAuthState] = useState<AuthState>({
     user: initialState,
     isAuthenticated: !!initialState
   });

   async function login(input: userLoginInput) {
     const response = await authServices.login(input);
     setAccessToken(response.accessToken)
     setAuthState({user: response.user, isAuthenticated: true})
   }

   async function logout() {
     await authServices.logout();
     setAuthState({user: null, isAuthenticated: false})
   }

   async function register(input: userRegistrationInput) {
     const response = await authServices.register(input);
     setAccessToken(response.accessToken)
     setAuthState({user: response.user, isAuthenticated: true})
   }
  return <AuthContext.Provider value={{...authState, login , register, logout}}>{children}</AuthContext.Provider>;
}
