import { Router } from "express";
import * as authServices from "./auth.service.js";

const router = Router();

router.post("/signup", authServices.signUp);
router.post("/login", authServices.login);
router.post("/refersh-token", authServices.refreshToken);
router.post("/confirm-email", authServices.confirmEmail);

export default router;
