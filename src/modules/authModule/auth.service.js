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
  let { name, email, password, role, gender, phone, age } = req.body;

  if (!name || !email || !password || !phone || !age || !gender) {
    throw new Error("All fields are required", { cause: 400 });
  }
  email = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error("Invalid email format", { cause: 400 });
  }

  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters", { cause: 400 });
  }

  if (name.length < 2) {
    throw new Error("Name must be at least 2 characters", { cause: 400 });
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
    emailOtp: otp,
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
      id: user._id,
      email: user.email,
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

export const confirmEmail = async (req, res, next) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return next(new Error("Email and OTP are required", 400));
  }

  const user = await findOne(userModel, { email });

  if (!user) {
    return next(new Error("User not found", { cause: 404 }));
  }

  if (user.isVerified) {
    return next(new Error("User already verified", 400));
  }

  const isMatch = compare(otp, user.emailOtp);

  if (!isMatch) {
    return next(new Error("in-valid otp", { cause: 400 }));
  }

  await userModel.updateOne(
    { _id: user._id },
    {
      isVerified: true,
      $unset: {
        emailOtp: "",
      },
    }
  );
  handleSuccess({
    res,
    statusCode: 202,
    message: "Email verified successfully",
    data: {
      id: user._id,
      email: user.email,
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
      new Error("Please verify your email before logging in.", {
        cause: 403,
      })
    );
  }

  const otp = generateOtp();
  user.passwordOtp = otp;
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
  });
};
