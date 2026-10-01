import mongoose from "mongoose";

const paymentEventSchema = new mongoose.Schema(
  {
    provider_event_id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    payment_order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },

    provider: {
      type: String,
      required: true,
      trim: true,
    },

    verification_status: {
      type: String,
      enum: ["pending", "valid", "invalid"],
      default: "pending",
    },

    processing_status: {
      type: String,
      enum: ["pending", "processed", "ignored", "failed"],
      default: "pending",
    },

    verification_error: {
      type: String,
      trim: true,
    },

    received_at: {
      type: Date,
      default: Date.now,
    },

    processed_at: {
      type: Date,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

const PaymentEvent = mongoose.model(
  "PaymentEvent",
  paymentEventSchema
);

export default PaymentEvent;