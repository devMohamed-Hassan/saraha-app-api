import multer from "multer";

export const uploadFile = () => {
  const storage = multer.diskStorage({
    destination: "uploads",
    filename: (req, file, callback) => {
      const name = file.originalname;
      callback(null, name);
    },
  });

  return multer({ storage });
};
