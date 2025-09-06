import { User } from "../models/user.model";
import { ApiError } from "../utilities/utilites";
export default class UserServices {
    static async createUser(input) {
        const { email, lastname, firstname, password, confirmPassword } = input;
        const userExists = await User.findOne({ email: email.toLowerCase() });
        if (userExists) {
            throw new ApiError(409, "The email is already registered please login or register with new email");
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
