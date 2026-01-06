import { User } from "../../src/models/user.model";
import mongoose from "mongoose";
import UserServices from "../../src/services/user.service";
import { userRegistrationInput } from "@e-com/shared/schemas";
import AuthServices from "../../src/services/auth.service";


const authServices = new AuthServices()

describe("User services test", () => {
  describe("find user by email", () => {
    it("it should return a user document from the db without the password field", async () => {
      await User.create({
        email: "test4@gmail.com",
        firstname: "teswtaryan",
        lastname: "tee2222",
        password: "test123422",
        cart: new mongoose.Types.ObjectId(),
        wishlist: new mongoose.Types.ObjectId(),
      });

      const foundUser = await UserServices.findUserByEmail("test4@gmail.com");

      expect(foundUser).not.toBeNull();
      expect(foundUser?.password).toBeUndefined();
    });

    it("it should return null for non exsisting user", async () => {
      const notFound = await UserServices.findUserByEmail("non@gmail.com");

      expect(notFound).toBeNull();
    });
  });

  describe("UserServices - findUserForLogin", () => {
    it("should return user with password field selected", async () => {
      const password = "LoginPass123!";

      await User.create({
        email: "login@gmail.com",
        firstname: "Login",
        lastname: "User",
        password,
        cart: new mongoose.Types.ObjectId(),
        wishlist: new mongoose.Types.ObjectId(),
      });

      const found = await UserServices.findUserForLogin("login@gmail.com");

      expect(found).not.toBeNull();
      expect(found?.email).toBe("login@gmail.com");

      expect(found?.password).toBeDefined();
      expect(typeof found?.password).toBe("string");
    });

    it("should return null when the user doesn't exist", async () => {
      const found = await UserServices.findUserForLogin("noone@example.com");
      expect(found).toBeNull();
    });
  });

  describe("updateRefToken", () => {
    it("should update refreshToken and increment the version number", async () => {
      const input: userRegistrationInput = {
        firstname: "testUser",
        lastname: "surnametest",
        email: "test@gmail.com",
        password: "Test@123",
        confirmPassword: "Test@123",
      };

      const tokens = await authServices.registerUser(input);

      const registeredUser =
        await UserServices.findUserByEmail("test@gmail.com");
      expect(registeredUser).not.toBeNull();

      await UserServices.updateRefToken(
        registeredUser!.id,
        tokens.refreshToken,
      );

      const updatedUser = await User.findById(registeredUser!.id).select(
        "+refreshToken +refreshTokenVersion",
      );

      expect(updatedUser).not.toBeNull();
      expect(updatedUser!.refreshToken).toBe(tokens.refreshToken);
    });
  });
});
