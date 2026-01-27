import { userLoginInput, userRegistrationInput } from "@e-com/shared/schemas";
import UserServices from "./user.service.js";
import { ApiError } from "../utils/applevel.utils.js";
import { IUser } from "../models/user.model.js";
import mongoose from "mongoose";
import pino from "pino";
import { TokenService } from "./token.service.js";
import { SessionService } from "./session.service.js";

export default class AuthServices {
  private static async _generateTokenAndAssignSession(
    user: IUser,
    logger?: pino.Logger,
    options?: { session: mongoose.ClientSession },
  ) {
    logger?.info(
      { userId: user.id },
      "starting the process of token generation for this user",
    );

    const accessToken = TokenService.generateAccessToken({
      _id: user.id,
      email: user.email,
      role: user.role,
    });
    logger?.debug({ userId: user.id }, "access token generated");

    const refreshToken = TokenService.generateRefreshToken({ _id: user.id });
    logger?.debug({ userId: user.id }, "refresh token generated");

    await SessionService.createSession(user.id, refreshToken);

    return { accessToken, refreshToken };
  }

  async registerUser(userInput: userRegistrationInput, logger?: pino.Logger) {
    logger?.info({ email: userInput.email }, "Starting user registration");

    const session = await mongoose.startSession();
    session.startTransaction({ writeConcern: { w: "majority" } });

    try {
      logger?.debug("starting the process for creating user in database");
      const regUser = await UserServices.createUser(userInput, logger, {
        session,
      });

      logger?.debug({ userId: regUser.id }, "User created, generating tokens");
      const tokens = await AuthServices._generateTokenAndAssignSession(
        regUser,
        logger,
        {
          session,
        },
      );

      await session.commitTransaction();
      logger?.info({ userId: regUser.id }, "User registration successful");

      return tokens;
    } catch (error: any) {
      logger?.error(
        { err: error, email: userInput.email },
        "User registration failed",
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

    return AuthServices._generateTokenAndAssignSession(user, logger);
  }

  async refreshService(oldRefToken: string, logger?: pino.Logger) {
    const { decoded } = await TokenService.verifyRefreshToken(
      oldRefToken,
      logger,
    );

    const session = await SessionService.findSessionByToken(oldRefToken);

    if (!session) {
      // nuke log out add later
      logger?.warn(
        { userId: decoded._id },
        "Refresh failed: Session not found (Possible Reuse)",
      );
      throw new ApiError(401, "Invalid Session");
    }
    if (!session.isValid || new Date() > session.expiresAt) {
      // nuke log out add later
      logger?.warn(
        { sessionId: session._id },
        "Refresh failed: Session expired or invalid",
      );
      throw new ApiError(401, "Session Expired");
    }

    const user = await UserServices.findUserByIdForAuth(decoded._id);

    if (!user) throw new ApiError(401, "User not found");

    await SessionService.revokeSession(session.id);

    return await AuthServices._generateTokenAndAssignSession(user, logger);
  }
}
