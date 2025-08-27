import jwt from "jsonwebtoken";
import { findById } from "../services/db.service.js";
import userModel, { Roles } from "../config/models/user.model.js";

export const types = {
  access: "access",
  refresh: "refresh",
};
Object.freeze(types);

export const decodeToken = async ({
  tokenType = types.access,
  authorization = "",
  next,
}) => {
  if (!authorization) {
    return next(new Error("Token is required", { cause: 401 }));
  }

  const [key, token] = authorization.split(" ");

  if (
    !authorization.startsWith(process.env.BEARER_TOKEN) ||
    key !== process.env.BEARER_TOKEN
  ) {
    return next(new Error("invaild bearer key"));
  }

  const decoded = jwt.decode(token);

  if (!decoded || !decoded.role) {
    return next(new Error("Invalid token", { cause: 401 }));
  }

  decoded.role;
  const accessSignture =
    decoded.role === Roles.admin
      ? process.env.ADMIN_ACCESS_TOKEN_SECRET
      : process.env.USER_ACCESS_TOKEN_SECRET;

  const refreshSignture =
    decoded.role === Roles.admin
      ? process.env.ADMIN_REFRESH_TOKEN_SECRET
      : process.env.USER_REFRESH_TOKEN_SECRET;

  const secret = tokenType === types.access ? accessSignture : refreshSignture;

  const payload = jwt.verify(token, secret);

  const user = await findById(userModel, payload._id);
  if (!user) {
    return next(new Error("User Not Found", { cause: 404 }));
  }
  if (!user.isVerified) {
    return next(
      new Error("Please verify your email before logging in.", {
        cause: 403,
      })
    );
  }
  if (
    user.credentialChangedAt &&
    payload.iat * 1000 < user.credentialChangedAt.getTime()
  ) {
    return next(new Error("Token is no longer valid. Please login again."));
  }

  return user;
};

export const auth = (req, res, next) => {
  return async (req, res, next) => {
    const { authorization } = req.headers;
    const user = await decodeToken({
      authorization,
      next,
    });
    req.user = user;
    next();
  };
};

export const allowTo = (...roles) => {
  return async (req, res, next) => {
    const user = req.user;
    if (!roles.includes(user.role)) {
      return next(
        new Error("You are not allowed to access this endpoint", { cause: 403 })
      );
    }
    next();
  };
};
