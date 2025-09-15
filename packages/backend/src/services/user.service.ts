import { userRegistrationInput } from "@e-com/shared/schemas";
import { IUser, User } from "../models/user.model";
import { ApiError } from "../utilities/utilites";
import mongoose from "mongoose";

export default class UserServices {
  static async findUserByEmail(email: string): Promise<IUser | null> {
    const user = await User.findOne({ email: email.toLowerCase() });

    return user;
  }

  static async updateRefToken(
    userId: string,
    refreshToken: string,
    options? : {session: mongoose.ClientSession}
  ): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      $set: { refreshToken: refreshToken },
    }, {session: options?.session});
  }


  static async createUser(input: userRegistrationInput, options?: {session: mongoose.ClientSession}): Promise<IUser> {
    const { email, lastname, firstname, password} = input;
    const userExists = await User.findOne({ email: email.toLowerCase() }, {session: options?.session});

    if (userExists) {
      throw new ApiError(
        409,
        "The email is already registered please login or register with new email"
      );
    }

    const [newUser] = await User.create([{
      email,
      password,
      firstname,
      lastname,
    }], {session: options?.session});
    return newUser;
  }
}
