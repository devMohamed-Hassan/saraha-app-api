import Joi from "joi";
import { imageFileSchema } from "../../utils/commonValidators.js";



export const uploadImageSchema = {
  file: imageFileSchema.required().messages({
    "any.required": "Image is required!",
  }),
};
