import mongoose from "mongoose";
import { User } from "../../src/models/user.model";
import { PERMISSIONS, USER_ROLES } from "@e-com/shared/constants";

describe("User model unit tests", () => {
  it("this should hash password before saving", async () => {
    const user = new User({
      email: "test4@gmail.com",
      firstname: "teswtaryan",
      lastname: "tee2222",
      password: "test123422",
      cart: new mongoose.Types.ObjectId(),
      wishlist: new mongoose.Types.ObjectId(),
      reviews: new mongoose.Types.ObjectId(),
      role: "SUPER_ADMIN",
      orderHistory: new mongoose.Types.ObjectId(),
    });

    await user.save();

    expect(user.password).not.toBe("test123422");
  });

  it("this should check the hashed password is correct or not", async () => {
    const pass = "check123";
    const user = new User({
      email: "test@gmail.com",
      firstname: "testaryan",
      lastname: "srivas",
      password: pass,
      cart: new mongoose.Types.ObjectId(),
      wishlist: new mongoose.Types.ObjectId(),
      reviews: new mongoose.Types.ObjectId(),
      role: "SUPER_ADMIN",
      orderHistory: new mongoose.Types.ObjectId(),
    });

    await user.save();

    expect(await user.isPasswordCorrect(pass)).toBe(true);
    expect(await user.isPasswordCorrect("wrongpass")).toBe(false);
  });

  it("should check the   email verification and password reset  token and its expiry", async () => {
    const user = new User({
      email: "test4@gmail.com",
      firstname: "teswtaryan",
      lastname: "tee2222",
      password: "test123422",
      cart: new mongoose.Types.ObjectId(),
      wishlist: new mongoose.Types.ObjectId(),
      role: "SUPER_ADMIN",
    });

    await user.save();

    const passToken = await user.generatePasswordResetToken();
    const token = await user.generateEmailVerificationToken();

    expect(token).toBeDefined();
    expect(passToken).toBeDefined();
    expect(typeof token).toBe("string");
    expect(typeof passToken).toBe("string");

    expect(user.emailVerificationToken).toBe(token),
      expect(user.passwordResetToken).toBe(passToken);
    expect(user.emailVerificationExpires).toBeInstanceOf(Date);
    expect(user.emailVerificationExpires?.getTime()).toBeGreaterThan(
      Date.now()
    );
    expect(user.passwordResetExpires).toBeInstanceOf(Date);
    expect(user.passwordResetExpires?.getTime()).toBeGreaterThan(Date.now());
  });

  it("should check the generation of the refresh and access tokens", async () => {
    const user = new User({
      email: "test4@gmail.com",
      firstname: "teswtaryan",
      lastname: "tee2222",
      password: "test123422",
      cart: new mongoose.Types.ObjectId(),
      wishlist: new mongoose.Types.ObjectId(),
      role: "SUPER_ADMIN",
    });

    await user.save();

    const accTok = user.generateAccessToken();
    const refTok = user.generateRefreshToken();

    expect(accTok).toBeDefined();
    expect(typeof accTok).toBe("string");
    expect(refTok).toBeDefined();
    expect(typeof refTok).toBe("string");
  });

  it("checking the role field is User by default", async () => {
    const user = new User({
      email: "test4@gmail.com",
      firstname: "teswtaryan",
      lastname: "tee2222",
      password: "test123422",
      cart: new mongoose.Types.ObjectId(),
      wishlist: new mongoose.Types.ObjectId(),
    });

    await user.save();

    expect(user.role).toBe(USER_ROLES.USER);
  });

  it("should correctly handle explicit permissions", async () => {
    const user = new User({
      email: "test4@gmail.com",
      firstname: "teswtaryan",
      lastname: "tee2222",
      password: "test123422",
      cart: new mongoose.Types.ObjectId(),
      wishlist: new mongoose.Types.ObjectId(),
      permissions: [PERMISSIONS.PRODUCTS_CREATE, PERMISSIONS.CATEGORIES_DELETE]
    });

    await user.save();

    expect(user.permissions).toContain(PERMISSIONS.PRODUCTS_CREATE);
    expect(user.permissions).toContain(PERMISSIONS.CATEGORIES_DELETE);
    expect(user.permissions).not.toContain(PERMISSIONS.CATEGORIES_UPDATE);
  });
});
