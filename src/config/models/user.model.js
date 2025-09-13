import { Schema, Types, get, model, set } from "mongoose";
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

const userSchema = new Schema(
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
    passwordHistory: {
      type: [String],
      default: [],
      //select: false,
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
      get: (value) => (value ? decrypt(value) : value),
      set: (value) => (value ? encrypt(value) : value),
    },
    profileImage: {
      public_id: String,
      secure_url: String,
    },
    coverImage: {
      public_id: String,
      secure_url: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    emailOtp: OtpSchema,
    newEmailOtp: OtpSchema,
    passwordOtp: OtpSchema,
    pendingEmail: {
      type: String,
      lowercase: true,
      trim: true,
    },
    credentialChangedAt: {
      type: Date,
    },
    provider: {
      type: String,
      enum: Object.values(Providers),
      default: Providers.SYSTEM,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    deletedBy: {
      type: Types.ObjectId,
      ref: "users",
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },

  {
    timestamps: true,
    toJSON: { getters: true, virtuals: true, transform: commonTransform },
    toObject: { getters: true, virtuals: true, transform: commonTransform },
  }
);

userSchema.virtual("greeting").get(function () {
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
  const greeting = ret.greeting;
  delete ret.greeting;

  ret.passwordHistory = undefined;
  ret.passwordOtp = undefined;
  ret.emailOtp = undefined;
  ret.newEmailOtp = undefined;

  return {
    greeting,
    id: ret._id,
    ...ret,
    _id: undefined,
    __v: undefined,
    password: undefined,
    deletedAt: undefined,
  };
}

userSchema.methods.deactivate = function (deletedBy) {
  this.isActive = false;
  this.deletedBy = deletedBy;
  this.deletedAt = new Date();
  return this.save();
};

const userModel = model("users", userSchema);
export default userModel;
