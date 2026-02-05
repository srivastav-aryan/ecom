import { userRegistrationInput, userLoginInput } from "@e-com/shared/schemas";
import { RequestContext } from "../../types/request-context";

export interface IAuthService {
  registerUser: (
    input: userRegistrationInput,
    ctx?: RequestContext,
  ) => Promise<{ accessToken: string; refreshToken: string }>;
  loginUser: (
    input: userLoginInput,
    ctx?: RequestContext,
  ) => Promise<{ accessToken: string; refreshToken: string }>;
  refreshService: (
    reftoken: string,
    ctx?: RequestContext,
  ) => Promise<{ accessToken: string; refreshToken: string }>;

  deleteOneSession: (
    refreshToken: string,
    ctx?: RequestContext,
  ) => Promise<void>;
}
