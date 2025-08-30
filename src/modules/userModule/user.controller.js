import { Router } from "express";
import { getUserProfile } from "./user.service.js";
import { allowTo, auth } from "../../middlewares/auth.middleware.js";
import { Roles } from "../../utils/constants/roles.js";

const router = Router();

router.get("/", auth(), allowTo(Roles.USER), getUserProfile);

export default router;
