import UserServices from "./user.service";
import { User } from "../models/user.model";
import { ApiError } from "../utilities/utilites";
export default class AuthServices {
    static async registerUser(userInput) {
        const regUser = await UserServices.createUser(userInput);
        const accessToken = regUser.generateAccessToken();
        const refreshToken = regUser.generateRefreshToken();
        regUser.refreshToken = refreshToken;
        await regUser.save();
        return { refreshToken, accessToken };
    }
    static async loginUser(input) {
        const { email, password } = input;
        const user = await User.findOne({ email: email });
        if (!user) {
            throw new ApiError(400, "Invalid credentials");
        }
        const passCheck = await user.isPasswordCorrect(password);
        if (!passCheck) {
            throw new ApiError(400, "Invalid credentials");
        }
        const accToken = user.generateAccessToken();
        const refToken = user.generateRefreshToken();
        user.refreshToken = refToken;
        await user.save();
        return { refToken, accToken };
    }
}
