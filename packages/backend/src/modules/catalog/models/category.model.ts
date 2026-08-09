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
   ancestors: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Category",
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

categorySchema.index({ parent: 1, isActive: 1 });
categorySchema.index({ parent: 1, name: 1 }, { unique: true });
categorySchema.index({ parent: 1, slug: 1 }, { unique: true });
// Multikey index: MongoDB creates one index entry per element in the array,
// so `Category.find({ ancestors: someId })` is an indexed lookup, not a collection scan.
categorySchema.index({ ancestors: 1 });

type CategoryProps = InferSchemaType<typeof categorySchema>;

export type LeanCategory = Omit<CategoryProps, "parent" | "ancestors"> & {
  _id: mongoose.Types.ObjectId;
  parent?: mongoose.Types.ObjectId | null;
  ancestors: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
};

export type CategoryDocument = HydratedDocument<CategoryProps>;

export const Category = mongoose.model<CategoryProps>(
  "Category",
  categorySchema,
);
