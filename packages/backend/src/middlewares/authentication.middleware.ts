import { NextFunction, Request, Response } from "express";
import {
  JWT_ERROR_CODES,
  JWTError,
} from "../utils/jwt.utils";
import { Types } from "mongoose";
import JwtServices from "../services/jwt.service";


export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const logger = req.log

    const accessToken = JwtServices.extractTokenFromHeader(req.headers.authorization, logger);
  

    if (!accessToken) {
      throw new JWTError("Access token not provided", JWT_ERROR_CODES.NO_TOKEN);
    }

    const decoded = JwtServices.verifyAccessToken(accessToken, logger);

    req.user = {
      _id: new Types.ObjectId(decoded._id),
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error instanceof JWTError) {
      return next(error);
    }
    next(
      new JWTError(
        "Authentication failed",
        JWT_ERROR_CODES.MALFORMED,
        false, // isOperational = false (it's a programming error)
      ),
    );
  }
};
