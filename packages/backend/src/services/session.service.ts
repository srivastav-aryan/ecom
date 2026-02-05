import mongoose from "mongoose";
import crypto from "crypto";
import { userSession, IUserSession } from "../models/userSession.model.js";
import { SessionServiceInterface } from "../interfaces/services/session.service.interface.js";
import { RequestContext } from "../types/request-context.js";
import { ApiError } from "../utils/applevel.utils.js";

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
): Promise<IUserSession> {
  const hash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");
  
  const session = await userSession.findOne({ refreshTokenHash: hash });
  
  if (!session) {
    ctx?.logger?.warn({ refreshTokenHash: hash }, "Session not found for token");
    throw new ApiError(401, "Session not found");
  }
  
  return session;
}

  async revokeSession(sessionId: string, ctx?: RequestContext): Promise<void> {
    ctx?.logger?.debug({ sessionId }, "Revoking session");
    await userSession.findByIdAndDelete(sessionId);
    ctx?.logger?.debug({ sessionId }, "Session revoked");
  }

  async revokeAllSessions(userId: string, ctx?: RequestContext): Promise<number> {
    ctx?.logger?.info({ userId }, "Revoking all sessions for user");

    const result = await userSession.deleteMany({ userId });

    ctx?.logger?.info(
      { userId, deletedCount: result.deletedCount },
      "All sessions revoked for user",
    );

    return result.deletedCount;
  }
}
