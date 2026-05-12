import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "profiles",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
    resource_type: "auto",
    type: "upload",
  },
});

// Intercept the storage to add full URL to req.file
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    console.log(
      `File upload attempt: ${file.originalname}, mimetype: ${file.mimetype}`,
    );
    cb(null, true);
  },
});

export default upload;
