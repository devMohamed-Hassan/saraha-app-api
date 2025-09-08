import userModel from "../../config/models/user.model.js";
import { Roles } from "../../utils/constants/roles.js";
import { decrypt } from "../../utils/crypto.js";
import { handleSuccess } from "../../utils/responseHandler.js";

export const getUserProfile = async (req, res, next) => {
  const user = req.user;
  handleSuccess({
    res,
    statusCode: 200,
    message: "success",
    data: user,
  });
};

export const shareProfile = async (req, res, next) => {
  const user = req.user;
  const shareLink = `${req.protocol}://${req.get("host")}/user/public/${
    user.id
  }`;
  handleSuccess({
    res,
    statusCode: 200,
    message: "success",
    data: { shareLink },
  });
};

export const publicProfile = async (req, res, next) => {
  const id = req.params.id;
  const user = await userModel.findById(id).select("name");
  if (!user) {
    return next(new Error("User not found", { cause: 404 }));
  }
  const messageFormUrl = `${req.protocol}://${req.get("host")}/send-message/${
    user.id
  }`;

  handleSuccess({
    res,
    statusCode: 200,
    message: "success",
    data: {
      username: user.name,
      messageFormUrl,
    },
  });
};

export const updateUser = async (req, res, next) => {
  const { name, phone } = req.body;
  const user = req.user;

  const updatedUser = await userModel
    .findByIdAndUpdate(user._id, {
      name,
      phone,
    })
    .select("name phone");

  if (!updatedUser) {
    return res.status(404).json({ error: "User not found" });
  }

  handleSuccess({
    res,
    statusCode: 200,
    message: "Profile updated successfully",
    data: updatedUser,
  });
};

export const deactivate = async (req, res, next) => {
  const { id } = req.params;
  const loggedUser = req.user;

  const user = await userModel.findById(id);
  if (!user) {
    return next(new NotFoundError("User not found"));
  }

  const isOwner = loggedUser._id.toString() === user._id.toString();
  const isAdmin = loggedUser.role === Roles.ADMIN;

  if (!isOwner && !isAdmin) {
    return next(
      new Error("You are not authorized to deactivate this account", {
        cause: 403,
      })
    );
  }

  await user.deactivate(loggedUser._id);

  handleSuccess({
    res,
    statusCode: 200,
    message: "User account has been deactivated successfully",
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      isActive: user.isActive,
      deletedAt: user.deletedAt,
    },
  });
};
