import mongoose, { Document, Model, Schema } from "mongoose";

export interface IUserSession extends Document {
  userId: Schema.Types.ObjectId,
  isValid: boolean,
  refreshTokenHash: string,
  expiresAt: Date,
  createdAt?: Date;
  updatedAt?: Date;
  deviceInfo: string
}


const userSessionSchema = new Schema<IUserSession>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true 
  },

  isValid: {
    type: Boolean,
    default: true,
    index: true 
  },
 
  deviceInfo: {
    type: String,
    required: true
  },

  refreshTokenHash: {
    type: String,
    required: true
  },

  expiresAt: {
    type: Date
  }
}, {timestamps: true})


userSessionSchema.index({expiresAt: 1}, {expireAfterSeconds: 0})


export const userSession: Model<IUserSession> = mongoose.model("UserSession", userSessionSchema) 
