import { Router } from "express";
import * as authServices from "./auth.service.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  confirmEmailSchema,
  confirmUpdateEmailSchema,
  forgotPasswordSchema,
  loginSchema,
  resendOtpSchema,
  resetPasswordSchema,
  signUpSchema,
  socialLoginSchema,
  updateEmailSchema,
  updatePasswordSchema,
  verifyForgotOtpSchema,
} from "./auth.validation.js";
import { auth } from "../../middlewares/auth.middleware.js";

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

router.patch(
  "/update-email",
  validate(updateEmailSchema),
  auth(),
  authServices.updateEmail
);

router.post("/resend-update-email", auth(), authServices.resendUpdateEmail);

router.patch(
  "/confirm-update-email",
  validate(confirmUpdateEmailSchema),
  auth(),
  authServices.confirmUpdateEmail
);

router.patch(
  "/update-password",
  validate(updatePasswordSchema),
  auth(),
  authServices.updatePassword
);

router.post("/logout", auth(), authServices.logout);
router.post("/logout-all", auth(), authServices.logoutFromAllDevices);

router.get("/devices", auth(), authServices.getAllDevices);

export default router;
