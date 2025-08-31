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
