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

export const deleteManyFiles = async ({ public_ids = [] }) => {
  await cloudinaryConfig().api.delete_resources(public_ids);
};

export const deleteByPrefix = async ({ prefix = "" }) => {
  await cloudinaryConfig().api.delete_resources_by_prefix(
    `${process.env.APP_NAME}/${prefix}`
  );
};

export const deleteFolder = async ({ path = "" }) => {
  const fullPath = `${process.env.APP_NAME}/${path}`;
  try {
    await cloudinaryConfig().api.delete_resources_by_prefix(fullPath);
    await cloudinaryConfig().api.delete_folder(fullPath);
  } catch (error) {
    console.warn(
      `Cloudinary: folder ${fullPath} not deleted ->`,
      error.message
    );
    return false;
  }
};
