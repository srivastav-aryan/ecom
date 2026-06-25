import express from "express";
import { validateReq } from "../../../shared/middlewares/validation.middleware.js";
import { userLoginSchema, userRegistrationSchema } from "@e-com/shared/schemas";
import { AuthControllerInterface } from "../interfaces/auth.controller.interface.js";

export const authRouter = express.Router();

export const createAuthRouter = (authController: AuthControllerInterface) => {
  const authRouter = express.Router()

  authRouter.post(
    "/register",
    validateReq(userRegistrationSchema),
    authController.registerController
  );

  authRouter.post("/login", validateReq(userLoginSchema), authController.loginController);

  authRouter.post("/refresh", authController.refreshController)

  authRouter.post("/logout", authController.logOut)

  return authRouter
}
