import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    durationMonths: {
      type: Number,
      enum: [1, 3, 6, 12],
      required: true,
    },

  
    amountMinor: {
      type: Number,
      required: true,
      min: 1,
    },

    currency: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      minlength: 3,
      maxlength: 3,
    },

    description: {type: String, trim: true, maxlength: 1000, default: ''},
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);


planSchema.index(
  { durationMonths: 1 },
  { unique: true }
);

const PlanModel = mongoose.model(
  "Plan",
  planSchema
);

export default PlanModel;
