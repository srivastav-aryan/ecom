import { userRegistrationInput, userLoginInput } from "@e-com/shared/schemas";
import { RequestContext } from "../../types/request-context";
import { IUser } from "../../models/user.model";

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
