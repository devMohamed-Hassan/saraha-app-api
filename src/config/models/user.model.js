import { Schema, get, model, set } from "mongoose";
import { decrypt, encrypt } from "../../utils/crypto.js";

export const Roles = {
  admin: "admin",
  user: "user",
};
Object.freeze(Roles);

export const Gender = {
  male: "male",
  female: "female",
};
Object.freeze(Gender);

const schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    age: {
      type: Number,
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(Roles),
      default: Roles.user,
    },
    gender: {
      type: String,
      default: Gender.male,
      enum: Object.values(Gender),
    },
    phone: {
      type: String,
      required: true,
      get: (value) => decrypt(value),
      set: (value) => encrypt(value),
    },
  },

  {
    timestamps: true,
    toJSON: {
      getters: true,
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        return ret;
      },
    },
    toObject: {
      getters: true,
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        return ret;
      },
    },
  }
);

const userModel = model("users", schema);
export default userModel;
