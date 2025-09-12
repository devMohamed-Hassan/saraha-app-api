import mongoose, { model, Types } from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    receiver: {
      type: Types.ObjectId,
      ref: "users",
      required: true,
    },
    content: {
      type: String,
      required: function () {
        return !this.image;
      },
      trim: true,
    },
    image: {
      public_id: { type: String },
      secure_url: { type: String },
    },
    type: {
      type: String,
      enum: ["text", "image"],
      default: "text",
    },
    isAnonymous: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ["unread", "read"],
      default: "unread",
    },
  },
  { timestamps: true }
);

const messageModel = model("Messages", messageSchema);
export default messageModel;
