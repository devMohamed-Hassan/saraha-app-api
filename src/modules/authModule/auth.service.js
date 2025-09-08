import userModel from "../../config/models/user.model.js";
import { handleSuccess } from "../../utils/responseHandler.js";
import jwt from "jsonwebtoken";
import { create, find, findById, findOne } from "../../services/db.service.js";
import { decodeToken, types } from "../../middlewares/auth.middleware.js";
import { compare } from "../../utils/hash.js";
import emailEmitter, { emailEvents } from "../../utils/sendEmail/emailEvent.js";

import {
  UserNotFoundError,
  EmailNotVerifiedError,
  InvalidOtpError,
  OtpExpiredError,
  UserAlreadyVerifiedError,
} from "../../utils/customErrors.js";
import { OAuth2Client } from "google-auth-library";
import { Providers } from "../../utils/constants/providers.js";
import { Roles } from "../../utils/constants/roles.js";
import { buildOtp } from "../../utils/otp/buildOtp.js";

const client = new OAuth2Client();
const INVALID_CREDENTIALS_MSG = "Invalid email or password";

export const signUp = async (req, res, next) => {
  const { name, email, password, confirmPassword, role, gender, phone, age } =
    req.body;

  const isExist = await findOne(userModel, { email });
  if (isExist) {
    return next(new Error("This email is already registered", { cause: 400 }));
  }

  const otp = buildOtp();

  const user = await create(userModel, {
    name,
    email,
    password,
    role,
    gender,
    age,
    phone,
    emailOtp: otp,
  });

  emailEmitter.emit("sendEmail", {
    type: emailEvents.confirmEmail.type,
    email: user.email,
    userName: user.name,
    otp: otp.code,
  });

  handleSuccess({
    res,
    statusCode: 201,
    message: "Signup successful. Please check your email for OTP.",
    data: {
      user: {
        id: user._id,
        email: user.email,
      },
    },
  });
};

export const login = async (req, res, next) => {
  let { email, password } = req.body;

  const user = await findOne(userModel, { email });

  if (!user) {
    throw new Error(INVALID_CREDENTIALS_MSG, { cause: 400 });
  }

  if (user.provider !== Providers.SYSTEM) {
    return next(new Error(`Use ${user.provider} login for this account`), {
      cause: 401,
    });
  }

  const isMatch = compare(password, user.password);

  if (!isMatch) {
    throw new Error(INVALID_CREDENTIALS_MSG, { cause: 400 });
  }

  if (!user.isActive) {
    return next(
      new Error("This account has been deactivated.", { cause: 403 })
    );
  }

  if (!user.isVerified && !user.pendingEmail) {
    return next(new EmailNotVerifiedError());
  }

  const payload = {
    _id: user._id,
    email: user.email,
    role: user.role,
  };

  const accessSignture =
    user.role === Roles.ADMIN
      ? process.env.ADMIN_ACCESS_TOKEN_SECRET
      : process.env.USER_ACCESS_TOKEN_SECRET;

  const refreshSignture =
    user.role === Roles.ADMIN
      ? process.env.ADMIN_REFRESH_TOKEN_SECRET
      : process.env.USER_REFRESH_TOKEN_SECRET;

  const accessToken = jwt.sign(payload, accessSignture, {
    expiresIn: `1h`,
  });
  const refreshToken = jwt.sign(payload, refreshSignture, {
    expiresIn: `7d`,
  });

  handleSuccess({
    res,
    statusCode: 202,
    message: "Login successful",
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: 3600,
      },
    },
  });
};

export const refreshToken = async (req, res, next) => {
  const { authorization } = req.headers;
  const user = await decodeToken({
    tokenType: types.refresh,
    authorization,
    next,
  });

  const accessSignture =
    user.role === Roles.ADMIN
      ? process.env.ADMIN_ACCESS_TOKEN_SECRET
      : process.env.USER_ACCESS_TOKEN_SECRET;

  const accessToken = jwt.sign(
    {
      _id: user._id,
      email: user.email,
      role: user.role,
    },
    accessSignture,
    {
      expiresIn: `1h`,
    }
  );
  handleSuccess({ res, statusCode: 202, data: { accessToken } });
};

export const resendCode = async (req, res, next) => {
  const { email } = req.body;
  const { type } = req.params;

  const user = await findOne(userModel, { email: email.trim().toLowerCase() });

  if (!user) {
    return next(new UserNotFoundError());
  }

  if (!user.isActive) {
    return next(
      new Error("This account has been deactivated.", { cause: 403 })
    );
  }

  const otp = buildOtp();

  if (type === "register") {
    if (user.isVerified) {
      return next(new UserAlreadyVerifiedError());
    }

    user.emailOtp = otp;

    await user.save();

    emailEmitter.emit("sendEmail", {
      type: emailEvents.confirmEmail.type,
      email: user.email,
      userName: user.name,
      otp: otp.code,
    });
  } else if (type === "reset-password") {
    if (!user.isVerified) {
      return next(new EmailNotVerifiedError());
    }

    if (!user.passwordOtp || !user.passwordOtp.code) {
      return next(
        new Error("No forgot password request found for this account.", {
          cause: 400,
        })
      );
    }

    user.passwordOtp = otp;

    await user.save();

    emailEmitter.emit("sendEmail", {
      type: emailEvents.forgotPassword.type,
      email: user.email,
      userName: user.name,
      otp: otp.code,
    });
  } else {
    return next(new Error("Invalid type in URL", { cause: 400 }));
  }

  return handleSuccess({
    res,
    statusCode: 200,
    message: `OTP resent successfully for ${type}. Please check your email.`,
    data: { expiresAt },
  });
};

export const confirmEmail = async (req, res, next) => {
  const { email, otp } = req.body;

  const user = await findOne(userModel, { email });

  if (!user) {
    return next(new UserNotFoundError());
  }

  if (!user.isActive) {
    return next(
      new Error("This account has been deactivated.", { cause: 403 })
    );
  }

  if (user.isVerified) {
    return next(new UserAlreadyVerifiedError());
  }

  if (!user.emailOtp || !user.emailOtp.code) {
    return next(
      new Error("No OTP found, please request a new one", { cause: 400 })
    );
  }

  if (new Date() > user.emailOtp.expiresAt) {
    return next(new OtpExpiredError());
  }

  if (user.emailOtp.attempts >= user.emailOtp.maxAttempts) {
    return next(new Error("Max OTP attempts reached", { cause: 400 }));
  }

  const isMatch = compare(otp, user.emailOtp.code);
  if (!isMatch) {
    user.emailOtp.attempts += 1;
    await user.save();
    return next(new InvalidOtpError());
  }

  user.isVerified = true;
  user.emailOtp = undefined;
  await user.save();

  handleSuccess({
    res,
    statusCode: 202,
    message: "Email verified successfully",
    data: {
      user: {
        id: user._id,
        email: user.email,
      },
    },
  });
};

export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  const user = await findOne(userModel, { email: email.trim().toLowerCase() });

  if (!user) {
    return next(new UserNotFoundError());
  }

  if (!user.isActive) {
    return next(
      new Error("This account has been deactivated.", { cause: 403 })
    );
  }

  if (!user.isVerified) {
    return next(new EmailNotVerifiedError());
  }

  const otp = buildOtp();

  user.passwordOtp = otp;
  await user.save();

  emailEmitter.emit("sendEmail", {
    type: emailEvents.forgotPassword.type,
    email: user.email,
    userName: user.name,
    otp: otp.code,
  });

  handleSuccess({
    res,
    statusCode: 202,
    message: "Password reset OTP has been sent to your email",
    data: {
      expiry: user.passwordOtp.expiresAt,
      expiresIn: 10 * 60,
    },
  });
};

export const verifyForgotOtp = async (req, res, next) => {
  const { email, otp } = req.body;

  const user = await findOne(userModel, { email: email.trim().toLowerCase() });

  if (!user) {
    return next(new UserNotFoundError());
  }

  if (!user.isActive) {
    return next(
      new Error("This account has been deactivated.", { cause: 403 })
    );
  }

  if (!user.isVerified) {
    return next(new EmailNotVerifiedError());
  }

  if (!user.passwordOtp || !user.passwordOtp.code) {
    return next(
      new Error("No OTP request found. Please request again.", { cause: 400 })
    );
  }

  if (user.passwordOtp.expiresAt < new Date()) {
    return next(new OtpExpiredError());
  }

  if (user.passwordOtp.attempts >= user.passwordOtp.maxAttempts) {
    return next(new Error("Maximum OTP attempts reached", { cause: 403 }));
  }

  const isMatch = compare(otp, user.passwordOtp.code);

  if (!isMatch) {
    user.passwordOtp.attempts += 1;
    await user.save();
    return next(new InvalidOtpError());
  }

  user.passwordOtp.verified = true;
  await user.save();

  handleSuccess({
    res,
    statusCode: 200,
    message: "OTP verified. You can reset your password now.",
  });
};

export const resetPassword = async (req, res, next) => {
  const { email, newPassword, confirmPassword } = req.body;

  const user = await userModel.findOne({ email: email.trim().toLowerCase() });
  if (!user) {
    return next(new UserNotFoundError());
  }

  if (!user.isActive) {
    return next(
      new Error("This account has been deactivated.", { cause: 403 })
    );
  }

  if (!user.isVerified) {
    return next(new EmailNotVerifiedError());
  }

  if (!user.passwordOtp) {
    return next(
      new Error("No OTP request found. Please request again.", { cause: 400 })
    );
  }

  if (user.passwordOtp.expiresAt < new Date()) {
    return next(new OtpExpiredError());
  }

  if (!user.passwordOtp.verified) {
    return next(
      new Error("OTP not verified. Cannot reset password.", { cause: 403 })
    );
  }

  user.password = newPassword;
  user.credentialChangedAt = new Date();
  user.passwordOtp = undefined;

  await user.save();
  handleSuccess({
    res,
    statusCode: 200,
    message: "Password has been reset successfully.",
  });
};

export const socialLogin = async (req, res, next) => {
  const { idToken } = req.body;

  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const { email, name, picture, sub } = ticket.getPayload();

  let user = await userModel.findOne({ email });

  if (!user.isActive) {
    return next(
      new Error("This account has been deactivated.", { cause: 403 })
    );
  }

  if (user?.provider === Providers.SYSTEM) {
    return next(new Error("Please login using system account", 401));
  }

  if (!user) {
    user = await userModel.create({
      email,
      name,
      isVerified: true,
      role: Roles.USER,
      provider: Providers.GOOGLE,
      //avatar: picture,
      //googleId: sub,
    });
  }

  const accessToken = jwt.sign(
    {
      _id: user._id,
      email: user.email,
      role: user.role,
    },
    process.env.USER_ACCESS_TOKEN_SECRET,
    {
      expiresIn: `1h`,
    }
  );

  const refreshToken = jwt.sign(
    {
      _id: user._id,
      email: user.email,
      role: user.role,
    },
    process.env.USER_REFRESH_TOKEN_SECRET,
    { expiresIn: `7d` }
  );

  handleSuccess({
    res,
    statusCode: 202,
    message: "Login successful",
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: 3600,
      },
    },
  });
};

export const updateEmail = async (req, res, next) => {
  const { currentEmail, newEmail } = req.body;
  const user = req.user;

  if (currentEmail !== user.email) {
    return next(
      new Error("The email you entered does not match your account.", {
        cause: 400,
      })
    );
  }

  const existingUser = await userModel.findOne({ email: newEmail });
  if (existingUser) {
    return next(
      new Error("This email address is already registered.", {
        cause: 400,
      })
    );
  }

  user.isVerified = false;

  // Current Email
  const currentEmailOtp = buildOtp();
  user.emailOtp = currentEmailOtp;

  emailEmitter.emit("sendEmail", {
    type: emailEvents.changeEmail.type,
    email: user.email,
    userName: user.name,
    otp: currentEmailOtp.code,
  });

  // New Email
  const newEmailOtp = buildOtp();
  user.newEmailOtp = newEmailOtp;

  user.pendingEmail = newEmail;

  emailEmitter.emit("sendEmail", {
    type: emailEvents.changeEmail.type,
    email: newEmail,
    userName: user.name,
    otp: newEmailOtp.code,
  });

  await user.save();
  handleSuccess({
    res,
    statusCode: 200,
    message: "Verification codes sent to your current and new email addresses",
  });
};

export const confirmUpdateEmail = async (req, res, next) => {
  const { oldEmailOtp, newEmailOtp } = req.body;
  const user = req.user;

  if (!user.pendingEmail) {
    return next(new Error("No email change request found.", { cause: 400 }));
  }

  if (
    new Date() > user.emailOtp.expiresAt ||
    new Date() > user.newEmailOtp.expiresAt
  ) {
    return next(new OtpExpiredError());
  }

  if (
    user.emailOtp.attempts >= user.emailOtp.maxAttempts ||
    user.newEmailOtp.attempts >= user.newEmailOtp.maxAttempts
  ) {
    return next(new Error("Max OTP attempts reached", { cause: 400 }));
  }

  const isMatchOld = compare(oldEmailOtp, user.emailOtp.code);
  const isMatchNew = compare(newEmailOtp, user.newEmailOtp.code);

  if (!isMatchOld || !isMatchNew) {
    user.emailOtp.attempts += !isMatchOld ? 1 : 0;
    user.newEmailOtp.attempts += !isMatchNew ? 1 : 0;
    await user.save();
    return next(new InvalidOtpError());
  }

  user.email = user.pendingEmail;
  user.pendingEmail = undefined;
  user.isVerified = true;

  user.emailOtp = undefined;
  user.newEmailOtp = undefined;
  user.credentialChangedAt = new Date();

  await user.save();

  handleSuccess({
    res,
    statusCode: 200,
    message: "Your email address has been successfully updated.",
  });
};

export const resendUpdateEmail = async (req, res, next) => {
  const user = req.user;

  if (!user.pendingEmail) {
    return next(new Error("No email change request found.", { cause: 400 }));
  }

  const currentEmailOtp = buildOtp(10, 5);
  const newEmailOtp = buildOtp(10, 5);

  user.emailOtp = currentEmailOtp;
  user.newEmailOtp = newEmailOtp;

  await user.save();

  // Send OTP to current email
  emailEmitter.emit("sendEmail", {
    type: emailEvents.changeEmail.type,
    email: user.email,
    userName: user.name,
    otp: currentEmailOtp.code,
  });

  // Send OTP to new email (pendingEmail)
  emailEmitter.emit("sendEmail", {
    type: emailEvents.changeEmail.type,
    email: user.pendingEmail,
    userName: user.name,
    otp: newEmailOtp.code,
  });

  return res.status(200).json({
    success: true,
    message:
      "Verification codes resent to your current and new email addresses.",
  });
};
