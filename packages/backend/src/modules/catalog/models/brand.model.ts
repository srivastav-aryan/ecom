import mongoose, { InferSchemaType, HydratedDocument } from "mongoose";

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },

    logo: {
      type: String,
      required: false,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

type BrandProps = InferSchemaType<typeof brandSchema>;

export type LeanBrand = BrandProps & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export type BrandDocument = HydratedDocument<BrandProps>;

export const Brand = mongoose.model<BrandProps>("Brand", brandSchema);
