import jwt from "jsonwebtoken";
import { EmailNotVerifiedError, UserNotFoundError } from "../customErrors.js";
import { Roles } from "../constants/roles.js";
import { findById } from "../../services/db.service.js";
import userModel from "../../config/models/user.model.js";
import { RevokedTokenModel } from "../../config/models/revokedToken.model.js";

export const TokenTypes = Object.freeze({
  ACCESS: "ACCESS",
  REFRESH: "REFRESH",
});

Object.freeze(TokenTypes);

export const decodeToken = async ({
  tokenType = TokenTypes.ACCESS,
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

  const accessSignture =
    decoded.role === Roles.ADMIN
      ? process.env.ADMIN_ACCESS_TOKEN_SECRET
      : process.env.USER_ACCESS_TOKEN_SECRET;

  const refreshSignture =
    decoded.role === Roles.ADMIN
      ? process.env.ADMIN_REFRESH_TOKEN_SECRET
      : process.env.USER_REFRESH_TOKEN_SECRET;

  const secret =
    tokenType === TokenTypes.ACCESS ? accessSignture : refreshSignture;

  const payload = jwt.verify(token, secret);

  const user = await findById(userModel, payload._id);

  if (!user) {
    return next(new UserNotFoundError());
  }

  const revokedToken = await RevokedTokenModel.findOne({ jti: payload.jti });

  if (revokedToken) {
    return next(
      new Error("Token has been revoked. Please login again.", { cause: 401 })
    );
  }

  if (!user.isVerified && !user.pendingEmail) {
    return next(new EmailNotVerifiedError());
  }

  if (
    user.credentialChangedAt &&
    payload.iat * 1000 < user.credentialChangedAt.getTime()
  ) {
    return next(new Error("Token is no longer valid. Please login again."));
  }

  return { user, payload };
};
