import multer from "multer";
import path from "path";

const sanitize = (str) => str.replace(/[^a-zA-Z0-9_-]/g, "_");

export const cloudUploadFile = () => {
  const storage = multer.diskStorage({});

  const fileFilter = (req, file, callback) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const mime = allowedTypes.test(file.mimetype.toLowerCase());
    const ext = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mime && ext) {
      callback(null, true);
    } else {
      callback(
        new Error("Only image files are allowed!", { cause: 415 }),
        false
      );
    }
  };

  return multer({
    storage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  });
};
