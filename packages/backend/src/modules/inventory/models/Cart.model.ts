import mongoose from "mongoose";

export interface ICart extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  items: [
    {
      productVariant: mongoose.Types.ObjectId;
      quantity: number;
      addedAt: Date;
    },
    updatedAt: Date,
  ];
}

export const CartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  items: [
    {
      productVariant: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      addedAt: {
        type: Date,
        required: true,
      },
    },
  ],
}, {timestamps: true});

CartSchema.index({userId: 1}, {unique: true});

export const Cart = mongoose.model<ICart>("Cart", CartSchema);


