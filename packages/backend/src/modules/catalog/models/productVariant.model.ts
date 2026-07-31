import mongoose, { InferSchemaType, HydratedDocument } from "mongoose";

const productVariantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      default: "",
      trim: true,
      maxlength: 1000,
    },
    images: { type: [String], required: true, default: [] },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    // --- Inventory state machine ---
    stockQuantity: { type: Number, required: true, default: 0 },
    reservedQuantity: { type: Number, required: true, default: 0 },

    sku: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },
    weightInGrams: { type: Number, required: true, default: 0 },

    // --- Flexible Attributes Array ---
    attributes: [
      {
        name: { type: String, required: true, trim: true },
        value: { type: String, required: true, trim: true },
        meta: { type: String, trim: true },
      },
    ],

    sellingPrice: { type: Number, required: true, default: 0, min: 0 },
    costPrice: { type: Number, default: 0, min: 0 },
    mrp: { type: Number, required: true, min: 0 },
  },
  { timestamps: true },
);

productVariantSchema.index({ slug: 1 }, { unique: true });

productVariantSchema.index({ sku: 1 }, { unique: true });

productVariantSchema.index({ productId: 1 });

// The Ultimate Filtering Index
productVariantSchema.index(
  {
    productId: 1,
    "attributes.name": 1,
    "attributes.value": 1,
  },
  { partialFilterExpression: { isActive: true } },
);

// FOR ADMING QUERRYING
productVariantSchema.index({ productId: 1, isActive: 1 });

// Virtual field — computed on the fly, never stored in DB
// Accessible as variant.availableStock in  code
productVariantSchema.virtual("availableStock").get(function() {
  return this.stockQuantity - this.reservedQuantity;
});

type ProductVariantProps = InferSchemaType<typeof productVariantSchema>;

export type LeanProductVariant = Omit<ProductVariantProps, "productId"> & {
  _id: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  availableStock: number; // Virtual field typed
};

export type ProductVariantDocument = HydratedDocument<ProductVariantProps>;

export const ProductVariant = mongoose.model<ProductVariantProps>(
  "ProductVariant",
  productVariantSchema,
);
