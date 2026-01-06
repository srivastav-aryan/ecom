import { userLoginInput, userRegistrationInput } from "@e-com/shared/schemas";
import AuthServices from "../../src/services/auth.service";
import UserServices from "../../src/services/user.service";
import { logger } from "../../src/utilities/logging";
import { ApiError } from "../../src/utilities/utilites";

const authServices = new AuthServices()

describe("AuthService.registetUser test", () => {
  it("it should register user and return tokens", async () => {
     const input: userRegistrationInput = {
      firstname: "testUser",
      lastname: "surnametest",
      email: "test@gmail.com",
      password: "Test@123",
      confirmPassword: "Test@123",
    };

    const tokens = await authServices.registerUser(input, logger);

    expect(tokens).toHaveProperty("accessToken");
    expect(tokens).toHaveProperty("refreshToken");

    expect(typeof tokens.accessToken).toBe("string");
    expect(typeof tokens.refreshToken).toBe("string");

    const checkUser = await UserServices.findUserByEmail(input.email);

    expect(checkUser).not.toBeNull();
  });

  it("duplicate user behaviour", async () => {
    const input: userRegistrationInput = {
      firstname: "testUser",
      lastname: "surnametest",
      email: "test@gmail.com",
      password: "Test@123",
      confirmPassword: "Test@123",
    };

    await authServices.registerUser(input, logger);

    await expect(
      authServices.registerUser(input, logger),
    ).rejects.toBeInstanceOf(ApiError);
  });
});

describe("AuthServices.loginUser tests", () => {
  it("login user and return token", async () => {
    const registerInput: userRegistrationInput = {
      firstname: "testUser",
      lastname: "surnametest",
      email: "test@gmail.com",
      password: "Test@123",
      confirmPassword: "Test@123",
    };

    await authServices.registerUser(registerInput, logger);

    const input: userLoginInput = {
      email: registerInput.email,
      password: registerInput.password,
    };

    const tokens = await authServices.loginUser(input);
    expect(tokens).toHaveProperty("accessToken");
    expect(tokens).toHaveProperty("refreshToken");
    expect(typeof tokens.accessToken).toBe("string");
    expect(typeof tokens.refreshToken).toBe("string");
  });

  it("should throw ApiError when password is incorrect", async () => {
    const registerInput: userRegistrationInput = {
      firstname: "testUser",
      lastname: "surnametest",
      email: "wrongpass@example.com",
      password: "CorrectPass1!",
      confirmPassword: "CorrectPass1!",
    };

    await authServices.registerUser(registerInput);

    const input: userLoginInput = {
      email: registerInput.email,
      password: "WrongPass1!", // wrong password
    };

    await expect(authServices.loginUser(input)).rejects.toBeInstanceOf(
      ApiError,
    );
  });
});
