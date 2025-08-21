import mongoose, { Document, Schema } from "mongoose";
import { Permission, USER_ROLES, UserRole } from "@e-com/shared/constants";
import { UserAddress } from "@e-com/shared/schemas";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { env } from "../config/env";

export interface IUser extends Document {
  email: string;
  password: string;
  firstname: string;
  lastname: string;
  role: UserRole;
  permissions: Permission[];
  phone?: string;
  addresses?: UserAddress[];
  isEmailVerified?: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;

  cart: Schema.Types.ObjectId;
  wishlist: Schema.Types.ObjectId;
  reviews: Schema.Types.ObjectId;
  orderHistory: Schema.Types.ObjectId;

  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  isPasswordCorrect(password: string): Promise<boolean>;
  generatePasswordResetToken(): Promise<string>;
  generateEmailVerificationToken(): Promise<string>;
  generateRefreshToken(): string;
  generateAccessToken(): string;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      maxlength: 16,
    },
    firstname: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 50,
    },
    lastname: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 50,
    },
    role: {
      type: String,
      required: true,
      default: USER_ROLES.USER,
      enum: Object.values(USER_ROLES),
    },
    permissions: {
      type: [String],
      default: [],
    },

    phone: {
      type: String,
      match: [
        /^[0-9]{10,15}$/,
        "Invalid phone number format (10-15 digits expected)",
      ],
      default: null,
    },
    addresses: {
      type: [String],
      default: [],
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },

    emailVerificationExpires: {
      type: Date,
      select: false,
    },

    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },

    cart: {
      type: Schema.Types.ObjectId,
      ref: "Cart",
      required: true,
    },

    wishlist: {
      type: Schema.Types.ObjectId,
      ref: "Wishlist",
      required: true,
    },

    reviews: {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },

    orderHistory: {
      type: Schema.Types.ObjectId,
      ref: "Order",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.isPasswordCorrect = async function (
  password: string
): Promise<boolean> {
  const res = await bcrypt.compare(password, this.password);
  return res;
};

userSchema.methods.generateEmailVerificationToken =
  async function (): Promise<string> {
    const buffer = crypto.randomBytes(32);
    const token = buffer.toString("hex");
    console.log(buffer);
    console.log(token);

    this.emailVerificationToken = token;
    this.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    return token;
  };

userSchema.methods.generatePasswordResetToken =
  async function (): Promise<string> {
    const buffer = crypto.randomBytes(32);
    const token = buffer.toString("hex");

    this.passwordResetToken = token;
    this.passwordResetExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    return token;
  };

userSchema.methods.generateAccessToken = function (): string {
  const secret: Secret = env.ACCESS_TOKEN_SECRET as string;
  const expiry: SignOptions["expiresIn"] = env.ACCESS_TOKEN_EXPIRY
    ? (env.ACCESS_TOKEN_EXPIRY as SignOptions["expiresIn"])
    : "15m";

  return jwt.sign(
    { _id: this._id, email: this.email, role: this.role },
    secret,
    { expiresIn: expiry }
  );
};

userSchema.methods.generateRefreshToken = function (): string {
  const secret: Secret = env.REFRESH_TOKEN_SECRET as string;
  const expiry: SignOptions["expiresIn"] = env.REFRESH_TOKEN_EXPIRY
    ? (env.REFRESH_TOKEN_EXPIRY as SignOptions["expiresIn"])
    : "7d";

  return jwt.sign({ _id: this._id }, secret, { expiresIn: expiry });
};

export const User = mongoose.model<IUser>("User", userSchema);
