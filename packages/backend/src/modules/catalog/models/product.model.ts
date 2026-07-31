import mongoose, { InferSchemaType, HydratedDocument } from "mongoose";

const productSchema = new mongoose.Schema(
  {
    vendorId: {
      type: String,
      required: true,
      default: "Default Vendor",// Till the time of multi-vendor, this is the default single vendor
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

productSchema.index({ slug: 1 }, { unique: true }); // this is ok for single vendor, but not for multi-vendor
productSchema.index({ category: 1 , isActive: 1});
productSchema.index({ brand: 1 , isActive: 1})

type ProductProps = InferSchemaType<typeof productSchema>;

export type LeanProduct = Omit<ProductProps, "category" | "brand"> & {
  _id: mongoose.Types.ObjectId;
  category: mongoose.Types.ObjectId;
  brand: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export type ProductDocument = HydratedDocument<ProductProps>;

export const Product = mongoose.model<ProductProps>("Product", productSchema);
