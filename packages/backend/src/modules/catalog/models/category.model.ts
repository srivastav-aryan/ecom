import mongoose, { InferSchemaType, HydratedDocument } from "mongoose";
import {
  MAX_DESCRIPTION_LENGTH,
  MAX_NAME_LENGTH,
  MAX_SLUG_LENGTH,
} from "@e-com/shared/constants";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 1,
      maxlength: MAX_NAME_LENGTH,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 2,
      maxlength: MAX_SLUG_LENGTH,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: MAX_DESCRIPTION_LENGTH,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: false,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

// Supports listing direct children: GET /categories?parent=<id>&isActive=true
categorySchema.index({ parent: 1, isActive: 1 });

type CategoryProps = InferSchemaType<typeof categorySchema>;

export type LeanCategory = Omit<CategoryProps, "parent"> & {
  _id: mongoose.Types.ObjectId;
  parent: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CategoryDocument = HydratedDocument<CategoryProps>;

export const Category = mongoose.model<CategoryProps>("Category", categorySchema);
