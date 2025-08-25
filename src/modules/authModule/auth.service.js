import bcrypt from "bcrypt";
import userModel from "../../config/models/user.model.js";
import { handleSuccess } from "../../utils/responseHandler.js";
import jwt from "jsonwebtoken";
import { create, findById, findOne } from "../../services/db.service.js";
import { decodeToken, types } from "../../middlewares/auth.middleware.js";
import { encrypt } from "../../utils/crypto.js";

const INVALID_CREDENTIALS_MSG = "Invalid email or password";
const SALT_ROUNDS = 10;

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

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await create(userModel, {
    name,
    email,
    password: hashedPassword,
    role,
    gender,
    age,
    phone: encrypt(phone),
  });

  const userObj = user.toObject();
  delete userObj.password;
  handleSuccess({
    res,
    statusCode: 201,
    message: "Signup successful",
    data: userObj,
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
    const fakeHash = "$2b$10$abcdefghijklmnopqrstuvCDEFGHIJKLMNO123456";
    await bcrypt.compare(password, fakeHash);
    throw new Error(INVALID_CREDENTIALS_MSG, { cause: 400 });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error(INVALID_CREDENTIALS_MSG, { cause: 400 });
  }

  const payload = {
    _id: user._id,
    email: user.email,
  };

  const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: `1 H`,
  });
  const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: `7d`,
  });

  handleSuccess({
    res,
    statusCode: 202,
    message: "Login successful",
    data: {
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        accessToken,
        refreshToken,
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
  const accessToken = jwt.sign(
    {
      _id: user._id,
      email: user.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: `1 H`,
    }
  );
  handleSuccess({ res, statusCode: 202, data: { accessToken } });
};
