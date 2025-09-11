import { cloudinaryConfig } from "../utils/multer/cloudinary.js";

export const uploadImage = async ({ path, folder = "others" }) => {
  const { public_id, secure_url } = await cloudinaryConfig().uploader.upload(
    path,
    { folder: `${process.env.APP_NAME}/${folder}` }
  );
  return { public_id, secure_url };
};

export const destroyImage = async (publicId) => {
  if (!publicId) return;
  await cloudinaryConfig().uploader.destroy(publicId);
};
