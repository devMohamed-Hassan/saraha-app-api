import { Router } from "express";
import { getMessages, sendMessage } from "./message.service.js";
import { handleMulterError } from "../../middlewares/handleMulterError.middleware.js";
import { cloudUploadFile } from "../../utils/multer/multer.cloud.js";
import { auth } from "../../middlewares/auth.middleware.js";

const router = Router();

router.post(
  "/send/:receiverId",
  cloudUploadFile().single("image"),
  handleMulterError,
  sendMessage
);

router.get("/inbox", auth(), getMessages);

export default router;
