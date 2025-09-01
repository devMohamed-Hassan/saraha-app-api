import { Router } from "express";
import { getUserProfile, publicProfile, shareProfile } from "./user.service.js";
import { allowTo, auth } from "../../middlewares/auth.middleware.js";
import { Roles } from "../../utils/constants/roles.js";

const router = Router();

router.get("/", auth(), allowTo(Roles.USER), getUserProfile);
router.get("/share-profile", auth(), shareProfile);
router.get("/public/:id", publicProfile);

export default router;
