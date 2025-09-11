import { userRegistrationInput } from "@e-com/shared/schemas";
import { IUser, User } from "../models/user.model";
import { ApiError } from "../utilities/utilites";

export default class UserServices {
  static async findUserByEmail(email: string): Promise<IUser | null> {
    const user = await User.findOne({ email: email });

    return user;
  }

  static async updateRefToken(
    userId: string,
    refreshToken: string
  ): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      $set: { refreshToken: refreshToken },
    });
  }


  static async createUser(input: userRegistrationInput) {
    const { email, lastname, firstname, password, confirmPassword } = input;
    const userExists = await User.findOne({ email: email.toLowerCase() });

    if (userExists) {
      throw new ApiError(
        409,
        "The email is already registered please login or register with new email"
      );
    }

    const newUser = await User.create({
      email,
      password,
      firstname,
      lastname,
    });
    return newUser;
  }
}
