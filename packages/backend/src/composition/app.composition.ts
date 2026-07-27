import { env } from "../shared/config/env.js";
import {
  authControllerCreator,
  AuthServices,
  RateLimiterService,
  UserServices,
  SessionService,
  TokenService,
  AuthControllerInterface,
  createAuthMiddleware,
  UserServiceInterface,
  SessionServiceInterface,
  TokenServiceInterface,
  IAuthService,
  createAuthRouter,
} from "../modules/identity/index.js";
import {
  BrandService,
  brandControllerCreator,
  BrandControllerInterface,
  createBrandRouter,
} from "../modules/catalog/index.js";
import { CategoryService } from "../modules/catalog/services/category.service.js";
import { ICategoryContollerInterface } from "../modules/catalog/interfaces/category.controller.interface.js";
import { categoryControllerCreator } from "../modules/catalog/controllers/category.controller.js";
import { createCategoryRouter } from "../modules/catalog/routes/category.routes.js";

// ******** Identity Module ********
// --- Services ---
const userServices: UserServiceInterface= new UserServices();
const sessionService: SessionServiceInterface = new SessionService();
const tokenService: TokenServiceInterface = new TokenService();
const authServices: IAuthService = new AuthServices(
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
export const authController: AuthControllerInterface = authControllerCreator(authServices, loginLimiter, tokenService);
// --- Middleware ---
export const authenticateMiddlware = createAuthMiddleware(tokenService, userServices);
 // -- Router ---
 export const authRouter = createAuthRouter(authController) 


// *********** Catalog Module**********
// --- Services----
const brandService = new BrandService();
// --- Controllers ---
export const brandController: BrandControllerInterface = brandControllerCreator(brandService);
// --- Router ---
export const brandRouter = createBrandRouter(brandController, authenticateMiddlware);


// --- Services----
const categoryService = new CategoryService();
// --- Controllers ---
export const categoryController: ICategoryContollerInterface  = categoryControllerCreator(categoryService);
// --- Router ---
export const categoryRouter = createCategoryRouter(categoryController, authenticateMiddlware);
