import userModel from "../../config/models/user.model.js";
import {
  deleteFolder,
  destroyImage,
  uploadImage,
} from "../../services/cloudinary.service.js";
import { Roles } from "../../utils/constants/roles.js";
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
  const user = await userModel.findById(id).select("name profileImage");
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
      profileImage: user.profileImage.url,
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

export const restoreAccount = async (req, res, next) => {
  const { id } = req.params;
  const loggedUser = req.user;

  const account = await userModel.findById(id);
  if (!account) {
    return next(new NotFoundError());
  }

  if (account.isActive) {
    return next(new Error("Account is already active", { cause: 409 }));
  }

  const isOwner = loggedUser._id.toString() === account._id.toString();
  const isAdmin = loggedUser.role === Roles.ADMIN;
  const canRestoreSelf =
    isOwner && account.deletedBy?.toString() === account._id.toString();

  if (!(isAdmin || canRestoreSelf)) {
    return next(
      new Error("You are not authorized to restore this account", {
        cause: 401,
      })
    );
  }

  account.isActive = true;
  account.deletedBy = undefined;
  account.deletedAt = undefined;
  await account.save();

  handleSuccess({
    res,
    statusCode: 200,
    message: "User account has been restored successfully",
    data: {
      id: account._id,
      name: account.name,
      email: account.email,
      isActive: account.isActive,
    },
  });
};

export const deleteAccount = async (req, res, next) => {
  const { id } = req.params;

  const account = await userModel.findById(id);
  if (!account) {
    return next(new Error("Account not found", { cause: 404 }));
  }

  if (account.role === Roles.ADMIN) {
    return next(new Error("Admins cannot be deleted", { cause: 403 }));
  }

  await deleteFolder({ path: `users/${account._id}` });

  await account.deleteOne();

  handleSuccess({
    res,
    statusCode: 200,
    message: "User account has been permanently deleted",
    data: { id: account._id, email: account.email },
  });
};

export const uploadProfileImage = async (req, res, next) => {
  const user = req.user;
  const file = req.file;

  const { public_id, secure_url } = await uploadImage({
    path: file.path,
    folder: `users/${user._id}/profile`,
  });

  if (user.profileImage?.public_id) {
    await destroyImage(user.profileImage.public_id);
  }

  user.profileImage = { public_id, secure_url };
  await user.save();

  handleSuccess({
    message: "Profile image uploaded successfully",
    res,
    data: { profileImage: { public_id, url: secure_url } },
  });
};

export const uploadCoverImages = async (req, res, next) => {
  const user = req.user;
  const file = req.file;

  const { public_id, secure_url } = await uploadImage({
    path: file.path,
    folder: `users/${user._id}/cover`,
  });

  if (user.coverImage?.public_id) {
    await destroyImage(user.coverImage.public_id);
  }

  user.coverImage = { public_id, secure_url };
  await user.save();

  handleSuccess({
    message: "Cover image uploaded successfully",
    res,
    data: { profileImage: { public_id, url: secure_url } },
  });
};
