import Joi from "joi";
import {
  nameValidator,
  ageValidator,
  phoneValidator,
  emailValidator,
  passwordValidator,
  otpValidator,
} from "../../utils/commonValidators.js";

// Signup Schema
export const signUpSchema = {
  body: Joi.object({
    name: nameValidator,
    email: emailValidator,
    password: passwordValidator,
    confirmPassword: Joi.string()
      .valid(Joi.ref("password"))
      .required()
      .messages({
        "any.only": "Passwords do not match.",
        "any.required": "Confirm password is required.",
      }),
    age: ageValidator,
    gender: Joi.string().valid("male", "female").required().messages({
      "any.only": "Gender must be either male or female.",
      "any.required": "Gender is required.",
    }),
    phone: phoneValidator,
  }).unknown(false),
};

// Login Schema
export const loginSchema = {
  body: Joi.object({
    email: emailValidator,
    password: Joi.string().required().messages({
      "string.empty": "Password is required.",
      "any.required": "Password is required.",
    }),
  }),
};

// Resend OTP Schema
export const resendOtpSchema = {
  params: Joi.object({
    type: Joi.string().valid("register", "reset-password").required().messages({
      "any.only": "Invalid type in URL",
      "any.required": "Type is required.",
    }),
  }),
  body: Joi.object({
    email: emailValidator,
  }),
};

// Confirm Email Schema
export const confirmEmailSchema = {
  body: Joi.object({
    email: emailValidator,
    otp: otpValidator,
  }),
};

// Forgot Password Schema
export const forgotPasswordSchema = {
  body: Joi.object({
    email: emailValidator,
  }),
};

// Verify Forgot OTP Schema
export const verifyForgotOtpSchema = {
  body: Joi.object({
    email: emailValidator,
    otp: otpValidator,
  }),
};

// Reset Password Schema
export const resetPasswordSchema = {
  body: Joi.object({
    email: emailValidator,
    newPassword: passwordValidator.messages({
      "string.empty": "New password is required.",
      "any.required": "New password is required.",
    }),
    confirmPassword: Joi.string()
      .valid(Joi.ref("newPassword"))
      .required()
      .messages({
        "any.only": "Passwords do not match.",
        "any.required": "Confirm password is required.",
      }),
  }),
};

// Social Login Schema
export const socialLoginSchema = {
  body: Joi.object({
    idToken: Joi.string().required().messages({
      "any.required": "ID Token is required.",
      "string.empty": "ID Token cannot be empty.",
    }),
  }),
};

// Update Email Schema
export const updateEmailSchema = {
  body: Joi.object({
    currentEmail: emailValidator.messages({
      "any.required": "Current email is required.",
      "string.empty": "Current email cannot be empty.",
    }),
    newEmail: emailValidator.not(Joi.ref("currentEmail")).messages({
      "any.required": "New email is required.",
      "string.empty": "New email cannot be empty.",
      "any.invalid": "New email must be different from current email.",
    }),
  }),
};

// Confirm Update Email Schema
export const confirmUpdateEmailSchema = {
  body: Joi.object({
    oldEmailOtp: otpValidator.messages({
      "any.required": "Old email OTP is required.",
      "string.empty": "Old email OTP cannot be empty.",
    }),
    newEmailOtp: otpValidator.messages({
      "any.required": "New email OTP is required.",
      "string.empty": "New email OTP cannot be empty.",
    }),
  }),
};

// Update Password
export const updatePasswordSchema = {
  body: Joi.object({
    currentPassword: passwordValidator.messages({
      "any.required": "Current password is required.",
      "string.empty": "Current password cannot be empty.",
    }),

    newPassword: passwordValidator
      .disallow(Joi.ref("currentPassword"))
      .messages({
        "any.required": "New password is required.",
        "string.empty": "New password cannot be empty.",
        "any.invalid":
          "New password cannot be the same as the current password.",
      }),
  }),
};
