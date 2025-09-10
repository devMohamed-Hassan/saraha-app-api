import mongoose, { Types, model } from "mongoose";

const revokedTokenSchema = new mongoose.Schema(
  {
    jti: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    device: {
      type: String,
    },
    expiresAt: {
      type: Date,
      default: Date.now,
      expires: 7 * 24 * 60 * 60,
    },
  },
  {
    timestamps: true,
  }
);

export const RevokedTokenModel = model("RevokedToken", revokedTokenSchema);
