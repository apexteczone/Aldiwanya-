import mongoose from "mongoose";

const passwordResetTokenSchema =
  new mongoose.Schema(
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      tokenHash: {
        type: String,
        required: true,
        unique: true,
      },

      expiresAt: {
        type: Date,
        required: true,
        index: true,
      },

      usedAt: {
        type: Date,
        default: null,
      },
    },
    {
      timestamps: true,
    }
  );

const PasswordResetTokenModel =
  mongoose.model(
    "PasswordResetToken",
    passwordResetTokenSchema
  );

export default PasswordResetTokenModel;