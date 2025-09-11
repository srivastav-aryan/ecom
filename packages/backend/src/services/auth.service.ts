import { userLoginInput, userRegistrationInput } from "@e-com/shared/schemas";
import UserServices from "./user.service";
import { User } from "../models/user.model";
import { ApiError } from "../utilities/utilites";

export default class AuthServices {
  static async registerUser(userInput: userRegistrationInput) {
    const regUser = await UserServices.createUser(userInput);

    const accessToken = regUser.generateAccessToken();
    const refreshToken = regUser.generateRefreshToken();

    regUser.refreshToken = refreshToken;

    await regUser.save();

    return { refreshToken, accessToken };
  }

  static async loginUser(input: userLoginInput) {
    const { email, password } = input;

    const user = await User.findOne({ email: email });

    if (!user) {
      throw new ApiError(400, "sorry no such email exsists");
    }

    const passCheck = await user.isPasswordCorrect(password);

    if (!passCheck) {
      throw new ApiError(400, "Incorrect password");
    }

    const accToken = user.generateAccessToken();
    const refToken = user.generateRefreshToken();

    await user.save({ validateBeforeSave: false });

    return { refToken, accToken };
  }
}
