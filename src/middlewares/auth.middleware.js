import jwt from "jsonwebtoken";
import { findById } from "../services/db.service.js";
import userModel from "../config/models/user.model.js";

export const types = {
  access: "access",
  refresh: "refresh",
};
Object.freeze(types);

export const decodeToken = async ({
  tokenType = types.access,
  token,
  next,
}) => {
  try {
    let secret = "";
    if (tokenType === types.access) {
      secret = process.env.ACCESS_TOKEN_SECRET;
    } else if (tokenType === types.refresh) {
      secret = process.env.REFRESH_TOKEN_SECRET;
    } else {
      return next(new Error("Invalid token type", { cause: 400 }));
    }
    const payload = jwt.verify(token, secret);
    const user = await findById(userModel, payload._id);
    if (!user) {
      return next(new Error("User Not Found", { cause: 404 }));
    }
    return payload;
  } catch (error) {
    return next(new Error(error.message, { cause: 400 }));
  }
};

export const auth = (req, res, next) => {
  return async (req, res, next) => {
    const { authorization } = req.headers;
    const user = await decodeToken({
      token: authorization,
      next,
    });
    req.user = user;
    next();
  };
};
