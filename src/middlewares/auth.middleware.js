import { decodeToken } from "../utils/token/decodeToken.js";

export const auth = (activation = true) => {
  return async (req, res, next) => {
    const { authorization } = req.headers;
    const { user, payload } = await decodeToken({
      authorization,
      next,
    });
    if (activation) {
      if (user && user.isActive === false) {
        return next(
          new Error("This account has been deactivated.", { cause: 403 })
        );
      }
    }
    req.user = user;
    req.payload = payload;
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
