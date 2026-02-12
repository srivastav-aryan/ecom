import { userLoginInput, userRegistrationInput } from "@e-com/shared/schemas";
import { ApiError } from "../utils/applevel.utils.js";
import { IUser } from "../models/user.model.js";
import { TokenServiceInterface } from "../interfaces/services/token.service.interface.js";
import { SessionServiceInterface } from "../interfaces/services/session.service.interface.js";
import { UserServiceInterface } from "../interfaces/services/user.service.interface.js";
import { RequestContext } from "../types/request-context.js";
import { authCache } from "../cache/auth.cache.js";

export default class AuthServices {
  constructor(
    private userServices: UserServiceInterface,
    private sessionService: SessionServiceInterface,
    private tokenService: TokenServiceInterface,
  ) { }

  private async _generateTokenAndAssignSession(
    user: IUser,
    ctx?: RequestContext,
  ) {
    ctx?.logger?.info(
      { userId: user.id },
      "starting the process of token generation for this user",
    );

    const accessToken = this.tokenService.generateAccessToken({
      _id: user.id,
      email: user.email,
      role: user.role,
    });
    ctx?.logger?.debug({ userId: user.id }, "access token generated");

    const refreshToken = this.tokenService.generateRefreshToken({
      _id: user.id,
    });
    ctx?.logger?.debug({ userId: user.id }, "refresh token generated");

    await this.sessionService.createSession(user.id, refreshToken, ctx);

    return { accessToken, refreshToken };
  }

  async registerUser(userInput: userRegistrationInput, ctx?: RequestContext) {
    ctx?.logger?.info({ email: userInput.email }, "Starting user registration");

    try {
      ctx?.logger?.debug("starting the process for creating user in database");
      const regUser = await this.userServices.createUser(userInput, ctx);

      ctx?.logger?.debug(
        { userId: regUser.id },
        "User created, generating tokens",
      );
      const tokens = await this._generateTokenAndAssignSession(regUser, ctx);

      ctx?.logger?.info({ userId: regUser.id }, "User registration successful");

      return tokens;
    } catch (error: any) {
      ctx?.logger?.error(
        { err: error, email: userInput.email },
        "User registration failed",
      );
      throw new ApiError(error.statusCode, error.message, false);
    }
  }

  async loginUser(input: userLoginInput, ctx?: RequestContext) {
    const { email, password } = input;
    ctx?.logger?.info({ email }, "Login attempt");

    const user = await this.userServices.findUserForLogin(email, ctx);

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
      ctx?.logger?.warn(
        { email, userId: user.id },
        "Login failed - wrong password",
      );
      throw new ApiError(400, "Invalid credentials");
    }

    ctx?.logger?.info({ userId: user.id }, "Login successful");

    return this._generateTokenAndAssignSession(user, ctx);
  }

  async refreshService(oldRefToken: string, ctx?: RequestContext) {
    const { decoded } = this.tokenService.verifyRefreshToken(oldRefToken, ctx);

    const session = await this.sessionService.findSessionByToken(
      oldRefToken,
      ctx,
    );

    // REUSE DETECTION: Token is a valid JWT but session is gone
    // This means someone already used this token → compromise
    if (!session) {
      ctx?.logger?.error(
        { userId: decoded._id },
        "Refresh token reuse detected — revoking all sessions",
      );
      await this.sessionService.revokeAllSessions(decoded._id, ctx);
      authCache.delete(decoded._id);
      throw new ApiError(401, "Security alert: all sessions revoked");
    }

    if (!session.isValid || new Date() > session.expiresAt) {
      ctx?.logger?.warn(
        { sessionId: session._id },
        "Refresh failed: Session expired or invalid",
      );
      throw new ApiError(401, "Session Expired");
    }

    const user = await this.userServices.findUserByIdForAuth(decoded._id, ctx);

    if (session) {
      await this.sessionService.revokeSession(session.id, ctx);
    }
    return await this._generateTokenAndAssignSession(user, ctx);
  }

  async deleteOneSession(refreshToken: string, ctx?: RequestContext) {
    const refTokenPayload = this.tokenService.verifyRefreshToken(
      refreshToken,
      ctx,
    );

    const session = await this.sessionService.findSessionByToken(
      refreshToken,
      ctx,
    );

    if (session) {
      await this.sessionService.revokeSession(session.id, ctx);
    }

    ctx?.logger?.info("Session deleted, user logged out from one device");
  }
}
