import mongoose, { Document } from "mongoose";

export interface IProduct extends Document {
  vendorId: string;
  name: string;
  slug: string;
  description: string;
  category: mongoose.Types.ObjectId;
  brand: mongoose.Types.ObjectId;
  hsnCode: string;
  gstRate: number;
  isActive: boolean;
  images: string[];
  tags: string[];
}

const productSchema = new mongoose.Schema<IProduct>(
  {
    vendorId: {
      type: String,
      required: true,
      default: "Default Vendor",
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
    },

    description: {
      type: String,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    hsnCode: {
      type: String,
      required: true,
    },
    gstRate: {
      type: Number,
      required: true,
      enum: [5, 12],
      default: 5,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    images: [{ type: String }],
    tags: [{ type: String, lowercase: true }],
  },
  { timestamps: true },
);



productSchema.index({ slug: 1 });
productSchema.index({ category: 1 , isActive: 1});
productSchema.index({ brand: 1 , isActive: 1});

export const Product = mongoose.model<IProduct>("Product", productSchema);
