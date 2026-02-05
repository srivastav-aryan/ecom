import express from "express";
import { validateReq } from "../middlewares/validation.middleware.js";
import { userLoginSchema, userRegistrationSchema } from "@e-com/shared/schemas";
import { authController } from "../composition/app.composition.js";

export const authRouter = express.Router();

authRouter.post(
  "/register",
  validateReq(userRegistrationSchema),
  authController.registerController
);

authRouter.post("/login", validateReq(userLoginSchema), authController.loginController);

authRouter.post("/refresh", authController.refreshController)

authRouter.post("/logout", authController.logOut)
