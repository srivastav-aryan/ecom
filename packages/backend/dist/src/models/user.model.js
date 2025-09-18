import mongoose, { Schema } from "mongoose";
import { DEFAULT_PERMISSIONS, USER_ROLES, } from "@e-com/shared/constants";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
const userSchema = new Schema({
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
        select: false,
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
        default: DEFAULT_PERMISSIONS.USER,
        required: true,
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
    refreshToken: {
        type: String,
        select: false,
    },
    refreshTokenVersion: {
        type: Number,
        default: 0,
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
        //for nowwwww
        // required: true,
    },
    wishlist: {
        type: Schema.Types.ObjectId,
        ref: "Wishlist",
        //for nowwwww
        // required: true,
    },
    reviews: {
        type: [Schema.Types.ObjectId],
        ref: "Review",
        default: [],
    },
    orderHistory: {
        type: [Schema.Types.ObjectId],
        ref: "Order",
        default: [],
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });
//OPTIONALY WE CAN SET TRANSFORM FUCNTION TO REMOVE THE SENSITVE INFO SENT DURING RESPONSE
userSchema.pre("save", async function (next) {
    if (!this.isModified("password"))
        return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});
userSchema.methods.isPasswordCorrect = async function (password) {
    const res = await bcrypt.compare(password, this.password);
    return res;
};
userSchema.methods.generateEmailVerificationToken =
    async function () {
        const buffer = crypto.randomBytes(32);
        const token = buffer.toString("hex");
        this.emailVerificationToken = token;
        this.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        return token;
    };
userSchema.methods.generatePasswordResetToken =
    async function () {
        const buffer = crypto.randomBytes(32);
        const token = buffer.toString("hex");
        this.passwordResetToken = token;
        this.passwordResetExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        return token;
    };
userSchema.methods.generateAccessToken = function () {
    const secret = env.ACCESS_TOKEN_SECRET;
    const expiry = env.ACCESS_TOKEN_EXPIRY
        ? env.ACCESS_TOKEN_EXPIRY
        : "15m";
    return jwt.sign({ _id: this._id, email: this.email, role: this.role }, secret, { expiresIn: expiry });
};
userSchema.methods.generateRefreshToken = function () {
    const secret = env.REFRESH_TOKEN_SECRET;
    const expiry = env.REFRESH_TOKEN_EXPIRY
        ? env.REFRESH_TOKEN_EXPIRY
        : "7d";
    return jwt.sign({ _id: this._id, tokenVersion: this.refreshTokenVersion || 0 }, secret, { expiresIn: expiry });
};
export const User = mongoose.model("User", userSchema);
