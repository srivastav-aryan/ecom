import { userLoginInput, userRegistrationInput } from "@e-com/shared/schemas";
import UserServices from "./user.service.js";
import { ApiError } from "../utils/applevel.utils.js";
import { IUser } from "../models/user.model.js";
import mongoose from "mongoose";
import pino from "pino";

export default class AuthServices {
  private static async _generateAndAssignToken(
    user: IUser,
    logger?: pino.Logger,
    options?: { session: mongoose.ClientSession }
  ) {
    // email verifcation later to be added
    logger?.info(
      { userId: user.id },
      "starting the process of token generation for this user"
    );

    const accessToken = user.generateAccessToken();

    logger?.debug({ userId: user.id }, "access token generated");

    const refreshToken = user.generateRefreshToken();
    logger?.debug({ userId: user.id }, "refresh token generated");

    await UserServices.updateRefToken(user.id, refreshToken, logger, options);

    return { accessToken, refreshToken };
  }

  async registerUser(
    userInput: userRegistrationInput,
    logger?: pino.Logger
  ) {
    logger?.info({ email: userInput.email }, "Starting user registration");

    const session = await mongoose.startSession();
    session.startTransaction({ writeConcern: { w: "majority" } });

    try {
      logger?.debug("Creating user in database");
      const regUser = await UserServices.createUser(userInput, logger, {
        session,
      });

      logger?.debug({ userId: regUser.id }, "User created, generating tokens");
      const tokens = await AuthServices._generateAndAssignToken(regUser, logger, {
        session,
      });

      await session.commitTransaction();
      logger?.info({ userId: regUser.id }, "User registration successful");

      return tokens;
    } catch (error: any) {
      logger?.error(
        { err: error, email: userInput.email },
        "User registration failed"
      );
      await session.abortTransaction();
      throw new ApiError(error.statusCode, error.message, false);
    } finally {
      session.endSession();
      logger?.debug("Mongoose session closed");
    }
  }

  async loginUser(input: userLoginInput, logger?: pino.Logger) {
    // currently no transactions needed but can be added as future proofing or for a consistent pattern
    const { email, password } = input;
    logger?.info({ email }, "Login attempt");

    const user = await UserServices.findUserForLogin(email, logger);

    if (!user) {
      logger?.warn({ email }, "Login failed - user not found");
      throw new ApiError(400, "Invalid credentials");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
      logger?.warn({ email, userId: user.id }, "Login failed - wrong password");
      throw new ApiError(400, "Invalid credentials");
    }

    logger?.info({ userId: user.id }, "Login successful");

    return AuthServices._generateAndAssignToken(user, logger);
  }
}
