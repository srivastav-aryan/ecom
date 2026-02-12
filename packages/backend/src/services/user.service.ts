import { userRegistrationInput } from "@e-com/shared/schemas";
import { IUser, User } from "../models/user.model.js";
import { ApiError } from "../utils/applevel.utils.js";
import { UserServiceInterface } from "../interfaces/services/user.service.interface.js";
import { RequestContext } from "../types/request-context.js";

export default class UserServices implements UserServiceInterface {
  async findUserByEmail(
    email: string,
    ctx?: RequestContext,
  ): Promise<IUser | null> {
    ctx?.logger?.debug({ email }, "Looking up user by email");

    const user = await User.findOne({ email: email });

    if (user) {
      ctx?.logger?.debug({ userId: user.id }, "User found by email");
    } else {
      ctx?.logger?.debug({ email }, "No user found by email");
    }

    return user;
  }

  async findUserByIdForAuth(
    userId: string,
    ctx?: RequestContext,
  ): Promise<IUser> {
    ctx?.logger?.debug({ userId }, "Looking up user by ID for auth");
    const user = await User.findById(userId).select(
      "+refreshToken +refreshTokenVersion +password +isActive",
    );

    if (!user) {
      ctx?.logger?.warn({ userId }, "User not found by ID for auth");
      throw new ApiError(401, "User not found");
    }

    ctx?.logger?.debug({ userId: user.id }, "User found by ID for auth");
    return user;
  }

  async findUserForLogin(
    email: string,
    ctx?: RequestContext,
  ): Promise<IUser> {
    ctx?.logger?.debug({ email }, "Looking up user by email for LOGIN");
    const user = await User.findOne({ email: email }).select("+password");

    if (!user) {
      ctx?.logger?.warn({ email }, "Login failed - user not found");
      throw new ApiError(400, "Invalid credentials");
    }

    ctx?.logger?.debug({ userId: user.id }, "User found by email");
    return user;
  }

  async createUser(
    input: userRegistrationInput,
    ctx?: RequestContext,
  ): Promise<IUser> {
    const { email, lastname, firstname, password } = input;

    ctx?.logger?.debug({ email }, "Checking if user already exists");

    const query = User.findOne({ email }).lean();

    const userExists = await query;

    if (userExists) {
      ctx?.logger?.warn(
        { email },
        "Attempt to register with an already registered email",
      );
      throw new ApiError(
        409,
        "The email is already registered. Please login or use a new email",
      );
    }

    ctx?.logger?.debug({ email }, "Creating new user in database");
    const [newUser] = await User.create(
      [
        {
          email,
          password,
          firstname,
          lastname,
        },
      ],
    );

    ctx?.logger?.info({ userId: newUser.id }, "New user created successfully");

    return newUser;
  }
}
