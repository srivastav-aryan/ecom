import mongoose from "mongoose";
import pino from "pino";
import crypto from "crypto";
import { userSession, IUserSession } from "../models/userSession.model.js";
import { SessionServiceInterface } from "../interfaces/services/session.service.interface.js";

export class SessionService implements SessionServiceInterface {
  async createSession(
    userId: string,
    refreshToken: string,
    logger?: pino.Logger,
    options?: { session: mongoose.ClientSession },
  ) {
    logger?.debug({ userId }, "creating session for this user");
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
        deviceInfo: "UNKNOWN",
        expiresAt,
      },
    ]);

    logger?.debug({ userId }, "session created for this user");
  }

  async findSessionByToken(
    refreshToken: string
  ): Promise<IUserSession | null> {
    const hash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");
    return userSession.findOne({ refreshTokenHash: hash });
  }

  async revokeSession(sessionId: string) {
    await userSession.findByIdAndDelete(sessionId);
  }
}
