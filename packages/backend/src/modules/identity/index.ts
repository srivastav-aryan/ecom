// === Identity Module Public API ===
// Other modules should ONLY import from this file, never reach into internals.

// Models
export { User, type IUser } from "./models/user.model.js";
export { userSession, type IUserSession } from "./models/userSession.model.js";

// Services
export { default as AuthServices } from "./services/auth.service.js";
export { default as UserServices } from "./services/user.service.js";
export { SessionService } from "./services/session.service.js";
export { TokenService } from "./services/token.service.js";
export { default as RateLimiterService } from "./services/ratelimiter.service.js";

// Interfaces
export type { IAuthService } from "./interfaces/auth.service.interface.js";
export type { UserServiceInterface } from "./interfaces/user.service.interface.js";
export type { SessionServiceInterface } from "./interfaces/session.service.interface.js";
export {
  type TokenServiceInterface,
  type AccessTokenPayload,
  type RefreshTokenPayload,
  type JWTErrorCode,
  JWT_ERROR_CODES,
  JWTError,
} from "./interfaces/token.service.interface.js";

// Cache
export { authCache, type AuthCacheEntry } from "./cache/auth.cache.js";

// Controllers
export { authControllerCreator } from "./controllers/auth.controller.js";
export type { RateLimiter } from "./controllers/auth.controller.js";

// Routes
export { authRouter } from "./routes/auth.routes.js";

// Middlewares
export { createAuthMiddleware } from "./middlewares/authentication.middleware.js";
