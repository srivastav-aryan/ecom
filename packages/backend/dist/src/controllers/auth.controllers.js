// Following factory function pattern instead of classes
import { env } from "../config/env.js";
import { ApiError } from "../utilities/utilites.js";
export const authControllerCreator = (deps) => {
    const { AuthServices, loginLimitter } = deps;
    return {
        register: async (req, res, next) => {
            //@ts-ignore
            const logger = req.log.child({ route: "register" });
            try {
                const { accessToken, refreshToken } = await AuthServices.registerUser(req.body, logger);
                res.cookie("refreshToken", refreshToken, {
                    httpOnly: true,
                    secure: env.NODE_ENV === "production",
                    sameSite: "strict",
                    maxAge: parseInt(env.REFRESH_TOKEN_EXPIRY),
                });
                res.status(201).json({
                    success: true,
                    data: { accessToken },
                    message: "User Registered Successfully",
                });
            }
            catch (error) {
                next(error);
            }
        },
        login: async (req, res, next) => {
            //@ts-ignore
            const logger = req.log.child({ route: "login" });
            try {
                const { email } = req.body;
                const result = loginLimitter.checkRateLimit(email || req.ip, logger.child({ email }));
                if (!result.allowed) {
                    throw new ApiError(429, "Too many login attempts. Try again later.", false);
                }
                const { accessToken, refreshToken } = await AuthServices.loginUser(req.body, logger);
                res.cookie("refreshToken", refreshToken, {
                    httpOnly: true,
                    secure: env.NODE_ENV === "production",
                    sameSite: "strict",
                    path: "/auth/refresh",
                    maxAge: parseInt(env.REFRESH_TOKEN_EXPIRY, 10) || 7 * 24 * 60 * 60 * 1000,
                });
                res.status(201).json({
                    success: true,
                    data: { accessToken },
                    message: "User Registered Successfu",
                });
                res.status(200).json({
                    success: true,
                    data: { accessToken },
                    message: "User logged in successfully",
                });
            }
            catch (error) {
                next(error);
            }
        },
    };
};
