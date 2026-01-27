import { userLoginInput, userRegistrationInput } from "@e-com/shared/schemas";
import { ApiError } from "../utils/applevel.utils.js";
import { IUser } from "../models/user.model.js";
import mongoose from "mongoose";
import pino from "pino";
import { TokenServiceInterface } from "../interfaces/services/token.service.interface.js";
import { SessionServiceInterface } from "../interfaces/services/session.service.interface.js";
import { UserServiceInterface } from "../interfaces/services/user.service.interface.js";

export default class AuthServices {
  constructor(
    private userServices: UserServiceInterface,
    private sessionService: SessionServiceInterface,
    private tokenService: TokenServiceInterface,
  ) {}

  private async _generateTokenAndAssignSession(
    user: IUser,
    logger?: pino.Logger,
    options?: { session: mongoose.ClientSession },
  ) {
    logger?.info(
      { userId: user.id },
      "starting the process of token generation for this user",
    );

    const accessToken = this.tokenService.generateAccessToken({
      _id: user.id,
      email: user.email,
      role: user.role,
    });
    logger?.debug({ userId: user.id }, "access token generated");

    const refreshToken = this.tokenService.generateRefreshToken({ _id: user.id });
    logger?.debug({ userId: user.id }, "refresh token generated");

    await this.sessionService.createSession(user.id, refreshToken, logger);

    return { accessToken, refreshToken };
  }

  async registerUser(userInput: userRegistrationInput, logger?: pino.Logger) {
    logger?.info({ email: userInput.email }, "Starting user registration");

    const session = await mongoose.startSession();
    session.startTransaction({ writeConcern: { w: "majority" } });

    try {
      logger?.debug("starting the process for creating user in database");
      const regUser = await this.userServices.createUser(userInput, logger, {
        session,
      });

      logger?.debug({ userId: regUser.id }, "User created, generating tokens");
      const tokens = await this._generateTokenAndAssignSession(
        regUser,
        logger,
        { session },
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
    const { email, password } = input;
    logger?.info({ email }, "Login attempt");

    const user = await this.userServices.findUserForLogin(email, logger);

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

    return this._generateTokenAndAssignSession(user, logger);
  }

  async refreshService(oldRefToken: string, logger?: pino.Logger) {
    const { decoded } = this.tokenService.verifyRefreshToken(oldRefToken, logger);

    const session = await this.sessionService.findSessionByToken(oldRefToken);

    if (!session) {
      logger?.warn(
        { userId: decoded._id },
        "Refresh failed: Session not found (Possible Reuse)",
      );
      throw new ApiError(401, "Invalid Session");
    }
    if (!session.isValid || new Date() > session.expiresAt) {
      logger?.warn(
        { sessionId: session._id },
        "Refresh failed: Session expired or invalid",
      );
      throw new ApiError(401, "Session Expired");
    }

    const user = await this.userServices.findUserByIdForAuth(decoded._id, logger);

    if (!user) throw new ApiError(401, "User not found");

    await this.sessionService.revokeSession(session.id);

    return await this._generateTokenAndAssignSession(user, logger);
  }
}

