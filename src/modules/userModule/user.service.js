import userModel from "../../config/models/user.model.js";
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
  const user = await userModel.findById(id).select("username");
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  const messageFormUrl = `${req.protocol}://${req.get("host")}/send-message/${
    user.id
  }`;

  handleSuccess({
    res,
    statusCode: 200,
    message: "success",
    data: {
      username: user.username,
      messageFormUrl,
    },
  });
};
