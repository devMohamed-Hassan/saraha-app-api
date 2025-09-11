import { Router } from "express";
import {
  deactivate,
  deleteAccount,
  getUserProfile,
  publicProfile,
  restoreAccount,
  shareProfile,
  updateUser,
  uploadProfileImage,
} from "./user.service.js";
import { allowTo, auth } from "../../middlewares/auth.middleware.js";
import { Roles } from "../../utils/constants/roles.js";
import { uploadFile } from "../../utils/multer/multer.local.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { uploadImageSchema } from "./user.validation.js";
import { handleMulterError } from "../../middlewares/handleMulterError.middleware.js";


const router = Router();

router.get("/", auth(), getUserProfile);

router.get("/share-profile", auth(), shareProfile);
router.get("/public/:id", publicProfile);

router.patch("/update", auth(), updateUser);

router.patch("/:id/deactivate", auth(), deactivate);
router.patch("/:id/restore-account", auth(false), restoreAccount);

router.delete("/:id", auth(), allowTo(Roles.ADMIN), deleteAccount);

router.post(
  "/profile-image",
  auth(),
  uploadFile("profile").single("image"),
  handleMulterError,
  validate(uploadImageSchema),
  uploadProfileImage
);

export default router;
