import { Router } from "express";
import * as authServices from "./auth.service.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { loginSchema, signUpSchema } from "./auth.validation.js";

const router = Router();

router.post("/signup", validate(signUpSchema), authServices.signUp);
router.post("/login", validate(loginSchema), authServices.login);

router.post("/refersh-token", authServices.refreshToken);

router.patch("/resend-otp/:type", authServices.resendCode);

router.post("/confirm-email", authServices.confirmEmail);

router.post("/forgot-password", authServices.forgotPassword);
router.post("/verify-reset-code", authServices.verifyForgotOtp);
router.put("/reset-password", authServices.resetPassword);

router.post("/social-login", authServices.socialLogin);

export default router;
