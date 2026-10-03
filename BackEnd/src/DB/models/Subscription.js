import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    plan_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      required: true,
    },

    payment_order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      required: true,
    },

    starts_at: {
      type: Date,
      required: true,
    },

    ends_at: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

subscriptionSchema.virtual("status").get(function () {
  const now = new Date();

  if (now < this.starts_at) {
    return "none";
  }

  if (now >= this.starts_at && now < this.ends_at) {
    return "active";
  }

  return "expired";
});

subscriptionSchema.set("toJSON", {
  virtuals: true,
});

subscriptionSchema.set("toObject", {
  virtuals: true,
});

const SubscriptionPeriod = mongoose.model(
  "SubscriptionPeriod",
  subscriptionSchema
);

export default SubscriptionPeriod;