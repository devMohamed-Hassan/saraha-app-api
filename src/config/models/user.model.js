import { Schema, get, model, set } from "mongoose";
import { decrypt, encrypt } from "../../utils/crypto.js";
import { hash } from "../../utils/hash.js";

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
      set: (value) => hash(value),
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
    toJSON: { getters: true, virtuals: true, transform: commonTransform },
    toObject: { getters: true, virtuals: true, transform: commonTransform },
  }
);

schema.virtual("message").get(function () {
  const hours = new Date().getHours();

  const timeMsg =
    hours < 12
      ? "Good morning"
      : hours < 18
      ? "Good afternoon"
      : "Good evening";

  const title = this.gender === Gender.male ? "Mr." : "Ms.";

  return `${timeMsg}, ${title} ${this.name}`;
});

function commonTransform(doc, ret) {
  const message = ret.greeting;
  delete ret.greeting;
  return {
    message,
    id: ret._id,
    ...ret,
    _id: undefined,
    __v: undefined,
    password: undefined,
  };
}

const userModel = model("users", schema);
export default userModel;
