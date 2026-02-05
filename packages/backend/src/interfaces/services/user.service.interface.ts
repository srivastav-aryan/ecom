import { IUser } from "../../models/user.model";
import { userRegistrationInput } from "@e-com/shared/schemas";
import mongoose from "mongoose";
import { RequestContext } from "../../types/request-context.js";

export interface UserServiceInterface {
  findUserByEmail(email: string, ctx?: RequestContext): Promise<IUser | null>;
  findUserByIdForAuth(userId: string, ctx?: RequestContext): Promise<IUser | null>;
  findUserForLogin(email: string, ctx?: RequestContext): Promise<IUser | null>;
  createUser(
    input: userRegistrationInput,
    ctx?: RequestContext,
    options?: { session: mongoose.ClientSession }
  ): Promise<IUser>;
}

