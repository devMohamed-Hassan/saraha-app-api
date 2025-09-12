import { Router } from "express";
import { sendMessage } from "./message.service.js";
import { handleMulterError } from "../../middlewares/handleMulterError.middleware.js";
import { cloudUploadFile } from "../../utils/multer/multer.cloud.js";

const router = Router();

router.post(
  "/send/:receiverId",
  cloudUploadFile().single("image"),
  handleMulterError,
  sendMessage
);

export default router;
