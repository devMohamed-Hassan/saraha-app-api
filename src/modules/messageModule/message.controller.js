import { Router } from "express";
import { getMessages, sendMessage } from "./message.service.js";
import { handleMulterError } from "../../middlewares/handleMulterError.middleware.js";
import { cloudUploadFile } from "../../utils/multer/multer.cloud.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { sendMessageSchema } from "./message.validation.js";

const router = Router({
  caseSensitive: true,
  strict: true,
});

router.post(
  "/send/:receiverId",
  cloudUploadFile().single("image"),
  handleMulterError,
  validate(sendMessageSchema),
  sendMessage
);

router.get("/inbox", auth(), getMessages);

export default router;
