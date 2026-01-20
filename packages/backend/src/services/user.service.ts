import { userRegistrationInput } from "@e-com/shared/schemas";
import { IUser, User } from "../models/user.model.js";
import { ApiError } from "../utils/applevel.utils.js";
import mongoose from "mongoose";
import pino from "pino";
import crypto from "crypto";

export default class UserServices {
  static async findUserByEmail(
    email: string,
    logger?: pino.Logger,
  ): Promise<IUser | null> {
    logger?.debug({ email }, "Looking up user by email");

    const user = await User.findOne({ email: email });

    if (user) {
      logger?.debug({ userId: user.id }, "User found by email");
    } else {
      logger?.debug({ email }, "No user found by email");
    }

    return user;
  }

  static async findUserByIdForAuth(
    userId: string,
    logger?: pino.Logger,
  ): Promise<IUser | null> {
    logger?.debug({ userId }, "Looking up user by ID for auth");
    const user = await User.findById(userId).select(
      "+refreshToken +refreshTokenVersion +password +isActive",
    );

    if (user) {
      logger?.debug({ userId: user.id }, "User found by ID for auth");
    } else {
      logger?.debug({ userId }, "No user found by ID for auth");
    }

    return user;
  }

  static async findUserForLogin(
    email: string,
    logger?: pino.Logger,
  ): Promise<IUser | null> {
    logger?.debug({ email }, "Looking up user by email for LOGIN");
    const user = await User.findOne({ email: email }).select("+password");

    if (user) {
      logger?.debug({ userId: user.id }, "User found by email");
    } else {
      logger?.debug({ email }, "No user found by email");
    }

    return user;
  }

  static async updateRefToken(
    userId: string,
    refreshToken: string,
    logger?: pino.Logger,
    options?: { session: mongoose.ClientSession },
  ): Promise<void> {
    logger?.debug({ userId }, "Updating refresh token in database");

    const hashedRefToken = crypto.createHash("sha256").update(refreshToken).digest("hex");

    const updated = await User.findByIdAndUpdate(
      userId,
      {
        $set: { refreshToken: hashedRefToken },
        $inc: { refreshTokenVersion: 1 },
      },
      { session: options?.session },
    );

    if (!updated) {
      logger?.error({ userId }, "Failed to update refresh token");
      throw new ApiError(500, "Token update failed");
    }

    logger?.debug({ userId }, "Refresh token updated");
  }

  static async createUser(
    input: userRegistrationInput,
    logger?: pino.Logger,
    options?: { session: mongoose.ClientSession },
  ): Promise<IUser> {
    const { email, lastname, firstname, password } = input;

    logger?.debug({ email }, "Checking if user already exists");

    const query = User.findOne({ email });
    if (options?.session) {
      query.session(options.session);
    }
    const userExists = await query;

    if (userExists) {
      logger?.warn(
        { email },
        "Attempt to register with an already registered email",
      );
      throw new ApiError(
        409,
        "The email is already registered. Please login or use a new email",
      );
    }

    logger?.debug({ email }, "Creating new user in database");
    const [newUser] = await User.create(
      [
        {
          email,
          password,
          firstname,
          lastname,
        },
      ],
      { session: options?.session },
    );

    logger?.info({ userId: newUser.id }, "New user created successfully");

    return newUser;
  }
}
