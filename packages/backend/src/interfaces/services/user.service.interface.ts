import { IUser } from "../../models/user.model";
import { userRegistrationInput } from "@e-com/shared/schemas";
import mongoose from "mongoose";
import pino from "pino";

export interface UserServiceInterface {
  findUserByEmail(email: string, logger?: pino.Logger): Promise<IUser | null>;
  findUserByIdForAuth(userId: string, logger?: pino.Logger): Promise<IUser | null>;
  findUserForLogin(email: string, logger?: pino.Logger): Promise<IUser | null>;
  createUser(
    input: userRegistrationInput,
    logger?: pino.Logger,
    options?: { session: mongoose.ClientSession }
  ): Promise<IUser>;
}


