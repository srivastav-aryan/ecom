import { env } from "../shared/config/env.js";
import { authControllerCreator } from "../modules/identity/controllers/auth.controller.js";
import AuthServices from "../modules/identity/services/auth.service.js";
import RateLimiterService from "../modules/identity/services/ratelimiter.service.js";
import UserServices from "../modules/identity/services/user.service.js";
import { SessionService } from "../modules/identity/services/session.service.js";
import { TokenService } from "../modules/identity/services/token.service.js";
import { createAuthMiddleware } from "../modules/identity/middlewares/authentication.middleware.js";
import { BrandService } from "../modules/catalog/services/brand.service.js";
import { brandControllerCreator } from "../modules/catalog/controllers/brand.controller.js";

// ******** Identity Module ********
// --- Services ---
const userServices = new UserServices();  
const sessionService = new SessionService();
const tokenService = new TokenService();
const authServices = new AuthServices(
  userServices,
  sessionService,
  tokenService,
);
// --- Rate Limiter ---
const loginLimiter = new RateLimiterService(
  Number(env.LOGIN_WINDOW_MS),
  Number(env.LOGIN_MAX_ATTEMPTS),
);
// --- Controllers ---
export const authController = authControllerCreator(authServices, loginLimiter, tokenService);
// --- Middleware ---
export const authenticate = createAuthMiddleware(tokenService, userServices);



// *********** Catalog Module**********
// --- Services----
const brandService = new BrandService();
// --- Controllers ---
export const brandController = brandControllerCreator(brandService);
