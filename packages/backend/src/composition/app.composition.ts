import { env } from "../shared/config/env.js";
import {
  authControllerCreator,
  AuthServices,
  RateLimiterService,
  UserServices,
  SessionService,
  TokenService,
  createAuthMiddleware,
} from "../modules/identity/index.js";
import { BrandService, brandControllerCreator } from "../modules/catalog/index.js";

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
