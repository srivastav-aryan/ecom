import mongoose from "mongoose";

export type InventoryEventType =
  | "RESTOCK" // new shipment arrived from supplier
  | "SALE" // order confirmed, stock decremented
  | "RETURN" // customer returned item
  | "DAMAGED" // item written off as damaged/unsellable
  | "RESERVATION_CREATED" // cart reservation placed
  | "RESERVATION_EXPIRED" // cart abandoned, stock returned
  | "RESERVATION_FULFILLED" // cart checked out, reservation converted to sale
  | "MANUAL_ADJUSTMENT"; // admin corrected a discrepancy

export interface IInventoryEvent extends Document {
  productVariantId: mongoose.Types.ObjectId;
  ResultingStockQuantity: number;
  ResultingReservedQuantity: number;
  reason?: string;
  refId?: mongoose.Types.ObjectId;
  delta: number;
  eventType: InventoryEventType;
  createdAt: Date;
}

// IMPORTANT: This collection is append-only. Events are never updated or deleted.
// It's an immutable ledger — like a bank's transaction history.
const inventoryEventSchema = new mongoose.Schema<IInventoryEvent>(
  {
    productVariantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductVariant",
      required: true,
    },
    ResultingStockQuantity: {
      type: Number,
      required: true,
      min: 0,
    },
    ResultingReservedQuantity: {
      type: Number,
      required: true,
      min: 0,
    },
    reason: {
      type: String,
      required: false,
    },
    refId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
    },
    delta: {
      type: Number,
      required: true,
    },
    eventType: {
      type: String,
      required: true,
      enum: [
        "RESTOCK",
        "SALE",
        "RETURN",
        "DAMAGED",
        "RESERVATION_CREATED",
        "RESERVATION_EXPIRED",
        "RESERVATION_FULFILLED",
        "MANUAL_ADJUSTMENT",
      ],
    },
  },
  { timestamps: true },
);

inventoryEventSchema.index({ productVariantId: 1, createdAt: -1 });

inventoryEventSchema.index({ refId: 1 });

export const InventoryEvent = mongoose.model<IInventoryEvent>(
  "InventoryEvent",
  inventoryEventSchema,
);
