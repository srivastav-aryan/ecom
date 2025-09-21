import { env } from "../config/env";
import { authControllerCreator } from "../controllers/auth.controllers";
import AuthServices from "../services/auth.service";
import RateLimiterService from "../services/ratelimter.service";
const loginLimitter = new RateLimiterService(Number(env.LOGIN_WINDOW_MS), Number(env.LOGIN_MAX_ATTEMPTS));
export const authController = authControllerCreator({
    AuthServices,
    loginLimitter,
});
