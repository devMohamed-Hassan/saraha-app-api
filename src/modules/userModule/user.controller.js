import { Router } from "express";
import { getUserProfile } from "./user.service.js";
import { allowTo, auth } from "../../middlewares/auth.middleware.js";
import { Roles } from "../../config/models/user.model.js";

const router = Router();

router.get("/", auth(), allowTo(Roles.admin), getUserProfile);


export default router;
