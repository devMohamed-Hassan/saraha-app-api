import { Router } from "express";
import {
  deactivate,
  getUserProfile,
  publicProfile,
  restoreAccount,
  shareProfile,
  updateUser,
} from "./user.service.js";
import { allowTo, auth } from "../../middlewares/auth.middleware.js";
import { Roles } from "../../utils/constants/roles.js";

const router = Router();

router.get("/", auth(), allowTo(Roles.USER), getUserProfile);

router.get("/share-profile", auth(), shareProfile);
router.get("/public/:id", publicProfile);

router.patch("/update", auth(), updateUser);

router.patch("/:id/deactivate", auth(), deactivate);
router.patch("/:id/restore-account", auth(false), restoreAccount);

export default router;
