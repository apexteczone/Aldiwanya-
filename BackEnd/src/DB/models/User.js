import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    passwordHash: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: ["Student", "Admin"],
      default: "Student",
      required: true,
    },

    termsAccepted: {
      type: Boolean,
      required: true,
      default: false,
    },

    termsVersion: {
      type: String,
      default: "v1",
    },

    tokenVersion: {
      type: Number,
      default: 0,
    },

    gradePreference: {
      type: Number,
      enum: [10, 11, 12],
    },
  },
  {
    timestamps: true,
  }
);

const UserModel = mongoose.model(
  "User",
  userSchema
);

export default UserModel;