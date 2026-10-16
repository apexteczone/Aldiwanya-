import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
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

    amount_minor: {type:Number,min:1,validate:Number.isSafeInteger},
    customer_email: {type:String,lowercase:true},
    payment_method_id: Number,
    checkout_url: String,
    return_to: {type:String,default:'/dashboard'},
    last_attempt: {type:String,enum:['unknown','pending','failed']},
    open_user_id: {type:mongoose.Schema.Types.ObjectId,ref:'User',unique:true,sparse:true},
    price_snapshot: {
      type: Number,
      required: true,
      min: 0,
    },

    duration_snapshot: {
      type: Number,
      required: true,
      min: 1,
    },

    currency: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "created",
        "pending",
        "succeeded",
        "failed",
        "canceled",
      ],
      default: "created",
    },

    provider: {
      type: String,
      trim: true,
    },

    provider_reference: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    idempotency_key: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    paid_at: {
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

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;