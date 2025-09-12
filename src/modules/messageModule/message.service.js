import messageModel from "../../config/models/message.model.js";
import { uploadImage } from "../../services/cloudinary.service.js";
import { handleSuccess } from "../../utils/responseHandler.js";

export const sendMessage = async (req, res, next) => {
  const { content } = req.body;
  const { receiverId } = req.params;

  let messageData = {
    receiver: receiverId,
    content,
    type: "text",
    isAnonymous: true,
  };

  if (req.file) {
    const { public_id, secure_url } = await uploadImage({
      path: req.file.path,
      folder: `users/${receiverId}/messages`,
    });

    messageData.image = { public_id, secure_url };
    messageData.type = "image";
  }

  const message = await messageModel.create(messageData);

  handleSuccess({
    message: "Message sent successfully",
    res,
    data: message,
  });
};

export const getMessages = async (req, res, next) => {
  const userId = req.user._id;

  const messages = await messageModel
    .find({ receiver: userId })
    .sort({ createdAt: -1 });

  const formattedMessages = messages.map((msg) => ({
    _id: msg._id,
    receiver: msg.receiver,
    content: msg.content,
    type: msg.type,
    isAnonymous: msg.isAnonymous,
    status: msg.status,
    createdAt: msg.createdAt,
    updatedAt: msg.updatedAt,
    imageUrl: msg.image?.secure_url || null,
  }));

  handleSuccess({
    message: "Messages retrieved successfully",
    res,
    data: formattedMessages,
  });
};
