import { User } from "../models/user.model";
import { ApiError } from "../utilities/utilites";
export default class UserServices {
    static async findUserByEmail(email) {
        const user = await User.findOne({ email: email.toLowerCase() });
        return user;
    }
    static async updateRefToken(userId, refreshToken, options) {
        await User.findByIdAndUpdate(userId, {
            $set: { refreshToken: refreshToken },
        }, { session: options?.session });
    }
    static async createUser(input, options) {
        const { email, lastname, firstname, password } = input;
        const userExists = await User.findOne({ email: email.toLowerCase() }, { session: options?.session });
        if (userExists) {
            throw new ApiError(409, "The email is already registered please login or register with new email");
        }
        const [newUser] = await User.create([{
                email,
                password,
                firstname,
                lastname,
            }], { session: options?.session });
        return newUser;
    }
}
