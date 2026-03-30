import { env } from "../shared/config/env.js";
import { authControllerCreator } from "../modules/identity/controllers/auth.controller.js";
import AuthServices from "../modules/identity/services/auth.service.js";
import RateLimiterService from "../modules/identity/services/ratelimiter.service.js";
import UserServices from "../modules/identity/services/user.service.js";
import { SessionService } from "../modules/identity/services/session.service.js";
import { TokenService } from "../modules/identity/services/token.service.js";
import { createAuthMiddleware } from "../modules/identity/middlewares/authentication.middleware.js";

// --- Services Initialization---
const userServices = new UserServices();  
const sessionService = new SessionService();
const tokenService = new TokenService();
const authServices = new AuthServices(
  userServices,
  sessionService,
  tokenService,
);

// --- Rate Limiter Service Initialization------
const loginLimiter = new RateLimiterService(
  Number(env.LOGIN_WINDOW_MS),
  Number(env.LOGIN_MAX_ATTEMPTS),
);

// --- Controller Initialization---
export const authController = authControllerCreator(authServices, loginLimiter, tokenService);

// --- Middleware Initialization---
export const authenticate = createAuthMiddleware(tokenService, userServices);
