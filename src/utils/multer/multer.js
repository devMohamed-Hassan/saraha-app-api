import multer from "multer";
import fs from "fs";
import path from "path";

export const uploadFile = () => {
  const storage = multer.diskStorage({
    destination: (req, file, callback) => {
      const dest = `uploads/${req.user.name}_${req.user.id}`;
      const fullDest = path.resolve(".", dest);

      req.dest = dest;

      if (!fs.existsSync(fullDest)) {
        fs.mkdirSync(fullDest, { recursive: true });
      }

      callback(null, fullDest);
    },

    filename: (req, file, callback) => {
      const name = req.user.name + "_" + file.originalname;

      callback(null, name);
    },
  });

  return multer({ storage });
};
