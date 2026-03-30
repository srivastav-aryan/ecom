import mongoose from "mongoose";

export interface ICartReservation extends Document {
  userId: mongoose.Types.ObjectId;
  productVariantId: mongoose.Types.ObjectId;
  reservedQuantity: number;
  expiresAt: Date;
}

const cartReservationSchema = new mongoose.Schema<ICartReservation>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productVariantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductVariant",
      required: true,
    },
    reservedQuantity: {
      type: Number,
      required: true,
      min: 0,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);


cartReservationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
cartReservationSchema.index({ userId: 1, productVariantId: 1 }, { unique: true });


// Safety net for developer mistakes in manual delete flows
// It does NOT run for: deleteOne(), deleteMany(), TTL expiry ❗, direct Mongo queries , bulk operations 
cartReservationSchema.post("findOneAndDelete", async function (doc: ICartReservation) {
  if (!doc) return;
  
  // Atomically return the reserved quantity back to the variant
  await mongoose.model("ProductVariant").findOneAndUpdate(
    { _id: doc.productVariantId },
    { $inc: { reservedQuantity: -doc.reservedQuantity } },
  );
});

export const CartReservation = mongoose.model<ICartReservation>("CartReservation", cartReservationSchema);
