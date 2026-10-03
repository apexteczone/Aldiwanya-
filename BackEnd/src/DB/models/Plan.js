import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    duration_months: {
      type: Number,
      enum: [1, 3, 12],
      required: true,
    },

    amount_minor: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "amount_minor must be an integer",
      },
    },

    currency: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

const Plan = mongoose.model("Plan", planSchema);

export default Plan;