import { Schema, get, model, set } from "mongoose";
import { decrypt, encrypt } from "../../utils/crypto.js";
import { hash } from "../../utils/hash.js";
import { Providers } from "../../utils/constants/providers.js";
import { Gender } from "../../utils/constants/gender.js";
import { Roles } from "../../utils/constants/roles.js";

const OtpSchema = new Schema(
  {
    code: {
      type: String,
      set: (value) => (value ? hash(value) : undefined),
    },
    expiresAt: { type: Date },
    verified: { type: Boolean, default: false },
    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 5 },
  },
  { _id: false }
);

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
    },
    password: {
      type: String,
      required: function () {
        return this.provider === Providers.system;
      },
      minlength: 8,
      set: (value) => hash(value),
    },
    age: {
      type: Number,
      required: function () {
        return this.provider === Providers.system;
      },
    },
    role: {
      type: String,
      enum: Object.values(Roles),
      default: Roles.USER,
    },
    gender: {
      type: String,
      default: Gender.MALE,
      enum: Object.values(Gender),
    },
    phone: {
      type: String,
      required: function () {
        return this.provider === Providers.system;
      },
      get: (value) => decrypt(value),
      set: (value) => encrypt(value),
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    emailOtp: OtpSchema,
    passwordOtp: OtpSchema,
    credentialChangedAt: {
      type: Date,
    },
    provider: {
      type: String,
      enum: Object.values(Providers),
      default: Providers.SYSTEM,
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

  const title = this.gender === Gender.MALE ? "Mr." : "Ms.";

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
