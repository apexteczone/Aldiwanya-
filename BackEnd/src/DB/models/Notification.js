import mongoose from "mongoose";
const schema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    eventKey: { type: String, required: true },
    type: { type: String, required: true },
    title: { type: String, required: true, maxlength: 200 },
    message: { type: String, required: true, maxlength: 500 },
    href: { type: String, required: true, maxlength: 200 },
    readAt: { type: Date, default: null },
  },
  { timestamps: true },
);
schema.index({ recipient: 1, eventKey: 1 }, { unique: true });
schema.index({ recipient: 1, readAt: 1, createdAt: -1 });
export default mongoose.model("Notification", schema);
