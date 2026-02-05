import mongoose from "mongoose";
import crypto from "crypto";
import { userSession, IUserSession } from "../models/userSession.model.js";
import { SessionServiceInterface } from "../interfaces/services/session.service.interface.js";
import { RequestContext } from "../types/request-context.js";

export class SessionService implements SessionServiceInterface {
  async createSession(
    userId: string,
    refreshToken: string,
    ctx?: RequestContext,
    options?: { session: mongoose.ClientSession },
  ) {
    ctx?.logger?.debug({ userId }, "creating session for this user");
    const hashedRefToken = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const expiryDays = 7 * 24 * 60 * 60 * 1000;

    const expiresAt = new Date(Date.now() + expiryDays);

    await userSession.create([
      {
        userId: userId,
        isValid: true,
        refreshTokenHash: hashedRefToken,
        deviceInfo: ctx?.deviceInfo || "UNKNOWN",
        expiresAt,
      },
    ]);

    ctx?.logger?.debug({ userId }, "session created for this user");
  }

  async findSessionByToken(
    refreshToken: string,
    ctx?: RequestContext,
  ): Promise<IUserSession | null> {
    const hash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");
    return userSession.findOne({ refreshTokenHash: hash });
  }

  async revokeSession(sessionId: string, ctx?: RequestContext) {
    await userSession.findByIdAndDelete(sessionId);
  }
}
