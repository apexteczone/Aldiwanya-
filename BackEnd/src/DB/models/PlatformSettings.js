import mongoose from "mongoose";

const text = (max, fallback = "") => ({
  type: String,
  trim: true,
  maxlength: max,
  default: fallback,
});
const generalSchema = new mongoose.Schema(
  {
    platformName: { ...text(100, "الديوانية"), required: true },
    shortDescription: text(300),
    description: text(3000),
    websiteUrl: text(2048),
    contactEmail: text(254),
    phoneCountryCode: {
      ...text(5, "+20"),
      enum: ["+20", "+965", "+966", "+971", "+974", "+973", "+968", "+962"],
    },
    phoneNumber: text(15),
    address: text(300),
  },
  { _id: false },
);
const socialSchema = new mongoose.Schema(
  {
    facebook: text(2048),
    instagram: text(2048),
    youtube: text(2048),
    x: text(2048),
    linkedin: text(2048),
  },
  { _id: false },
);
const schema = new mongoose.Schema(
  {
    _id: { type: String, default: "platform", enum: ["platform"] },
    general: { type: generalSchema, default: () => ({}) },
    socialLinks: { type: socialSchema, default: () => ({}) },
    revision: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true, versionKey: false },
);
export default mongoose.model("PlatformSettings", schema);
