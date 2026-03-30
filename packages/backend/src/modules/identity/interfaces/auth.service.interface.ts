import { userRegistrationInput, userLoginInput } from "@e-com/shared/schemas";
import { RequestContext } from "../../../shared/types/request-context.js";
import { IUser } from "../models/user.model.js";

export interface IAuthService {
  registerUser: (
    input: userRegistrationInput,
    ctx?: RequestContext,
  ) => Promise<{ accessToken: string; refreshToken: string , user: IUser}>;
  loginUser: (
    input: userLoginInput,
    ctx?: RequestContext,
  ) => Promise<{ accessToken: string; refreshToken: string , user: IUser}>;
  refreshService: (
    reftoken: string,
    ctx?: RequestContext,
  ) => Promise<{ accessToken: string; refreshToken: string , user: IUser}>;

  deleteOneSession: (
    refreshToken: string,
    ctx?: RequestContext,
  ) => Promise<void>;
}
