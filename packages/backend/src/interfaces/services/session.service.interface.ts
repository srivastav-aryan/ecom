import mongoose from "mongoose";
import pino from "pino";
import { IUserSession } from "../../models/userSession.model";

export interface SessionServiceInterface {
  createSession(
    userId: string,
    refreshToken: string,
    logger?: pino.Logger,
    options?: { session: mongoose.ClientSession }
  ): Promise<void>;

  findSessionByToken(refreshToken: string): Promise<IUserSession | null>;

  revokeSession(sessionId: string): Promise<void>;
}
       