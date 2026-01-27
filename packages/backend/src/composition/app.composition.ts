import { env } from "../config/env.js";
import { authControllerCreator } from "../controllers/auth.controllers.js";
import AuthServices from "../services/auth.service.js";
import RateLimiterService from "../services/ratelimter.service.js";
import UserServices from "../services/user.service.js";
import { SessionService } from "../services/session.service.js";
import { TokenService } from "../services/token.service.js";
import { createAuthMiddleware } from "../middlewares/authentication.middleware.js";

// --- Services Initialization---
const userServices = new UserServices();  
const sessionService = new SessionService();
const tokenService = new TokenService();

const authServices = new AuthServices(
  userServices,
  sessionService,
  tokenService,
);

// --- Rate Limiter Initialization------
const loginLimiter = new RateLimiterService(
  Number(env.LOGIN_WINDOW_MS),
  Number(env.LOGIN_MAX_ATTEMPTS),
);

// --- Controller Initialization---
export const authController = authControllerCreator(authServices, loginLimiter, tokenService);

// --- Middleware Initialization---
export const authenticate = createAuthMiddleware(tokenService, userServices);
