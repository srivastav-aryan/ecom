import UserServices from "./user.service";
import { ApiError } from "../utilities/utilites";
import mongoose from "mongoose";
export default class AuthServices {
    static async registerUser(userInput) {
        const session = await mongoose.startSession();
        session.startTransaction({ writeConcern: { w: "majority" } });
        try {
            const regUser = await UserServices.createUser(userInput, { session });
            const tokens = await this._generateAndAssginToken(regUser, { session });
            await session.commitTransaction();
            return tokens;
        }
        catch (error) {
            await session.abortTransaction();
            throw new ApiError(500, "Internal server issue", false);
        }
        finally {
            session.endSession();
        }
    }
    static async loginUser(input) {
        // currently no transactions needed but can be added as future proofing or for a consistent pattern 
        const { email, password } = input;
        const user = await UserServices.findUserByEmail(email);
        if (!user || !(await user.isPasswordCorrect(password))) {
            throw new ApiError(400, "Invalid credentials");
        }
        return this._generateAndAssginToken(user);
    }
    static async _generateAndAssginToken(user, options) {
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        await UserServices.updateRefToken(user.id, refreshToken, options);
        return { accessToken, refreshToken };
    }
}
