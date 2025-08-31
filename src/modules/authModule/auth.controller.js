import { Router } from "express";
import * as authServices from "./auth.service.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  confirmEmailSchema,
  forgotPasswordSchema,
  loginSchema,
  resendOtpSchema,
  resetPasswordSchema,
  signUpSchema,
  socialLoginSchema,
  verifyForgotOtpSchema,
} from "./auth.validation.js";

const router = Router();

router.post("/signup", validate(signUpSchema), authServices.signUp);
router.post("/login", validate(loginSchema), authServices.login);

router.post("/refersh-token", authServices.refreshToken);

router.patch(
  "/resend-otp/:type",
  validate(resendOtpSchema),
  authServices.resendCode
);

router.post(
  "/confirm-email",
  validate(confirmEmailSchema),
  authServices.confirmEmail
);

router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  authServices.forgotPassword
);

router.post(
  "/verify-reset-code",
  validate(verifyForgotOtpSchema),
  authServices.verifyForgotOtp
);

router.put(
  "/reset-password",
  validate(resetPasswordSchema),
  authServices.resetPassword
);

router.post(
  "/social-login",
  validate(socialLoginSchema),
  authServices.socialLogin
);

export default router;
