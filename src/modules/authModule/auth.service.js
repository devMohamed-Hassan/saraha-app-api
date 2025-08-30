import userModel, { Roles } from "../../config/models/user.model.js";
import { handleSuccess } from "../../utils/responseHandler.js";
import jwt from "jsonwebtoken";
import { create, find, findById, findOne } from "../../services/db.service.js";
import { decodeToken, types } from "../../middlewares/auth.middleware.js";
import { compare } from "../../utils/hash.js";
import emailEmitter from "../../utils/sendEmail/emailEvent.js";
import { generateOtp } from "../../utils/sendEmail/generateOtp.js";

const INVALID_CREDENTIALS_MSG = "Invalid email or password";

export const signUp = async (req, res, next) => {
  let { name, email, password, confirmPassword, role, gender, phone, age } =
    req.body;

  if (
    !name ||
    !email ||
    !password ||
    !phone ||
    !age ||
    !gender ||
    !confirmPassword
  ) {
    return next(new Error("All fields are required", { cause: 400 }));
  }

  if (name.length < 2) {
    return next(
      new Error("Name must be at least 2 characters", { cause: 400 })
    );
  }

  email = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return next(new Error("Invalid email format", { cause: 400 }));
  }

  if (password.length < 6) {
    return next(
      new Error("Password must be at least 6 characters", { cause: 400 })
    );
  }

  if (password !== confirmPassword) {
    return next(new Error("Passwords do not match", { cause: 400 }));
  }

  const isExist = await findOne(userModel, { email });
  if (isExist) {
    throw new Error("This email is already registered", { cause: 400 });
  }

  const otp = generateOtp();

  const user = await create(userModel, {
    name,
    email,
    password,
    role,
    gender,
    age,
    phone,
    emailOtp: {
      code: otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      verified: false,
      attempts: 0,
      maxAttempts: 5,
    },
  });

  emailEmitter.emit("confirmEmail", {
    email: user.email,
    otp,
    userName: user.name,
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

  if (!email || !password) {
    throw new Error("Email and password are required", { cause: 400 });
  }

  email = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error("Invalid email format", { cause: 400 });
  }

  const user = await findOne(userModel, { email });

  if (!user) {
    throw new Error(INVALID_CREDENTIALS_MSG, { cause: 400 });
  }

  const isMatch = compare(password, user.password);

  if (!isMatch) {
    throw new Error(INVALID_CREDENTIALS_MSG, { cause: 400 });
  }

  if (!user.isVerified) {
    return next(
      new Error("Please verify your email before logging in.", {
        cause: 403,
      })
    );
  }

  const payload = {
    _id: user._id,
    email: user.email,
    role: user.role,
  };

  const accessSignture =
    user.role === Roles.admin
      ? process.env.ADMIN_ACCESS_TOKEN_SECRET
      : process.env.USER_ACCESS_TOKEN_SECRET;

  const refreshSignture =
    user.role === Roles.admin
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
    user.role === Roles.admin
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

  if (!email) {
    return next(new Error("Email is required", { cause: 400 }));
  }

  const user = await findOne(userModel, { email: email.trim().toLowerCase() });

  if (!user) {
    return next(new Error("No account found with this email", { cause: 404 }));
  }

  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  if (type === "register") {
    if (user.isVerified) {
      return next(new Error("User already verified", { cause: 400 }));
    }

    user.emailOtp = {
      code: otp,
      expiresAt,
      verified: false,
      attempts: 0,
      maxAttempts: 5,
    };

    await user.save();

    emailEmitter.emit("confirmEmail", {
      email: user.email,
      otp,
      userName: user.name,
    });
  } else if (type === "reset-password") {
    if (!user.isVerified) {
      return next(new Error("Please verify your email first", { cause: 403 }));
    }

    if (!user.passwordOtp || !user.passwordOtp.code) {
      return next(
        new Error("No forgot password request found for this account.", {
          cause: 400,
        })
      );
    }

    user.passwordOtp = {
      code: otp,
      expiresAt,
      verified: false,
      attempts: 0,
      maxAttempts: 5,
    };

    await user.save();

    emailEmitter.emit("forgotPassword", {
      email: user.email,
      otp,
      userName: user.name,
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

  if (!email || !otp) {
    return next(new Error("Email and OTP are required", 400));
  }

  const user = await findOne(userModel, { email });

  if (!user) {
    return next(new Error("No account found with this email", { cause: 404 }));
  }

  if (user.isVerified) {
    return next(new Error("User already verified", 400));
  }

  if (!user.emailOtp || !user.emailOtp.code) {
    return next(
      new Error("No OTP found, please request a new one", { cause: 400 })
    );
  }

  if (new Date() > user.emailOtp.expiresAt) {
    return next(new Error("OTP has expired", { cause: 400 }));
  }

  if (user.emailOtp.attempts >= user.emailOtp.maxAttempts) {
    return next(new Error("Max OTP attempts reached", { cause: 400 }));
  }

  const isMatch = compare(otp, user.emailOtp.code);
  if (!isMatch) {
    user.emailOtp.attempts += 1;
    await user.save();
    return next(new Error("Invalid OTP", { cause: 400 }));
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

  if (!email) {
    return next(new Error("Email is required", { cause: 400 }));
  }

  const user = await findOne(userModel, { email: email.trim().toLowerCase() });

  if (!user) {
    return next(new Error("No account found with this email", { cause: 404 }));
  }

  if (!user.isVerified) {
    return next(
      new Error("Please verify your email first", {
        cause: 403,
      })
    );
  }

  const otp = generateOtp();

  user.passwordOtp = {
    code: otp,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    verified: false,
    attempts: 0,
    maxAttempts: 5,
  };

  await user.save();

  emailEmitter.emit("forgotPassword", {
    email: user.email,
    userName: user.name,
    otp,
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

  if (!email || !otp) {
    return next(new Error("Email and OTP are required", { cause: 400 }));
  }

  const user = await findOne(userModel, { email: email.trim().toLowerCase() });

  if (!user) {
    return next(new Error("No account found with this email", { cause: 404 }));
  }

  if (!user.isVerified) {
    return next(
      new Error("Please verify your email first", {
        cause: 403,
      })
    );
  }

  if (!user.passwordOtp || !user.passwordOtp.code) {
    return next(
      new Error("No OTP request found. Please request again.", { cause: 400 })
    );
  }

  if (user.passwordOtp.expiresAt < new Date()) {
    return next(
      new Error("OTP expired. Please request again.", { cause: 400 })
    );
  }

  if (user.passwordOtp.attempts >= user.passwordOtp.maxAttempts) {
    return next(new Error("Maximum OTP attempts reached", { cause: 403 }));
  }

  const isMatch = compare(otp, user.passwordOtp.code);

  if (!isMatch) {
    user.passwordOtp.attempts += 1;
    await user.save();
    return next(new Error("Invalid OTP", { cause: 400 }));
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

  if (!email || !newPassword || !confirmPassword) {
    return next(
      new Error("Email, new password and confirm password are required", {
        cause: 400,
      })
    );
  }

  if (newPassword !== confirmPassword) {
    return next(new Error("Passwords do not match", { cause: 400 }));
  }

  const user = await userModel.findOne({ email: email.trim().toLowerCase() });
  if (!user) {
    return next(new Error("No account found with this email", { cause: 404 }));
  }

  if (!user.isVerified) {
    return next(new Error("Please verify your email first", { cause: 403 }));
  }

  if (!user.passwordOtp || !user.passwordOtp.verified) {
    return next(
      new Error("OTP not verified. Cannot reset password.", { cause: 403 })
    );
  }

  if (user.passwordOtp.expiresAt < new Date()) {
    return next(
      new Error("OTP expired. Please request again.", { cause: 410 })
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
