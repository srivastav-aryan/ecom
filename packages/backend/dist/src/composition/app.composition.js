import { env } from "../config/env.js";
import { authControllerCreator } from "../controllers/auth.controllers.js";
import AuthServices from "../services/auth.service.js";
import RateLimiterService from "../services/ratelimter.service.js";
const loginLimitter = new RateLimiterService(Number(env.LOGIN_WINDOW_MS), Number(env.LOGIN_MAX_ATTEMPTS));
export const authController = authControllerCreator({
    AuthServices,
    loginLimitter,
});
