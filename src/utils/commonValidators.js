import Joi from "joi";

export const nameValidator = Joi.string().min(3).max(50).required().messages({
  "string.base": "Name must be text.",
  "string.empty": "Name is required.",
  "string.min": "Name must be at least 3 characters long.",
  "string.max": "Name must not exceed 50 characters.",
  "any.required": "Name is required.",
});

export const emailValidator = Joi.string().email().required().messages({
  "string.base": "Email must be text.",
  "string.email": "Please provide a valid email address.",
  "any.required": "Email is required.",
});

export const passwordValidator = Joi.string()
  .min(6)
  .max(30)
  .pattern(/^[a-zA-Z0-9!@#$%^&*]{6,30}$/)
  .required()
  .messages({
    "string.empty": "Password is required.",
    "string.min": "Password must be at least 6 characters.",
    "string.max": "Password must not exceed 30 characters.",
    "string.pattern.base":
      "Password must contain only letters, numbers, or special characters (!@#$%^&*).",
  });

export const ageValidator = Joi.number().min(18).max(100).required().messages({
  "number.base": "Age must be a number.",
  "number.min": "Age must be at least 18.",
  "number.max": "Age must not be more than 100.",
  "any.required": "Age is required.",
});

export const phoneValidator = Joi.string()
  .pattern(/^(01)[0-9]{9}$/)
  .required()
  .messages({
    "string.empty": "Phone number is required.",
    "string.pattern.base":
      "Phone number must be a valid Egyptian number (11 digits starting with 01).",
    "any.required": "Phone number is required.",
  });

export const otpValidator = Joi.string()
  .length(6)
  .pattern(/^[0-9]+$/)
  .required()
  .messages({
    "string.empty": "OTP is required.",
    "string.length": "OTP must be 6 digits.",
    "string.pattern.base": "OTP must contain only numbers.",
    "any.required": "OTP is required.",
  });
