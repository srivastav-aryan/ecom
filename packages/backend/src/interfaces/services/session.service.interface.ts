import mongoose from "mongoose";
import { IUserSession } from "../../models/userSession.model";
import { RequestContext } from "../../types/request-context.js";

export interface SessionServiceInterface {
  createSession(
    userId: string,
    refreshToken: string,
    ctx?: RequestContext,
    options?: { session: mongoose.ClientSession }
  ): Promise<void>;

  findSessionByToken(refreshToken: string, ctx?: RequestContext): Promise<IUserSession | null>;

  revokeSession(sessionId: string, ctx?: RequestContext): Promise<void>;
}