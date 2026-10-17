import mongoose from "mongoose";
const schema = new mongoose.Schema(
  {
    _id: String,
    audience: {
      type: String,
      enum: ["Student", "Admin", "user"],
      required: true,
    },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type: { type: String, required: true },
    title: String,
    message: String,
    href: String,
    deliveredAt: { type: Date, default: null },
    announcedAt: {type:Date,default:null},
  },
  { timestamps: true, versionKey: false },
);
schema.index({ deliveredAt: 1, createdAt: 1 });
schema.index({announcedAt:1,createdAt:1});
export default mongoose.model("NotificationEvent", schema);
