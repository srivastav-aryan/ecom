import { User } from "../models/user.model.js";
import { ApiError } from "../utilities/utilites.js";
export default class UserServices {
    static async findUserByEmail(email, logger) {
        logger?.debug({ email }, "Looking up user by email");
        const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
        if (user) {
            logger?.debug({ userId: user.id }, "User found by email");
        }
        else {
            logger?.debug({ email }, "No user found by email");
        }
        return user;
    }
    static async updateRefToken(userId, refreshToken, logger, options) {
        logger?.debug({ userId }, "Updating refresh token in database");
        const updated = await User.findByIdAndUpdate(userId, { $set: { refreshToken }, $inc: { refreshTokenVersion: 1 } }, { session: options?.session });
        if (!updated) {
            logger?.error({ userId }, "Failed to update refresh token");
            throw new ApiError(500, "Token update failed");
        }
        logger?.debug({ userId }, "Refresh token updated");
    }
    static async createUser(input, logger, options) {
        const { email, lastname, firstname, password } = input;
        logger?.debug({ email }, "Checking if user already exists");
        const userExists = await User.findOne({ email }, null, { session: options?.session });
        if (userExists) {
            logger?.warn({ email }, "Attempt to register with an already registered email");
            throw new ApiError(409, "The email is already registered. Please login or use a new email");
        }
        logger?.debug({ email }, "Creating new user in database");
        const [newUser] = await User.create([
            {
                email,
                password,
                firstname,
                lastname,
            },
        ], { session: options?.session });
        logger?.info({ userId: newUser.id }, "New user created successfully");
        return newUser;
    }
}
