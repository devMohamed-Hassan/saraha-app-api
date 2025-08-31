import Joi from "joi";

export const signUpSchema = Joi.object({
  name: Joi.string().min(3).max(50).required().messages({
    "string.base": "Name must be a text.",
    "string.empty": "Name is required.",
    "string.min": "Name must be at least 3 characters long.",
    "string.max": "Name must not exceed 50 characters.",
    "any.required": "Name is required.",
  }),

  email: Joi.string().email().required().messages({
    "string.base": "Email must be a text.",
    "string.email": "Please provide a valid email address.",
    "any.required": "Email is required.",
  }),

  password: Joi.string()
    .min(6)
    .max(30)
    .pattern(new RegExp("^[a-zA-Z0-9!@#$%^&*]{6,30}$"))
    .required()
    .messages({
      "string.empty": "Password is required.",
      "string.min": "Password must be at least 6 characters.",
      "string.max": "Password must not exceed 30 characters.",
      "string.pattern.base":
        "Password must contain only letters, numbers, or special characters (!@#$%^&*).",
    }),

  confirmPassword: Joi.any().equal(Joi.ref("password")).required().messages({
    "any.only": "Passwords do not match.",
    "any.required": "Confirm password is required.",
  }),

  age: Joi.number().min(18).max(100).required().messages({
    "number.base": "Age must be a number.",
    "number.min": "Age must be at least 18.",
    "number.max": "Age must not be more than 100.",
    "any.required": "Age is required.",
  }),

  gender: Joi.string().valid("male", "female").required().messages({
    "any.only": "Gender must be either male or female.",
    "any.required": "Gender is required.",
  }),

  phone: Joi.string()
    .pattern(/^(01)[0-9]{9}$/)
    .required()
    .messages({
      "string.empty": "Phone number is required.",
      "string.pattern.base":
        "Phone number must be a valid Egyptian number (11 digits starting with 01).",
      "any.required": "Phone number is required.",
    }),
})
  .unknown(false)
  .messages({
    "object.unknown": "Extra fields are not allowed in signup request.",
  });

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address.",
    "any.required": "Email is required.",
  }),

  password: Joi.string().required().messages({
    "string.empty": "Password is required.",
    "any.required": "Password is required.",
  }),
});
