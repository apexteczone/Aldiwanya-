import mongoose from "mongoose";

const subscriptionPeriodSchema =
  new mongoose.Schema(
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Plan",
        required: true,
      },

      paymentOrderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PaymentOrder",
        required: true,
        unique: true,
      },

      startsAt: {
        type: Date,
        required: true,
      },

      endsAt: {
        type: Date,
        required: true,
      },
    },
    {
      timestamps: true,
    }
  );

subscriptionPeriodSchema.index({
  userId: 1,
  startsAt: 1,
  endsAt: 1,
});

const SubscriptionPeriodModel =
  mongoose.model(
    "SubscriptionPeriod",
    subscriptionPeriodSchema
  );

export default SubscriptionPeriodModel;