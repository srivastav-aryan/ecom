import { userLoginInput, userRegistrationInput } from "@e-com/shared/schemas";
import UserServices from "./user.service";
import { ApiError } from "../utilities/utilites";
import { IUser } from "../models/user.model";

export default class AuthServices {
  static async registerUser(userInput: userRegistrationInput) {
    const regUser = await UserServices.createUser(userInput);
    return this._generateAndAssginToken(regUser);
  }

  static async loginUser(input: userLoginInput) {
    const { email, password } = input;

    const user = await UserServices.findUserByEmail(email);

    if (!user || !(await user.isPasswordCorrect(password))) {
      throw new ApiError(400, "Invalid credentials");
    }

    return this._generateAndAssginToken(user);
  }

  private static async _generateAndAssginToken(user: IUser) {
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    await UserServices.updateRefToken(user.id, refreshToken);

    return { accessToken, refreshToken };
  }
}
