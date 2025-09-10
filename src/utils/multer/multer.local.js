import multer from "multer";
import fs from "fs";
import path from "path";

const sanitize = (str) => str.replace(/[^a-zA-Z0-9_-]/g, "_");

export const uploadFile = (folder = "general") => {
  const storage = multer.diskStorage({
    destination: (req, file, callback) => {
      const user = req.user;
      const dest = `/public/uploads/${folder}/${user.id}`;
      const fullDest = path.resolve(`.${dest}`);

      req.dest = dest;

      if (!fs.existsSync(fullDest)) {
        fs.mkdirSync(fullDest, { recursive: true });
      }

      callback(null, fullDest);
    },

    filename: (req, file, callback) => {
      const user = req.user;
      const safeName = sanitize(user.name);
      const name = `${safeName}_${Date.now()}_${file.originalname}`;
      callback(null, name);
    },
  });

  return multer({ storage });
};
