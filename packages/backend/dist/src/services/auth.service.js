import UserServices from "./user.service";
export default class AuthServices {
    static async registerUser(userInput) {
        const regUser = await UserServices.createUser(userInput);
        const accessToken = regUser.generateAccessToken();
        const refreshToken = regUser.generateRefreshToken();
        regUser.refreshToken = refreshToken;
        await regUser.save();
        return { refreshToken, accessToken };
    }
}
