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
  authorization = "",
  next,
}) => {
  if (!authorization) {
    return next(new Error("Token is required", { cause: 401 }));
  }

  const [key, token] = authorization.split(" ");

  if (
    !authorization.startsWith(process.env.BearerToken) ||
    key !== process.env.BearerToken
  ) {
    return next(new Error("invaild bearer key"));
  }

  const secret =
    tokenType === types.access
      ? process.env.ACCESS_TOKEN_SECRET
      : process.env.REFRESH_TOKEN_SECRET;

  const payload = jwt.verify(token, secret);

  const user = await findById(userModel, payload._id);
  if (!user) {
    return next(new Error("User Not Found", { cause: 404 }));
  }
  return payload;
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
