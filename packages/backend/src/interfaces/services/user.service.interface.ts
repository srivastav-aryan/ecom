import { IUser } from "../../models/user.model";
import { userRegistrationInput } from "@e-com/shared/schemas";
import mongoose from "mongoose";
import { RequestContext } from "../../types/request-context.js";

export interface UserServiceInterface {
  findUserByEmail(email: string, ctx?: RequestContext): Promise<IUser | null>;
  findUserByIdForAuth(userId: string, ctx?: RequestContext): Promise<IUser>;
  findUserForLogin(email: string, ctx?: RequestContext): Promise<IUser>;
  createUser(
    input: userRegistrationInput,
    ctx?: RequestContext,
    options?: { session: mongoose.ClientSession }
  ): Promise<IUser>;
}

