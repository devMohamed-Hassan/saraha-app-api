import Joi from "joi";

const objectIdPattern = /^[a-fA-F0-9]{24}$/;

export const sendMessageSchema = {
  params: Joi.object({
    receiverId: Joi.string().pattern(objectIdPattern).required().messages({
      "string.pattern.base": "Invalid receiver ID format",
      "any.required": "Receiver ID is required",
    }),
  }).required(),

  body: Joi.object({
    content: Joi.string().trim().min(1).max(1000).allow("").messages({
      "string.base": "Content must be a string",
      "string.empty": "Message content cannot be empty",
      "string.min": "Message content must be at least 1 character",
      "string.max": "Message content cannot exceed 1000 characters",
    }),
  }).required(),
};
