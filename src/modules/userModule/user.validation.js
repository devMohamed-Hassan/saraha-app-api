import Joi from "joi";
import { imageFileSchema } from "../../utils/commonValidators.js";

export const uploadImageSchema = {
  file: imageFileSchema.required().messages({
    "any.required": "Profile Image is required!",
  }),
};

export const uploadImagesSchema = {
  files: Joi.array()
    .items(imageFileSchema)
    .max(2)
    .required()
    .messages({ "any.required": "Cover Image is required!" }),
};
